export class PinochleRound {
  teamAMeldScore: number;
  teamATrickScore: number;
  teamBMeldScore: number;
  teamBTrickScore: number;
  bid: number;
  teamWithBid: "a" | "b";
  roundComplete: boolean;
  _teamAHasTakenTrick: boolean;
  _teamBHasTakenTrick: boolean;

  constructor(options?: {
    teamAMeldScore?: number;
    teamATrickScore?: number;
    teamBMeldScore?: number;
    teamBTrickScore?: number;
    bid?: number;
    teamWithBid?: "a" | "b";
    roundComplete?: boolean;
  }) {
    const {
      teamAMeldScore = 0,
      teamATrickScore = 0,
      teamBMeldScore = 0,
      teamBTrickScore = 0,
      bid = 25,
      teamWithBid = "a",
      roundComplete = false,
    } = options || {};
    this.teamAMeldScore = teamAMeldScore;
    this.teamATrickScore = teamATrickScore;
    this.teamBMeldScore = teamBMeldScore;
    this.teamBTrickScore = teamBTrickScore;
    this.bid = bid;
    this.teamWithBid = teamWithBid;
    this.roundComplete = roundComplete;
    this._teamAHasTakenTrick = false;
    this._teamBHasTakenTrick = false;
  }

  // Team must take trick to not go set, but trick doesn't need to have points
  get teamAHasTakenTrick() {
    if (this._teamAHasTakenTrick) {
      return true;
    }
    return this.teamATrickScore !== 0;
  }

  get teamBHasTakenTrick() {
    if (this._teamBHasTakenTrick) {
      return true;
    }
    return this.teamBTrickScore !== 0;
  }

  set teamAHasTakenTrick(newVal) {
    this._teamAHasTakenTrick = newVal;
  }

  set teamBHasTakenTrick(newVal) {
    this._teamBHasTakenTrick = newVal;
  }

  get teamATotalScore() {
    if (this.isTeamASet) {
      return -this.bid;
    }
    return this.teamAMeldScore + this.teamATrickScore;
  }

  get teamBTotalScore() {
    if (this.isTeamBSet) {
      return -this.bid;
    }
    return this.teamBMeldScore + this.teamBTrickScore;
  }

  get isTeamASet() {
    if (this.teamWithBid === "a") {
      if (!this.roundComplete) {
        return false;
      }
      if (!this.teamAHasTakenTrick) {
        return true;
      }
      const score = this.teamAMeldScore + this.teamATrickScore;
      return score < this.bid;
    }
    return false;
  }

  get isTeamBSet() {
    if (this.teamWithBid === "b") {
      if (!this.roundComplete) {
        return false;
      }
      if (!this.teamBHasTakenTrick) {
        return true;
      }
      const score = this.teamBMeldScore + this.teamBTrickScore;
      return score < this.bid;
    }
    return false;
  }

  clone() {
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      JSON.parse(JSON.stringify(this)),
    );
  }
}
