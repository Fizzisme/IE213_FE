import { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Search, Star, Archive, MoreHorizontal } from 'lucide-react';

const mockNotifications = [
    {
        id: 1,
        type: 'success',
        title: 'Xét nghiệm hoàn tất',
        message: 'Mẫu máu của bệnh nhân #1023 đã được xử lý thành công và kết quả đã sẵn sàng.',
        time: '2 phút trước',
        read: false,
        starred: false,
    },
    {
        id: 2,
        type: 'warning',
        title: 'Thiết bị cần kiểm tra',
        message: 'Máy phân tích sinh hóa có dấu hiệu bất thường, cần kiểm tra ngay.',
        time: '10 phút trước',
        read: false,
        starred: true,
    },
    {
        id: 3,
        type: 'info',
        title: 'Lịch bảo trì',
        message: 'Bảo trì hệ thống vào 22:00 tối nay, vui lòng lưu công việc trước đó.',
        time: '1 giờ trước',
        read: true,
        starred: false,
    },
    {
        id: 4,
        type: 'success',
        title: 'Báo cáo tháng đã sẵn sàng',
        message: 'Báo cáo thống kê tháng 3 đã được tạo và sẵn sàng để xem xét.',
        time: '2 giờ trước',
        read: true,
        starred: false,
    },
    {
        id: 5,
        type: 'info',
        title: 'Bệnh nhân mới được thêm',
        message: 'Bệnh nhân Nguyễn Văn A (#1045) đã được thêm vào hệ thống.',
        time: '3 giờ trước',
        read: true,
        starred: true,
    },
    {
        id: 6,
        type: 'warning',
        title: 'Hết hạn thuốc thử',
        message: 'Reagent kit #RK-2024 sẽ hết hạn trong 7 ngày, cần đặt hàng bổ sung.',
        time: '5 giờ trước',
        read: true,
        starred: false,
    },
];

const typeConfig = {
    success: { icon: CheckCircle, color: 'text-emerald-500', dot: 'bg-emerald-400' },
    warning: { icon: AlertCircle, color: 'text-amber-500', dot: 'bg-amber-400' },
    info: { icon: Info, color: 'text-blue-500', dot: 'bg-blue-400' },
};

export default function LabTechNotification() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const unreadCount = notifications.filter((n) => !n.read).length;
    const starredCount = notifications.filter((n) => n.starred).length;

    const filtered = notifications.filter((n) => {
        const matchSearch =
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.message.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || (filter === 'unread' && !n.read) || (filter === 'starred' && n.starred);
        return matchSearch && matchFilter;
    });

    const markAsRead = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const toggleStar = (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n)));

    const deleteNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

    const tabs = [
        { key: 'all', label: 'All', count: notifications.length },
        { key: 'unread', label: 'Unread', count: unreadCount },
        { key: 'starred', label: 'Starred', count: starredCount },
    ];

    return (
        <div className="h-full p-6 bg-gray-50">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-indigo-600" />
                        <h1 className="text-base font-bold text-gray-800">List Notification</h1>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <MoreHorizontal size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Subheader: count + search */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500 font-medium">{notifications.length} Notification</span>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Name Product"
                            className="pl-8 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 w-56 transition"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition relative
                                ${filter === tab.key ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}
                            `}
                        >
                            <span
                                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${filter === tab.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}
                            `}
                            >
                                {tab.count}
                            </span>
                            {tab.label}
                            {filter === tab.key && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />
                            )}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="divide-y divide-gray-50">
                    {filtered.length === 0 && (
                        <div className="text-center text-gray-400 py-16 text-sm">Không có thông báo nào</div>
                    )}

                    {filtered.map((n) => {
                        const config = typeConfig[n.type];

                        return (
                            <div
                                key={n.id}
                                className={`flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition group
                                    ${!n.read ? 'bg-white' : 'bg-white'}
                                `}
                            >
                                {/* Unread dot */}
                                <div className="w-4 flex justify-center shrink-0">
                                    {!n.read ? (
                                        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                                    ) : (
                                        <span className="w-2 h-2" />
                                    )}
                                </div>

                                {/* Star */}
                                <button onClick={() => toggleStar(n.id)} className="shrink-0 transition">
                                    <Star
                                        size={15}
                                        className={
                                            n.starred
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-300 hover:text-amber-300'
                                        }
                                    />
                                </button>

                                {/* Type icon */}
                                <div className="shrink-0">
                                    <config.icon size={15} className={config.color} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm truncate ${
                                            !n.read ? 'font-semibold text-gray-800' : 'text-gray-600'
                                        }`}
                                    >
                                        <span className="font-semibold text-gray-700">{n.title} — </span>
                                        {n.message}
                                    </p>
                                </div>

                                {/* Time */}
                                <span className="text-xs text-gray-400 shrink-0 ml-2">{n.time}</span>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition"
                                            title="Đánh dấu đã đọc"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition"
                                        title="Xóa"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
