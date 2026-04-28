// src/components/pages/Doctor/DoctorDashboard.jsx

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

/**
 * Tối ưu hóa hiệu suất (Performance) bằng kỹ thuật Code Splitting thông qua React.lazy.
 * Các component PatientChart và Calendar chỉ được tải về (fetch) khi thực sự cần thiết,
 * giúp giảm dung lượng của bundle chính trong lần tải đầu tiên (Initial Load).
 */
const PatientChart = React.lazy(() => import('@/components/PatientChart/PatientChart.jsx'));
const Calendar = React.lazy(() => import('@/components/ui/calendar').then((m) => ({ default: m.Calendar })));

/**
 * Component DoctorDashboard
 * Giao diện trang chủ (Trang tổng quan) dành cho người dùng có role là Doctor.
 */
export default function DoctorDashboard() {
    // Khởi tạo state để quản lý ngày hiện tại được chọn trên giao diện Calendar
    const [date, setDate] = useState(new Date());

    // Định nghĩa mảng dữ liệu (events) để hiển thị các điểm đánh dấu (marker) trên Calendar
    const myEvents = [
        {
            id: 'khamBenh',
            label: 'Lịch khám',
            color: '#0d7b6d',
            dates: [new Date()],
        },
    ];

    // Lấy thông tin người dùng từ global store (Zustand) để hiển thị lời chào cá nhân hóa
    const userInfo = useLayoutStore((state) => state.userInfo);

    return (
        <div className="flex h-full">
            {/* Vùng chứa chính: Cho phép cuộn dọc (overflow-y-auto) toàn bộ nội dung trang */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                {/* Bọc nội dung trong motion.div để tạo hiệu ứng trượt mượt mà khi component mount */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6"
                >
                    {/* ================= HEADER ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* KHU VỰC BÊN TRÁI: Hiển thị lời chào, tên bác sĩ và trích dẫn (Quote) */}
                        <div className="flex-1 sm:pl-6 transition-all duration-500">
                            <h1 className="text-2xl font-bold text-primary">
                                Mừng bạn quay lại, BS. {userInfo?.fullName || 'Chuyên khoa'}
                            </h1>

                            <p className="text-gray-500 text-sm mt-1">Chúc bạn một ngày khám bệnh hiệu quả</p>

                            <div className="mt-6 border-l-4 border-primary pl-4 italic text-gray-600 max-w-lg">
                                “Nghề y là nghề của trái tim và trách nhiệm.”
                                <span className="block mt-2 text-xs text-gray-400 not-italic">— Medical Ethics</span>
                            </div>

                            <p className="mt-3 text-xs text-gray-400">
                                Mỗi quyết định của bạn ảnh hưởng trực tiếp đến sức khỏe bệnh nhân.
                            </p>
                        </div>

                        {/* KHU VỰC BÊN PHẢI: Chứa hình ảnh minh họa và Component Calendar */}
                        <div className="flex items-center gap-6">
                            {/* Hình ảnh minh họa (Chỉ hiển thị trên màn hình cực lớn - xl) */}
                            <div className="hidden xl:flex items-center">
                                <img
                                    src="/doctor-welcome.png"
                                    alt="doctor welcome"
                                    className="max-h-[200px] w-auto object-contain"
                                />
                            </div>

                            {/* Component Calendar (Ẩn trên màn hình nhỏ, hiển thị từ lg trở lên) */}
                            <div className="hidden lg:block shrink-0">
                                {/* Sử dụng Suspense cung cấp fallback UI (Skeleton) trong thời gian chờ load file JS của Calendar */}
                                <Suspense
                                    fallback={
                                        <div className="h-[280px] w-[280px] rounded-2xl bg-slate-100 animate-pulse" />
                                    }
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

                    {/* Component Chart được gọi qua Lazy load */}
                    <PatientChart />
                </motion.div>
            </main>
        </div>
    );
}
