//
//  PinochleGameView.swift
//  Pinochle Scorecard
//
//  Created by Spenser Bushey on 4/30/24.
//

import SwiftUI
import CoreData

struct PinochleGameView: View {
  @StateObject var game = PinochleGame()
  
  var body: some View {
    ScrollView {
      TextField("Game name", text: Binding<String>(get: { game.gameName }, set: { newValue in
        game.gameName = newValue
      }))
      .multilineTextAlignment(.center)
      .dynamicTypeSize(.xxxLarge)
      
      Text("\(game.teamAName) vs \(game.teamBName)")
      ForEach(game.rounds.indices, id:\.self) {index in
        Text("Round \(index + 1)")
        HStack(spacing: 2, content: {
          VStack(spacing: 2, content: {
            
            Text("Meld")
            Text(String(game.rounds[index].teamAMeldScore))
            Stepper("", value: Binding<Int>(get: {game.rounds[index].teamAMeldScore}, set: {newValue in
              game.rounds[index].teamAMeldScore = newValue
            }), in: 0...Int.max)
            .labelsHidden()
            
            Divider()
            
            Text("Tricks")
            Text(String(game.rounds[index].teamATrickScore))
            Stepper("", value: Binding<Int>(get: {game.rounds[index].teamATrickScore}, set: {newValue in
              game.rounds[index].teamATrickScore = newValue
            }), in: 0...Int.max)
            .labelsHidden()
            
            Divider()
            
            Text("Score")
            Text(String(game.rounds[index].teamATotalScore))
            
          })
          Divider().padding(6)
          VStack(spacing: 2, content: {
            
            Text("Meld")
            Text(String(game.rounds[index].teamBMeldScore))
            Stepper("", value: Binding<Int>(get: {game.rounds[index].teamBMeldScore}, set: {newValue in
              game.rounds[index].teamBMeldScore = newValue
            }), in: 0...Int.max)
            .labelsHidden()
            
            Divider()
            
            Text("Tricks")
            Text(String(game.rounds[index].teamBTrickScore))
            Stepper("", value: Binding<Int>(get: {game.rounds[index].teamATrickScore}, set: {newValue in
              game.rounds[index].teamBTrickScore = newValue
            }), in: 0...Int.max)
            .labelsHidden()
            
            Divider()
            
            Text("Score")
            
            Text(String(game.rounds[index].teamBTotalScore))
            
          })
        })
      }
    }

    Button("Add Round") {
      game.newRound()
    }
  }
}

#Preview {
  ContentView()
    .modelContainer(for: PinochleGame.self)
}
