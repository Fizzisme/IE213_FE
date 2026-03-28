// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api'; 

export const AuthContext = createContext();

// Custom hook để gọi cho lẹ ở các trang khác
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Hỏi server "Tôi là ai?" dựa vào cookie trình duyệt tự gửi
    const fetchCurrentUser = async () => {
        try {
            const res = await api.get('/users/me'); // Sửa lại đúng endpoint GET thông tin user của bạn
            const userData = res.data.data || res.data;
            setUser(userData); // { id, role, hasProfile, ... }
            console.log(userData);
            return userData;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    },[]);

    // 2. Hàm Login: Trả về user data để AuthPage điều hướng
    const login = async (credentials) => {
        // Backend tự động set HTTP-only cookie vào trình duyệt sau lệnh này
        await api.post('/auth/login/nationId', credentials);
        // Cập nhật lại state user ngay lập tức
        return await fetchCurrentUser(); 
    };

    // 3. Hàm Login MetaMask
    const loginMetaMask = async (walletAddress, signature) => {
        await api.post('/auth/login/wallet', { walletAddress, signature });
        return await fetchCurrentUser();
    };

    // 4. Hàm Logout
    const logout = async () => {
        try {
            await api.delete('/auth/logout');
            setUser(null);
        } catch (error) {
            console.error("Lỗi đăng xuất", error);
        }
    };

    // 5. Hàm Refresh (Dùng khi tạo hồ sơ xong)
    const refreshUser = () => fetchCurrentUser();

    return (
        <AuthContext.Provider value={{ user, login, loginMetaMask, logout, refreshUser, loading }}>
            {/* Ẩn toàn bộ app khi đang check cookie lần đầu để tránh nháy UI */}
            {!loading && children} 
        </AuthContext.Provider>
    );
};