import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService.js';
import { Users, UserCheck, ShieldAlert, Ban, PieChart, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const normalizeStatus = (status) => String(status || '').toLowerCase();

function StatCard({ icon: Icon, title, value, hint, color = 'indigo' }) {
    const palette = {
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
        amber: 'from-amber-500 to-amber-600 shadow-amber-200',
        rose: 'from-rose-500 to-rose-600 shadow-rose-200',
    }[color];

    return (
        <div className="cursor-pointer rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-gray-200 hover:bg-white group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                    <p className="mt-1 text-xs font-medium text-gray-400">{hint}</p>
                </div>
                <div
                    className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${palette} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function StatusChart({ data }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all duration-300 hover:shadow-md hover:bg-white">
            <div className="mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Thống kê trạng thái người dùng</h3>
            </div>
            <div className="space-y-5">
                {data.map((item) => (
                    <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-600">{item.label}</span>
                            <span className="font-bold text-gray-900">{item.value}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${item.barClass}`}
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RoleChart({ data }) {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all duration-300 hover:shadow-md hover:bg-white">
            <div className="mb-6 flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                    <PieChart className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Phân bố vai trò</h3>
            </div>
            <div className="space-y-5">
                {data.map((item) => {
                    const percent = Math.round((item.value / total) * 100);
                    return (
                        <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-semibold text-gray-600">{item.label}</span>
                                <span className="font-bold text-gray-900">{percent}%</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${item.barClass}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await adminService.getAdminUsers();
                setUsers(res?.data || []);
            } catch (err) {
                setError(err?.message || 'Không thể tải danh sách user');
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const pendingCount = users.filter((u) => normalizeStatus(u.status) === 'pending').length;
    const activeCount = users.filter((u) => normalizeStatus(u.status) === 'active').length;
    const rejectedCount = users.filter((u) => normalizeStatus(u.status) === 'rejected').length;
    const inactiveCount = users.filter((u) => normalizeStatus(u.status) === 'inactive').length;

    const roleMap = users.reduce((acc, u) => {
        const role = u.role?.toLowerCase();
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const statusChartData = [
        { label: 'Pending (Chờ duyệt)', value: pendingCount, barClass: 'bg-amber-500' },
        { label: 'Active (Đang hoạt động)', value: activeCount, barClass: 'bg-emerald-500' },
        { label: 'Rejected (Từ chối)', value: rejectedCount, barClass: 'bg-rose-500' },
        { label: 'Inactive (Ngưng)', value: inactiveCount, barClass: 'bg-slate-500' },
    ];

    const roleChartData = [
        { label: 'Patient (Bệnh nhân)', value: roleMap.patient || 0, barClass: 'bg-indigo-500' },
        { label: 'Doctor (Bác sĩ)', value: roleMap.doctor || 0, barClass: 'bg-violet-500' },
        { label: 'Admin (Quản trị)', value: roleMap.admin || 0, barClass: 'bg-sky-500' },
    ];

    if (loading) {
        return (
            <div className="flex h-full">
                <main className="flex-1 p-4 xl:p-6 flex flex-col items-center justify-center overflow-hidden h-full">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                    <p className="text-gray-500 text-base mt-4 font-medium">Đang tải dữ liệu tổng quan...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            {/* 1. KHÓA CUỘN NGOÀI: overflow-hidden */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col h-full overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* 2. CHIA CHIỀU CAO: min-h-0 giúp flex-1 co giãn đúng chuẩn box */
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1 h-full min-h-0"
                >
                    {/* Header Box (không co giãn) */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 shrink-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 sm:pl-4 transition-all duration-500">
                            <h1 className="text-2xl font-bold text-primary">Tổng quan hệ thống</h1>
                            <p className="text-gray-500 text-sm mt-1">Báo cáo và thống kê dữ liệu người dùng</p>
                        </div>
                    </header>

                    {/* 3. KHỐI NỘI DUNG CHÍNH: Luôn giãn full phần còn lại (flex-1 min-h-0) */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1 min-h-0">
                        {/* 4. THANH CUỘN BÊN TRONG: Khu vực chứa nội dung (flex-1 overflow-y-auto) */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {error ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
                                    {error}
                                </div>
                            ) : (
                                <>
                                    {/* Hàng 1: Các thẻ chỉ số */}
                                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        <StatCard
                                            icon={Users}
                                            title="Tổng người dùng"
                                            value={users.length}
                                            hint="Toàn hệ thống"
                                            color="indigo"
                                        />
                                        <StatCard
                                            icon={ShieldAlert}
                                            title="Chờ duyệt"
                                            value={pendingCount}
                                            hint="Cần xử lý"
                                            color="amber"
                                        />
                                        <StatCard
                                            icon={UserCheck}
                                            title="Đang hoạt động"
                                            value={activeCount}
                                            hint="Tài khoản ACTIVE"
                                            color="emerald"
                                        />
                                        <StatCard
                                            icon={Ban}
                                            title="Đã từ chối"
                                            value={rejectedCount}
                                            hint="Tài khoản REJECTED"
                                            color="rose"
                                        />
                                    </section>

                                    {/* Hàng 2: Biểu đồ */}
                                    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <StatusChart data={statusChartData} />
                                        <RoleChart data={roleChartData} />
                                    </section>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
