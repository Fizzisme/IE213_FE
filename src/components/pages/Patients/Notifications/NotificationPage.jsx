import { useState, useEffect } from 'react';
import { CheckCheck, Calendar, Clock, AlertCircle, Info, Bell, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../utils/api';

export default function NotificationPage() {
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (cursorValue = null) => {
        try {
            const isInitial = cursorValue === null;
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const params = {
                limit: 10,
            };
            if (cursorValue) {
                params.cursor = cursorValue;
            }

            const res = await api.get('patients/notifications/me', { params });
            const rawData = res.data.data.data || [];
            const nextCursor = res.data.data.nextCursor || null;
            const hasMoreFromServer = res.data.data.hasMore;
            const normalized = rawData.map((n) => ({
                id: n._id,
                event: n.event,
                title: n.title,
                content: n.content,
                createdAt: n.createdAt,
                isRead: n.isRead,
                metadata: n.metadata || {},
            }));

            if (isInitial) {
                setNotifications(normalized);
            } else {
                setNotifications((prev) => [...prev, ...normalized]);
            }

            setCursor(nextCursor);
            setHasMore(hasMoreFromServer);
        } catch (err) {
            console.error('Fetch notifications error:', err);
        } finally {
            if (cursorValue === null) setLoading(false);
            else setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markOne = async (id) => {
        try {
            await api.patch(`patients/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        } catch (err) {
            console.error('Mark read error:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch(`patients/notifications/read-all`);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Mark all read error:', err);
        }
    };

    const deleteOne = async (id) => {
        try {
            await api.delete(`patients/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error('Delete notification error:', err);
        }
    };

    const deleteAll = async () => {
        try {
            await api.delete(`patients/notifications/delete-all`);
            setNotifications([]);
            setCursor(null);
            setHasMore(true);
        } catch (err) {
            console.error('Delete all notifications error:', err);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            fetchNotifications(cursor);
        }
    };

    const getEventConfig = (event) => {
        switch (event) {
            case 'APPOINTMENT_CREATED':
                return {
                    label: 'Lịch hẹn mới',
                    icon: <Calendar className="w-5 h-5" />,
                    color: 'text-green-600 bg-green-50',
                };
            case 'APPOINTMENT_RESCHEDULED':
                return {
                    label: 'Đặt lại lịch',
                    icon: <Clock className="w-5 h-5" />,
                    color: 'text-orange-600 bg-orange-50',
                };
            case 'APPOINTMENT_CANCELLED':
                return {
                    label: 'Hủy lịch',
                    icon: <AlertCircle className="w-5 h-5" />,
                    color: 'text-red-600 bg-red-50',
                };
            case 'APPOINTMENT_REMINDER':
                return {
                    label: 'Nhắc nhở',
                    icon: <Bell className="w-5 h-5" />,
                    color: 'text-blue-600 bg-blue-50',
                };
            case 'SYSTEM':
                return {
                    label: 'Hệ thống',
                    icon: <Info className="w-5 h-5" />,
                    color: 'text-blue-600 bg-blue-50',
                };
            default:
                return {
                    label: 'Thông báo',
                    icon: <Bell className="w-5 h-5" />,
                    color: 'text-gray-600 bg-gray-50',
                };
        }
    };

    const formatDateTime = (iso) => {
        const d = new Date(iso);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} • ${d
            .getHours()
            .toString()
            .padStart(2, '0')}:${d
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
    };

    const groupByDate = (list) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const result = {
            'Hôm nay': [],
            'Hôm qua': [],
            'Cũ hơn': [],
        };

        list.forEach((n) => {
            const d = new Date(n.createdAt);
            d.setHours(0, 0, 0, 0);

            if (d.getTime() === today.getTime()) result['Hôm nay'].push(n);
            else if (d.getTime() === yesterday.getTime()) result['Hôm qua'].push(n);
            else result['Cũ hơn'].push(n);
        });

        return result;
    };

    const filtered = notifications.filter((n) => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'APPOINTMENTS') return n.event.includes('APPOINTMENT');
        return true;
    });

    const grouped = groupByDate(filtered);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    if (loading) {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#3B82F6] rounded-full animate-spin" />
                    <p className="text-gray-500 text-base">Đang tải thông báo...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Thông báo</h1>
                    <p className="text-gray-500 text-base md:text-lg">Cập nhật mới nhất của bạn</p>
                </div>

                {/* Filter */}
                <div className="mb-6 bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveFilter('ALL')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                    activeFilter === 'ALL'
                                        ? 'bg-[#3B82F6] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Tất cả
                            </button>

                            <button
                                onClick={() => setActiveFilter('APPOINTMENTS')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                    activeFilter === 'APPOINTMENTS'
                                        ? 'bg-[#3B82F6] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Lịch hẹn
                            </button>
                        </div>

                        <div className="flex gap-3 items-center">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-sm font-semibold text-[#3B82F6] flex items-center gap-2 hover:text-blue-700 transition-colors"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Đánh dấu đã đọc
                                </button>
                            )}

                            {notifications.length > 0 && (
                                <button
                                    onClick={deleteAll}
                                    className="text-sm font-semibold text-red-600 flex items-center gap-2 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa tất cả
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-6">
                    {Object.entries(grouped).map(([label, items]) =>
                        items.length > 0 ? (
                            <div key={label}>
                                <h3 className="text-sm font-semibold text-gray-600 mb-3">{label}</h3>

                                <div className="space-y-3">
                                    {items.map((n) => {
                                        const cfg = getEventConfig(n.event);

                                        return (
                                            <div
                                                key={n.id}
                                                className={`p-5 rounded-xl transition-all duration-300 border group ${
                                                    n.isRead
                                                        ? 'bg-white border-gray-100 hover:shadow-md'
                                                        : 'bg-blue-50 border-blue-200 hover:shadow-md hover:border-blue-300'
                                                }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.color} cursor-pointer`}
                                                        onClick={() => markOne(n.id)}
                                                    >
                                                        {cfg.icon}
                                                    </div>

                                                    <div
                                                        className="flex-1"
                                                        onClick={() => markOne(n.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <h4 className="font-bold text-gray-900">{n.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{n.content}</p>

                                                        <div className="text-xs text-gray-500 mt-2">
                                                            {cfg.label} • {formatDateTime(n.createdAt)}
                                                        </div>

                                                        {n.metadata?.reason && (
                                                            <div className="text-xs text-red-600 mt-2">
                                                                Lý do: {n.metadata.reason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => deleteOne(n.id)}
                                                        className="shrink-0 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Xóa thông báo"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null,
                    )}

                    {/* Load More Button */}
                    {hasMore && notifications.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                    loadingMore
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#3B82F6] text-white hover:bg-blue-600 shadow-md'
                                }`}
                            >
                                {loadingMore ? 'Đang tải...' : 'Tải thêm'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
