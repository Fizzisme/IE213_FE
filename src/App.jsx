import AuthPage from './components/pages/AuthPage';
import DemoDashboard from './components/pages/DemoDashboard';
import PatientInfoForm from './components/pages/PatientInForm';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/demo-dashboard" element={<DemoDashboard />} />
        <Route path="/create-patient" element={<PatientInfoForm/>} />
      </Routes>
    
import AuthPage from "./components/pages/AuthPage";
import DemoDashboard from "./components/pages/DemoDashboard";
import AdminLogin from "./components/pages/AdminLogin";
import AdminRegister from "./components/pages/AdminRegister";
import AdminDashboard from "./components/pages/AdminDashboard";
import AdminRoute from "./components/guards/AdminRoute";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/demo-dashboard" element={<DemoDashboard />} />

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
  );
}

export default App;
