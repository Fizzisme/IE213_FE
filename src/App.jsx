import React, { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingScreen } from './components/common/LoadingScreen';
import { useAuthStore } from '@/stores/useAuthStore.js';

const AuthPage = React.lazy(() => import('./components/pages/Auth/AuthPage'));
import { patientRoutes } from './routes/patientRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { labTechRoutes } from './routes/labTechRoutes';
import { doctorRoutes } from '@/routes/doctorRoutes.jsx';

function App() {
    const { initAuth, loading } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, []);

    if (loading) return <LoadingScreen />;

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />
                {patientRoutes}
                {adminRoutes}
                {doctorRoutes}
                {labTechRoutes}
            </Routes>
        </Suspense>
    );
}

export default App;
