import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import PatientLayout from '@/components/pages/Patients/PatientLayout.jsx';

/**
 * Tối ưu hóa hiệu năng bằng cơ chế React.lazy (Lazy Loading).
 * Các trang chức năng của Bệnh nhân sẽ được tải động theo nhu cầu truy cập,
 * giúp tối ưu tốc độ tải trang đầu tiên cho hệ thống EHR.
 */
const PatientMedicalRecords = React.lazy(() => import('@/components/pages/Patients/PatientMedicalRecords.jsx'));
const PatientMedicalRecordDetail = React.lazy(() =>
    import('@/components/pages/Patients/PatientMedicalRecordDetail.jsx'),
);
const PatientDashboard = React.lazy(() => import('@/components/pages/Patients/Dashboard/PatientDashboard.jsx'));
const PatientInfoForm = React.lazy(() => import('@/components/pages/Patients/FormPage/PatientInForm.jsx'));
const AppointmentManagement = React.lazy(() =>
    import('@/components/pages/Patients/AppointmentPage/AppointmentManagement.jsx'),
);
const AppointmentBooking = React.lazy(() =>
    import('@/components/pages/Patients/AppointmentPage/AppoinmentBooking.jsx'),
);
const NotificationPage = React.lazy(() => import('@/components/pages/Patients/NotificationPage/NotificationPage.jsx'));

/**
 * Định nghĩa danh sách định tuyến cho phân hệ Bệnh nhân (Patient Routes).
 * * Cấu trúc bảo mật:
 * - RoleProtectedRoute: Đảm bảo chỉ người dùng có vai trò 'PATIENT' mới được truy cập.
 * - PatientLayout: Khung giao diện đồng nhất tích hợp Sidebar và Topbar dành cho bệnh nhân.
 */
export const patientRoutes = (
    <Route
        path="/patient"
        element={
            <RoleProtectedRoute allowedRoles={['PATIENT']}>
                <PatientLayout />
            </RoleProtectedRoute>
        }
    >
        {/* ================= ĐỊNH TUYẾN NỘI BỘ (CHILD ROUTES) ================= */}

        {/* Chuyển hướng mặc định: Truy cập /patient sẽ vào thẳng trang Dashboard */}
        <Route index element={<Navigate to="dashboard" />} />

        {/* Trang tổng quan hiển thị thống kê và hoạt động gần đây */}
        <Route path="dashboard" element={<PatientDashboard />} />

        {/* Trang khởi tạo hồ sơ y tế điện tử cho bệnh nhân mới */}
        <Route path="create-patient" element={<PatientInfoForm />} />

        {/* Quản lý danh sách lịch hẹn: xem trạng thái, đổi lịch hoặc hủy lịch */}
        <Route path="appointments-manage" element={<AppointmentManagement />} />

        {/* Quy trình đặt lịch khám mới với bác sĩ chuyên khoa */}
        <Route path="appointments" element={<AppointmentBooking />} />

        {/* Trang hiển thị các thông báo từ hệ thống và nhắc lịch khám */}
        <Route path="notifications" element={<NotificationPage />} />

        {/* Danh sách lịch sử bệnh án đã được lưu trữ trên hệ thống */}
        <Route path="medical-records" element={<PatientMedicalRecords />} />

        {/* Xem chi tiết từng hồ sơ bệnh án, bao gồm kết quả Lab và chẩn đoán của bác sĩ */}
        <Route path="medical-records/:medicalRecordId" element={<PatientMedicalRecordDetail />} />
    </Route>
);
