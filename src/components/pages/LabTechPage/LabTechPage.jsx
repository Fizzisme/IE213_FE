'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import PatientList from '@/components/pages/LabTechPage/PatientList/PatientList.jsx';
import PatientChart from '@/components/pages/LabTechPage/PatientChart/PatientChart.jsx';

export default function LabTechPage() {
    const [date, setDate] = useState(new Date());

    const myEvents = [
        {
            id: 'phauThuat',
            label: 'Phẫu thuật',
            color: '#0d7b6d',
            dates: [new Date(2026, 2, 10)],
        },
    ];

    return (
        <div className="flex h-full">
            {/* MAIN */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                {/* Header*/}
                <header className="bg-white rounded-2xl p-6 shadow mb-6 hidden sm:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* LEFT */}
                    <div className="flex-1">
                        {/* GREETING */}
                        <h1 className="text-2xl font-bold text-primary">Mừng bạn quay lại, Tuấn Phi</h1>
                        <p className="text-gray-500 text-sm mt-1">Chúc bạn một ngày làm việc hiệu quả và chính xác</p>

                        {/* QUOTE */}
                        <div className="mt-6 border-l-4 border-primary pl-4 italic text-gray-600 max-w-lg">
                            “Wherever the art of medicine is loved, there is also a love of humanity.”
                            <span className="block mt-2 text-xs text-gray-400 not-italic">— Hippocrates</span>
                        </div>

                        {/* OPTIONAL SUBTEXT */}
                        <p className="mt-3 text-xs text-gray-400">
                            Độ chính xác của bạn góp phần cứu sống bệnh nhân mỗi ngày.
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4">
                        {/* IMAGE */}
                        <div className="hidden lg:flex items-center">
                            <img src="/labtech-welcome.png" className="max-h-[200px] w-auto object-contain" />
                        </div>

                        {/* CALENDAR */}
                        <div className="hidden lg:block">
                            <Calendar
                                events={myEvents}
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                captionLayout="dropdown"
                            />
                        </div>
                    </div>
                </header>

                {/* Chart */}
                <PatientChart />

                {/* Content box */}
                <PatientList />
            </main>
        </div>
    );
}
