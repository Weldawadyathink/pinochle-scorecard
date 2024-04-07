import { useEffect, useState } from "react";
import { MainGameEditor } from "@/components/MainGameEditor";
import { PinochleGame } from "@/shared/PinochleGame";
import { Button } from "@/components/ui/button";

export default function App() {
  const [gameEditorKey, setGameEditorKey] = useState(crypto.randomUUID());
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [connectToGameName, setConnectToGameName] = useState<string | null>(
    null,
  );
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

  function addNewGame() {
    const temp = [...allGames];
    temp.push(new PinochleGame());
    setAllGames(temp);
  }

  function deleteGame(index: Number) {
    let temp = allGames.filter((_, i) => i !== index);
    if (temp.length < 1) {
      temp = [new PinochleGame()];
    }
    setAllGames(temp);
  }

  function openGame(index: number) {
    setCurrentGameIndex(index);
    setGameEditorKey(crypto.randomUUID());
  }

  useEffect(() => {
    localStorage.setItem("PinochleGames", JSON.stringify(allGames));
  }, [allGames]);

  return (
    <div className="flex flex-row">
      <div className="flex flex-col m-6 gap-6">
        <div className="flex flex-row gap-6">
          <h1 className="my-auto">My Games</h1>
          <Button onClick={addNewGame}>New Game</Button>
        </div>
        {allGames.map((game, index) => (
          <div className="flex flex-row gap-2">
            <Button onClick={() => openGame(index)}>{game.gameName}</Button>
            <Button onClick={() => deleteGame(index)}>delete</Button>
          </div>
        ))}
      </div>
      <MainGameEditor
        key={gameEditorKey}
        gameData={allGames[currentGameIndex]}
        onGameDataChange={setGameData}
      />
    </div>
  );
}
