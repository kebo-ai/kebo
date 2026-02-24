import { create } from "zustand"

interface DeleteDialogState {
  open: boolean
  title: string
  description: string
  onConfirm: (() => void) | null
}

interface UIStore {
  balanceVisible: boolean
  toggleBalanceVisible: () => void

  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  deleteDialog: DeleteDialogState
  openDeleteDialog: (opts: {
    title: string
    description: string
    onConfirm: () => void
  }) => void
  closeDeleteDialog: () => void
}

const initialDeleteDialog: DeleteDialogState = {
  open: false,
  title: "",
  description: "",
  onConfirm: null,
}

export const useUIStore = create<UIStore>((set) => ({
  balanceVisible: true,
  toggleBalanceVisible: () =>
    set((state) => ({ balanceVisible: !state.balanceVisible })),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  deleteDialog: initialDeleteDialog,
  openDeleteDialog: ({ title, description, onConfirm }) =>
    set({
      deleteDialog: { open: true, title, description, onConfirm },
    }),
  closeDeleteDialog: () => set({ deleteDialog: initialDeleteDialog }),
}))
