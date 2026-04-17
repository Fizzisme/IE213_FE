'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import PatientList from '@/components/pages/LabTechPage/PatientList/PatientList.jsx';
import PatientChart from '@/components/pages/LabTechPage/PatientChart/PatientChart.jsx';

const C = {
    purple: '#7C6EF6',
    red: '#F75C5C',
    teal: '#2EC4B6',
    orange: '#F8A84B',
};

const SCHEDULE = [
    {
        title: 'Online consultation',
        sub: 'Alison Cooper',
        time: '9:00 – 9:30',
        color: C.teal,
        icon: '💻',
    },
    {
        title: 'Cardiogram',
        sub: 'Brad Duncan',
        time: '9:30 – 10:00',
        color: C.purple,
        icon: '📈',
    },
    {
        title: 'Break',
        sub: '45 min',
        time: '',
        color: '#ccc',
        icon: '☕',
        isBreak: true,
    },
    {
        title: 'Meeting',
        sub: '',
        time: '10:45 – 11:45',
        color: C.orange,
        icon: '👥',
    },
];

export default function LabTechPage() {
    const [date, setDate] = useState(new Date());

    const myEvents = [
        {
            id: 'phauThuat',
            label: 'Phẫu thuật',
            color: '#22d3ee',
            dates: [new Date(2026, 2, 10)],
        },
    ];

    return (
        <div className="flex h-full">
            {/* MAIN */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                {/* Header*/}
                {/*<div className="bg-white rounded-2xl p-6 shadow mb-6 h-[170px]">*/}
                {/*    <h1 className="text-2xl font-bold">Mừng bạn quay lại, Tuấn Phi 👋</h1>*/}
                {/*    <p className="text-gray-500 text-sm mt-1">Chúc bạn một ngày tốt lành!</p>*/}
                {/*</div>*/}

                {/* Stats */}
                <PatientChart />

                {/* Content box */}
                <PatientList />
            </main>

            {/* ASIDE (RIGHT) */}
            {/*<aside className="w-[350px] p-4 xl:p-6 flex flex-col gap-5 overflow-x-hidden overflow-y-auto">*/}
            {/*    /!* Calendar *!/*/}

            {/*    <Calendar*/}
            {/*        mode="single"*/}
            {/*        selected={date}*/}
            {/*        onSelect={(d) => d && setDate(d)}*/}
            {/*        captionLayout="dropdown"*/}
            {/*        events={myEvents}*/}
            {/*    />*/}

            {/*    /!* Schedule *!/*/}
            {/*    <div className="bg-white rounded-2xl p-4 shadow flex-1">*/}
            {/*        <div className="flex justify-between items-start mb-4">*/}
            {/*            <div>*/}
            {/*                <div className="text-3xl font-bold">14</div>*/}
            {/*                <div className="text-sm font-semibold">Friday, Oct</div>*/}
            {/*                <div className="text-xs text-gray-400">18 appointments</div>*/}
            {/*            </div>*/}

            {/*            <button className="w-9 h-9 bg-purple-500 text-white rounded-full flex items-center justify-center text-lg shadow hover:scale-105 transition">*/}
            {/*                +*/}
            {/*            </button>*/}
            {/*        </div>*/}

            {/*        <div className="space-y-3">*/}
            {/*            {SCHEDULE.map((item, i) => (*/}
            {/*                <div*/}
            {/*                    key={i}*/}
            {/*                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"*/}
            {/*                >*/}
            {/*                    <div*/}
            {/*                        className="w-9 h-9 flex items-center justify-center rounded-lg text-sm"*/}
            {/*                        style={{*/}
            {/*                            backgroundColor: item.color + '22',*/}
            {/*                            color: item.color,*/}
            {/*                        }}*/}
            {/*                    >*/}
            {/*                        {item.icon}*/}
            {/*                    </div>*/}

            {/*                    <div className="flex-1">*/}
            {/*                        <div className="text-sm font-semibold">{item.title}</div>*/}
            {/*                        {item.sub && <div className="text-xs text-gray-400">{item.sub}</div>}*/}
            {/*                        {item.time && <div className="text-xs text-gray-400">{item.time}</div>}*/}
            {/*                    </div>*/}

            {/*                    {item.isBreak && <span className="text-xs text-gray-400">45 min</span>}*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</aside>*/}
        </div>
    );
}
