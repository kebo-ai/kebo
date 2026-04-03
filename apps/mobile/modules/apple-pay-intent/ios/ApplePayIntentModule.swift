import ExpoModulesCore
import UIKit

public class ApplePayIntentModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ApplePayIntent")

    OnCreate {
      registerKeboShortcuts()
    }

    Function("syncToken") { (accessToken: String, refreshToken: String) in
      TokenManager.shared.setAccessToken(accessToken)
      TokenManager.shared.setRefreshToken(refreshToken)
    }

    Function("clearToken") {
      TokenManager.shared.clearTokens()
    }

    Function("syncApiUrl") { (url: String) in
      TokenManager.shared.setApiUrl(url)
    }

    AsyncFunction("getFailedTransactions") { () -> String in
      let queue = FailedTransactionQueue.shared
      let transactions = queue.getAll()
      guard let data = try? JSONEncoder().encode(transactions) else {
        return "[]"
      }
      return String(data: data, encoding: .utf8) ?? "[]"
    }

    Function("clearFailedTransactions") {
      FailedTransactionQueue.shared.clearAll()
    }

    AsyncFunction("openShortcutsApp") {
      await MainActor.run {
        if let url = URL(string: "shortcuts://app") {
          UIApplication.shared.open(url)
        }
      }
    }
  }
}
