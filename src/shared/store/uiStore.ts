import { create } from 'zustand'

interface UiState {
  navigationOpen: boolean
  searchOpen: boolean
  notificationsOpen: boolean
  setNavigationOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setNotificationsOpen: (open: boolean) => void
  resetEphemeral: () => void
}

export const useUiStore = create<UiState>((set) => ({
  navigationOpen: false,
  searchOpen: false,
  notificationsOpen: false,
  setNavigationOpen: (navigationOpen) =>
    set({
      navigationOpen,
      ...(navigationOpen ? { searchOpen: false, notificationsOpen: false } : {})
    }),
  setSearchOpen: (searchOpen) =>
    set({ searchOpen, ...(searchOpen ? { navigationOpen: false, notificationsOpen: false } : {}) }),
  setNotificationsOpen: (notificationsOpen) =>
    set({
      notificationsOpen,
      ...(notificationsOpen ? { navigationOpen: false, searchOpen: false } : {})
    }),
  resetEphemeral: () => set({ navigationOpen: false, searchOpen: false, notificationsOpen: false })
}))
