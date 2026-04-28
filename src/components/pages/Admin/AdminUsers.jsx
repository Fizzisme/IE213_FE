// src/components/pages/Admin/AdminUsers.jsx

import { useEffect, useRef, useState } from 'react';
import { adminService } from '@/services/adminService.js';
import { Search, CheckCircle2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateVN } from '@/utils/formater.js';
import { motion } from 'framer-motion';

/**
 * ABI (Application Binary Interface) của Smart Contract IdentityManager.
 * Định nghĩa các hàm để tương tác với blockchain khi thực hiện duyệt người dùng.
 */
const IDENTITY_MANAGER_ABI = [
    'function registerPatientGasless(address patient, bytes signature) external',
    'function registerStaff(address staff, uint8 role) external',
];

/**
 * Hàm hỗ trợ chuẩn hóa chuỗi trạng thái về dạng chữ thường.
 * Giúp việc so sánh an toàn hơn, tránh các lỗi về chữ hoa/thường hoặc undefined.
 */
const normalizeStatus = (status) => String(status || '').toLowerCase();

/**
 * Component AdminUsers
 * Màn hình quản lý toàn bộ người dùng trong hệ thống dành cho Admin.
 * Hỗ trợ tìm kiếm, lọc theo trạng thái và tương tác phê duyệt qua Web2/Web3.
 */
