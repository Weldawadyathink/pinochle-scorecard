import { PinochleRound } from "../shared/PinochleRound.ts";
import { set, cloneDeep } from "lodash-es";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface PinochleRoundEditorProps {
  data: PinochleRound;
  onChange: (data: PinochleRound) => void;
}

export function PinochleRoundEditor({
  data,
  onChange,
}: PinochleRoundEditorProps) {
  function setData(path: string, value: any) {
    const temp = cloneDeep(data);
    set(temp, path, value);
    onChange(temp);
  }

  function setInt(path: string, value: string) {
    const temp = cloneDeep(data);
    set(temp, path, parseInt(value));
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
