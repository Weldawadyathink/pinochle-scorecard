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
    for (let i = 0; i < 8; i++) {
      this.rounds.push(new PinochleRound({ roundComplete: true }));
    }
    this.currentRoundIndex = 0;
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
