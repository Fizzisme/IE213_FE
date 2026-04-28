import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import LabTechLayout from '@/components/pages/LabTech/LabTechLayout.jsx';

/**
 * Tối ưu hóa hiệu năng hệ thống bằng React.lazy (Lazy Loading).
 * Các trang nghiệp vụ của Kỹ thuật viên phòng Lab chỉ được tải khi cần thiết,
 * giúp giảm tải cho trình duyệt trong lần truy cập đầu tiên.
 */
const LabTechPage = React.lazy(() => import('@/components/pages/LabTech/LabTechDashboard'));
const LabTechNotification = React.lazy(() =>
    import('@/components/pages/LabTech/LabTechNotification/LabTechNotification.jsx'),
);
const DosagePage = React.lazy(() => import('@/components/pages/LabTech/DosagePage/DosagePage.jsx'));

/**
 * Định nghĩa danh sách các Route dành cho Kỹ thuật viên phòng Lab (Lab Tech Routes).
 * * Cấu trúc bảo mật:
 * - RoleProtectedRoute: Chặn truy cập trái phép, chỉ cho phép user có role 'LAB_TECH'.
 * - LabTechLayout: Cung cấp khung giao diện chuyên biệt cho các thao tác xét nghiệm và quản lý mẫu.
 */
export const labTechRoutes = (
    <Route
        path="/lab-tech"
        element={
            <RoleProtectedRoute allowedRoles={['LAB_TECH']}>
                <LabTechLayout />
            </RoleProtectedRoute>
        }
    >
        {/* ================= ĐỊNH TUYẾN NỘI BỘ (CHILD ROUTES) ================= */}

        {/* Điều hướng mặc định: Khi vào /lab-tech sẽ tự động chuyển sang trang Dashboard */}
        <Route index element={<Navigate to="dashboard" />} />

        {/* Trang tổng quan công việc và thống kê kết quả xét nghiệm */}
        <Route path="dashboard" element={<LabTechPage />} />

        {/* Quản lý các thông báo hệ thống và yêu cầu xét nghiệm mới */}
        <Route path="notifications" element={<LabTechNotification />} />

        {/* Nhóm Route liên quan đến tài liệu và hồ sơ chuyên môn (Nested Routes) */}
        <Route path="documents">
            {/* Trang quản lý và tra cứu liều lượng xét nghiệm/thuốc */}
            <Route path="dosage" element={<DosagePage />} />
        </Route>
    </Route>
);
