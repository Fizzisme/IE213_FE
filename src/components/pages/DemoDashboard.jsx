import { useDashboard } from '../../hooks/useDashboard';
import DashboardNavbar from '../ui/dashboard/DashboardNavbar';
import WelcomeBanner from '../ui/dashboard/WelcomeBanner';
import StatsGrid from '../ui/dashboard/StatsGrid';
import AppointmentList from '../ui/dashboard/AppointmentList';
import RecentActivity from '../ui/dashboard/RecentActivity';
export default function DemoDashboard() {
    const { displayName, roleLabel, loginMethod } = useDashboard();

    return (
        <main
            style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: 'clamp(16px, 5vw, 32px) clamp(16px, 4vw, 24px)',
                minWidth: 0,
            }}
        >
            <WelcomeBanner displayName={displayName} roleLabel={roleLabel} loginMethod={loginMethod} />
            <StatsGrid />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'clamp(12px, 3vw, 20px)',
                }}
            >
                <AppointmentList />
                <RecentActivity />
            </div>
        </main>
    );
}
