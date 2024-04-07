import { PinochleGame } from "@/shared/PinochleGame";
import { Button } from "@/components/ui/button";
import { Trash2, SquarePlus } from "lucide-react";
import { animated, useSprings } from "@react-spring/web";

export interface GameListProps {
  games: Array<PinochleGame>;
  onChange: (games: Array<PinochleGame>) => void;
  openGame: (index: number) => void; // Returns index of user selected game
}

export function GameList({ games, onChange, openGame }: GameListProps) {
  function deleteGame(index: number) {
    let temp = games.filter((_, i) => i !== index);
    if (temp.length < 1) {
      temp = [new PinochleGame()];
    }
    springApi.start((i) => {
      return i !== index
        ? {}
        : {
            to: { x: -100, opacity: 0, scale: 0.9 },
            onRest: () => {
              onChange(temp);
              springApi.set({ opacity: 1, x: 0, scale: 1 });
            },
          };
    });
  }

  function addNewGame() {
    const temp = [...games];
    temp.push(new PinochleGame());
    onChange(temp);
  }

  const [spring, springApi] = useSprings(
    games.length,
    () => ({
      from: { opacity: 0, y: 100, x: 0, scale: 1 },
      to: { opacity: 1, y: 0 },
    }),
    [games],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-6">
        <h1 className="m-auto text-2xl">My Games</h1>
        <Button onClick={addNewGame} variant="link" className="hover:text-blue-500">
          <SquarePlus />
        </Button>
      </div>

      {games.map((game, index) => (
        <animated.div
          style={spring[index]}
          key={index}
          className="flex flex-row gap-2"
        >
          <Button onClick={() => openGame(index)} className="w-72">
            {game.gameName}
          </Button>
          <Button
            onClick={() => deleteGame(index)}
            variant="link"
            className="hover:text-red-500"
          >
            <Trash2 />
          </Button>
        </animated.div>
      ))}
    </div>
  );
}
