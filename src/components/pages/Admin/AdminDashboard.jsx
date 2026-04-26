import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/adminService.js';
import { ethers } from 'ethers';
import {
    Users,
    UserCheck,
    ShieldAlert,
    Ban,
    Search,
    Trash2,
    CheckCircle2,
    Activity,
    PieChart,
    BarChart3,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDateVN } from '@/utils/formater.js';

const IDENTITY_MANAGER_ABI = [
    'function registerPatientGasless(address patient, bytes signature) external',
    'function registerStaff(address staff, uint8 role) external',
];

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    inactive: 'bg-slate-200 text-slate-700 border-slate-300',
};

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
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockchainLoading, setBlockchainLoading] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await adminService.getAdminUsers();
            setUsers(res?.data?.data || []);
        } catch (err) {
            setError(err?.message || 'Không thể tải danh sách user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchStatus =
                statusFilter === 'all' ? true : normalizeStatus(u.status) === statusFilter.toLowerCase();
            const matchKeyword =
                keyword === ''
                    ? true
                    : u.fullName?.toLowerCase().includes(keyword.toLowerCase()) ||
                      u.authProviders?.[0]?.walletAddress?.toLowerCase().includes(keyword.toLowerCase());
            return matchStatus && matchKeyword;
        });
    }, [users, statusFilter, keyword]);

    const onApprove = async (userId) => {
        try {
            setBlockchainLoading(userId);
            const response = await adminService.approveUser(userId);
            const { needsBlockchain, blockchain, message } = response.data;

            if (!needsBlockchain || !blockchain) {
                toast.success(message || 'Duyệt thành công (Local)');
                await loadUsers();
                return;
            }

            if (!window.ethereum) throw new Error('Vui lòng cài đặt MetaMask để duyệt Web3');

            const provider = new ethers.BrowserProvider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const chainId = (await provider.getNetwork()).chainId;
            if (chainId !== 11155111n) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) toast.error('Vui lòng thêm mạng Sepolia vào MetaMask');
                }
                return;
            }

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(blockchain.contractAddress, IDENTITY_MANAGER_ABI, signer);

            toast.info('Vui lòng xác nhận giao dịch trên MetaMask...');

            const tx =
                blockchain.method === 'registerPatientGasless'
                    ? await contract.registerPatientGasless(blockchain.args[0], blockchain.args[1])
                    : await contract.registerStaff(blockchain.args[0], blockchain.args[1]);

            toast.loading(`Giao dịch đang chờ xác nhận: ${tx.hash.substring(0, 10)}...`);
            await tx.wait();

            toast.info('Đang xác minh giao dịch với Server...');
            await adminService.verifyOnboarding(userId, tx.hash);

            toast.success('Duyệt thành công trên cả Web2 và Web3!');
            await loadUsers();
        } catch (err) {
            toast.error(err.reason || err.message || 'Duyệt user thất bại');
        } finally {
            setBlockchainLoading(null);
        }
    };

    const onReject = async (userId) => {
        const reason = window.prompt('Nhập lý do từ chối user:');
        if (reason === null) return;
        if (!reason.trim()) {
            toast.error('Lý do từ chối không được để trống');
            return;
        }
        try {
            await adminService.rejectUser(userId, reason.trim());
            toast.success('Đã từ chối user');
            await loadUsers();
        } catch (err) {
            toast.error(err?.message || 'Từ chối user thất bại');
        }
    };

    const onDelete = async (userId) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa user này?')) return;
        try {
            await adminService.deleteUser(userId);
            toast.success('Xóa user thành công');
            await loadUsers();
        } catch (err) {
            toast.error(err?.message || 'Xóa user thất bại');
        }
    };

    const getUserId = (user) => user?._id || user?.id;

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

    return (
        <div className="p-4 md:p-6 space-y-6">
            {' '}
            {/* ← bỏ min-h-screen, dùng padding như DoctorDashboard */}
            {/* Stats */}
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
            {/* Charts */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <StatusChart data={statusChartData} />
                <RoleChart data={roleChartData} />
            </section>
            {/* User Table */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Quản lý người dùng</h2>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Tìm ví/tên..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-52 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {loading && <p className="text-slate-500">Đang tải dữ liệu...</p>}
                {error && <p className="text-rose-600">{error}</p>}

                {!loading && !error && (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="hidden grid-cols-[1.4fr_1fr_.7fr_.8fr_auto] bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 md:grid">
                            <div>Địa chỉ ví</div>
                            <div>Ngày đăng ký</div>
                            <div>Role</div>
                            <div>Trạng thái</div>
                            <div>Hành động</div>
                        </div>

                        <div className="max-h-[500px] divide-y divide-slate-100 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                            {filteredUsers.map((u) => {
                                const uid = getUserId(u);
                                const isPending = normalizeStatus(u.status) === 'pending';
                                const isBusy = blockchainLoading === uid;

                                return (
                                    <div
                                        key={uid}
                                        onClick={() => navigate(`/admin/users/${uid}`, { state: { user: u } })}
                                        className="grid cursor-pointer grid-cols-1 gap-2 px-4 py-4 transition-all hover:bg-indigo-50/40 md:grid-cols-[1.4fr_1fr_.7fr_.8fr_auto] md:items-center"
                                    >
                                        <div className="font-mono text-xs text-slate-800 break-all">
                                            {u?.authProviders?.[0]?.walletAddress || 'N/A'}
                                        </div>
                                        <div className="text-sm text-slate-600">{formatDateVN(u.createdAt)}</div>
                                        <div className="font-medium text-slate-700">{u.role}</div>
                                        <div>
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[
                                                    normalizeStatus(u.status)
                                                ] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                                            >
                                                {u.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={!isPending || isBusy}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onApprove(uid);
                                                }}
                                                className="inline-flex min-w-[90px] cursor-pointer items-center justify-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isBusy ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                                {isBusy ? 'Wait...' : 'Duyệt'}
                                            </button>
                                            <button
                                                disabled={!isPending || isBusy}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onReject(uid);
                                                }}
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Từ chối
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(uid);
                                                }}
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredUsers.length === 0 && (
                                <div className="px-4 py-8 text-center italic text-slate-500">
                                    Không tìm thấy người dùng nào.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
