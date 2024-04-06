import { Button } from "@/components/ui/button";
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

export interface ConnectToGameProps {
  onSetGameName: (name: string) => void;
}

export function ConnectToGame({ onSetGameName }: ConnectToGameProps) {
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
