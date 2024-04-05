import { AutoRouter, error, json, withParams } from "itty-router";

export interface Env {
	PINOCHLE_DURABLE_OBJECT: DurableObjectNamespace;
}

interface StandardMessage {
	messageType: "gameUpdate"; // Future values to come for other controls
	payload?: string; // JSON representation of pinochle object
	senderId?: string; // arbitrary identifier to determine which client sent the update. UUID4 is recommended.
}

const router = AutoRouter();

router
	.all("*", withParams)
	.all("/v1/game/watch/:id", ({ id }, { env }) => {
		// TODO: make human readable "game codes" (like docker does with names)
		// Allow users to connect with these game codes instead of id
		const d_obj: DurableObjectId = env.PINOCHLE_DURABLE_OBJECT.idFromString(id);
		const stub: DurableObjectStub = env.PINOCHLE_DURABLE_OBJECT.get(d_obj);
		const doRequest = new Request("http://game/watch");
		return stub.fetch(doRequest);
	})
	.all("/v1/game/new", (_request, { env }) => {
		console.log(env);
		const id = env.PINOCHLE_DURABLE_OBJECT.newUniqueId();
		console.log(id.toString());
		return { id: id.toString() };
	})
	.all("/v1/game/control/:id", (request, { env }) => {
		const objId: DurableObjectId = env.PINOCHLE_DURABLE_OBJECT.idFromString(
			request.id,
		);
		const stub: DurableObjectStub = env.PINOCHLE_DURABLE_OBJECT.get(objId);
		const doRequest = new Request("http://game/control");
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
		return router.fetch(request, { env, ctx }).then(json).catch(error);
	},
};

export class WebSocketHibernationServer {
	state: DurableObjectState;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
	}

	// Handle HTTP requests from clients.
	async fetch(request: Request): Promise<Response> {
		if (request.url === "http://game/control") {
			const upgradeHeader = request.headers.get("Upgrade");
			if (!upgradeHeader || upgradeHeader !== "websocket") {
				// TODO: Return current game state without websocket upgrade
				return new Response("Durable Object expected Upgrade: websocket", {
					status: 426,
				});
			}

			const [client, server] = Object.values(new WebSocketPair());
			this.state.acceptWebSocket(server, ["read_write"]);
			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}

		if (request.url === "http://game/watch") {
			const upgradeHeader = request.headers.get("Upgrade");
			if (!upgradeHeader || upgradeHeader !== "websocket") {
				// TODO: Return current game state without websocket upgrade
				return new Response("Durable Object expected Upgrade: websocket", {
					status: 426,
				});
			}

			const [client, server] = Object.values(new WebSocketPair());
			this.state.acceptWebSocket(server, ["read_only"]);
			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}

		// 		if (request.url.endsWith("/websocket")) {
		// 			// Expect to receive a WebSocket Upgrade request.
		// 			// If there is one, accept the request and return a WebSocket Response.
		// 			const upgradeHeader = request.headers.get("Upgrade");
		// 			if (!upgradeHeader || upgradeHeader !== "websocket") {
		// 				return new Response("Durable Object expected Upgrade: websocket", {
		// 					status: 426,
		// 				});
		// 			}

		// 			// Creates two ends of a WebSocket connection.
		// 			const webSocketPair = new WebSocketPair();
		// 			const [client, server] = Object.values(webSocketPair);

		// 			// Calling `acceptWebSocket()` tells the runtime that this WebSocket is to begin terminating
		// 			// request within the Durable Object. It has the effect of "accepting" the connection,
		// 			// and allowing the WebSocket to send and receive messages.
		// 			// Unlike `ws.accept()`, `state.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
		// 			// is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
		// 			// the connection is open. During periods of inactivity, the Durable Object can be evicted
		// 			// from memory, but the WebSocket connection will remain open. If at some later point the
		// 			// WebSocket receives a message, the runtime will recreate the Durable Object
		// 			// (run the `constructor`) and deliver the message to the appropriate handler.
		// 			this.state.acceptWebSocket(server);

		// 			return new Response(null, {
		// 				status: 101,
		// 				webSocket: client,
		// 			});
		// 		} else if (request.url.endsWith("/getCurrentConnections")) {
		// 			let numConnections: number = this.state.getWebSockets().length;
		// 			if (numConnections == 1) {
		// 				return new Response(
		// 					`There is ${numConnections} WebSocket client connected to this Durable Object instance.`,
		// 				);
		// 			}
		// 			return new Response(
		// 				`There are ${numConnections} WebSocket clients connected to this Durable Object instance.`,
		// 			);
		// 		}

		return new Response("Could not find an appropriate response", {
			status: 404,
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
			const sockets = this.state.getWebSockets();
			sockets.forEach((socket) => socket.send(JSON.stringify(data)));
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
