import { useEffect, useState } from 'react';
import { patientService } from '@/services/patientService.js';
export default function RecentActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const getDotColor = (event) => {
        switch (event) {
            case 'APPOINTMENT_RESCHEDULED':
                return '#F59E0B';
            case 'TEST_RESULT':
                return '#10B981';
            case 'PRESCRIPTION':
                return '#8B5CF6';
            default:
                return '#0d7b6d';
        }
    };
    const formatTimeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;

        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };
    useEffect(() => {
        const fetchRecentNotifications = async () => {
            try {
                setLoading(true);

                const res = await patientService.getNotifications({
                    limit: 5,
                });

                const rawData = res.data || [];

                const normalized = rawData.map((n) => ({
                    id: n._id,
                    text: n.title || n.content,
                    time: formatTimeAgo(n.createdAt),
                    dot: getDotColor(n.event),
                }));

                setActivities(normalized);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentNotifications();
    }, []);
    const ACTIVITY = [
        { text: 'Đã ghi nhận huyết áp', time: '2 giờ trước', dot: '#0d7b6d' },
        { text: 'Đã gia hạn đơn thuốc', time: '1 ngày trước', dot: '#8B5CF6' },
        { text: 'Kết quả xét nghiệm đã tải lên', time: '3 ngày trước', dot: '#10B981' },
        { text: 'Đã đổi lịch hẹn', time: '5 ngày trước', dot: '#F59E0B' },
    ];

    return (
        <div
            className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            style={{ animation: 'fadeUp 0.5s ease 0.43s both' }}
        >
            <div className="p-4 lg:p-5 border-b border-slate-100">
                <h2 className="m-0 text-sm lg:text-base font-bold text-slate-900">Hoạt động gần đây</h2>
            </div>
            <div className="divide-y divide-slate-100">
                {activities.map((a, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-2.5 lg:gap-3 p-2.5 lg:p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                        <div
                            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                            style={{
                                background: a.dot,
                                boxShadow: `0 0 0 3px ${a.dot}40`,
                            }}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="m-0 text-xs lg:text-sm text-slate-700 font-medium break-words">{a.text}</p>
                            <p className="m-0 mt-0.5 text-xs text-slate-400">{a.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 640px) {
                    h2 {
                        font-size: 14px !important;
                    }
                }
            `}</style>
        </div>
    );
}
