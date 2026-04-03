import Foundation

public enum KeboAPIError: Error {
  case noToken
  case noApiUrl
  case networkError(Error)
  case serverError(statusCode: Int)
}

public enum KeboAPI {
  /// POST /transactions/quick with payload
  public static func createQuickTransaction(
    amount: String,
    currency: String,
    merchant: String,
    date: String,
    transactionName: String? = nil,
    cardName: String? = nil
  ) async throws {
    guard let token = TokenManager.shared.getAccessToken() else {
      throw KeboAPIError.noToken
    }
    guard let baseUrl = TokenManager.shared.getApiUrl() else {
      throw KeboAPIError.noApiUrl
    }

    let url = URL(string: "\(baseUrl)/transactions/quick")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.timeoutInterval = 15

    var body: [String: Any] = [
      "amount": amount,
      "currency": currency,
      "merchant": merchant,
      "date": date,
    ]
    if let name = transactionName, !name.isEmpty {
      body["transaction_name"] = name
    }
    if let card = cardName, !card.isEmpty {
      body["card_name"] = card
    }

    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse else {
      throw KeboAPIError.serverError(statusCode: 0)
    }

    guard (200...299).contains(httpResponse.statusCode) else {
      throw KeboAPIError.serverError(statusCode: httpResponse.statusCode)
    }
  }
}
