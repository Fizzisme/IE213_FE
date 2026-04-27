//import { STATS } from '../../../constants/dashboardData';
import { Calendar, Pill, Heart, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

import { patientService } from '@/services/patientService.js';
export default function StatsGrid() {
    const [appointments, setAppointments] = useState();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await patientService.getAppointments();
                setAppointments(res.data);
            } catch (err) {
                console.error(err);
                alert('Lỗi khi tải lịch hẹn');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    if (!appointments) return null; // hoặc skeleton loading
    const upcomingAppointments = appointments?.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED') || [];
    const now = new Date();
    // clone để tránh mutate
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // tính thứ 2 đầu tuần
    const day = today.getDay() || 7; // CN = 7
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day + 1);

    // cuối tuần
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const appointmentsThisWeek = upcomingAppointments.filter((a) => {
        const date = new Date(a.appointmentDateTime);
        return date >= startOfWeek && date <= endOfWeek;
    });
    const upcomingCount = upcomingAppointments.length;
    const thisWeekCount = appointmentsThisWeek.length;

    const STATS = [
        {
            label: 'Lịch hẹn sắp tới',
            value: loading ? '...' : upcomingCount,
            delta: thisWeekCount ? `+ ${thisWeekCount} trong tuần này` : '',
            icon: Calendar,
            color: '#0d7b6d',
            bgColor: 'bg-teal-50',
        },
        {
            label: 'Đơn thuốc đang dùng',
            value: '5',
            delta: '2 sắp hết hạn',
            icon: Pill,
            color: '#8B5CF6',
            bgColor: 'bg-purple-50',
        },
        {
            label: 'Chỉ số sức khỏe',
            value: '87',
            delta: '↑ 4 điểm tháng này',
            icon: Heart,
            color: '#EF4444',
            bgColor: 'bg-red-50',
        },
        {
            label: 'Kết quả xét nghiệm chờ',
            value: '1',
            delta: 'Dự kiến hôm nay',
            icon: TrendingUp,
            color: '#10B981',
            bgColor: 'bg-emerald-50',
        },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5 lg:mb-7">
            {STATS.map((s, i) => (
                <div
                    key={i}
                    className="bg-white border border-slate-100 rounded-xl p-4 lg:p-5 cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both` }}
                >
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <p className="text-xs lg:text-sm text-slate-400 font-medium m-0">{s.label}</p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 my-1">{s.value}</p>
                            <p className="text-xs lg:text-sm text-slate-500 m-0">{s.delta}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.bgColor}`}>
                            <s.icon className="w-5 h-5" style={{ color: s.color }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
