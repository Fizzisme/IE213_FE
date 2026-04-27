import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
    openSidebar: true,
    toggleSidebar: () => set((state) => ({ openSidebar: !state.openSidebar })),
    setOpenSidebar: (value) => set({ openSidebar: value }),
}));
