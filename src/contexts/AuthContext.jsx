// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

// Custom hook để gọi cho lẹ ở các trang khác
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [user, setUser] = useState(null);
    // 1. Hỏi server "Tôi là ai?" dựa vào cookie trình duyệt tự gửi
    const _fetchCurrentUser = async () => {
        try {
            const res = await api.get('/auth/me');
            const userData = res.data.data || res.data;
            setUser(userData);
        } catch {
            // 404 → chưa có hồ sơ → bình thường, không phải lỗi
            setPatient(null);
        }
    };
    const _fetchCurrentPatient = async () => {
        try {
            // Cookie tự gửi lên → server biết là ai → query Patient theo userId
            const res = await api.get('/patients/me');
            const patientData = res.data.data || res.data;
            setPatient(patientData);
        } catch {
            // 404 → chưa có hồ sơ → bình thường, không phải lỗi
            setPatient(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        _fetchCurrentPatient();
        _fetchCurrentUser();
    }, []);

    // 2. Hàm Login: Trả về user data để AuthPage điều hướng
    const login = async (credentials) => {
        // Backend tự động set HTTP-only cookie vào trình duyệt sau lệnh này
        const res = await api.post('/auth/login/nationId', credentials);
        setUser(res);
        console.log(res);
        // Cập nhật lại state user ngay lập tức
        await _fetchCurrentPatient();
        await _fetchCurrentUser();
    };

    // 3. Hàm Login MetaMask
    const loginMetaMask = async (walletAddress, signature) => {
        const res = await api.post('/auth/login/wallet', { walletAddress, signature });
        setUser(res);
        console.log(res);
        await _fetchCurrentPatient();
        await _fetchCurrentUser();
    };

    // 4. Hàm Logout
    const logout = async () => {
        try {
            await api.delete('/auth/logout');
        } catch (error) {
            console.error('Lỗi đăng xuất', error);
        }
    };

    // 5. Hàm Refresh (Dùng khi tạo hồ sơ xong)
    const refreshUser = () => _fetchCurrentPatient();
    console.log(user);
    return (
        <AuthContext.Provider value={{ user, patient, login, loginMetaMask, logout, refreshUser, loading }}>
            {/* Ẩn toàn bộ app khi đang check cookie lần đầu để tránh nháy UI */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
