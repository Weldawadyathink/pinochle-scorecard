const kv = await Deno.openKv();
const expiration = 604800000; // one week in ms

Deno.serve({
  port: 8080,
  handler: async (request) => {
    if (request.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(request);

      socket.onopen = async () => {
        console.log("CONNECTED");

        // Send current game state
        const gameState = await kv.get(["gameStatus", "testGame"]);
        socket.send(JSON.stringify(gameState.value));

        // Send future game states
        const stream = kv.watch([["gameStatus", "testGame"]]);
        for await (const [entry] of stream) {
          socket.send(JSON.stringify(entry.value));
          console.log(JSON.stringify(entry));
        }
      };
      socket.onmessage = (event) => {
        console.log(`RECEIVED: ${event.data}`);
        kv.set(["gameStatus", "testGame"], event.data, {
          expireIn: expiration,
        });
      };
      socket.onclose = () => console.log("DISCONNECTED");
      socket.onerror = (error) => console.error("ERROR:", error);

      return response;
    } else {
      // If the request is a normal HTTP request,
      // we serve the client HTML file.
      const file = await Deno.open("./index.html", { read: true });
      return new Response(file.readable);
    }
  },
});
