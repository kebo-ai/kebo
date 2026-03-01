const SECOND = 1_000
const MINUTE = 60 * SECOND

export const queryConfig = {
  transactions: {
    staleTime: 30 * SECOND,
    gcTime: 5 * MINUTE,
  },
  balance: {
    staleTime: 30 * SECOND,
    gcTime: 5 * MINUTE,
  },
  accounts: {
    staleTime: 2 * MINUTE,
    gcTime: 10 * MINUTE,
  },
  budgets: {
    staleTime: 2 * MINUTE,
    gcTime: 10 * MINUTE,
  },
  categories: {
    staleTime: 5 * MINUTE,
    gcTime: 10 * MINUTE,
  },
  profile: {
    staleTime: 5 * MINUTE,
    gcTime: 10 * MINUTE,
  },
  reports: {
    staleTime: 5 * MINUTE,
    gcTime: 15 * MINUTE,
  },
  banks: {
    staleTime: 10 * MINUTE,
    gcTime: 30 * MINUTE,
  },
  accountTypes: {
    staleTime: 30 * MINUTE,
    gcTime: 60 * MINUTE,
  },
  icons: {
    staleTime: 30 * MINUTE,
    gcTime: 60 * MINUTE,
  },
}
