import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(user?.role)) {
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
