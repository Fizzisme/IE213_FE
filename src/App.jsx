import AuthPage from './components/pages/AuthPage';
import DemoDashboard from './components/pages/DemoDashboard';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/demo-dashboard" element={<DemoDashboard />} />
      </Routes>
    
  );
}

export default App;