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
          NavigationLink(destination: PinochleGameView(game: game)) {
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
