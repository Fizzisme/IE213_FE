// src/components/Doctor/DoctorAppointments.jsx

import { useEffect, useMemo, useState } from 'react';
import {
    Calendar,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    AlertCircle,
    BadgeDollarSign,
    FileText,
    Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { doctorService } from '@/services/doctorService.js';

/**
 * Cấu hình hiển thị giao diện dựa trên các status của lịch hẹn.
 * Giúp đồng bộ label, màu sắc và icon tương ứng cho từng status.
 */
const STATUS_CONFIG = {
    PENDING: {
        label: 'Đang chờ',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertCircle,
    },
    CONFIRMED: {
        label: 'Xác nhận',
        className: 'bg-primary text-white border-primary',
        icon: Clock,
    },
    COMPLETED: {
        label: 'Hoàn thành',
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: 'Đã hủy',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
    },
};

/**
 * Hàm (helper) dùng để trích xuất payload data từ response của API.
 * Xử lý an toàn trong trường hợp response có hoặc không có bọc qua thuộc tính data.
 */
const unwrap = (res) => res?.data ?? res;

export default function DoctorAppointments() {
    // Khởi tạo các state để quản lý dữ liệu và UI
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null); // Lưu ID của cuộc hẹn đang thực hiện update status
    const [error, setError] = useState('');

    /**
     * useEffect được gọi một lần khi component mount.
     * Thực hiện gọi API để fetch danh sách lịch khám của bác sĩ.
     */
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setError('');
                const res = await doctorService.getAppointments();
                const payload = unwrap(res);

                // Kiểm tra định dạng mảng của payload trước khi set state để tránh crash component
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

    /**
     * Sử dụng useMemo để tối ưu hóa việc lọc danh sách.
     * Chỉ thực hiện tính toán lại khi mảng appointments hoặc giá trị filter thay đổi.
     */
    const filtered = useMemo(() => {
        if (!filter) return appointments;
        return appointments.filter((a) => a.status === filter);
    }, [appointments, filter]);

    /**
     * Hàm format chuỗi thời gian trả về từ server sang chuẩn local của Việt Nam.
     */
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    /**
     * Hàm xử lý thay đổi status của lịch hẹn (Approve/Reject).
     * Chỉ chấp nhận thao tác với các lịch hẹn đang ở status PENDING.
     */
    const handleUpdate = async (id, status) => {
        // Chặn click nhiều lần khi request trước đó chưa hoàn thành
        if (updatingId) return;

        const current = appointments.find((a) => a._id === id);
        if (!current || current.status !== 'PENDING') {
            toast.error('Chỉ những cuộc hẹn đang chờ xử lý mới có thể được cập nhật từ màn hình này.');
            return;
        }

        try {
            setUpdatingId(id);
            // Gửi request update status lên server
            await doctorService.updateAppointment(id, status);

            // Cập nhật trực tiếp vào state cục bộ để giao diện phản hồi tức thì (Optimistic UI update)
            setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
            toast.success(`Lịch hẹn ${status.toLowerCase()} thành công.`);
        } catch (err) {
            console.error('Update failed', err);
            toast.error(err?.message || 'Cập nhật trạng thái thất bại');
        } finally {
            // Giải phóng trạng thái loading cho item sau khi hoàn tất
            setUpdatingId(null);
        }
    };

    return (
        <div className="flex h-full">
            {/* Vùng ngoài cùng sử dụng overflow-hidden để khóa thanh cuộn cấp độ trang */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col h-full overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* Thiết lập min-h-0 hỗ trợ flex-1 co giãn chính xác mà không đẩy nội dung tràn khung */
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1 h-full min-h-0"
                >
                    {/* ================= HEADER ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#04d3b8] flex items-center justify-center text-white shadow-md shrink-0">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primary">Lịch khám</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Quản lý và phê duyệt các cuộc hẹn của bệnh nhân
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* ================= CONTENT BOX ================= */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1 min-h-0">
                        {/* FILTERS AREA */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 shrink-0">
                            <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                                {/* Nút reset bộ lọc */}
                                <button
                                    onClick={() => setFilter('')}
                                    className={`px-4 py-2 text-sm rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all duration-300 ${
                                        filter === ''
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-gray-500 hover:text-primary hover:bg-white'
                                    }`}
                                >
                                    Tất cả
                                </button>

                                {/* Map các status được định nghĩa trong STATUS_CONFIG thành các nút filter */}
                                {Object.keys(STATUS_CONFIG).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className={`px-4 py-2 text-sm rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all duration-300 ${
                                            filter === key
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-gray-500 hover:text-primary hover:bg-white'
                                        }`}
                                    >
                                        {STATUS_CONFIG[key].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ================= LIST AREA (Khu vực áp dụng thanh cuộn độc lập) ================= */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            {loading ? (
                                // Render UI chờ khi call API
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                    <p className="font-medium">Đang tải danh sách lịch khám...</p>
                                </div>
                            ) : error ? (
                                // Render UI lỗi nếu API thất bại
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-medium">
                                    {error}
                                </div>
                            ) : filtered.length === 0 ? (
                                // Render UI rỗng khi không có dữ liệu khớp với bộ lọc
                                <div className="flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Không có lịch khám nào</h3>
                                    <p className="text-gray-500 text-sm">
                                        Chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
                                    </p>
                                </div>
                            ) : (
                                // Render grid chứa các thẻ (card) thông tin lịch hẹn
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pb-4">
                                    {filtered.map((a) => {
                                        const status = STATUS_CONFIG[a.status] || {};
                                        const Icon = status.icon || Clock;
                                        const isProcessing = updatingId === a._id;

                                        return (
                                            <div
                                                key={a._id}
                                                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/30 flex flex-col"
                                            >
                                                {/* THÔNG TIN HEADER CỦA CARD */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">
                                                            #{String(a._id).slice(-6)}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            Tạo: {formatDate(a.createdAt)}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border font-bold uppercase tracking-wide ${status.className ||
                                                            'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                    >
                                                        <Icon className="w-3.5 h-3.5" />
                                                        {status.label || a.status}
                                                    </span>
                                                </div>

                                                {/* CHI TIẾT NỘI DUNG CARD */}
                                                <div className="space-y-2 mb-6 flex-1">
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                        <User className="w-4 h-4 text-primary shrink-0" />
                                                        <span
                                                            className="font-medium truncate"
                                                            title={
                                                                typeof a.patientId === 'object'
                                                                    ? a.patientId?._id
                                                                    : a.patientId
                                                            }
                                                        >
                                                            {typeof a.patientId === 'object'
                                                                ? a.patientId?._id || 'N/A'
                                                                : a.patientId}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                        <Clock className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="font-bold text-gray-900">
                                                            {formatDate(a.appointmentDateTime)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                        <BadgeDollarSign className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="font-bold text-emerald-600">
                                                            {Number(a.price || 0).toLocaleString('vi-VN')} đ
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* KHU VỰC THAO TÁC (ACTIONS) */}
                                                <div className="mt-auto grid grid-cols-2 gap-2">
                                                    {/* Chỉ render nút Duyệt/Từ chối nếu status hiện tại là PENDING */}
                                                    {a.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdate(a._id, 'CONFIRMED')}
                                                                disabled={isProcessing}
                                                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-green-700 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isProcessing ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        <span>Duyệt</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                // Chuyển status sang CANCELLED để khớp với enum dưới server
                                                                onClick={() => handleUpdate(a._id, 'CANCELLED')}
                                                                disabled={isProcessing}
                                                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold border-2 border-red-200 text-red-600 bg-white rounded-xl hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isProcessing ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="w-4 h-4" />
                                                                        <span>Từ chối</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Nút Xem chi tiết: Hiển thị full width nếu không có các nút thao tác khác */}
                                                    <button
                                                        className={`col-span-${
                                                            a.status === 'PENDING' ? '2' : '2'
                                                        } flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold border-2 border-gray-200 text-gray-700 bg-white rounded-xl hover:border-primary hover:text-primary transition-all cursor-pointer`}
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        <span>Xem chi tiết</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
