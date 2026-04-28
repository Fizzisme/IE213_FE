// src/components/pages/Doctor/DoctorLayout.jsx

import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { User } from 'lucide-react';
import { doctorService } from '@/services/doctorService.js';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list.js';
import { Users } from '@/components/animate-ui/icons/users.js';
import { Clock3 } from '@/components/animate-ui/icons/clock-3.js';

import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

/**
 * Khai báo danh sách các NAV_ITEMS dành riêng cho role Doctor.
 * Mảng này sẽ được truyền vào store để cấu hình menu trong Sidebar.
 */
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/Doctor/dashboard' },
    { icon: ClipboardList, label: 'Quản lý Bệnh án', to: '/Doctor/medical-records' },
    { icon: Users, label: 'Bệnh nhân', to: '/Doctor/patients' },
    { icon: Clock3, label: 'Lịch hẹn', to: '/Doctor/appointments' },
];

/**
 * Component DoctorLayout
 * Đóng vai trò là Wrapper Component để khởi tạo dữ liệu và cấu hình state
 * cho giao diện bác sĩ trước khi render cấu trúc DashBoardLayout dùng chung.
 */
export default function DoctorLayout() {
    // Trích xuất các hàm cập nhật state từ Zustand store
    const { setUserInfo, setRole, setRenderExtra, setNavItems } = useLayoutStore();
    const navigate = useNavigate();

    /**
     * Sử dụng useCallback để ghi nhớ hàm renderExtra, tránh việc khởi tạo lại
     * function sau mỗi lần component re-render.
     * Hàm này nhận vào tham số user và trả về một khối giao diện bổ sung
     * (hiển thị chuyên môn, giấy phép và nút truy cập hồ sơ) để gắn vào Sidebar.
     */
    const renderExtra = useCallback(
        (user) => {
            return (
                <>
                    {/* Khu vực hiển thị specialization */}
                    <div>
                        <p className="text-gray-500 mb-1">Chuyên môn</p>
                        <div className="flex flex-wrap gap-1">
                            {user?.specialization?.map((sp, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                                    {sp}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Khu vực hiển thị license */}
                    <div className="p-3 rounded-lg bg-gradient-to-r from-secondary/25 to-primary/25 border">
                        <p className="text-xs text-gray-500">Giấy phép</p>
                        <p className="font-mono text-sm font-semibold text-primary">{user?.licenseNumber}</p>
                    </div>

                    {/* Nút điều hướng chuyển sang trang Hồ sơ cá nhân */}
                    <button
                        onClick={() => navigate('/doctor/profile')}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 w-full text-left text-textColor transition-colors cursor-pointer"
                    >
                        <User size={16} />
                        <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                    </button>
                </>
            );
        },
        [navigate], // Phụ thuộc vào navigate để cập nhật hàm nếu đối tượng router thay đổi
    );

    /**
     * useEffect chạy một lần duy nhất khi component mount.
     * Đảm nhiệm việc fetch dữ liệu cá nhân của bác sĩ và thiết lập các biến môi trường vào store.
     */
    useEffect(() => {
        const fetchData = async () => {
            // Gọi API lấy thông tin chi tiết của user đang đăng nhập
            const res = await doctorService.getMe();

            // Nếu API trả về statusCode 200 (thành công), lưu thông tin vào store
            if (res.statusCode === 200) {
                setUserInfo(res.data);
                setRole('Bác sĩ');
            }
        };

        // Kích hoạt tiến trình lấy dữ liệu
        fetchData();

        // Bơm hàm render giao diện phụ và danh sách menu vào layout store
        setRenderExtra(renderExtra);
        setNavItems(NAV_ITEMS);
    }, []); // Dependency array rỗng đảm bảo chỉ chạy 1 lần khi khởi tạo

    // Trả về Component layout tổng sau khi đã chuẩn bị xong dữ liệu trong store
    return <DashBoardLayout />;
}
