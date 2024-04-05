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
    this.rounds.push(new PinochleRound());
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

  toJSON(): any {
    return {
      rounds: this.rounds,
      currentRoundIndex: this.currentRoundIndex,
      teamAName: this.teamAName,
      teamBName: this.teamBName,
    };
  }

  static fromJSON(json: any) {
    const obj = JSON.parse(json)
    let game = new PinochleGame();
    game.rounds = obj.rounds.map((round: any) => new PinochleRound(round));
    game.currentRoundIndex = obj.currentRoundIndex;
    game.teamAName = obj.teamAName;
    game.teamBName = obj.teamBName;
    return game;
  }
}
