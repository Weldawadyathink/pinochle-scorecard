import { PinochleGame } from "@/shared/PinochleGame";
import { PinochleRound } from "@/shared/PinochleRound";
import { cloneDeep } from "lodash-es";
import { PinochleRoundEditor } from "./PinochleRoundEditor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface PinochleGameEditorProps {
  data: PinochleGame;
  onChange: (data: PinochleGame) => void;
}

export function PinochleGameEditor({
  data,
  onChange,
}: PinochleGameEditorProps) {
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

  return (
    <>
      <Accordion type="single">
        {data.rounds.map((round, index) => {
          const roundNumber = index + 1;
          const teamACumulativeScore = data.getTeamAScore(index);
          const teamBCumulativeScore = data.getTeamBScore(index);
          return (
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
          );
        })}
      </Accordion>
      <Button onClick={newRound}>New Round</Button>
    </>
  );
}