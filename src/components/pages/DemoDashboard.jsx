import { useDashboard } from '../../hooks/useDashboard';
import DashboardNavbar from '../ui/dashboard/DashboardNavbar';
import WelcomeBanner from '../ui/dashboard/WelcomeBanner';
import StatsGrid from '../ui/dashboard/StatsGrid';
import AppointmentList from '../ui/dashboard/AppointmentList';
import RecentActivity from '../ui/dashboard/RecentActivity';

export default function DemoDashboard() {
    const { hasProfile, displayName, roleLabel, loginMethod, handleLogout, navigate } = useDashboard();

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
            <DashboardNavbar
                displayName={displayName}
                roleLabel={roleLabel}
                loginMethod={loginMethod}
                hasProfile={hasProfile}
                onNavigateCreate={() => navigate('/create-patient')}
                onLogout={handleLogout}
            />
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                <WelcomeBanner displayName={displayName} roleLabel={roleLabel} loginMethod={loginMethod} />
                <StatsGrid />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
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
    );
}