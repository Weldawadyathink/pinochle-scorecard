//
//  ContentView.swift
//  Pinochle Scorecard
//
//  Created by Spenser Bushey on 4/24/24.
//

import SwiftUI
import SwiftData

struct ContentView: View {
  @Environment(\.modelContext) private var modelContext
  @Query private var games: [PinochleGame]
  
  var body: some View {
    NavigationSplitView {
      List {
        ForEach(games) { game in
          NavigationLink {
            Text(game.gameName)
            TextField("Game name", text: Binding<String>(get: { game.gameName }, set: { newValue in
              game.gameName = newValue
              try? modelContext.save()
            }))
            Text("\(game.teamAName) vs \(game.teamBName)")
            ForEach(game.rounds) {round in
              HStack(spacing: 2, content: {
                VStack(spacing: 2, content: {
                  Stepper("", value: Binding<Int>(get: {round.teamAMeldScore}, set: {newValue in
                    round.teamAMeldScore = newValue
                  }), in: 0...Int.max)
                  .labelsHidden()
                })
                Divider().padding(6)
                VStack(spacing: 2, content: {
                  Stepper("", value: Binding<Int>(get: {round.teamBMeldScore}, set: {newValue in
                    round.teamBMeldScore = newValue
                  }), in: 0...Int.max)
                  .labelsHidden()
                })
              })
            }
          } label: {
            Text(game.gameName)
          }
        }
        .onDelete(perform: deleteItems)
      }
      .toolbar {
        ToolbarItem(placement: .navigationBarTrailing) {
          EditButton()
        }
        ToolbarItem {
          Button(action: addItem) {
            Label("Add Item", systemImage: "plus")
          }
        }
      }
    } detail: {
      Text("Select an item")
    }
  }
  
  private func addItem() {
    withAnimation {
      let newGame = PinochleGame()
      modelContext.insert(newGame)
    }
  }
  
  private func deleteItems(offsets: IndexSet) {
    withAnimation {
      for index in offsets {
        modelContext.delete(games[index])
      }
    }
  }
}

#Preview {
  ContentView()
    .modelContainer(for: PinochleGame.self)
}
