import { useState } from "react";
import { PinochleGame } from "@/shared/PinochleGame";
import { PinochleGameEditor } from "./components/PinochleGameEditor";
import useWebSocket, { ReadyState } from "react-use-websocket";

export default function App() {
  const [data, setData] = useState(new PinochleGame());
  const [appId] = useState(crypto.randomUUID());
  const [socketUrl, setSocketUrl] = useState(
    "ws://localhost:8787/v1/game/control/ddac71a2dad249756faac840a98e507ce92faf6b05f4f88642c1fb0496d6b209",
  );
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

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <span>{connectionStatus}</span>
      <PinochleGameEditor data={data} onChange={(d) => setNewGameState(d)} />
    </div>
  );
}
