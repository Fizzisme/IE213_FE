// src/components/RoleProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    console.log(user);
    if (loading) {
        return <div>Loading...</div>;
    }
    console.log(user?.role);
    // Chưa đăng nhập
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Đăng nhập nhưng không có quyền
    if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};
