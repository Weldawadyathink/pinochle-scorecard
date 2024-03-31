import { PinochleRound } from "../shared/PinochleRound.ts";
import { set, cloneDeep } from "lodash-es";

export interface PinochleRoundEditorProps {
  data: PinochleRound;
  onChange: (data: PinochleRound) => void;
}

export function PinochleRoundEditor({
  data,
  onChange,
}: PinochleRoundEditorProps) {
  function setData(path: string, value: unknown) {
    const temp = cloneDeep(data);
    set(temp, path, value);
    onChange(temp);
  }
  return (
    <>
      <div className="columns-2">
        <div>
          <p>
            Team A Meld:{" "}
            <input
              className="max-w-12"
              type="number"
              value={data.teamAMeldScore}
              onChange={(e) => setData("teamAMeldScore", e.target.value)}
            />
          </p>
        </div>
        <p>{JSON.stringify(data)}</p>
      </div>
    </>
  );
}
