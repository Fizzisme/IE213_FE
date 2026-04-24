import React from 'react';
import { Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import DashboardLayout from '@/components/pages/Patients/GeneralLayout/DashboardLayout.jsx';

const PatientDashboard = React.lazy(() => import('@/components/pages/Patients/Dashboard/PatientDashboard.jsx'));
const PatientInfoForm = React.lazy(() => import('@/components/pages/Patients/FormPage/PatientInForm.jsx'));
const AppointmentManagement = React.lazy(() => import('@/components/pages/Patients/AppointmentPage/AppointmentManagement.jsx'));
const AppointmentBooking = React.lazy(() => import('@/components/pages/Patients/AppointmentPage/AppoinmentBooking.jsx'));
const NotificationPage = React.lazy(() => import('@/components/pages/Patients/NotificationPage/NotificationPage.jsx'));

export const patientRoutes = (
    <Route
        path="/demo-dashboard"
        element={
            <RoleProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout />
            </RoleProtectedRoute>
        }
    >
        <Route index element={<PatientDashboard />} />
        <Route path="create-patient" element={<PatientInfoForm />} />
        <Route path="appointments-manage" element={<AppointmentManagement />} />
        <Route path="appointments" element={<AppointmentBooking />} />
        <Route path="notifications" element={<NotificationPage />} />
    </Route>
);
