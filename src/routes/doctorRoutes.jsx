import { Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import DoctorLayout from '@/components/pages/doctor/DoctorLayout.jsx';
import DoctorDashboard from '@/components/pages/doctor/DoctorDashboard.jsx';
import DoctorProfile from '@/components/pages/doctor/DoctorProfile.jsx';
import DoctorPatientDetail from '@/components/pages/doctor/DoctorPatientDetail.jsx';
import DoctorMedicalRecords from '@/components/pages/doctor/DoctorMedicalRecords.jsx';
import DoctorDiagnosis from '@/components/pages/doctor/DoctorDiagnosis.jsx';
import DoctorPatients from '@/components/pages/doctor/DoctorPatients.jsx';
import DoctorAppointments from '@/components/pages/doctor/DoctorAppointments.jsx';

export const doctorRoutes = (
    <Route
        path="/doctor"
        element={
            <RoleProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorLayout /> {/* <-- Thay Outlet bằng DoctorLayout */}
            </RoleProtectedRoute>
        }
    >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="patients/:patientId/create-record" element={<DoctorPatientDetail />} />
        <Route path="medical-records" element={<DoctorMedicalRecords />} />
        <Route path="medical-records/:medicalRecordId/diagnose" element={<DoctorDiagnosis />} />
        <Route path="appointments" element={<DoctorAppointments />} />
    </Route>
);
