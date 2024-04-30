//
//  Pinochle_ScorecardApp.swift
//  Pinochle Scorecard
//
//  Created by Spenser Bushey on 4/24/24.
//

import SwiftUI
import SwiftData

@main
struct Pinochle_ScorecardApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            PinochleGame.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(sharedModelContainer)
    }
}
