import { create } from 'zustand';
import { authService } from '@/services/authService.js';
import { patientService } from '@/services/patientService.js';

export const useAuthStore = create((set, get) => ({
    user: null,
    patient: null,
    loading: true,
    error: null,

    _fetchCurrentUser: async () => {
        try {
            const res = await authService.getMe();
            const userData = res?.data || res;
            set({ user: userData, error: null });
            return userData;
        } catch (err) {
            set({ user: null, error: err.message });
            return null;
        }
    },

    _fetchCurrentPatient: async () => {
        try {
            const res = await patientService.getMe();
            const patientData = res?.data || res;
            set({ patient: patientData });
            return patientData;
        } catch (err) {
            set({ patient: null });
            return null;
        }
    },

    initAuth: async () => {
        try {
            const userData = await get()._fetchCurrentUser();
            if (userData?.role === 'PATIENT') {
                await get()._fetchCurrentPatient();
            }
        } finally {
            set({ loading: false });
        }
    },

    login: async (credentials) => {
        try {
            const res = await authService.loginNationId(credentials);
            const userData = res?.data;
            if (!userData) throw new Error('No user data returned');
            set({ user: userData, error: null });
            if (userData?.role === 'PATIENT') await get()._fetchCurrentPatient();
            return userData;
        } catch (err) {
            set({ user: null, patient: null, error: err.message });
            throw err;
        }
    },

    loginMetaMask: async (walletAddress, signature, registrationSignature) => {
        try {
            const res = await authService.loginWallet({
                walletAddress,
                signature,
                registrationSignature,
            });
            const userData = res?.data;
            if (!userData) throw new Error('No user data returned');
            set({ user: userData, error: null });
            if (userData?.role === 'PATIENT') await get()._fetchCurrentPatient();
            return userData;
        } catch (err) {
            set({ user: null, patient: null, error: err.message });
            throw err;
        }
    },

    logout: async () => {
        try {
            await authService.logout();
        } finally {
            set({ user: null, patient: null, error: null });
        }
    },

    refreshUser: async () => {
        const userData = await get()._fetchCurrentUser();
        if (userData?.role === 'PATIENT') await get()._fetchCurrentPatient();
        return userData;
    },
}));
