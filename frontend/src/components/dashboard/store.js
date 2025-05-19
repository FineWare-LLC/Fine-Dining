/**
 * Lightweight global store (Zustand) — eliminates prop‑drilling.
 */
import create from 'zustand';

export const useDashStore = create(set => ({
  drawerOpen: false,
  searchTerm: '',
  toggleDrawer: () => set(s => ({ drawerOpen: !s.drawerOpen })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}));
