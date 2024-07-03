//
//  PinochleGame.swift
//  Pinochle Scorecard
//
//  Created by Spenser Bushey on 4/24/24.
//

import Foundation
import SwiftData

@Model
class PinochleRound: ObservableObject {
    
    var teamAMeldScore = 0
    var teamATrickScore = 0
    var teamBMeldScore = 0
    var teamBTrickScore = 0
    var bid = 25
    var teamWithBid: String = "a"
    var roundComplete = true
    var overrideTeamAHasTakenTrick = false
    var overrideTeamBHasTakenTrick = false
    let uuid = UUID().uuidString
    
    init(options: [String: Any]? = nil) {
        guard let options = options else { return }
        
        teamAMeldScore = options["teamAMeldScore"] as? Int ?? 0
        teamATrickScore = options["teamATrickScore"] as? Int ?? 0
        teamBMeldScore = options["teamBMeldScore"] as? Int ?? 0
        teamBTrickScore = options["teamBTrickScore"] as? Int ?? 0
        bid = options["bid"] as? Int ?? 25
        teamWithBid = options["teamWithBid"] as? String ?? "a"
        roundComplete = options["roundComplete"] as? Bool ?? true
    }
    
    var teamAHasTakenTrick: Bool {
        if overrideTeamAHasTakenTrick {
            return true
        }
        
        return teamATrickScore != 0
    }
    
    var teamBHasTakenTrick: Bool {
        if overrideTeamBHasTakenTrick {
            return true
        }
        
        return teamBTrickScore != 0
    }
    
    var teamATotalScore: Int {
        if isTeamASet {
            return -bid
        }
        
        return teamAMeldScore + teamATrickScore
    }
    
    var teamBTotalScore: Int {
        if isTeamBSet {
            return -bid
        }
        
        return teamBMeldScore + teamBTrickScore
    }
    
    var isTeamASet: Bool {
        if teamWithBid == "a" {
            if !roundComplete {
                return false
            }
            
            if !teamAHasTakenTrick {
                return true
            }
            
            let score = teamAMeldScore + teamATrickScore
            return score < bid
        }
        
        return false
    }
    
    var isTeamBSet: Bool {
        if teamWithBid == "b" {
            if !roundComplete {
                return false
            }
            
            if !teamBHasTakenTrick {
                return true
            }
            
            let score = teamBMeldScore + teamBTrickScore
            return score < bid
        }
        
        return false
    }
    
    func toJSON() -> String {
        let dict: [String: Any] = [
            "teamAMeldScore": teamAMeldScore,
            "teamATrickScore": teamATrickScore,
            "teamBMeldScore": teamBMeldScore,
            "teamBTrickScore": teamBTrickScore,
            "bid": bid,
            "teamWithBid": teamWithBid,
            "roundComplete": roundComplete,
            "overrideTeamAHasTakenTrick": overrideTeamAHasTakenTrick,
            "overrideTeamBHasTakenTrick": overrideTeamBHasTakenTrick,
            "uuid": uuid,
        ]
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted)
            
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                return jsonString // Now it's a JSON string
            } else {
                return ""
            }
        } catch {
            print("Error trying to convert data to JSON")
            return ""
        }
    }
    
    static func fromObject(obj: Any) -> PinochleRound {
        return PinochleRound(options: obj as? [String: Any])
    }
}

enum PinochleGameParseError: Error {
    case invalidJson
    case missingElements
}

@Model
class PinochleGame: ObservableObject {
    var rounds: [PinochleRound]
    var currentRoundIndex: Int
    var teamAName: String
    var teamBName: String
    var gameName: String
    var uuid: String
    
    init(options: [String: Any]? = nil) {
        let teamAName = options?["teamAName"] as? String ?? "Awesome Team A"
        let teamBName = options?["teamBName"] as? String ?? "Fabulous Team B"
        let gameName = (options?["gameName"] as? String) ?? "Default Game Name"
        let uuid = options?["uuid"] as? String ?? UUID().uuidString
        
        self.teamAName = teamAName
        self.teamBName = teamBName
        self.rounds = []
        self.currentRoundIndex = 0
        self.gameName = gameName
        self.uuid = uuid
        self.rounds.append(PinochleRound())
    }
    
