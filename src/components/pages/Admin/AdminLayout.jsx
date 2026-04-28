// src/components/pages/AdminLayout.jsx

import React, { useCallback, useEffect } from 'react';

import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { ShieldCheck } from 'lucide-react';
import { adminService } from '@/services/adminService.js';
import { Users } from '@/components/animate-ui/icons/users.js';

import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

/**
 * Khai báo danh sách các NAV_ITEMS dành riêng cho role Admin.
 * Mảng này sẽ được lưu vào store để tự động render thành menu trong Sidebar.
 */
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/admin/dashboard' },
    { icon: Users, label: 'Người dùng', to: '/admin/users' },
];

/**
 * Component AdminLayout
 * Đóng vai trò là một Wrapper Component để khởi tạo và thiết lập các state ban đầu
 * cho giao diện Admin trước khi render cấu trúc DashBoardLayout dùng chung.
 */
export default function AdminLayout() {
    // Trích xuất các hàm cập nhật state từ Zustand store
    const { setUserInfo, setRole, setNavItems, setRenderExtra } = useLayoutStore();

    /**
     * Sử dụng useCallback để ghi nhớ hàm render UI, tránh việc tạo lại tham chiếu
     * function sau mỗi lần component re-render.
     * Hàm này trả về một khối giao diện nhỏ (badge) hiển thị role hiện tại của user.
     */
    const renderExtra = useCallback(() => {
        return (
            <>
                <div className="p-3 rounded-lg bg-gradient-to-r from-secondary/25 to-primary/25 border">
                    <p className="text-xs text-gray-500">Vai trò</p>
                    <p className="font-mono text-sm font-semibold text-primary">
                        <ShieldCheck className="inline h-4 w-4 mr-1" />
                        Quản trị viên
                    </p>
                </div>
            </>
        );
    }, []);

    /**
     * useEffect được gọi một lần duy nhất khi component mount.
     * Đảm nhiệm việc fetch dữ liệu khởi tạo và cấu hình layout store.
     */
    useEffect(() => {
        const fetchData = async () => {
            const res = await adminService.getMe();

            // Nếu API trả về statusCode 200 (thành công), tiến hành lưu dữ liệu user
            // và gán cố định role là 'Admin' vào store.
            if (res?.statusCode === 200) {
                setUserInfo(res.data);
                setRole('Admin');
            }
        };

        // Kích hoạt tiến trình lấy dữ liệu
        fetchData();

        // Bơm hàm render custom UI và danh sách menu vào layout store
        setRenderExtra(renderExtra);
        setNavItems(NAV_ITEMS);
    }, []); // Dependency array rỗng đảm bảo Hook này chỉ thực thi một lần

    // Trả về Component layout tổng tổng sau khi đã chuẩn bị xong dữ liệu trong store
    return <DashBoardLayout />;
}
