/**
 * Lightweight global store (Zustand) — eliminates prop‑drilling.
 * • Named import (`{ create }`) plays nicely with ESM bundlers.
 * • toggleDrawer uses previous state correctly.
 */
import { create } from 'zustand';

export const useDashStore = create((set, get) => ({
    drawerOpen: false,
    searchTerm: '',

    /** Flip the drawer’s open/closed state */
    toggleDrawer() {
        set(state => ({ drawerOpen: !state.drawerOpen }));
    },

    /**
   * Replace the current search term.
   * @param {string} searchTerm
   */
    setSearchTerm(searchTerm) {
        set({ searchTerm });
    },
}));
