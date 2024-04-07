import { useEffect, useState } from "react";
import { MainGameEditor } from "@/components/MainGameEditor";
import { PinochleGame } from "@/shared/PinochleGame";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

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
    setCurrentGameIndex(allGames.length)
    setAllGames([...allGames, new PinochleGame])
    setGameEditorKey(crypto.randomUUID());
  }

  useEffect(() => {
    localStorage.setItem("PinochleGames", JSON.stringify(allGames));
  }, [allGames]);

  return (
    <div className="flex flex-row">
      <Sidebar games={allGames} onChange={setAllGames} openGame={openGame} onSetGameName={connectToGame}>
        <Button variant="outline">Open Sidebar</Button>
      </Sidebar>
      <MainGameEditor
        key={gameEditorKey}
        gameData={allGames[currentGameIndex]}
        onGameDataChange={setGameData}
        sharedGameName={connectToGameName}
      />
    </div>
  );
}
