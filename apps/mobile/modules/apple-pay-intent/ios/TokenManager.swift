import Foundation

public final class TokenManager {
  public static let shared = TokenManager()

  private let suiteName = "group.com.kebo.app.mobile"
  private let accessTokenKey = "kebo_access_token"
  private let refreshTokenKey = "kebo_refresh_token"
  private let apiUrlKey = "kebo_api_url"

  private var defaults: UserDefaults? {
    UserDefaults(suiteName: suiteName)
  }

  private init() {}

  public func getAccessToken() -> String? {
    defaults?.string(forKey: accessTokenKey)
  }

  public func setAccessToken(_ token: String) {
    defaults?.set(token, forKey: accessTokenKey)
  }

  public func getRefreshToken() -> String? {
    defaults?.string(forKey: refreshTokenKey)
  }

  public func setRefreshToken(_ token: String) {
    defaults?.set(token, forKey: refreshTokenKey)
  }

  public func getApiUrl() -> String? {
    defaults?.string(forKey: apiUrlKey)
  }

  public func setApiUrl(_ url: String) {
    defaults?.set(url, forKey: apiUrlKey)
  }

  public func clearTokens() {
    defaults?.removeObject(forKey: accessTokenKey)
    defaults?.removeObject(forKey: refreshTokenKey)
  }
}