    func newRound() {
        self.rounds.append(PinochleRound())
        self.currentRoundIndex += 1
    }
    
    func getTeamAScore(upToRound: Int) -> Int {
        return rounds.prefix(upToRound).reduce(0, { (total, round) in
            total + round.teamATotalScore
        })
    }
    
    func getTeamBScore(upToRound: Int) -> Int {
        return rounds.prefix(upToRound).reduce(0, { (total, round) in
            total + round.teamBTotalScore
        })
    }
    
    func toJSON() -> Any {
        return ["rounds": self.rounds,
                "currentRoundIndex": self.currentRoundIndex,
                "teamAName": self.teamAName,
                "teamBName": self.teamBName,
                "gameName": self.gameName]
    }
    
    static func fromJSON(_ json: String) throws -> PinochleGame {
        guard let data = json.data(using: .utf8),
              let gameDict = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {throw PinochleGameParseError.invalidJson}

        guard let roundsArr = gameDict["rounds"] as? [[String: Any]] else { throw PinochleGameParseError.missingElements }

        var rounds: [PinochleRound] = []
        for round in roundsArr {
            let roundObj = PinochleRound(options: round)
            rounds.append(roundObj)
        }

        let game = PinochleGame()
        game.rounds = rounds
        game.currentRoundIndex = (gameDict["currentRoundIndex"] as? Int) ?? 0
        game.teamAName = gameDict["teamAName"] as? String ?? ""
        game.teamBName = gameDict["teamBName"] as? String ?? ""
        game.gameName = gameDict["gameName"] as? String ?? ""

        return game
    }

}

let gamestr = """
{
  "rounds": [
    {
      "teamAMeldScore": 0,
      "teamATrickScore": 0,
      "teamBMeldScore": 0,
      "teamBTrickScore": 0,
      "bid": 25,
      "teamWithBid": "a",
      "roundComplete": true,
      "overrideTeamAHasTakenTrick": false,
      "overrideTeamBHasTakenTrick": false,
      "uuid": "5983abe9-c953-4c12-8d84-356838163aed"
    },
    {
      "teamAMeldScore": 0,
      "teamATrickScore": 0,
      "teamBMeldScore": 6,
      "teamBTrickScore": 0,
      "bid": 25,
      "teamWithBid": "a",
      "roundComplete": true,
      "overrideTeamAHasTakenTrick": false,
      "overrideTeamBHasTakenTrick": false,
      "uuid": "8e1fcef4-74ef-4c4a-83bd-ab49305ec712"
    },
    {
      "teamAMeldScore": 0,
      "teamATrickScore": 0,
      "teamBMeldScore": 30,
      "teamBTrickScore": 50,
      "bid": 25,
      "teamWithBid": "a",
      "roundComplete": true,
      "overrideTeamAHasTakenTrick": false,
      "overrideTeamBHasTakenTrick": false,
      "uuid": "dca29c84-2b10-4a42-a15c-2aa726e6171f"
    },
    {
      "teamAMeldScore": 0,
      "teamATrickScore": 0,
      "teamBMeldScore": 0,
      "teamBTrickScore": 0,
      "bid": 25,
      "teamWithBid": "a",
      "roundComplete": true,
      "overrideTeamAHasTakenTrick": false,
      "overrideTeamBHasTakenTrick": false,
      "uuid": "fa66c2c4-f946-4b80-a273-73a4d0c331ca"
    }
  ],
  "currentRoundIndex": 3,
  "teamAName": "Awesome Team A",
  "teamBName": "Fabulous Team B",
  "gameName": "Hi there swift"
}
"""
//let g = try! PinochleGame.fromJSON(gamestr)
//
//print(g.toJSON())
