import React from 'react';

import { Navigate, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import DoctorLayout from '@/components/pages/Doctor/DoctorLayout.jsx';

/**
 * Tối ưu hóa hiệu năng bằng React.lazy (Lazy Loading).
 * Các component thuộc phân hệ Bác sĩ chỉ được tải về khi người dùng truy cập vào route tương ứng,
 * giúp giảm dung lượng bundle ban đầu của ứng dụng.
 */
const DoctorDashboard = React.lazy(() => import('@/components/pages/Doctor/DoctorDashboard.jsx'));
const DoctorProfile = React.lazy(() => import('@/components/pages/Doctor/DoctorProfile.jsx'));
const DoctorPatientDetail = React.lazy(() => import('@/components/pages/Doctor/DoctorPatientDetail.jsx'));
const DoctorMedicalRecords = React.lazy(() => import('@/components/pages/Doctor/DoctorMedicalRecords.jsx'));
const DoctorDiagnosis = React.lazy(() => import('@/components/pages/Doctor/DoctorDiagnosis.jsx'));
const DoctorPatients = React.lazy(() => import('@/components/pages/Doctor/DoctorPatients.jsx'));
const DoctorAppointments = React.lazy(() => import('@/components/pages/Doctor/DoctorAppointments.jsx'));

/**
 * Định nghĩa danh sách các Route dành riêng cho Bác sĩ (Doctor Routes).
 * * Cấu trúc phân tầng:
 * - Bao bọc bởi RoleProtectedRoute: Chỉ người dùng có role 'DOCTOR' mới được phép truy cập.
 * - Sử dụng DoctorLayout: Cung cấp giao diện Sidebar/Topbar đặc thù cho bác sĩ.
 */
export const doctorRoutes = (
    <Route
        path="/doctor"
        element={
            <RoleProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorLayout />
            </RoleProtectedRoute>
        }
    >
        {/* ================= ĐỊNH TUYẾN NỘI BỘ (CHILD ROUTES) ================= */}

        {/* Route mặc định: Chuyển hướng từ /doctor sang /doctor/dashboard */}
        <Route index element={<Navigate to="dashboard" />} />

        {/* Trang tổng quan thống kê công việc của bác sĩ */}
        <Route path="dashboard" element={<DoctorDashboard />} />

        {/* Trang quản lý thông tin cá nhân và bằng cấp của bác sĩ */}
        <Route path="profile" element={<DoctorProfile />} />

        {/* Quản lý danh sách bệnh nhân đã từng thăm khám */}
        <Route path="patients" element={<DoctorPatients />} />

        {/* Trang chi tiết bệnh nhân và tạo chỉ định hồ sơ y tế mới */}
        <Route path="patients/:patientId/create-record" element={<DoctorPatientDetail />} />

        {/* Quản lý danh sách các hồ sơ y tế (Medical Records) trong hệ thống */}
        <Route path="medical-records" element={<DoctorMedicalRecords />} />

        {/* Trang thực hiện chẩn đoán y khoa dựa trên kết quả Lab và AI */}
        <Route path="medical-records/:medicalRecordId/diagnose" element={<DoctorDiagnosis />} />

        {/* Trang quản lý lịch hẹn khám của bác sĩ với bệnh nhân */}
        <Route path="appointments" element={<DoctorAppointments />} />
    </Route>
);
