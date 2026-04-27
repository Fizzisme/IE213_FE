import { useEffect, useRef, useState } from 'react';
import { adminService } from '@/services/adminService.js';
import { Search, CheckCircle2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateVN } from '@/utils/formater.js';
import { motion } from 'framer-motion';

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
        // 1. Tạo một biến để lưu ID của toast
        let toastId = null;

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

            // 2. Khởi tạo toast loading và lấy ID
            toastId = toast.loading('Vui lòng xác nhận giao dịch trên MetaMask...');

            const tx =
                blockchain.method === 'registerPatientGasless'
                    ? await contract.registerPatientGasless(blockchain.args[0], blockchain.args[1])
                    : await contract.registerStaff(blockchain.args[0], blockchain.args[1]);

            // 3. Cập nhật nội dung toast ĐANG CÓ (truyền thêm { id: toastId })
            toast.loading(`Giao dịch đang chờ xác nhận: ${tx.hash.substring(0, 10)}...`, { id: toastId });
            await tx.wait();

            // Cập nhật tiếp nội dung
            toast.loading('Đang xác minh giao dịch với Server...', { id: toastId });
            await adminService.verifyOnboarding(userId, tx.hash);

            // 4. Biến toast loading thành thành công (nó sẽ tự động mất sau vài giây)
            toast.success('Duyệt thành công trên cả Web2 và Web3!', { id: toastId });
            await loadUsers();
        } catch (err) {
            // 5. Nếu lỗi xảy ra, kiểm tra xem đã có toast loading chưa để biến nó thành lỗi
            const errorMessage = err.reason || err.message || 'Duyệt user thất bại';
            if (toastId) {
                toast.error(errorMessage, { id: toastId });
            } else {
                toast.error(errorMessage);
            }
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
        <div className="flex h-full">
            {/* CUỘN TOÀN TRANG */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* flex-1 để khối tự động giãn khi nội dung ngắn */
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1"
                >
                    {/* KHỐI CARD DUY NHẤT BAO GỒM CẢ HEADER, FILTER VÀ TABLE */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1">
                        {/* Header & Filters Area */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pb-6 border-b border-gray-100 shrink-0">
                            {/* Title */}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-primary">Quản lý người dùng</h1>
                                <p className="text-gray-500 text-sm mt-1">Duyệt và quản lý tài khoản hệ thống</p>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                {/* SEARCH */}
                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 bg-gray-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 w-full sm:w-auto transition-all">
                                    <Search className="h-4 w-4 text-gray-500" />
                                    <input
                                        placeholder="Tìm ví hoặc tên..."
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="w-full sm:w-64 bg-transparent text-sm outline-none text-gray-700"
                                    />
                                </div>

                                {/* FILTER */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer w-full sm:w-auto transition-all"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="active">Hoạt động</option>
                                    <option value="rejected">Từ chối</option>
                                    <option value="inactive">Ngưng</option>
                                </select>
                            </div>
                        </div>

                        {/* Danh sách người dùng */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <p className="text-gray-500 mt-4 font-medium">Đang tải danh sách...</p>
                                </div>
                            ) : error ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-medium">
                                    {error}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                                    {/* SỬ DỤNG TABLE HTML CHUẨN */}
                                    <table className="w-full text-left border-collapse">
                                        {/* THEAD: Ẩn trên mobile, hiện trên md trở lên */}
                                        <thead className="hidden md:table-header-group bg-gray-50">
                                            <tr>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                                    Ví MetaMask
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                                    Ngày tạo
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                                    Trạng thái
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {users.map((u) => {
                                                const uid = getUserId(u);
                                                const isPending = normalizeStatus(u.status) === 'pending';
                                                const isBusy = blockchainLoading === uid;

                                                return (
                                                    <tr
                                                        key={uid}
                                                        /* TR: Chuyển thành dạng block (dọc) trên mobile, dạng table-row trên màn lớn */
                                                        className="block md:table-row hover:bg-gray-50/80 transition-colors duration-200 border-b md:border-none last:border-0"
                                                    >
                                                        {/* WALLET */}
                                                        <td className="block md:table-cell px-5 py-3 md:py-4">
                                                            <div className="flex flex-col md:block">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Ví MetaMask
                                                                </span>
                                                                <div
                                                                    className="font-mono text-sm font-medium text-gray-700 truncate w-full max-w-[200px] sm:max-w-xs md:max-w-[180px] lg:max-w-[250px]"
                                                                    title={u?.authProviders?.[0]?.walletAddress}
                                                                >
                                                                    {u?.authProviders?.[0]?.walletAddress || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* DATE */}
                                                        <td className="block md:table-cell px-5 py-3 md:py-4">
                                                            <div className="flex flex-col md:block">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Ngày tạo
                                                                </span>
                                                                <div className="text-sm text-gray-500 font-medium">
                                                                    {formatDateVN(u.createdAt)}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* STATUS */}
                                                        <td className="block md:table-cell px-5 py-3 md:py-4">
                                                            <div className="flex flex-col md:items-start">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Trạng thái
                                                                </span>
                                                                <span
                                                                    className={`inline-flex px-3 py-1 text-xs rounded-full border font-bold uppercase tracking-wide ${
                                                                        normalizeStatus(u.status) === 'pending'
                                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                            : normalizeStatus(u.status) === 'active'
                                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                                            : normalizeStatus(u.status) === 'rejected'
                                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                                                    }`}
                                                                >
                                                                    {u.status}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* ACTION */}
                                                        <td className="block md:table-cell px-5 py-4 md:py-4 md:text-right bg-gray-50/50 md:bg-transparent">
                                                            <div className="flex flex-col md:items-end">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-2">
                                                                    Hành động
                                                                </span>
                                                                <div className="flex gap-2 w-full md:w-auto justify-start md:justify-end">
                                                                    {isPending ? (
                                                                        <>
                                                                            <button
                                                                                disabled={isBusy}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onApprove(uid);
                                                                                }}
                                                                                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-green-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer flex-1 md:flex-none"
                                                                            >
                                                                                {isBusy ? (
                                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                                ) : (
                                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                                )}
                                                                                Duyệt
                                                                            </button>
                                                                            <button
                                                                                disabled={isBusy}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onReject(uid);
                                                                                }}
                                                                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer flex-1 md:flex-none"
                                                                            >
                                                                                Từ chối
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button
                                                                            disabled
                                                                            className={`px-4 py-2 text-sm font-semibold rounded-lg border w-full md:w-auto cursor-not-allowed ${
                                                                                normalizeStatus(u.status) === 'active'
                                                                                    ? 'bg-green-50 border-green-100 text-green-700'
                                                                                    : normalizeStatus(u.status) ===
                                                                                      'rejected'
                                                                                    ? 'bg-red-50 border-red-100 text-red-700'
                                                                                    : 'bg-gray-50 border-gray-100 text-gray-600'
                                                                            }`}
                                                                        >
                                                                            {normalizeStatus(u.status) === 'active'
                                                                                ? '✓ Đã duyệt'
                                                                                : normalizeStatus(u.status) ===
                                                                                  'rejected'
                                                                                ? '✗ Đã từ chối'
                                                                                : normalizeStatus(u.status) ===
                                                                                  'inactive'
                                                                                ? '— Đã ngưng'
                                                                                : u.status}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Trống dữ liệu */}
                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="py-12 text-center bg-white">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Users className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                            Không có người dùng nào
                                                        </h3>
                                                        <p className="text-gray-500 text-sm">
                                                            Chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
