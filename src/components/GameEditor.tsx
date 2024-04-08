import { useState } from "react";
import { PinochleGame } from "@/shared/PinochleGame";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { fetcher } from "itty-fetcher";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import clipboard from "clipboardy";
import { PinochleRound } from "@/shared/PinochleRound";
import { set, cloneDeep } from "lodash-es";
import { animated, useTrail } from "@react-spring/web";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

interface PinochleRoundEditorProps {
  data: PinochleRound;
  onChange: (data: PinochleRound) => void;
}

function PinochleRoundEditor({ data, onChange }: PinochleRoundEditorProps) {
  function setData(path: string, value: any) {
    const temp = cloneDeep(data);
    set(temp, path, value);
    onChange(temp);
  }

  function setInt(path: string, value: string) {
    const temp = cloneDeep(data);
    set(temp, path, parseInt(value, 10));
    onChange(temp);
  }

  return (
    <>
      <div className="flex flex-row text-xl gap-8">
        <div>
          <div className="flex flex-row gap-4">
            <Button
              variant={data.teamWithBid === "a" ? "default" : "secondary"}
              onClick={() => setData("teamWithBid", "a")}
            >
              Take Bid
            </Button>
            <Input
              type="number"
              disabled={data.teamWithBid !== "a"}
              value={data.bid}
              onChange={(e: any) => setInt("bid", e.target.value)}
            />
          </div>
          <h1>Team A Meld</h1>
          <Input
            type="number"
            value={data.teamAMeldScore}
            onChange={(e: any) => setInt("teamAMeldScore", e.target.value)}
          />
          <h1>Team A Tricks</h1>
          <Input
            type="number"
            value={data.teamATrickScore}
            onChange={(e: any) => setInt("teamATrickScore", e.target.value)}
          />
          <h1>Total Score: {data.teamATotalScore}</h1>
        </div>
        <div>
          <div className="flex flex-row gap-4">
            <Button
              variant={data.teamWithBid === "b" ? "default" : "secondary"}
              onClick={() => setData("teamWithBid", "b")}
            >
              Take Bid
            </Button>
            <Input
              type="number"
              value={data.bid}
              disabled={data.teamWithBid !== "b"}
              onChange={(e: any) => setInt("bid", e.target.value)}
            />
          </div>
          <h1>Team B Meld</h1>
          <Input
            type="number"
            value={data.teamBMeldScore}
            onChange={(e: any) => setInt("teamBMeldScore", e.target.value)}
          />
          <h1>Team B Tricks</h1>
          <Input
            type="number"
            value={data.teamBTrickScore}
            onChange={(e: any) => setInt("teamBTrickScore", e.target.value)}
          />
          <h1>Total Score: {data.teamBTotalScore}</h1>
        </div>
      </div>
    </>
  );
}

interface PinochleGameEditorProps {
  data: PinochleGame;
  onChange: (data: PinochleGame) => void;
}

function PinochleGameEditor({ data, onChange }: PinochleGameEditorProps) {
  const [openNewRound, setOpenNewRound] = useState(false);

  function setRound(index: number, roundData: PinochleRound) {
    const temp = cloneDeep(data);
    temp.rounds[index] = roundData;
    onChange(temp);
  }

  function newRound() {
    const temp = cloneDeep(data);
    temp.newRound();
    setOpenNewRound(true);
    onChange(temp);
  }

  if (openNewRound) {
    setOpenNewRound(false);
  }

  const trails = useTrail(data.rounds.length, {
    from: { x: 100, opacity: 0 },
    to: { x: 0, opacity: 1 },
  });

  return (
    <>
      <Accordion type="single">
        {data.rounds.map((round, index) => {
          const roundNumber = index + 1;
          const teamACumulativeScore = data.getTeamAScore(index);
          const teamBCumulativeScore = data.getTeamBScore(index);
          return (
            <animated.div key={index} style={trails[index]}>
              <AccordionItem value={`round-${index}`} key={`round-${index}`}>
                <AccordionTrigger>
                  Round {roundNumber} | Team A: {teamACumulativeScore} | Team B:{" "}
                  {teamBCumulativeScore}
                </AccordionTrigger>
                <AccordionContent>
                  <PinochleRoundEditor
                    data={round}
                    onChange={(d) => setRound(index, d)}
                  />
                </AccordionContent>
              </AccordionItem>
            </animated.div>
          );
        })}
      </Accordion>
      <Button onClick={newRound}>New Round</Button>
    </>
  );
}

export interface MainGameEditorProps {
  gameData: PinochleGame;
  onGameDataChange: (data: PinochleGame) => void;
  sharedGameName?: string;
}

export function GameEditor({
  gameData,
  onGameDataChange,
  sharedGameName,
}: MainGameEditorProps) {
  // TODO: Fetch game state from server when given a sharedGameName
  const [connectToSocket, setConnectToSocket] = useState(!!sharedGameName);
  const [appId] = useState(crypto.randomUUID());
  const [socketUrl, setSocketUrl] = useState(
    import.meta.env.MODE === "development"
      ? `ws://localhost:8787/v1/game/connect/${sharedGameName}`
      : `wss://api.pinochle.spenserbushey.com/v1/game/connect/${sharedGameName}`,
  );
  const { sendJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      onMessage: (msg) => {
        console.log(["Received websocket message", msg]);
        const data = JSON.parse(msg.data);
        const senderId = data.senderId;
        if (senderId !== appId) {
          const game = PinochleGame.fromJSON(data.payload);
          onGameDataChange(game);
        }
      },
      onOpen: () => {
        if (sharedGameName) {
          sendJsonMessage({
            messageType: "requestGameUpdate",
          });
        }
      },
    },
    connectToSocket,
  );

  const gameName: string | null = socketUrl.split("/").pop() || null;

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  let gameSharedStatus: "Private" | "Shared" | "Connecting";
  if (!connectToSocket) {
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
    sendJsonMessage({
      messageType: "gameUpdate",
      payload: serialized,
      senderId: appId,
    });
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

  function shareGame() {
    const api = fetcher({ base: apiUrl });
    api.get("/v1/game/new").then((response) => {
      setSocketUrl(`${websocketUrl}/v1/game/connect/${(response as any).name}`);
      setConnectToSocket(true);
    });
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-row gap-4 text-center">
          {gameSharedStatus === "Private" && (
            <>
              <span className="my-auto">Private Game</span>
              <Button onClick={shareGame}>Share this game</Button>
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
                onClick={() => clipboard.write(gameName || "")}
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
