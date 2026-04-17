import AuthPage from './components/pages/AuthPage';
import DemoDashboard from './components/pages/DemoDashboard';
import PatientInfoForm from './components/pages/PatientInForm';

import AdminLogin from './components/pages/AdminLogin';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminUserDetail from './components/pages/AdminUserDetail';
import AdminRoute from './components/guards/AdminRoute';
import DashboardLayout from './components/pages/DashboardLayout.jsx';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LabTechPage from './components/pages/LabTechPage/LabTechPage.jsx';
import LabTechLayout from '@/components/pages/LabTechPage/LabTechLayout.jsx';
import LabTechNotification from '@/components/pages/LabTechNotification/LabTechNotification.jsx';
import { RoleProtectedRoute } from './components/guards/RoleProtectedRoute.jsx';
import AppointmentBooking from './components/pages/AppoinmentBooking.jsx';
import AppointmentManagement from './components/pages/AppointmentManagement.jsx';
import DosagePage from '@/components/pages/DosagePage/DosagePage.jsx';
function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Auth */}
                <Route path="/" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* User */}
                <Route
                    path="/demo-dashboard"
                    element={
                        <RoleProtectedRoute allowedRoles={['PATIENT']}>
                            <DashboardLayout />
                        </RoleProtectedRoute>
                    }
                >
                    <Route index element={<DemoDashboard />} />
                    <Route path="create-patient" element={<PatientInfoForm />} />
                    <Route path="appointments-manage" element={<AppointmentManagement />}></Route>
                    <Route path="appointments" element={<AppointmentBooking />} />
                </Route>
                {/* Admin */}
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users/:id"
                    element={
                        <AdminRoute>
                            <AdminUserDetail />
                        </AdminRoute>
                    }
                />
                {/* Doctor */}
                <Route
                    path="/" // them vao de navigate
                    element={
                        <RoleProtectedRoute allowedRoles={['DOCTOR']}>
                            {/* gắn trang anh muốn dẫn tới vào đây sau khi đăng nhập */}
                        </RoleProtectedRoute>
                    }
                ></Route>
                {/* Lab tech */}
                <Route
                    path="/lab-tech"
                    element={
                        <RoleProtectedRoute allowedRoles={['LAB_TECH']}>
                            <LabTechLayout />
                        </RoleProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<LabTechPage />} />
                    <Route path="notifications" element={<LabTechNotification />} />
                    <Route path="documents">
                        <Route path="dosage" element={<DosagePage />} />
                    </Route>
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
