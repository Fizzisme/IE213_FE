import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import LabTechLayout from '@/components/pages/LabTech/LabTechPage/LabTechLayout.jsx';

const LabTechPage = React.lazy(() => import('@/components/pages/LabTech/LabTechPage/LabTechPage.jsx'));
const LabTechNotification = React.lazy(() =>
    import('@/components/pages/LabTech/LabTechNotification/LabTechNotification.jsx'),
);
const DosagePage = React.lazy(() => import('@/components/pages/LabTech/DosagePage/DosagePage.jsx'));

export const labTechRoutes = (
    <Route
        path="/lab-tech"
        element={
            <RoleProtectedRoute allowedRoles={['LAB_TECH']}>
                <LabTechLayout />
            </RoleProtectedRoute>
        }
    >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<LabTechPage />} />
        <Route path="notifications" element={<LabTechNotification />} />
        <Route path="documents">
            <Route path="dosage" element={<DosagePage />} />
        </Route>
    </Route>
);
