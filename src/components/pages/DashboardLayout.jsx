import { Outlet } from 'react-router-dom';
import Sidebar from './LabTechPage/Sidebar/PatientSidebar';
import { useDashboard } from '../../hooks/useDashboard';

export default function DashboardLayout() {
    const { displayName, roleLabel, loginMethod, hasProfile, onNavigateCreate, onLogout, navigate } = useDashboard();

    return (
        <div className="bg-white flex h-screen overflow-hidden">
            <Sidebar
                displayName={displayName}
                roleLabel={roleLabel}
                loginMethod={loginMethod}
                hasProfile={hasProfile}
                onNavigateCreate={() => navigate('/demo-dashboard/create-patient')}
                onLogout={onLogout}
            />

            <div className="flex-1 bg-white p-6 overflow-auto">
                <div className="bg-[#f5f5f5] rounded-3xl w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}