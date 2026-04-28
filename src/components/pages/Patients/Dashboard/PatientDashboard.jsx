import { motion } from 'framer-motion';

import WelcomeBanner from '@/components/ui/dashboard/WelcomeBanner.jsx';
import StatsGrid from '@/components/ui/dashboard/StatsGrid.jsx';
import AppointmentList from '@/components/ui/dashboard/AppointmentList.jsx';
import RecentActivity from '@/components/ui/dashboard/RecentActivity.jsx';
import { useAuthStore } from '@/stores/useAuthStore.js';

/**
 * Component PatientDashboard
 * Trang điều khiển trung tâm (Dashboard) dành cho Bệnh nhân.
 * Hiển thị tổng quan các thông số sức khỏe, lịch hẹn sắp tới
 * và lịch sử hoạt động gần đây của bệnh nhân.
 */
export default function PatientDashboard() {
    // Lấy thông tin vai trò và dữ liệu chi tiết bệnh nhân từ Auth Store toàn cục
    const { roleLabel, patient } = useAuthStore();

    return (
        <div className="flex h-full">
            {/* MAIN CONTAINER 
                Thành phần chứa chính với khả năng cuộn dọc và ngăn cuộn ngang.
                p-4 xl:p-6 đảm bảo khoảng cách hiển thị tốt trên mọi kích thước màn hình.
            */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                {/* Sử dụng hiệu ứng motion.div để tạo trải nghiệm trượt lên (fade-in slide-up) khi vào trang */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto"
                >
                    {/* ================= PHẦN HEADER TỔNG QUAN (WELCOME BANNER) ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col justify-center">
                        <WelcomeBanner displayName={patient?.fullName} roleLabel={roleLabel} loginMethod={'metamask'} />
                    </header>

                    {/* ================= PHẦN THỐNG KÊ (STATS GRID) ================= */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow mb-6">
                        <StatsGrid />
                    </div>

                    {/* ================= KHU VỰC CHI TIẾT (GRID LAYOUT) ================= */}
                    {/* Lưới Responsive:
                        - Mobile: 1 cột (grid-cols-1)
                        - Desktop (lg trở lên): 2 cột (lg:grid-cols-2) để hiển thị song song.
                    */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {/* Box hiển thị danh sách lịch hẹn sắp tới */}
                        <div className="bg-white rounded-2xl p-4 md:p-6 shadow overflow-hidden">
                            <AppointmentList />
                        </div>

                        {/* Box hiển thị các hoạt động hoặc giao dịch blockchain gần nhất */}
                        <div className="bg-white rounded-2xl p-4 md:p-6 shadow overflow-hidden">
                            <RecentActivity />
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
