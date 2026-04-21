import { create } from 'zustand';

interface UiStore {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