export default function AdminUsers() {
    // Định nghĩa các state quản lý dữ liệu và UI
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockchainLoading, setBlockchainLoading] = useState(null); // Lưu ID của user đang được xử lý blockchain
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

    /**
     * Hàm gọi API lấy danh sách người dùng.
     * Có thể nhận thêm các tham số (params) để hỗ trợ bộ lọc và tìm kiếm.
     */
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

    /**
     * Effect hook chạy lần đầu khi component mount hoặc khi bộ lọc thay đổi.
     * Thực hiện việc chuẩn bị tham số và gọi hàm loadUsers.
     */
    useEffect(() => {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter.toUpperCase(); // Tuỳ thuộc Backend yêu cầu UPPERCASE
        if (keyword) params.search = keyword;

        loadUsers(params);
    }, [statusFilter, keyword]);

    // Sử dụng useRef để lưu trữ ID của timeout, phục vụ kỹ thuật debounce
    const debounceRef = useRef(null);

    /**
     * Effect hook áp dụng kỹ thuật Debounce cho tính năng tìm kiếm.
     * Ngăn chặn việc gọi API liên tục mỗi khi người dùng gõ một phím.
     * Chỉ gọi API sau khi người dùng đã ngừng gõ 500ms.
     */
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
            if (keyword) params.search = keyword;
            loadUsers(params);
        }, 500);

        // Cleanup function: Hủy timeout nếu component bị unmount hoặc effect chạy lại
        return () => clearTimeout(debounceRef.current);
    }, [statusFilter, keyword]);

    /**
     * Hàm hỗ trợ lấy ID của user một cách an toàn.
     * Dự phòng cho trường hợp field ID bị đổi tên giữa _id và id.
     */
    const getUserId = (user) => user?._id || user?.id;

    /**
     * Hàm xử lý nghiệp vụ Phê duyệt (Approve) người dùng.
     * Bao gồm cả luồng duyệt thông thường (Local/Web2) và luồng duyệt trên Blockchain (Web3).
     */
    const onApprove = async (userId) => {
        // Biến cục bộ lưu trữ ID của thông báo (toast) để cập nhật trạng thái liên tục
        let toastId = null;

        try {
            // Đánh dấu dòng dữ liệu tương ứng đang trong trạng thái loading
            setBlockchainLoading(userId);

            // Gọi API lần 1: Lấy thông tin hướng dẫn xử lý từ Backend
            const response = await adminService.approveUser(userId);
            const { needsBlockchain, blockchain, message } = response.data;

            // Nếu Backend báo không cần Blockchain (ví dụ user thông thường), hiển thị thành công ngay
            if (!needsBlockchain || !blockchain) {
                toast.success(message || 'Duyệt thành công (Local)');
                await loadUsers();
                return;
            }

            // --- Bắt đầu luồng Web3 ---
            if (!window.ethereum) throw new Error('Vui lòng cài đặt MetaMask để duyệt Web3');

            // Import động thư viện ethers để tối ưu hóa hiệu suất (Lazy load)
            const { ethers } = await import('ethers');

            const provider = new ethers.BrowserProvider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Kiểm tra và yêu cầu đổi mạng (Network Switch) sang Sepolia nếu chưa đúng
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

            // Khởi tạo Smart Contract với quyền ghi (Signer)
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(blockchain.contractAddress, IDENTITY_MANAGER_ABI, signer);

            // Bật thông báo chờ xác nhận giao dịch trên ví
            toastId = toast.loading('Vui lòng xác nhận giao dịch trên MetaMask...');

            // Thực thi ghi dữ liệu lên Blockchain tùy thuộc vào loại hàm Backend trả về
            const tx =
                blockchain.method === 'registerPatientGasless'
                    ? await contract.registerPatientGasless(blockchain.args[0], blockchain.args[1])
                    : await contract.registerStaff(blockchain.args[0], blockchain.args[1]);

            // Cập nhật thông báo: Đang chờ mạng lưới xác nhận (Mining)
            toast.loading(`Giao dịch đang chờ xác nhận: ${tx.hash.substring(0, 10)}...`, { id: toastId });
            await tx.wait();

            // Gọi API lần 2: Xác minh với Backend rằng giao dịch Web3 đã thành công
            toast.loading('Đang xác minh giao dịch với Server...', { id: toastId });
            await adminService.verifyOnboarding(userId, tx.hash);

            // Hoàn tất toàn bộ quy trình
            toast.success('Duyệt thành công trên cả Web2 và Web3!', { id: toastId });
            await loadUsers();
        } catch (err) {
            // Xử lý lỗi và cập nhật trực tiếp vào toast loading nếu có
            const errorMessage = err.reason || err.message || 'Duyệt user thất bại';
            if (toastId) {
                toast.error(errorMessage, { id: toastId });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            // Tắt trạng thái loading cho dòng dữ liệu tương ứng
            setBlockchainLoading(null);
        }
    };

    /**
     * Hàm xử lý nghiệp vụ Từ chối (Reject) người dùng.
     * Yêu cầu quản trị viên nhập lý do cụ thể.
     */
    const onReject = async (userId) => {
        const reason = window.prompt('Nhập lý do từ chối user:');

        // Thoát nếu người dùng bấm Cancel
        if (reason === null) return;

        // Chặn trường hợp cố tình nhập khoảng trắng
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
            {/* Vùng ngoài cùng bao bọc toàn trang, cho phép cuộn nội dung */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* Sử dụng flex-1 để khối tự động giãn đều khi nội dung ngắn, giới hạn chiều rộng max-w-7xl */
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1"
                >
                    {/* KHỐI CARD DUY NHẤT BAO GỒM CẢ HEADER, FILTER VÀ TABLE */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1">
                        {/* Khu vực Header & Filters: Cố định kích thước (shrink-0), hiển thị hàng ngang trên Desktop */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pb-6 border-b border-gray-100 shrink-0">
                            {/* Tiêu đề trang */}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-primary">Quản lý người dùng</h1>
                                <p className="text-gray-500 text-sm mt-1">Duyệt và quản lý tài khoản hệ thống</p>
                            </div>

                            {/* Bộ lọc và Tìm kiếm */}
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                {/* Ô input tìm kiếm (Search) */}
                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 bg-gray-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 w-full sm:w-auto transition-all">
                                    <Search className="h-4 w-4 text-gray-500" />
                                    <input
                                        placeholder="Tìm ví hoặc tên..."
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="w-full sm:w-64 bg-transparent text-sm outline-none text-gray-700"
                                    />
                                </div>

                                {/* Menu thả xuống lọc trạng thái (Filter) */}
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

                        {/* Khu vực hiển thị Bảng Danh sách người dùng */}
                        <div className="flex-1">
                            {loading ? (
                                // Giao diện màn hình chờ tải danh sách
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <p className="text-gray-500 mt-4 font-medium">Đang tải danh sách...</p>
                                </div>
                            ) : error ? (
                                // Giao diện báo lỗi khi không thể tải dữ liệu
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-medium">
                                    {error}
                                </div>
                            ) : (
                                // Giao diện bảng dữ liệu chính
                                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                                    {/* Sử dụng thẻ table chuẩn HTML5 */}
                                    <table className="w-full text-left border-collapse">
                                        {/* Phần THEAD: Ẩn trên giao diện Mobile (dưới md), chỉ hiển thị tiêu đề cột trên Desktop */}
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

                                        {/* Phần TBODY: Render từng hàng dữ liệu của người dùng */}
                                        <tbody className="divide-y divide-gray-100">
                                            {users.map((u) => {
                                                const uid = getUserId(u);
                                                const isPending = normalizeStatus(u.status) === 'pending';

                                                // Kiểm tra xem dòng này có đang chịu tác động từ Web3 không
                                                const isBusy = blockchainLoading === uid;

                                                return (
                                                    <tr
                                                        key={uid}
                                                        /* Responsive Design cho Row:
                                                       Hiển thị dạng block (chồng lên nhau) trên Mobile,
                                                       chuyển về dạng table-row chuẩn trên Desktop.
                                                    */
                                                        className="block md:table-row hover:bg-gray-50/80 transition-colors duration-200 border-b md:border-none last:border-0"
                                                    >
                                                        {/* Cột 1: Địa chỉ ví MetaMask */}
                                                        <td className="block md:table-cell px-5 py-3 md:py-4">
                                                            <div className="flex flex-col md:block">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Ví MetaMask
                                                                </span>
                                                                {/* Áp dụng kỹ thuật truncate để cắt bớt text nếu địa chỉ ví quá dài */}
                                                                <div
                                                                    className="font-mono text-sm font-medium text-gray-700 truncate w-full max-w-[200px] sm:max-w-xs md:max-w-[180px] lg:max-w-[250px]"
                                                                    title={u?.authProviders?.[0]?.walletAddress}
                                                                >
                                                                    {u?.authProviders?.[0]?.walletAddress || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Cột 2: Ngày tạo tài khoản */}
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

                                                        {/* Cột 3: Trạng thái (Status) hiện tại của tài khoản */}
                                                        <td className="block md:table-cell px-5 py-3 md:py-4">
                                                            <div className="flex flex-col md:items-start">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Trạng thái
                                                                </span>
                                                                {/* Gán class màu sắc dựa trên biến status */}
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

                                                        {/* Cột 4: Nút tương tác (Approve / Reject) */}
                                                        <td className="block md:table-cell px-5 py-4 md:py-4 md:text-right bg-gray-50/50 md:bg-transparent">
                                                            <div className="flex flex-col md:items-end">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-2">
                                                                    Hành động
                                                                </span>
                                                                <div className="flex gap-2 w-full md:w-auto justify-start md:justify-end">
                                                                    {/* Render cụm nút duyệt nếu trạng thái là pending */}
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
                                                                                {/* Chuyển sang icon xoay vòng khi isBusy = true */}
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
                                                                        // Render nút trạng thái (Read-only) nếu user đã được xử lý
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
                                                                                ? ' Đã duyệt'
                                                                                : normalizeStatus(u.status) ===
                                                                                  'rejected'
                                                                                ? ' Đã từ chối'
                                                                                : normalizeStatus(u.status) ===
                                                                                  'inactive'
                                                                                ? ' Đã ngưng'
                                                                                : u.status}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Giao diện dự phòng (Empty State) khi mảng người dùng trả về rỗng */}
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
