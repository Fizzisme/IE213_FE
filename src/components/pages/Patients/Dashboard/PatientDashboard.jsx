import { motion } from 'framer-motion';

import WelcomeBanner from '@/components/ui/dashboard/WelcomeBanner.jsx';
import StatsGrid from '@/components/ui/dashboard/StatsGrid.jsx';
import AppointmentList from '@/components/ui/dashboard/AppointmentList.jsx';
import RecentActivity from '@/components/ui/dashboard/RecentActivity.jsx';
import { useAuthStore } from '@/stores/useAuthStore.js';

export default function PatientDashboard() {
    const { roleLabel, patient } = useAuthStore();
    return (
        <div className="flex h-full">
            {/* MAIN CONTAINER */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto"
                >
                    {/* Header Box: Welcome Banner */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col justify-center">
                        <WelcomeBanner displayName={patient?.fullName} roleLabel={roleLabel} loginMethod={'metamask'} />
                    </header>

                    {/* Stats Box */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow mb-6">
                        <StatsGrid />
                    </div>

                    {/* Lưới Responsive (Grid) cho Appointment và Activity */}
                    {/* Trên mobile sẽ là 1 cột, trên màn hình lớn (lg) sẽ là 2 cột */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div className="bg-white rounded-2xl p-4 md:p-6 shadow overflow-hidden">
                            <AppointmentList />
                        </div>
                        <div className="bg-white rounded-2xl p-4 md:p-6 shadow overflow-hidden">
                            <RecentActivity />
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
