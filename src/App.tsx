import { useEffect, useState } from "react";
import { MainGameEditor } from "@/components/MainGameEditor";
import { PinochleGame } from "@/shared/PinochleGame";
import { ConnectToGame } from "./components/ConnectToGame";
import { GameList } from "@/components/GameList";
import { Unplug } from "lucide-react";

export default function App() {
  const [gameEditorKey, setGameEditorKey] = useState(crypto.randomUUID());
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [connectToGameName, setConnectToGameName] = useState<
    string | undefined
  >(undefined);
  const [allGames, setAllGames] = useState<Array<PinochleGame>>(() => {
    const savedGames = localStorage.getItem("PinochleGames");
    let parsedGames = null;
    if (savedGames) {
      const parsed = JSON.parse(savedGames);
      parsedGames = parsed.map((item: any) => PinochleGame.fromJSON(item));
    }
    return parsedGames || [new PinochleGame()];
  });

  function setGameData(data: PinochleGame) {
    const temp = [...allGames];
    temp[currentGameIndex] = data;
    setAllGames(temp);
  }

  function openGame(index: number) {
    setCurrentGameIndex(index);
    setGameEditorKey(crypto.randomUUID());
    setConnectToGameName(undefined);
  }

  function connectToGame(name: string) {
    setConnectToGameName(name);
    setGameEditorKey(crypto.randomUUID());
  }

  useEffect(() => {
    localStorage.setItem("PinochleGames", JSON.stringify(allGames));
  }, [allGames]);

  return (
    <div className="flex flex-row">
      <div className="flex flex-col m-6 gap-6">
        <ConnectToGame onSetGameName={connectToGame} />
        <GameList games={allGames} onChange={setAllGames} openGame={openGame} />
      </div>
      <MainGameEditor
        key={gameEditorKey}
        gameData={allGames[currentGameIndex]}
        onGameDataChange={setGameData}
        sharedGameName={connectToGameName}
      />
    </div>
  );
}
