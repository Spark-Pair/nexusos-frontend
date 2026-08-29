import { create } from 'zustand'

interface UiState {
  navigationOpen: boolean
  setNavigationOpen(open: boolean): void
}

export const useUiStore = create<UiState>((set) => ({
  navigationOpen: false,
  setNavigationOpen: (navigationOpen) => set({ navigationOpen })
}))
