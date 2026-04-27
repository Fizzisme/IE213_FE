import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService.js';
import { Users, UserCheck, ShieldAlert, Ban, PieChart, BarChart3 } from 'lucide-react';

const normalizeStatus = (status) => String(status || '').toLowerCase();

function StatCard({ icon: Icon, title, value, hint, color = 'indigo' }) {
    const palette = {
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
        amber: 'from-amber-500 to-amber-600 shadow-amber-200',
        rose: 'from-rose-500 to-rose-600 shadow-rose-200',
    }[color];

    return (
        <div className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                    <p className="mt-1 text-xs text-slate-400">{hint}</p>
                </div>
                <div
                    className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${palette} text-white shadow-md`}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function StatusChart({ data }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Thống kê trạng thái người dùng</h3>
            </div>
            <div className="space-y-4">
                {data.map((item) => (
                    <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600">{item.label}</span>
                            <span className="font-semibold text-slate-800">{item.value}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-violet-600" />
                <h3 className="font-semibold text-slate-900">Phân bố vai trò</h3>
            </div>
            <div className="space-y-3">
                {data.map((item) => {
                    const percent = Math.round((item.value / total) * 100);
                    return (
                        <div key={item.label}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-600">{item.label}</span>
                                <span className="font-semibold text-slate-800">{percent}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
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
        { label: 'Pending', value: pendingCount, barClass: 'bg-amber-500' },
        { label: 'Active', value: activeCount, barClass: 'bg-emerald-500' },
        { label: 'Rejected', value: rejectedCount, barClass: 'bg-rose-500' },
        { label: 'Inactive', value: inactiveCount, barClass: 'bg-slate-500' },
    ];

    const roleChartData = [
        { label: 'Patient', value: roleMap.patient || 0, barClass: 'bg-indigo-500' },
        { label: 'Doctor', value: roleMap.doctor || 0, barClass: 'bg-violet-500' },
        { label: 'Admin', value: roleMap.admin || 0, barClass: 'bg-sky-500' },
    ];

    if (loading) return <p className="p-6 text-slate-500">Đang tải dữ liệu...</p>;
    if (error) return <p className="p-6 text-rose-600">{error}</p>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={Users}
                    title="Tổng người dùng"
                    value={users.length}
                    hint="Toàn hệ thống"
                    color="indigo"
                />
                <StatCard icon={ShieldAlert} title="Chờ duyệt" value={pendingCount} hint="Cần xử lý" color="amber" />
                <StatCard
                    icon={UserCheck}
                    title="Đang hoạt động"
                    value={activeCount}
                    hint="Tài khoản ACTIVE"
                    color="emerald"
                />
                <StatCard icon={Ban} title="Đã từ chối" value={rejectedCount} hint="Tài khoản REJECTED" color="rose" />
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <StatusChart data={statusChartData} />
                <RoleChart data={roleChartData} />
            </section>
        </div>
    );
}
