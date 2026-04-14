import { useDashboard } from '../../hooks/useDashboard';
import DashboardNavbar from '../ui/dashboard/DashboardNavbar';
import WelcomeBanner from '../ui/dashboard/WelcomeBanner';
import StatsGrid from '../ui/dashboard/StatsGrid';
import AppointmentList from '../ui/dashboard/AppointmentList';
import RecentActivity from '../ui/dashboard/RecentActivity';
import Sidebar from './LabTechPage/Sidebar/PatientSidebar';
export default function DemoDashboard() {
    const { hasProfile, displayName, roleLabel, loginMethod, handleLogout, navigate } = useDashboard();

    return (
        <>
            <div className="bg-white flex h-screen overflow-hidden hide-scrollbar">
                {/* Sidebar */}
                <Sidebar />
                {/* Main */}
                <div className="flex-1 bg-white min-w-0 overflow-auto">
                    <div className="bg-[#f5f5f5] rounded-3xl h-full w-full">
                        <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
                            <DashboardNavbar
                                displayName={displayName}
                                roleLabel={roleLabel}
                                loginMethod={loginMethod}
                                hasProfile={hasProfile}
                                onNavigateCreate={() => navigate('/create-patient')}
                                onLogout={handleLogout}
                            />
                            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                                <WelcomeBanner
                                    displayName={displayName}
                                    roleLabel={roleLabel}
                                    loginMethod={loginMethod}
                                />
                                <StatsGrid />
                                <div
                                    style={{
                                        display: 'grid',
                                        // Giải thích:
                                        // 'auto-fit' sẽ tự tính toán số cột.
                                        // 'minmax(300px, 1fr)' nghĩa là mỗi cột tối thiểu 300px, tối đa là chiếm hết chỗ trống.
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        gap: 20,
                                    }}
                                >
                                    <AppointmentList />
                                    <RecentActivity />
                                </div>
                            </main>
                            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
