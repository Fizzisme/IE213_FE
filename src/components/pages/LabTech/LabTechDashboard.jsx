// src/components/pages/LabTech/LabTechDashboard.jsx

import React, { Suspense, useState } from 'react';
import PatientList from '@/components/pages/LabTech/PatientList.jsx';
import { useSidebarStore } from '@/stores/useSidebarStore.jsx';
import { motion } from 'framer-motion';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

/**
 * Tối ưu hóa hiệu suất (Performance) bằng kỹ thuật Code Splitting.
 * Sử dụng React.lazy để trì hoãn việc tải các component nặng (Chart, Calendar)
 * cho đến khi chúng thực sự cần hiển thị trên giao diện.
 */
const PatientChart = React.lazy(() => import('@/components/PatientChart/PatientChart.jsx'));
const Calendar = React.lazy(() => import('@/components/ui/calendar.js').then((m) => ({ default: m.Calendar })));

/**
 * Component LabTechDashboard
 * Trang tổng quan dành cho Kỹ thuật viên phòng Lab (Lab Technician).
 * Hiển thị lời chào cá nhân hóa, lịch làm việc, biểu đồ thống kê và danh sách bệnh nhân cần xử lý.
 */
export default function LabTechDashboard() {
    // Quản lý trạng thái ngày đang được chọn trên Calendar
    const [date, setDate] = useState(new Date());

    /**
     * Dữ liệu các sự kiện (events) để hiển thị các điểm đánh dấu trên lịch.
     * Lưu ý: Tháng trong đối tượng Date của Javascript bắt đầu từ 0 (Tháng 3 là index 2).
     */
    const myEvents = [
        {
            id: 'phauThuat',
            label: 'Phẫu thuật',
            color: '#0d7b6d',
            dates: [new Date(2026, 2, 10)],
        },
    ];

    // Lấy trạng thái đóng/mở của Sidebar từ global store để điều chỉnh padding cho Header
    const openSidebar = useSidebarStore((s) => s?.openSidebar);

    // Truy xuất thông tin người dùng hiện tại từ layout store (Zustand)
    const userInfo = useLayoutStore((state) => state.userInfo);

    return (
        <div className="flex h-full">
            {/* Vùng chứa chính (Main Content): Thiết lập thanh cuộn dọc độc lập cho nội dung */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                {/* Sử dụng motion.div từ framer-motion để tạo hiệu ứng trượt nhẹ (y: 30 -> 0) khi trang tải */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col flex-1 w-full"
                >
                    {/* ================= PHẦN HEADER TỔNG QUAN ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* KHỐI TRÁI: Lời chào và trích dẫn truyền cảm hứng */}
                        <div className={`flex-1 sm:pl-10 transition-all duration-500 ${!openSidebar && 'pl-20'}`}>
                            {/* Lấy tên đầy đủ từ userInfo store */}
                            <h1 className="text-2xl font-bold text-primary">Mừng bạn quay lại, {userInfo?.fullName}</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Chúc bạn một ngày làm việc hiệu quả và chính xác
                            </p>

                            {/* Khối trích dẫn (Quote) với thanh trang trí bên trái (border-l-4) */}
                            <div className="mt-6 border-l-4 border-primary pl-4 italic text-gray-600 max-w-lg">
                                “Wherever the art of medicine is loved, there is also a love of humanity.”
                                <span className="block mt-2 text-xs text-gray-400 not-italic">— Hippocrates</span>
                            </div>

                            <p className="mt-3 text-xs text-gray-400">
                                Độ chính xác của bạn góp phần cứu sống bệnh nhân mỗi ngày.
                            </p>
                        </div>

                        {/* KHỐI PHẢI: Hình ảnh minh họa và Lịch làm việc */}
                        <div className="flex items-center gap-4">
                            {/* Ảnh minh họa chỉ hiển thị trên màn hình lớn (Desktop xl) */}
                            <div className="hidden xl:flex items-center">
                                <img
                                    src="/labtech-welcome.png"
                                    className="max-h-[200px] w-auto object-contain"
                                    alt="Welcome"
                                />
                            </div>

                            {/* Component Calendar chỉ hiển thị từ màn hình lg trở lên */}
                            <div className="hidden lg:block">
                                {/* Sử dụng Suspense kết hợp với fallback (Skeleton) trong lúc component Calendar được lazy load */}
                                <Suspense
                                    fallback={<div className="h-64 w-64 rounded-2xl bg-slate-100 animate-pulse" />}
                                >
                                    <Calendar
                                        events={myEvents}
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        captionLayout="dropdown"
                                    />
                                </Suspense>
                            </div>
                        </div>
                    </header>

                    {/* ================= BIỂU ĐỒ THỐNG KÊ (PATIENT CHART) ================= */}
                    <Suspense fallback={<div className="h-40 animate-pulse bg-slate-100 rounded-2xl" />}>
                        <PatientChart />
                    </Suspense>

                    {/* ================= DANH SÁCH BỆNH NHÂN (PATIENT LIST) ================= */}
                    <PatientList />
                </motion.div>
            </main>
        </div>
    );
}
