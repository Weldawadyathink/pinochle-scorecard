import { useState } from "react";
import { PinochleGame } from "@/shared/PinochleGame";
import { PinochleGameEditor } from "@/components/PinochleGameEditor";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { fetcher } from "itty-fetcher";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import clipboard from "clipboardy";

export interface MainGameEditorProps {
  gameData: PinochleGame;
  onGameDataChange: (data: PinochleGame) => void;
  sharedGameName?: string;
}

export function MainGameEditor({
  gameData,
  onGameDataChange,
  sharedGameName,
}: MainGameEditorProps) {
  const [appId] = useState(crypto.randomUUID());
  const [socketUrl, setSocketUrl] = useState(
    import.meta.env.MODE === "development"
      ? `ws://localhost:8787/v1/game/connect/${sharedGameName}`
      : `wss://api.pinochle.spenserbushey.com/v1/game/connect/${sharedGameName}`,
  );
  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onMessage: (msg) => {
      console.log(["Received websocket message", msg]);
      const data = JSON.parse(msg.data);
      const senderId = data.senderId;
      if (senderId !== appId) {
        const game = PinochleGame.fromJSON(data.payload);
        onGameDataChange(game);
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

  let gameSharedStatus: "Private" | "Shared" | "Connecting";
  if (socketUrl === "") {
    gameSharedStatus = "Private";
  } else {
    if (connectionStatus === "Open") {
      gameSharedStatus = "Shared";
    } else {
      gameSharedStatus = "Connecting";
    }
  }

  function setNewGameState(state: PinochleGame) {
    const serialized = JSON.stringify(state);
    sendMessage(
      JSON.stringify({
        messageType: "gameUpdate",
        payload: serialized,
        senderId: appId,
      }),
    );
    onGameDataChange(state);
  }

  const apiUrl =
    import.meta.env.MODE === "development"
      ? "http://localhost:8787"
      : "https://api.pinochle.spenserbushey.com";
  const websocketUrl =
    import.meta.env.MODE === "development"
      ? "ws://localhost:8787"
      : "wss://api.pinochle.spenserbushey.com";

  function openNewGame() {
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-row gap-4 text-center">
          {gameSharedStatus === "Private" && (
            <>
              <span className="my-auto">Private Game</span>
              <Button onClick={openNewGame}>Share this game</Button>
            </>
          )}
          {gameSharedStatus === "Connecting" && <span>Connecting...</span>}
          {gameSharedStatus === "Shared" && (
            <>
              <span>Shared Game</span>
              <span>{gameName}</span>
              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={() => clipboard.write(gameName)}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <PinochleGameEditor
          data={gameData}
          onChange={(d) => setNewGameState(d)}
        />
      </div>
    </div>
  );
}
