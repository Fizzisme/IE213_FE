import { useEffect, useState, useMemo } from 'react';
import { doctorService } from '@/services/doctorService.js';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, BadgeDollarSign } from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: {
        label: 'Chờ xác nhận',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: AlertCircle,
    },
    CONFIRMED: {
        label: 'Đã xác nhận',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Clock,
    },
    COMPLETED: {
        label: 'Đã hoàn thành',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: 'Đã huỷ',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: XCircle,
    },
};

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await doctorService.getAppointments();
                if (res.statusCode === 200) {
                    setAppointments(res.data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const filtered = useMemo(() => {
        if (!filter) return appointments;
        return appointments.filter((a) => a.status === filter);
    }, [appointments, filter]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    const [updatingId, setUpdatingId] = useState(null);

    const handleUpdate = async (id, status) => {
        try {
            setUpdatingId(id);

            const res = await doctorService.updateAppointment(id, status);

            if (res?.statusCode === 200) {
                // update UI ngay không cần gọi lại API
                setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
            }
        } catch (err) {
            console.error('Update failed', err);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-textColor">Lịch hẹn khám bệnh</h1>
                    <p className="text-sm text-gray-500">Quản lý và xác nhận lịch hẹn bệnh nhân</p>
                </div>

                {/* FILTER */}
                <div className="flex items-center gap-1 rounded-xl border bg-white p-1 shadow-sm">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer ${
                            filter === '' ? 'bg-slate-100 font-semibold' : 'text-gray-500'
                        }`}
                    >
                        Tất cả
                    </button>

                    {Object.keys(STATUS_CONFIG).map((key) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer ${
                                filter === key ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500'
                            }`}
                        >
                            {STATUS_CONFIG[key].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 max-h-[600px] overflow-y-auto">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Đang tải dữ liệu...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">Không có lịch hẹn nào</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((a) => {
                            const status = STATUS_CONFIG[a.status] || {};
                            const Icon = status.icon || Clock;

                            return (
                                <div
                                    key={a._id}
                                    className="border rounded-2xl p-4 hover:shadow-md transition flex flex-col gap-3"
                                >
                                    {/* TOP */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-textColor">#{a._id.slice(-6)}</p>
                                            <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                                        </div>

                                        <span
                                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${status.className}`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* INFO */}
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            {a.patientId}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {formatDate(a.appointmentDateTime)}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <BadgeDollarSign size={14} />
                                            {a.price?.toLocaleString()}đ
                                        </div>
                                    </div>

                                    {/* ACTION */}
                                    <div className="mt-2 flex gap-2">
                                        {a.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(a._id, 'CONFIRMED')}
                                                    disabled={updatingId === a._id}
                                                    className="flex-1 text-xs bg-primary text-white py-2 rounded-lg hover:bg-primary/80 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {updatingId === a._id ? 'Đang xử lý...' : 'Xác nhận'}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(a._id, 'CANCELLED')}
                                                    disabled={updatingId === a._id}
                                                    className="flex-1 text-xs bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {updatingId === a._id ? 'Đang xử lý...' : 'Huỷ'}
                                                </button>
                                            </>
                                        )}

                                        <button className="flex-1 text-xs border py-2 rounded-lg hover:bg-gray-50">
                                            Chi tiết
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
