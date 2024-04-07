import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PinochleGame } from "@/shared/PinochleGame";
import { Button } from "@/components/ui/button";
import { Trash2, SquarePlus } from "lucide-react";
import { animated, useTrail } from "@react-spring/web";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { fetcher } from "itty-fetcher";

interface ConnectToGameProps {
  onSetGameName: (name: string) => void;
}

function ConnectToGame({ onSetGameName }: ConnectToGameProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGameNotFound, setIsGameNotFound] = useState(false);
  const [open, setOpen] = useState(false);

  function checkGameName() {
    console.log(`Checking game name: ${name}`);
    setIsLoading(true);
    setIsGameNotFound(false);
    const apiUrl =
      import.meta.env.MODE === "development"
        ? "http://localhost:8787"
        : "https://api.pinochle.spenserbushey.com";
    const api = fetcher({ base: apiUrl });
    api
      .get(`/v1/game/connect/${name}`)
      .then(() => {
        onSetGameName(name);
        setOpen(false);
        setIsGameNotFound(false);
        setIsLoading(false);
      })
      .catch(() => {
        setIsGameNotFound(true);
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Connect to a game</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Game Connection</DialogTitle>
          <DialogDescription>Connect to a shared game</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          {isGameNotFound && (
            <span className="text-red-500">Invalid Game Name</span>
          )}
          <div className="flex flex-row gap-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button disabled={isLoading} onClick={checkGameName}>
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GameListProps {
  games: Array<PinochleGame>;
  onChange: (games: Array<PinochleGame>) => void;
  openGame: (index: number) => void; // Returns index of user selected game
}

function GameList({ games, onChange, openGame }: GameListProps) {
  function deleteGame(index: number) {
    let temp = games.filter((_, i) => i !== index);
    if (temp.length < 1) {
      temp = [new PinochleGame()];
    }
    onChange(temp);
  }

  function addNewGame() {
    const temp = [...games];
    temp.push(new PinochleGame());
    onChange(temp);
  }

  const [spring] = useTrail(
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
        <Button
          onClick={addNewGame}
          variant="link"
          className="hover:text-blue-500"
        >
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

export interface SidebarProps extends GameListProps, ConnectToGameProps {
  children: React.ReactNode;
}

export function Sidebar({
  children,
  onSetGameName,
  games,
  onChange,
  openGame,
}: SidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left">
        <ConnectToGame onSetGameName={onSetGameName} />
        <GameList games={games} onChange={onChange} openGame={openGame} />
      </SheetContent>
    </Sheet>
  );
}
