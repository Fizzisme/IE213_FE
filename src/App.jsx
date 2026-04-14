import AuthPage from './components/pages/AuthPage';
import DemoDashboard from './components/pages/DemoDashboard';
import PatientInfoForm from './components/pages/PatientInForm';

import AdminLogin from './components/pages/AdminLogin';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminUserDetail from './components/pages/AdminUserDetail';
import AdminRoute from './components/guards/AdminRoute';

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LabTechPage from './components/pages/LabTechPage/LabTechPage.jsx';
import LabTechLayout from '@/components/pages/LabTechPage/LabTechLayout.jsx';
import LabTechNotification from '@/components/pages/LabTechNotification/LabTechNotification.jsx';
import { RoleProtectedRoute } from './components/guards/RoleProtectedRoute.jsx';
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
                            <DemoDashboard />
                        </RoleProtectedRoute>
                    }
                >
                    <Route path="create-patient" element={<PatientInfoForm />} />
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
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
