// src/components/pages/LabTech/LabTechLayout.jsx

import { useCallback, useEffect } from 'react';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.tsx';
import { Bell } from '@/components/animate-ui/icons/bell.tsx';
import { labTechService } from '@/services/LabTechService.js';
import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

/**
 * Danh sách các tài liệu hướng dẫn chuyên ngành dành riêng cho Kỹ thuật viên phòng lab.
 * Mảng này sẽ được truyền vào DashBoardLayout để hiển thị trong khu vực tài liệu (Documents).
 */
const DOCUMENTS = [
    { label: 'Dosage guidelines', path: '/lab-tech/documents/dosage' },
    { label: 'Case study', path: '/documents/case-study' },
    { label: 'Treatment protocol', path: '/documents/treatment' },
];

/**
 * Danh sách các mục điều hướng (NAV_ITEMS) chính trên Sidebar dành cho role LabTech.
 */
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/lab-tech/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/lab-tech/notifications' },
];

/**
 * Component LabTechLayout
 * Đóng vai trò là Wrapper Component để khởi tạo dữ liệu và cấu hình giao diện
 * cho Kỹ thuật viên phòng lab trước khi render DashBoardLayout dùng chung.
 */
export default function LabTechLayout() {
    // Trích xuất các hàm cập nhật state từ Zustand layout store
    const { setUserInfo, setRole, setNavItems, setRenderExtra } = useLayoutStore();

    /**
     * Sử dụng useCallback để ghi nhớ hàm renderExtra, tránh việc tạo lại tham chiếu
     * function sau mỗi lần component re-render, giúp tối ưu hóa hiệu suất (Performance).
     * Hàm này trả về phần UI bổ sung (chuyên môn và giấy phép) cho Sidebar.
     */
    const renderExtra = useCallback(
        (user) => (
            <>
                {/* Khu vực hiển thị danh sách chuyên môn (specialization) của nhân viên */}
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

                {/* Khu vực hiển thị mã số giấy phép hành nghề (licenseNumber) */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-secondary/25 to-primary/25 border">
                    <p className="text-xs text-gray-500">Giấy phép</p>
                    <p className="font-mono text-sm font-semibold text-primary">{user?.licenseNumber}</p>
                </div>
            </>
        ),
        [], // Mảng phụ thuộc rỗng đảm bảo function chỉ được tạo một lần duy nhất
    );

    /**
     * useEffect thực thi một lần khi component mount.
     * Đảm nhiệm việc fetch thông tin cá nhân và thiết lập cấu hình Sidebar ban đầu.
     */
    useEffect(() => {
        const fetchData = async () => {
            // Gọi API để lấy thông tin chi tiết của Kỹ thuật viên đang đăng nhập
            const res = await labTechService.getMe();

            // Nếu API trả về statusCode 200 (thành công), cập nhật thông tin và role vào store
            if (res.statusCode === 200) {
                setUserInfo(res.data);
                setRole('Kỹ thuật viên phòng lab');
            }
        };

        // Kích hoạt tiến trình lấy dữ liệu
        fetchData();

        // Bơm danh sách menu điều hướng và hàm render UI phụ vào layout store
        setNavItems(NAV_ITEMS);
        setRenderExtra(renderExtra);
    }, []); // Dependency array rỗng để đảm bảo logic khởi tạo chỉ chạy 1 lần

    // Trả về DashBoardLayout cùng với danh sách tài liệu chuyên môn
    return <DashBoardLayout documents={DOCUMENTS} />;
}
