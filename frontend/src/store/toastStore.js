import { create } from 'zustand';

export const useToastStore = create((set) => ({
    toasts: [],
    queue: [],
    /**
   * Add a toast to the stack. If the stack already contains 3 toasts,
   * the toast is queued until space is available.
   * @param {{message:string,type:'success'|'error'|'info',duration?:number,id?:string}} toast
   * @returns {string} The toast id.
   */
    addToast(toast) {
        const id = toast.id || String(Date.now() + Math.random());
        const newToast = { ...toast, id };
        set((state) => {
            if (state.toasts.length >= 3) {
                return { queue: [...state.queue, newToast] };
            }
            return { toasts: [...state.toasts, newToast] };
        });
        return id;
    },
    /** Remove a toast by id and pull next toast from the queue if available. */
    removeToast(id) {
        set((state) => {
            const remaining = state.toasts.filter((t) => t.id !== id);
            const next = state.queue[0];
            const rest = state.queue.slice(1);
            if (next && remaining.length < 3) {
                return { toasts: [...remaining, next], queue: rest };
            }
            return { toasts: remaining, queue: rest.length ? rest : state.queue };
        });
    },
    /** Clear all toasts and queue (used for tests). */
    reset() {
        set({ toasts: [], queue: [] });
    },
}));
