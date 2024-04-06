import { useState } from "react";
import { PinochleGame } from "@/shared/PinochleGame";
import { PinochleGameEditor } from "./components/PinochleGameEditor";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { fetcher } from "itty-fetcher";
import { Button } from "./components/ui/button";

export default function App() {
  const [data, setData] = useState(new PinochleGame());
  const [appId] = useState(crypto.randomUUID());
  const [socketUrl, setSocketUrl] = useState("");
  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onMessage: (msg) => {
      console.log(["Received websocket message", msg]);
      const data = JSON.parse(msg.data);
      const senderId = data.senderId;
      if (senderId !== appId) {
        const game = PinochleGame.fromJSON(data.payload);
        setData(game);
      }
    },
  });
  const gameName = socketUrl.split("/").pop() || "No game connected";

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  function setNewGameState(state: PinochleGame) {
    const serialized = JSON.stringify(state);
    sendMessage(
      JSON.stringify({
        messageType: "gameUpdate",
        payload: serialized,
        senderId: appId,
      }),
    );
    setData(state);
  }

  function openNewGame() {
    const apiUrl =
      import.meta.env.MODE === "development"
        ? "http://localhost:8787"
        : "https://api.pinochle.spenserbushey.com";
    const websocketUrl =
      import.meta.env.MODE === "development"
        ? "ws://localhost:8787"
        : "wss://api.pinochle.spenserbushey.com";
    const api = fetcher({ base: apiUrl });
    api
      .get("/v1/game/new")
      .then((response) =>
        setSocketUrl(
          `${websocketUrl}/v1/game/connect/${(response as any).name}`,
        ),
      );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="flex flex-col">
        <span>{connectionStatus}</span>
        <span>{socketUrl}</span>
        <span>{gameName}</span>
        <Button onClick={openNewGame}>New Game</Button>
      </div>
      <PinochleGameEditor data={data} onChange={(d) => setNewGameState(d)} />
    </div>
  );
}
