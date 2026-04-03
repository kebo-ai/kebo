import Foundation

public struct FailedTransaction: Codable {
  public let amount: String
  public let currency: String
  public let merchant: String
  public let date: String
  public var retryCount: Int
  public let transactionName: String?
  public let cardName: String?

  public init(amount: String, currency: String, merchant: String, date: String, retryCount: Int = 0, transactionName: String? = nil, cardName: String? = nil) {
    self.amount = amount
    self.currency = currency
    self.merchant = merchant
    self.date = date
    self.retryCount = retryCount
    self.transactionName = transactionName
    self.cardName = cardName
  }
}

public final class FailedTransactionQueue {
  public static let shared = FailedTransactionQueue()

  private let suiteName = "group.com.kebo.app.mobile"
  private let queueKey = "kebo_failed_transactions"

  private var defaults: UserDefaults? {
    UserDefaults(suiteName: suiteName)
  }

  private init() {}

  public func enqueue(_ transaction: FailedTransaction) {
    var current = getAll()
    current.append(transaction)
    save(current)
  }

  public func getAll() -> [FailedTransaction] {
    guard let data = defaults?.data(forKey: queueKey) else { return [] }
    return (try? JSONDecoder().decode([FailedTransaction].self, from: data)) ?? []
  }

  public func clearAll() {
    defaults?.removeObject(forKey: queueKey)
  }

  private func save(_ transactions: [FailedTransaction]) {
    guard let data = try? JSONEncoder().encode(transactions) else { return }
    defaults?.set(data, forKey: queueKey)
  }
}
