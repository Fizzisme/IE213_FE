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
                padding: '32px 24px',
                minWidth: '800px',
            }}
        >
            <WelcomeBanner displayName={displayName} roleLabel={roleLabel} loginMethod={loginMethod} />
            <StatsGrid />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 20,
                }}
            >
                <AppointmentList />
                <RecentActivity />
            </div>
        </main>
    );
}
