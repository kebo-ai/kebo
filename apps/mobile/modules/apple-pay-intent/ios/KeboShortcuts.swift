import AppIntents

@available(iOS 16.0, *)
struct KeboShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: KeboTransactionIntent(),
      phrases: [
        "Log a transaction in \(.applicationName)",
        "Add expense to \(.applicationName)",
        "Log payment in \(.applicationName)"
      ],
      shortTitle: "Log Transaction",
      systemImageName: "creditcard"
    )
  }
}

/// Standalone function callable from ApplePayIntentModule without @available issues
func registerKeboShortcuts() {
  if #available(iOS 16.0, *) {
    Task {
      try? await KeboShortcuts.updateAppShortcutParameters()
    }
  }
}
