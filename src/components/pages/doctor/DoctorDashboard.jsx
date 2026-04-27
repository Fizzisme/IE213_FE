import React, { useState, Suspense } from 'react';
import { useAuthStore } from '@/stores/useAuthStore.js';
import { motion } from 'framer-motion';

const PatientChart = React.lazy(() => import('@/components/PatientChart/PatientChart.jsx'));
const Calendar = React.lazy(() => import('@/components/ui/calendar').then((m) => ({ default: m.Calendar })));

export default function DoctorDashboard() {
    const user = useAuthStore((s) => s.user);

    // State Lịch (Calendar)
    const [date, setDate] = useState(new Date());

    // Events đánh dấu trên lịch
    const myEvents = [
        {
            id: 'khamBenh',
            label: 'Lịch khám',
            color: '#0d7b6d',
            dates: [new Date()],
        },
    ];

    return (
        <div className="flex h-full">
            {/* CUỘN TOÀN TRANG */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6"
                >
                    {/* ================= HEADER ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* LEFT: Lời chào & Trích dẫn */}
                        <div className="flex-1 sm:pl-6 transition-all duration-500">
                            <h1 className="text-2xl font-bold text-primary">
                                Mừng bạn quay lại, BS. {user?.fullName || 'Chuyên khoa'}
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

                        {/* RIGHT: Hình minh họa & Lịch */}
                        <div className="flex items-center gap-6">
                            {/* IMAGE */}
                            <div className="hidden xl:flex items-center">
                                <img
                                    src="/doctor-welcome.png"
                                    alt="doctor welcome"
                                    className="max-h-[200px] w-auto object-contain"
                                />
                            </div>

                            {/* CALENDAR */}
                            <div className="hidden lg:block shrink-0">
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

                    <PatientChart />
                </motion.div>
            </main>
        </div>
    );
}
