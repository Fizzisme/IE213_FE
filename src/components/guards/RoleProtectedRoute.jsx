import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, error } = useAuth();

    // ✅ Loading state
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: '#F8FAFC',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            border: '3px solid #E2E8F0',
                            borderTop: '3px solid #3B82F6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    <p style={{ color: '#64748B', fontSize: 14 }}>Đang tải...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
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
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: '#F8FAFC',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                        ❌ Unauthorized
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
                        Role của bạn: <strong>{user?.role}</strong>
                    </p>
                    <p style={{ color: '#64748B', fontSize: 14, margin: '8px 0 0' }}>
                        Được phép: <strong>{allowedRoles.join(', ')}</strong>
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '16px',
                            padding: '8px 16px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // ✅ OK → render
    return children;
};