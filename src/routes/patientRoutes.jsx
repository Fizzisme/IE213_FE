import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import PatientLayout from '@/components/pages/Patients/PatientLayout.jsx';
const PatientMedicalRecords = React.lazy(() => import('@/components/pages/Patients/PatientMedicalRecords.jsx'));

const PatientMedicalRecordDetail = React.lazy(() =>
    import('@/components/pages/Patients/PatientMedicalRecordDetail.jsx'),
);

const PatientDashboard = React.lazy(() => import('@/components/pages/Patients/Dashboard/PatientDashboard.jsx'));
const PatientInfoForm = React.lazy(() => import('@/components/pages/Patients/FormPage/PatientInForm.jsx'));
const AppointmentManagement = React.lazy(() =>
    import('@/components/pages/Patients/AppointmentPage/AppointmentManagement.jsx'),
);
const AppointmentBooking = React.lazy(() =>
    import('@/components/pages/Patients/AppointmentPage/AppoinmentBooking.jsx'),
);
const NotificationPage = React.lazy(() => import('@/components/pages/Patients/NotificationPage/NotificationPage.jsx'));

export const patientRoutes = (
    <Route
        path="/patient"
        element={
            <RoleProtectedRoute allowedRoles={['PATIENT']}>
                <PatientLayout />
            </RoleProtectedRoute>
        }
    >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="create-patient" element={<PatientInfoForm />} />
        <Route path="appointments-manage" element={<AppointmentManagement />} />
        <Route path="appointments" element={<AppointmentBooking />} />
        <Route path="notifications" element={<NotificationPage />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
        <Route path="medical-records/:medicalRecordId" element={<PatientMedicalRecordDetail />} />
    </Route>
);
