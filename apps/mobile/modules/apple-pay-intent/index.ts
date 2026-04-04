import ApplePayIntentModule from "./src/ApplePayIntentModule";

export function syncToken(accessToken: string, refreshToken: string): void {
  ApplePayIntentModule.syncToken(accessToken, refreshToken);
}

export function clearToken(): void {
  ApplePayIntentModule.clearToken();
}

export function syncApiUrl(url: string): void {
  ApplePayIntentModule.syncApiUrl(url);
}

export async function getFailedTransactions(): Promise<
  Array<{
    amount: string;
    currency: string;
    merchant: string;
    date: string;
    retryCount: number;
    transactionName?: string;
    cardName?: string;
  }>
> {
  const json = await ApplePayIntentModule.getFailedTransactions();
  if (!json || json === "[]") return [];
  return JSON.parse(json);
}

export function clearFailedTransactions(): void {
  ApplePayIntentModule.clearFailedTransactions();
}

export async function openShortcutsApp(): Promise<void> {
  await ApplePayIntentModule.openShortcutsApp();
}
