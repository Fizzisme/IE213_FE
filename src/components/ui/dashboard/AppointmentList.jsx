import { ChevronRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/utils/api.js';
import { useNavigate } from 'react-router-dom';
export default function AppointmentList() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await api.get('patients/appointments/me');
                setAppointments(res.data.data);
            } catch (err) {
                console.error(err);
                alert('Lỗi khi tải lịch hẹn');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);
    const now = new Date();

    const upcomingAppointments = appointments.filter((a) => {
        const validStatus = ['PENDING', 'CONFIRMED'].includes(a.status);
        const date = new Date(a.appointmentDateTime);
        return validStatus && date >= now;
    });
    const sortedAppointments = upcomingAppointments.sort(
        (a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime),
    );
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const APPOINTMENTS = [
        {
            doctor: 'BS. Nguyễn Văn A',
            specialty: 'Tim mạch',
            date: '10/03/2026',
            time: '09:00 SA',
            status: 'confirmed',
        },
        { doctor: 'BS. Trần Thị B', specialty: 'Thần kinh', date: '14/03/2026', time: '02:30 CH', status: 'pending' },
        { doctor: 'BS. Lê Văn C', specialty: 'Da liễu', date: '20/03/2026', time: '11:00 SA', status: 'confirmed' },
    ];

    return (
        <div
            className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow min-w-0"
            style={{ animation: 'fadeUp 0.5s ease 0.35s both' }}
        >
            <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-sm lg:text-base font-bold text-slate-900">Upcoming Appointments</h2>
                <button
                    onClick={() => navigate('/patient/appointments-manage?tab=UPCOMING')}
                    className="bg-transparent border-none cursor-pointer text-xs lg:text-sm text-teal-700 font-semibold flex items-center gap-1 whitespace-nowrap hover:text-teal-800"
                >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="divide-y divide-slate-100">
                {sortedAppointments.map((a, i) => (
                    <div
                        key={i}
                        className="appointment-row flex flex-col md:flex-row md:items-center p-3 md:p-4 lg:p-5 cursor-pointer hover:bg-slate-50 transition-colors gap-3 md:gap-4"
                    >
                        {/* Box 1: Doctor & Specialty */}
                        <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
                                <User className="w-4.5 h-4.5 text-teal-700" />
                            </div>
                            <div className="min-w-0">
                                <p className="m-0 text-xs lg:text-sm font-semibold text-slate-900 truncate">
                                    {a.doctor || 'Đang tìm bác sĩ...'}
                                </p>
                                <p className="m-0 mt-0.5 text-xs text-slate-400 truncate">{a.specialty || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Box 2: Date, Time & Status */}
                        <div className="appointment-meta text-left md:text-right md:ml-auto">
                            <div className="date-time-group flex flex-col md:flex-row md:gap-3 md:items-center mb-2 md:mb-0">
                                <p className="m-0 text-xs text-slate-600 font-medium">
                                    {formatDate(a.appointmentDateTime)}
                                </p>
                                <p className="m-0 text-xs text-slate-400">{formatTime(a.appointmentDateTime)}</p>
                            </div>
                            <span
                                className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                                    a.status === 'CONFIRMED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                                {a.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ duyệt'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
