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
    
  );
}

export default App;