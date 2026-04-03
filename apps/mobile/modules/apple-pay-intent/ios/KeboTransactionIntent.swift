import AppIntents
import Foundation

@available(iOS 16.0, *)
struct KeboTransactionIntent: AppIntent {
  static var title: LocalizedStringResource = "Log Transaction in Kebo"
  static var description = IntentDescription("Log an expense from Apple Pay in Kebo")

  @Parameter(title: "Amount", default: "0.00")
  var amount: String

  @Parameter(title: "Merchant", default: "Unknown")
  var merchant: String

  @Parameter(title: "Name", default: "")
  var transactionName: String

  @Parameter(title: "Card or Pass", default: "")
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
      return .result(dialog: "Logged \(amount) at \(merchant)")
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
      return .result(dialog: "Saved \(amount) at \(merchant) for sync later")
    }
  }
}
