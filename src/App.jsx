import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingScreen } from './components/common/LoadingScreen';

// Lazy loaded public pages
const AuthPage = React.lazy(() => import('./components/pages/Auth/AuthPage'));

// Modular Route Groups
import { patientRoutes } from './routes/patientRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { labTechRoutes } from './routes/labTechRoutes';
import { doctorRoutes } from '@/routes/doctorRoutes.jsx';

function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    {/* Auth */}
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/auth" element={<AuthPage />} />

                    {/* User Routes */}
                    {patientRoutes}

                    {/* Admin Routes */}
                    {adminRoutes}

                    {/* Doctor Routes (Placeholder) */}
                    {/*<Route*/}
                    {/*    path="/doctor"*/}
                    {/*    element={*/}
                    {/*        <Suspense fallback={<LoadingScreen />}>*/}
                    {/*            <div>Doctor Page (TBA)</div>*/}
                    {/*        </Suspense>*/}
                    {/*    }*/}
                    {/*/>*/}
                    {doctorRoutes}

                    {/* Lab tech Routes */}
                    {labTechRoutes}
                </Routes>
            </Suspense>
        </AuthProvider>
    );
}

export default App;
