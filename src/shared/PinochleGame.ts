import { PinochleRound } from "./PinochleRound.ts";

export class PinochleGame {
  rounds: PinochleRound[];
  currentRoundIndex: number;
  teamAName: string;
  teamBName: string;

  constructor(options?: { teamAName?: string; teamBName?: string }) {
    const { teamAName = "Awesome Team A", teamBName = "Fabulous Team B" } =
      options || {};
    this.teamAName = teamAName;
    this.teamBName = teamBName;
    this.rounds = [];
    this.currentRoundIndex = 0;
    this.rounds.push(new PinochleRound());
  }

  newRound() {
    this.rounds.push(new PinochleRound())
    this.currentRoundIndex++;
  }

  getTeamAScore(upToRound: number) {
    return this.rounds
      .filter((_, index) => index <= upToRound)
      .reduce((acc, round) => acc + round.teamATotalScore, 0);
  }

  getTeamBScore(upToRound: number) {
    return this.rounds
      .filter((_, index) => index <= upToRound)
      .reduce((acc, round) => acc + round.teamBTotalScore, 0);
  }
}
