import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, error } = useAuth();

    // ✅ Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-700 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Đang tải...</p>
                </div>
            </div>
        );
    }

    // ✅ Chưa đăng nhập → về auth
    if (!user) {
        console.warn('❌ User not authenticated, redirecting to auth');
        console.warn('User:', user);
        console.warn('Loading:', loading);
        console.warn('Error:', error);
        return <Navigate to="/" replace />;
    }

    // ✅ Đăng nhập nhưng không đúng role
    if (!allowedRoles.includes(user?.role)) {
        console.warn(`❌ User role ${user?.role} not in allowed roles:`, allowedRoles);
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-100 gap-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        ❌ Unauthorized
                    </h1>
                    <p className="text-slate-500 text-sm mb-2">
                        Role của bạn: <strong>{user?.role}</strong>
                    </p>
                    <p className="text-slate-500 text-sm mb-4">
                        Được phép: <strong>{allowedRoles.join(', ')}</strong>
                    </p>
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="px-4 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return children;
};
