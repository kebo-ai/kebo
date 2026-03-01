export const queryKeys = {
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.transactions.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.transactions.details(), id] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    lists: () => [...queryKeys.accounts.all, "list"] as const,
    list: () => [...queryKeys.accounts.lists()] as const,
    listWithBalance: () =>
      [...queryKeys.accounts.all, "with-balance"] as const,
    details: () => [...queryKeys.accounts.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.accounts.details(), id] as const,
  },
  accountTypes: {
    all: ["account-types"] as const,
  },
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.categories.details(), id] as const,
  },
  banks: {
    all: ["banks"] as const,
    lists: () => [...queryKeys.banks.all, "list"] as const,
    list: () => [...queryKeys.banks.lists()] as const,
    byCountry: (countryCode: string) =>
      [...queryKeys.banks.all, "country", countryCode] as const,
    search: (query: string) =>
      [...queryKeys.banks.all, "search", query] as const,
    details: () => [...queryKeys.banks.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.banks.details(), id] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    lists: () => [...queryKeys.budgets.all, "list"] as const,
    list: () => [...queryKeys.budgets.lists()] as const,
    details: () => [...queryKeys.budgets.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.budgets.details(), id] as const,
  },
  reports: {
    all: ["reports"] as const,
    incomeExpense: (params?: Record<string, unknown>) =>
      [...queryKeys.reports.all, "income-expense", params ?? {}] as const,
    expenseByCategory: (params?: Record<string, unknown>) =>
      [...queryKeys.reports.all, "expense-by-category", params ?? {}] as const,
  },
  balance: {
    all: ["balance"] as const,
  },
  profile: {
    all: ["profile"] as const,
  },
}
