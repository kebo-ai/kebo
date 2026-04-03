import { requireNativeModule } from "expo-modules-core";

interface ApplePayIntentModuleType {
  syncToken(accessToken: string, refreshToken: string): void;
  clearToken(): void;
  getFailedTransactions(): Promise<string>;
  clearFailedTransactions(): void;
  syncApiUrl(url: string): void;
  openShortcutsApp(): Promise<void>;
}

export default requireNativeModule<ApplePayIntentModuleType>(
  "ApplePayIntent"
);
