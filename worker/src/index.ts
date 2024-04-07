import { AutoRouter, error, json, withParams, cors } from "itty-router";
import { drizzle } from "drizzle-orm/d1";
import { eq, sql } from "drizzle-orm";
import { game } from "./schema";

// @ts-expect-error
import { generate } from "project-namer";

export interface Env {
  PINOCHLE_DURABLE_OBJECT: DurableObjectNamespace;
  DB: D1Database;
}

interface StandardMessage {
  messageType: "gameUpdate" | "requestGameUpdate"; // Future values to come for other controls
  payload?: string; // JSON representation of pinochle object
  senderId?: string; // arbitrary identifier to determine which client sent the update. UUID4 is recommended.
}

const { preflight, corsify } = cors();
const router = AutoRouter({ before: [preflight], finally: [corsify] });

router
  .all("/v1/game/new", async (_request, env) => {
    const id = env.PINOCHLE_DURABLE_OBJECT.newUniqueId().toString();
    const db = drizzle(env.DB);

    async function getName() {
      const possibleName = generate({ number: true }).dashed.toLowerCase();
      console.log(`Generated name ${possibleName}, testing for collisions.`);
      const results = await db
        .select({ name: game.name })
        .from(game)
        .where(eq(game.name, possibleName));
      if (results.length > 0) {
        console.log("Name collision, generating new name.");
        return getName();
      }
      return possibleName;
    }

    const name = await getName();
    await db.insert(game).values({
      id: id,
      name: name,
      last_access: Date.now().toString(),
    });
    return { name: name };
  })

  .all("/v1/game/connect/:name", async (request, env) => {
    const db = drizzle(env.DB);
    const name = request.name.toLowerCase();
    const results = await db
      .update(game)
      .set({ last_access: Date.now().toString() })
      .where(eq(game.name, name))
      .returning({ id: game.id });
    if (results.length === 0) {
      return new Response("Game name not found", { status: 404 });
    }
    const [{ id }] = results;
    const objId = env.PINOCHLE_DURABLE_OBJECT.idFromString(id);
    const stub: DurableObjectStub = env.PINOCHLE_DURABLE_OBJECT.get(objId);
    const doRequest = new Request("https://game/");
    if (request.headers.get("Upgrade")) {
      doRequest.headers.set(
        "Upgrade",
        request.headers.get("Upgrade") as string,
      );
    }
    console.log(`Game control activated for durable object ${request.id}`);
    return stub.fetch(doRequest);
  });

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return router.fetch(request, env, ctx).then(json).catch(error);
  },
};

export class WebSocketHibernationServer {
  state: DurableObjectState;
  lastPayload: string;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.lastPayload = "";
  }

  // Handle HTTP requests from clients.
  async fetch(request: Request): Promise<Response> {
    console.log("Processing request in durable object");
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      // TODO: Return current game state without websocket upgrade
      return new Response(
        JSON.stringify({
          gameData: "Game data will be here",
        }),
        {
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
          },
        },
      );
    }

    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    let data: StandardMessage;
    try {
      if (message instanceof ArrayBuffer) {
        const textDecoder = new TextDecoder("utf-8");
        const decoded = textDecoder.decode(message);
        data = JSON.parse(decoded);
      } else {
        data = JSON.parse(message);
      }
    } catch {
      console.log(["Error parsing message", message]);
      ws.send(
        JSON.stringify({
          error: "Could not parse JSON from message",
          originalMessage: message,
        }),
      );
      return;
    }

    if (data.messageType === "gameUpdate") {
      console.log("Sending game update");
      this.lastPayload = data.payload as string;
      const sockets = this.state.getWebSockets();
      sockets.forEach((socket) => socket.send(JSON.stringify(data)));
    } else if (data.messageType === "requestGameUpdate") {
      ws.send(
        JSON.stringify({
          messageType: "gameUpdate",
          payload: this.lastPayload,
        }),
      );
    } else {
      console.log("Unknown message type");
      ws.send(
        JSON.stringify({
          error: "Could not find a valid messageType",
          originalMessage: data,
        }),
      );
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    ws.close(code, "Durable Object is closing WebSocket");
  }
}
