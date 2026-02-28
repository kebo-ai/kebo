const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency: string = "USD"): string {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter.format(amount);
}
