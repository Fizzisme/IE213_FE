import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.tsx';
import { Bell } from '@/components/animate-ui/icons/bell.tsx';
import { Check, Search, Shield, User, Wallet } from 'lucide-react';
import { Calendar } from '@/components/Calendar/Calendar.tsx';
import { useDashboard } from '@/hooks/useDashboard.js';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';
import { useEffect } from 'react';
import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list.js';

/**
 * Cấu hình danh sách điều hướng (Sidebar Navigation) dành cho Bệnh nhân.
 * Mỗi item bao gồm icon động, nhãn hiển thị và đường dẫn tương ứng.
 */
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/patient/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/patient/notifications' },
    { icon: Calendar, label: 'Lịch hẹn của tôi', to: '/patient/appointments-manage' },
    { icon: ClipboardList, label: 'Lịch sử bệnh án', to: '/patient/medical-records' },
];

/**
 * Component PatientLayout
 * Đóng vai trò là Wrapper Layout cho phân hệ Bệnh nhân.
 * Chịu trách nhiệm cấu hình Sidebar, Topbar và các thành phần phụ trợ (Extra Render)
 * dựa trên trạng thái thực tế của bệnh nhân (đã có profile hay chưa, phương thức đăng nhập).
 */
export default function PatientLayout() {
    // Lấy thông tin trạng thái từ hook dashboard chuyên biệt
    const { patient, roleLabel, loginMethod, hasProfile, onNavigateCreate } = useDashboard();

    // Lấy các hàm cập nhật giao diện từ Layout Store toàn cục
    const { setUserInfo, setRole, setNavItems, setRenderExtra } = useLayoutStore();

    /**
     * Side Effect: Đồng bộ dữ liệu người dùng và danh sách menu vào Layout Store.
     * Mảng dependency đảm bảo UI cập nhật ngay khi thông tin bệnh nhân hoặc vai trò thay đổi.
     */
    useEffect(() => {
        setUserInfo(patient);
        setRole(roleLabel);
        setRenderExtra(renderExtra);
        setNavItems(NAV_ITEMS);
    }, [patient, roleLabel]);

    /**
     * Hàm renderExtra
     * Cung cấp các thành phần giao diện bổ sung cho Sidebar như:
     * - Trạng thái ví/xác thực (MetaMask/CCCD).
     * - Thanh tìm kiếm nhanh.
     * - Nút tác vụ nhanh (Tạo hồ sơ y tế nếu chưa có).
     */
    const renderExtra = () => (
        <>
            {/* ================= PHẦN TRẠNG THÁI XÁC THỰC ================= */}
            <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border
            ${
                loginMethod === 'metamask'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    : 'bg-green-100 text-blue-700 border-green-300'
            }`}
                >
                    {loginMethod === 'metamask' ? <Wallet size={12} /> : <Shield size={12} />}
                    {loginMethod === 'metamask' ? 'MetaMask' : 'CCCD'}
                </div>
            </div>

            {/* ================= THANH TÌM KIẾM NHANH ================= */}
            <div className="p-3 border-t">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg opacity-60 cursor-not-allowed">
                    <Search size={14} className="text-gray-400" />
                    <input
                        placeholder="Tính năng đang phát triển..."
                        disabled
                        className="bg-transparent outline-none text-sm w-full cursor-not-allowed"
                    />
                </div>
            </div>

            {/* ================= CÁC TÁC VỤ NHANH (QUICK ACTIONS) ================= */}
            <div className="p-2 space-y-1">
                {/* Kiểm tra trạng thái hồ sơ để hiển thị thông báo đã hoàn tất hoặc nút tạo mới */}
                {hasProfile ? (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50 text-green-700">
                        <Check size={16} />
                        <span className="text-sm font-medium">Hồ sơ đã được thiết lập</span>
                    </div>
                ) : (
                    <button
                        onClick={onNavigateCreate}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left cursor-pointer"
                    >
                        <User size={16} />
                        <span className="text-sm">Tạo hồ sơ y tế</span>
                    </button>
                )}
            </div>
        </>
    );

    // Trả về Layout chung đã được cấu hình các tham số đặc thù của Patient
    return <DashBoardLayout />;
}
