import { create } from "zustand"

interface TransactionFilters {
  accountId: string | undefined
  categoryId: string | undefined
  transactionType: string | undefined
  search: string | undefined
  page: number
}

interface FiltersStore {
  filters: TransactionFilters
  setFilter: <K extends keyof Omit<TransactionFilters, "page">>(
    key: K,
    value: TransactionFilters[K]
  ) => void
  setPage: (page: number) => void
  resetFilters: () => void
}

const initialFilters: TransactionFilters = {
  accountId: undefined,
  categoryId: undefined,
  transactionType: undefined,
  search: undefined,
  page: 1,
}

export const useFiltersStore = create<FiltersStore>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 1 },
    })),
  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}))
