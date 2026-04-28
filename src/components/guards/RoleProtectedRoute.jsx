// src/components/guards/RoleProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useAuthStore } from '@/stores/useAuthStore.js';

/**
 * Component dùng để bảo vệ các route dựa trên phân quyền người dùng.
 * * @param {ReactNode} children - Giao diện hoặc component con sẽ được render nếu người dùng có quyền hợp lệ.
 * @param {string[]} allowedRoles - Mảng chứa danh sách các vai trò (role) được cấp phép truy cập.
 */
export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    // Trích xuất thông tin người dùng và trạng thái xử lý từ store quản lý xác thực
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);

    // Trường hợp 1: Đang trong quá trình tải hoặc kiểm tra thông tin người dùng
    // Hiển thị màn hình chờ để tránh chớp giật giao diện
    if (loading) return <LoadingScreen />;

    // Trường hợp 2: Người dùng chưa đăng nhập (không có thông tin user trong store)
    // Thực hiện chuyển hướng ngay lập tức về trang chủ và thay thế lịch sử trình duyệt (replace)
    if (!user) return <Navigate to="/" replace />;

    // Trường hợp 3: Người dùng đã đăng nhập nhưng không có vai trò hợp lệ
    // Kiểm tra xem vai trò của người dùng có nằm trong mảng allowedRoles hay không
    if (!allowedRoles.includes(user?.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-100 gap-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">❌ Unauthorized</h1>
                    <p className="text-slate-500 text-sm mb-2">
                        Role của bạn: <strong>{user?.role}</strong>
                    </p>
                    <p className="text-slate-500 text-sm mb-4">
                        Được phép: <strong>{allowedRoles.join(', ')}</strong>
                    </p>
                    <button
                        // Sử dụng window.location.href để tải lại toàn bộ trang và xóa state hiện tại
                        onClick={() => (window.location.href = '/')}
                        className="px-4 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // Trường hợp 4: Người dùng hợp lệ và có quyền truy cập
    // Cho phép render component con bên trong
    return children;
};
