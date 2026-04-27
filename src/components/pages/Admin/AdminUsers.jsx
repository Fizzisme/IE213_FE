import { useEffect, useRef, useState } from 'react';
import { adminService } from '@/services/adminService.js';
import { Search, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateVN } from '@/utils/formater.js';

const IDENTITY_MANAGER_ABI = [
    'function registerPatientGasless(address patient, bytes signature) external',
    'function registerStaff(address staff, uint8 role) external',
];

const normalizeStatus = (status) => String(status || '').toLowerCase();

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockchainLoading, setBlockchainLoading] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

    const loadUsers = async (params = {}) => {
        setLoading(true);
        setError('');
        try {
            const res = await adminService.getAdminUsers(params);
            setUsers(res?.data || []);
        } catch (err) {
            setError(err?.message || 'Không thể tải danh sách user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter.toUpperCase(); // tuỳ BE nhận gì
        if (keyword) params.search = keyword;

        loadUsers(params);
    }, [statusFilter, keyword]);

    const debounceRef = useRef(null);

    // Use debounce
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
            if (keyword) params.search = keyword;
            loadUsers(params);
        }, 500); // chờ 400ms sau khi ngừng gõ

        return () => clearTimeout(debounceRef.current);
    }, [statusFilter, keyword]);

    const getUserId = (user) => user?._id || user?.id;

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
            const { ethers } = await import('ethers');

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

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto h-full">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    {/* HEADER */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-textColor">Quản lý người dùng</h2>
                            <p className="text-sm text-gray-500">Duyệt và quản lý tài khoản hệ thống</p>
                        </div>

                        {/* FILTER */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* SEARCH */}
                            <div className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-gray-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <Search className="h-4 w-4 text-gray-400" />
                                <input
                                    placeholder="Tìm ví hoặc tên..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-52 bg-transparent text-sm outline-none"
                                />
                            </div>

                            {/* FILTER */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-xl border bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">Tất cả</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="active">Hoạt động</option>
                                <option value="rejected">Từ chối</option>
                                <option value="inactive">Ngưng</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLE */}
                    {loading ? (
                        <p className="text-gray-500">Đang tải...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="rounded-xl border overflow-hidden">
                            {/* HEADER TABLE */}
                            <div className="hidden md:grid grid-cols-[1.4fr_1fr_.6fr_.8fr_auto] bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <div>Ví</div>
                                <div>Ngày</div>
                                <div>Trạng thái</div>
                                <div></div>
                            </div>

                            {/* ROW */}
                            <div className="divide-y">
                                {users.map((u) => {
                                    const uid = getUserId(u);
                                    const isPending = normalizeStatus(u.status) === 'pending';
                                    const isBusy = blockchainLoading === uid;

                                    return (
                                        <div
                                            key={uid}
                                            className="grid cursor-pointer grid-cols-1 md:grid-cols-[1.4fr_1fr_.6fr_.8fr_auto] gap-2 px-4 py-4 hover:bg-primary/5 transition"
                                        >
                                            {/* WALLET */}
                                            <div className="font-mono text-xs text-textColor break-all">
                                                {u?.authProviders?.[0]?.walletAddress || 'N/A'}
                                            </div>

                                            {/* DATE */}
                                            <div className="text-sm text-gray-500">{formatDateVN(u.createdAt)}</div>

                                            {/* STATUS */}
                                            <div>
                                                <span
                                                    className={`px-2.5 py-1 text-xs rounded-full border font-semibold ${
                                                        normalizeStatus(u.status) === 'pending'
                                                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                            : normalizeStatus(u.status) === 'active'
                                                            ? 'bg-primary/10 text-primary border-primary/20'
                                                            : normalizeStatus(u.status) === 'rejected'
                                                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}
                                                >
                                                    {u.status}
                                                </span>
                                            </div>

                                            {/* ACTION */}
                                            {/* ACTION */}
                                            <div className="flex gap-2">
                                                {isPending ? (
                                                    <>
                                                        {/* APPROVE */}
                                                        <button
                                                            disabled={isBusy}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onApprove(uid);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
                                                        >
                                                            {isBusy ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            )}
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            disabled={isBusy}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onReject(uid);
                                                            }}
                                                            className="px-3 py-1.5 text-xs rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                ) : (
                                                    // Hiện trạng thái hiện tại, disabled, không cho bấm
                                                    <button
                                                        disabled
                                                        className={`px-3 py-1.5 text-xs rounded-lg font-medium opacity-50 cursor-not-allowed ${
                                                            normalizeStatus(u.status) === 'active'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : normalizeStatus(u.status) === 'rejected'
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : normalizeStatus(u.status) === 'inactive'
                                                                ? 'bg-gray-100 text-gray-600'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {normalizeStatus(u.status) === 'active'
                                                            ? '✓ Đã duyệt'
                                                            : normalizeStatus(u.status) === 'rejected'
                                                            ? '✗ Đã từ chối'
                                                            : normalizeStatus(u.status) === 'inactive'
                                                            ? '— Đã ngưng'
                                                            : u.status}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {users.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 italic">Không có dữ liệu</div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
