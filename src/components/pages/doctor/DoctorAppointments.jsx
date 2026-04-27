import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, BadgeDollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { doctorService } from '@/services/doctorService.js';

const STATUS_CONFIG = {
    PENDING: {
        label: 'Đang chờ',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: AlertCircle,
    },
    CONFIRMED: {
        label: 'Xác nhận',
        className: 'bg-primary text-white',
        icon: Clock,
    },
    COMPLETED: {
        label: 'Hoàn thành',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: 'Hủy',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: XCircle,
    },
};

const unwrap = (res) => res?.data ?? res;

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setError('');
                const res = await doctorService.getAppointments();
                const payload = unwrap(res);

                const list = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];

                setAppointments(list);
            } catch (err) {
                console.error(err);
                setError(err?.message || 'Không thể tải danh sách lịch hẹn');
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

    const handleUpdate = async (id, status) => {
        if (updatingId) return;

        const current = appointments.find((a) => a._id === id);
        if (!current || current.status !== 'PENDING') {
            toast.error('Chỉ những cuộc hẹn đang chờ xử lý mới có thể được cập nhật từ màn hình này.');
            return;
        }

        try {
            setUpdatingId(id);
            await doctorService.updateAppointment(id, status);

            setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
            toast.success(`Lịch hẹn ${status.toLowerCase()} thành công.`);
        } catch (err) {
            console.error('Update failed', err);
            toast.error(err?.message || 'Xác nhận thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-textColor">Lịch khám</h1>
                    <p className="text-sm text-gray-500">Quản lý và phê duyệt các cuộc hẹn của bệnh nhân</p>
                </div>

                <div className="flex items-center gap-1 rounded-xl border bg-white p-1 shadow-sm flex-wrap">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer ${
                            filter === '' ? 'bg-slate-100 font-semibold' : 'text-gray-500'
                        }`}
                    >
                        All
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

            <div className="bg-white rounded-2xl border shadow-sm p-5 max-h-[600px] overflow-y-auto">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Đang tải...</div>
                ) : error ? (
                    <div className="text-center text-rose-500 py-10">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">Không có lịch khám</div>
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
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-textColor">#{String(a._id).slice(-6)}</p>
                                            <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                                        </div>

                                        <span
                                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${status.className ||
                                                ''}`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {status.label || a.status}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            {typeof a.patientId === 'object' ? a.patientId?._id || 'N/A' : a.patientId}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {formatDate(a.appointmentDateTime)}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <BadgeDollarSign size={14} />
                                            {Number(a.price || 0).toLocaleString('vi-VN')}d
                                        </div>
                                    </div>

                                    <div className="mt-2 flex gap-2">
                                        {a.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(a._id, 'CONFIRMED')}
                                                    disabled={updatingId === a._id}
                                                    className="flex-1 text-xs bg-primary text-white py-2 rounded-lg hover:bg-primary/80 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {updatingId === a._id ? 'Đang xác nhận...' : 'Xác nhận'}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(a._id, 'Hủy')}
                                                    disabled={updatingId === a._id}
                                                    className="flex-1 text-xs bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {updatingId === a._id ? 'Đang xác nhận...' : 'Hủy'}
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
