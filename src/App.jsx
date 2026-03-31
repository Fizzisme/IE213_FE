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
function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Auth */}
                <Route path="/" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* User */}
                <Route path="/demo-dashboard" element={<DemoDashboard />} />
                <Route path="/create-patient" element={<PatientInfoForm />} />

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

                <Route path="/lab-tech" element={<LabTechPage />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
