import AppIntents
import Foundation

@available(iOS 16.0, *)
struct KeboTransactionIntent: AppIntent {
  static var title: LocalizedStringResource = "Log Transaction in Kebo"
  static var description = IntentDescription(LocalizedStringResource("Log an expense in Kebo"))

  @Parameter(title: LocalizedStringResource("Amount"), default: "0.00")
  var amount: String

  @Parameter(title: LocalizedStringResource("Merchant"), default: "Unknown")
  var merchant: String

  @Parameter(title: LocalizedStringResource("Name"), default: "")
  var transactionName: String

  @Parameter(title: LocalizedStringResource("Card or Pass"), default: "")
  var cardName: String

  static var parameterSummary: some ParameterSummary {
    Summary("Log \(\.$amount) at \(\.$merchant) named \(\.$transactionName) from \(\.$cardName)")
  }

  func perform() async throws -> some IntentResult & ProvidesDialog {
    let parsed = AmountParser.parse(amount)
    let amountString = String(format: "%.2f", parsed.value)
    let dateString = ISO8601DateFormatter().string(from: Date())

    do {
      try await KeboAPI.createQuickTransaction(
        amount: amountString,
        currency: parsed.currency,
        merchant: merchant,
        date: dateString,
        transactionName: transactionName.isEmpty ? nil : transactionName,
        cardName: cardName.isEmpty ? nil : cardName
      )
      let msg = String(format: String(localized: "Logged %@ at %@", table: "AppIntents"), amount, merchant)
      return .result(dialog: IntentDialog(stringLiteral: msg))
    } catch {
      let failed = FailedTransaction(
        amount: amountString,
        currency: parsed.currency,
        merchant: merchant,
        date: dateString,
        transactionName: transactionName.isEmpty ? nil : transactionName,
        cardName: cardName.isEmpty ? nil : cardName
      )
      FailedTransactionQueue.shared.enqueue(failed)
      let msg = String(format: String(localized: "Saved %@ at %@ for sync later", table: "AppIntents"), amount, merchant)
      return .result(dialog: IntentDialog(stringLiteral: msg))
    }
  }
}
