import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '@/utils/api.js';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const _fetchCurrentUser = async () => {
        try {
            const res = await api.get('/auth/me');
            const userData = res.data.data || res.data;
            setUser(userData);
            setError(null);
            return userData;
        } catch (err) {
            console.error('Error fetching user:', err);
            setUser(null);
            setError(err.message);
            return null;
        }
    };

    const _fetchCurrentPatient = async () => {
        try {
            const res = await api.get('/patients/me');
            const patientData = res.data.data || res.data;
            setPatient(patientData);
            setError(null);
            return patientData;
        } catch (err) {
            console.error('Error fetching patient:', err);
            setPatient(null);
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const userData = await _fetchCurrentUser();
                if (userData?.role === 'PATIENT') {
                    await _fetchCurrentPatient();
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // ✅ FIX: Login phải chờ xong tất cả
    const login = async (credentials) => {
        try {
            const res = await api.post('/auth/login/nationId', credentials);
            const userData = res?.data?.data;

            if (!userData) {
                throw new Error('No user data returned from login');
            }

            // ✅ Set user state
            setUser(userData);
            setError(null);

            // ✅ Fetch patient nếu là PATIENT
            if (userData?.role === 'PATIENT') {
                await _fetchCurrentPatient();
            }

            console.log('✅ Login success:', userData);
            return userData;
        } catch (err) {
            console.error('❌ Login error:', err);
            setUser(null);
            setPatient(null);
            setError(err.message || 'Login failed');
            throw err;
        }
    };

    // ✅ FIX: MetaMask login cũng phải chờ xong
    const loginMetaMask = async (walletAddress, signature) => {
        try {
            const res = await api.post('/auth/login/wallet', { walletAddress, signature });
            const userData = res?.data?.data;

            if (!userData) {
                throw new Error('No user data returned from MetaMask login');
            }

            setUser(userData);
            setError(null);

            if (userData?.role === 'PATIENT') {
                await _fetchCurrentPatient();
            }

            console.log('✅ MetaMask login success:', userData);
            return userData;
        } catch (err) {
            console.error('❌ MetaMask login error:', err);
            setUser(null);
            setPatient(null);
            setError(err.message || 'MetaMask login failed');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.delete('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setPatient(null);
            setError(null);
        }
    };

    const refreshUser = async () => {
        const userData = await _fetchCurrentUser();
        if (userData?.role === 'PATIENT') {
            await _fetchCurrentPatient();
        }
        return userData;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                patient,
                login,
                loginMetaMask,
                logout,
                refreshUser,
                loading,
                error,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
