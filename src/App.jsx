import AuthPage from './components/pages/AuthPage';
import DemoDashboard from './components/pages/DemoDashboard';
import PatientInfoForm from './components/pages/PatientInForm';

import AdminLogin from './components/pages/AdminLogin';
import AdminRegister from './components/pages/AdminRegister';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminRoute from './components/guards/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Routes, Route } from 'react-router-dom';

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
                <Route path="/admin-register" element={<AdminRegister />} />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
}

export default App;
