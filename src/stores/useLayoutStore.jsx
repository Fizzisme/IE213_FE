import { create } from 'zustand';

export const useLayoutStore = create((set) => ({
    userInfo: null,
    role: '',
    renderExtra: () => <div></div>,
    navItems: [],
    setUserInfo: (user) => {
        set({ userInfo: user });
    },
    setRole: (role) => {
        set({ role: role });
    },
    setRenderExtra: (renderExtra) => {
        set({ renderExtra: renderExtra });
    },
    setNavItems: (navItems) => {
        set({ navItems: navItems });
    },
}));
