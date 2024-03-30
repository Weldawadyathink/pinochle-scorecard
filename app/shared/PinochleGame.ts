import { PinochleRound } from "./PinochleRound.ts";

export class PinochleGame {
  rounds: PinochleRound[];
  currentRoundIndex: number;

  constructor() {
    this.rounds = [];
    for (let i = 0; i < 8; i++) {
      this.rounds.push(new PinochleRound());
    }
    this.currentRoundIndex = 0;
  }

  startNextRound() {
    if (this.isGameOver()) {
      throw new Error("The game is over, no more rounds can be played");
    }
    this.rounds[this.currentRoundIndex];
    this.currentRoundIndex++;
  }

  isGameOver() {
    return this.currentRoundIndex >= this.rounds.length;
  }

  getTeamAScore(upToRound: number) {
    let score = 0;
    for (let i = 0; i < Math.min(this.currentRoundIndex, upToRound); i++) {
      score += this.rounds[i].teamAMeldScore + this.rounds[i].teamATrickScore;
    }
    return score;
  }

  getTeamBScore(upToRound: number) {
    let score = 0;
    for (let i = 0; i < Math.min(this.currentRoundIndex, upToRound); i++) {
      score += this.rounds[i].teamBMeldScore + this.rounds[i].teamBTrickScore;
    }
    return score;
  }

  clone() {
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      JSON.parse(JSON.stringify(this)),
    );
  }
}
