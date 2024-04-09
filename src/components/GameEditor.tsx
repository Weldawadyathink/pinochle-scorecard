import { useState } from "react";
import { PinochleGame } from "@/shared/PinochleGame";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { fetcher } from "itty-fetcher";
import { Button } from "@/components/ui/button";
import { Share2, Swords } from "lucide-react";
import { PinochleRound } from "@/shared/PinochleRound";
import { set, cloneDeep } from "lodash-es";
import { animated, useTransition } from "@react-spring/web";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionHeader,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  IconSquareRoundedNumber1,
  IconSquareRoundedNumber2,
  IconSquareRoundedNumber3,
  IconSquareRoundedNumber4,
  IconSquareRoundedNumber5,
  IconSquareRoundedNumber6,
  IconSquareRoundedNumber7,
  IconSquareRoundedNumber8,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface RoundIconProps {
  number: number;
  stroke: number;
  width: number;
  height: number;
  className: string;
}

function RoundIcon({ number, ...props }: RoundIconProps) {
  return (
    <>
      {number === 1 && <IconSquareRoundedNumber1 {...(props as any)} />}
      {number === 2 && <IconSquareRoundedNumber2 {...(props as any)} />}
      {number === 3 && <IconSquareRoundedNumber3 {...(props as any)} />}
      {number === 4 && <IconSquareRoundedNumber4 {...(props as any)} />}
      {number === 5 && <IconSquareRoundedNumber5 {...(props as any)} />}
      {number === 6 && <IconSquareRoundedNumber6 {...(props as any)} />}
      {number === 7 && <IconSquareRoundedNumber7 {...(props as any)} />}
      {number === 8 && <IconSquareRoundedNumber8 {...(props as any)} />}
    </>
  );
}

interface PinochleRoundEditorProps {
  data: PinochleRound;
  onChange: (data: PinochleRound) => void;
}

function PinochleRoundEditor({
  data,
  onChange,
  ...props
}: PinochleRoundEditorProps) {
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
    <div className="flex flex-row text-xl gap-8" {...props}>
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
  );
}

interface PinochleGameEditorProps {
  game: PinochleGame;
  onChange: (game: PinochleGame) => void;
}

function PinochleGameEditor({ game, onChange }: PinochleGameEditorProps) {
  const [shouldOpenNewestRound, setShouldOpenNewestRound] = useState(false);
  const [openRound, setOpenRoundDirectly] = useState("");

  function setOpenRound(round: string) {
    if (openRound === round) {
      setOpenRoundDirectly("");
    } else {
      setOpenRoundDirectly(round);
    }
  }

  function setRound(index: number, roundData: PinochleRound) {
    const temp = cloneDeep(game);
    temp.rounds[index] = roundData;
    onChange(temp);
  }

  function newRound() {
    const temp = cloneDeep(game);
    temp.newRound();
    setShouldOpenNewestRound(true);
    onChange(temp);
  }

  if (shouldOpenNewestRound) {
    setOpenRoundDirectly(game.rounds[game.rounds.length - 1].uuid);
    setShouldOpenNewestRound(false);
  }

  const roundTransitions = useTransition(game.rounds, {
    from: { x: 0, y: 300, opacity: -0.2 },
    enter: { x: 0, y: 0, opacity: 1 },
    leave: { x: -300, y: 0, opacity: -0.2 },
    trail: 100,
    keys: game.rounds.map((r) => r.uuid),
  });

  function setTeamAName(name: string) {
    const temp = cloneDeep(game);
    temp.teamAName = name;
    onChange(temp);
  }

  function setTeamBName(name: string) {
    const temp = cloneDeep(game);
    temp.teamBName = name;
    onChange(temp);
  }

  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        <Input
          value={game.teamAName}
          className="text-right text-2xl col-span-2 justify-self-end my-auto !border-none"
          onChange={(e) => setTeamAName(e.target.value)}
        />
        <Swords className="justify-self-center" width={60} height={60} />
        <Input
          value={game.teamBName}
          className="text-left text-2xl col-span-2 justify-self-start my-auto !border-none"
          onChange={(e) => setTeamBName(e.target.value)}
        />
      </div>

      <Accordion
        type="single"
        value={openRound}
        onValueChange={setOpenRound}
        className="flex flex-col gap-6"
      >
        {roundTransitions((style, round, _, index) => (
          <animated.div key={round.uuid} style={style}>
            <AccordionItem value={round.uuid}>
              <AccordionHeader
                className="grid grid-cols-5 gap-2"
                onClick={() => setOpenRound(round.uuid)}
              >
                <span className="col-span-2 my-auto justify-self-end text-xl">
                  {game.getTeamAScore(index)}
                </span>
                <RoundIcon
                  number={index + 1}
                  width={42}
                  height={42}
                  stroke={2}
                  className="justify-self-center"
                />
                <span className="col-span-2 my-auto justify-self-start text-xl">
                  {game.getTeamBScore(index)}
                </span>
              </AccordionHeader>

              <AccordionContent asChild>
                <PinochleRoundEditor
                  data={round}
                  onChange={(d) => setRound(index, d)}
                />
              </AccordionContent>
            </AccordionItem>
          </animated.div>
        ))}
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

  const gameShareCode: string | null = socketUrl.split("/").pop() || null;

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
    if (gameSharedStatus === "Private") {
      console.log("Sharing game");
      const api = fetcher({ base: apiUrl });
      api.get("/v1/game/new").then((response) => {
        setSocketUrl(
          `${websocketUrl}/v1/game/connect/${(response as any).name}`,
        );
        setConnectToSocket(true);
      });
    } else {
      console.log("Game is already shared");
    }
  }

  function setGameName(name: string) {
    const temp = cloneDeep(gameData);
    temp.gameName = name;
    onGameDataChange(temp);
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        <Input
          value={gameData.gameName}
          className="!border-none text-3xl text-center"
          onChange={(e) => setGameName(e.target.value)}
        />
        <div className="flex flex-row">
          {gameSharedStatus === "Shared" && <span>{gameShareCode}</span>}
          <Button onClick={shareGame} variant="link">
            <Share2
              className={cn(
                "hover:text-blue-500 ease-in-out duration-300",
                gameSharedStatus === "Connecting"
                  ? "text-yellow-500 hover:text-yellow-500"
                  : "",
                gameSharedStatus === "Shared"
                  ? "text-green-500 hover:text-green-500"
                  : "",
              )}
            />
          </Button>
        </div>
        <PinochleGameEditor
          game={gameData}
          onChange={(d) => setNewGameState(d)}
        />
      </div>
    </div>
  );
}
