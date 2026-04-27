import { Navigate, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import DoctorLayout from '@/components/pages/doctor/DoctorLayout.jsx';

const DoctorDashboard = React.lazy(() => import('@/components/pages/doctor/DoctorDashboard.jsx'));
const DoctorProfile = React.lazy(() => import('@/components/pages/doctor/DoctorProfile.jsx'));
const DoctorPatientDetail = React.lazy(() => import('@/components/pages/doctor/DoctorPatientDetail.jsx'));
const DoctorMedicalRecords = React.lazy(() => import('@/components/pages/doctor/DoctorMedicalRecords.jsx'));
const DoctorDiagnosis = React.lazy(() => import('@/components/pages/doctor/DoctorDiagnosis.jsx'));
const DoctorPatients = React.lazy(() => import('@/components/pages/doctor/DoctorPatients.jsx'));
const DoctorAppointments = React.lazy(() => import('@/components/pages/doctor/DoctorAppointments.jsx'));
export const doctorRoutes = (
    <Route
        path="/doctor"
        element={
            <RoleProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorLayout />
            </RoleProtectedRoute>
        }
    >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="patients/:patientId/create-record" element={<DoctorPatientDetail />} />
        <Route path="medical-records" element={<DoctorMedicalRecords />} />
        <Route path="medical-records/:medicalRecordId/diagnose" element={<DoctorDiagnosis />} />
        <Route path="appointments" element={<DoctorAppointments />} />
    </Route>
);
