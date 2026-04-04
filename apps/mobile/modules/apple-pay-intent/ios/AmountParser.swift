import Foundation

public struct ParsedAmount {
  public let value: Double
  public let currency: String
}

public enum AmountParser {
  /// Map of common currency symbols to ISO 4217 codes
  private static let symbolToCurrency: [String: String] = [
    "$": "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₹": "INR",
    "R$": "BRL",
    "₩": "KRW",
    "CHF": "CHF",
    "kr": "SEK",
    "zł": "PLN",
    "₽": "RUB",
    "₺": "TRY",
    "₴": "UAH",
    "₦": "NGN",
    "₿": "BTC",
    "CA$": "CAD",
    "A$": "AUD",
    "NZ$": "NZD",
    "HK$": "HKD",
    "S$": "SGD",
    "MX$": "MXN",
    "COP$": "COP",
    "CLP$": "CLP",
    "ARS$": "ARS",
  ]

  /// Zero-decimal currencies (no cents)
  private static let zeroDecimalCurrencies: Set<String> = [
    "JPY", "KRW", "VND", "CLP", "ISK", "UGX",
  ]

  /// Parse a locale-formatted amount string from Shortcuts
  /// Examples: "$42.50", "€42,50", "¥4,250", "42.50 USD"
  public static func parse(_ input: String, fallbackCurrency: String = "USD") -> ParsedAmount {
    let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)

    // Detect currency from symbol or suffix
    let currency = detectCurrency(from: trimmed) ?? fallbackCurrency

    // Strip currency symbols and whitespace to get the numeric part
    var numericString = trimmed
    for (symbol, _) in symbolToCurrency.sorted(by: { $0.key.count > $1.key.count }) {
      numericString = numericString.replacingOccurrences(of: symbol, with: "")
    }
    // Also strip 3-letter currency codes at start or end
    let codePattern = "^[A-Z]{3}\\s*|\\s*[A-Z]{3}$"
    if let regex = try? NSRegularExpression(pattern: codePattern) {
      let range = NSRange(numericString.startIndex..., in: numericString)
      numericString = regex.stringByReplacingMatches(in: numericString, range: range, withTemplate: "")
    }
    numericString = numericString.trimmingCharacters(in: .whitespacesAndNewlines)

    // Parse the numeric value using locale-aware detection
    let value = parseNumericValue(numericString, currency: currency)

    return ParsedAmount(value: value, currency: currency)
  }

  private static func detectCurrency(from input: String) -> String? {
    // Check multi-char symbols first (sorted by length, longest first)
    for (symbol, code) in symbolToCurrency.sorted(by: { $0.key.count > $1.key.count }) {
      if input.contains(symbol) {
        return code
      }
    }

    // Check for 3-letter ISO code at start or end
    let pattern = "^([A-Z]{3})\\s|\\s([A-Z]{3})$"
    if let regex = try? NSRegularExpression(pattern: pattern),
       let match = regex.firstMatch(in: input, range: NSRange(input.startIndex..., in: input)) {
      for i in 1..<match.numberOfRanges {
        let range = match.range(at: i)
        if range.location != NSNotFound, let swiftRange = Range(range, in: input) {
          return String(input[swiftRange])
        }
      }
    }

    return nil
  }

  private static func parseNumericValue(_ string: String, currency: String) -> Double {
    // Try the user's current locale formatter first
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.locale = Locale.current

    if let value = formatter.number(from: string)?.doubleValue {
      return roundForCurrency(value, currency: currency)
    }

    // Heuristic: determine if comma or period is the decimal separator
    // "1,234.56" → period is decimal
    // "1.234,56" → comma is decimal
    // "42,50" → comma is decimal (no thousands)
    // "42.50" → period is decimal
    let lastComma = string.lastIndex(of: ",")
    let lastPeriod = string.lastIndex(of: ".")

    var cleaned = string

    if let lc = lastComma, let lp = lastPeriod {
      if lc > lp {
        // Comma is decimal separator: "1.234,56"
        cleaned = string.replacingOccurrences(of: ".", with: "")
          .replacingOccurrences(of: ",", with: ".")
      } else {
        // Period is decimal separator: "1,234.56"
        cleaned = string.replacingOccurrences(of: ",", with: "")
      }
    } else if lastComma != nil {
      // Only comma: check if it looks like decimal
      let parts = string.split(separator: ",")
      if parts.count == 2, parts[1].count <= 2 {
        // "42,50" → decimal
        cleaned = string.replacingOccurrences(of: ",", with: ".")
      } else {
        // "4,250" → thousands separator
        cleaned = string.replacingOccurrences(of: ",", with: "")
      }
    } else if lastPeriod != nil {
      // Only period: likely decimal separator, keep as-is
      cleaned = string.replacingOccurrences(of: " ", with: "")
    }

    let value = Double(cleaned) ?? 0.0
    return roundForCurrency(value, currency: currency)
  }

  private static func roundForCurrency(_ value: Double, currency: String) -> Double {
    if zeroDecimalCurrencies.contains(currency) {
      return value.rounded()
    }
    return (value * 100).rounded() / 100
  }
}
