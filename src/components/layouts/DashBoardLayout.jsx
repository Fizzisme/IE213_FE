// src/components/layouts/DashboardLayout.jsx
import MobileSheet from '@/components/Sidebar/MobileSheet.jsx';
import Sidebar from '@/components/Sidebar/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.js';

/**
 * Component DashBoardLayout
 * Định nghĩa bộ khung giao diện chính cho khu vực Dashboard.
 * Quản lý khả năng responsive giữa Sidebar trên Desktop
 * và MobileSheet trên thiết bị di động.
 *
 * @param {Object} props - Thuộc tính truyền vào component.
 * @param {Array} props.documents - Dữ liệu tài liệu được truyền xuống Sidebar và MobileSheet.
 */
export default function DashBoardLayout({ documents }) {
    return (
        // Container bao ngoài cùng: Chiếm toàn bộ chiều cao màn hình (h-screen),
        // sử dụng flex-col cho mobile và flex-row cho màn hình lớn (lg).
        <div className="bg-white flex flex-col lg:flex-row h-screen overflow-hidden">
            {/* Khu vực Header dành riêng cho thiết bị di động.
                Chỉ hiển thị trên màn hình nhỏ, tự động ẩn khi đạt breakpoint 'lg'.
            */}
            <div className="lg:hidden flex items-center gap-2 px-2 py-3 border-b border-gray-200 bg-white">
                <MobileSheet documents={documents} />
            </div>

            {/* Khu vực Sidebar điều hướng dành cho màn hình lớn (Desktop) */}
            <Sidebar documents={documents} />

            {/* Khu vực hiển thị nội dung chính.
                Sử dụng flex-1 để chiếm toàn bộ không gian còn lại sau khi đã trừ đi Sidebar.
                min-w-0 giúp ngăn chặn lỗi tràn layout với flexbox khi nội dung bên trong quá rộng.
            */}
            <div className="flex-1 min-w-0 overflow-hidden p-4 xl:p-6">
                {/* Khung chứa nội dung (Content Wrapper):
                    Sử dụng nền màu xám nhẹ, bo góc lớn (rounded-3xl) để tạo sự phân cách với Sidebar.
                    Thiết lập cuộn dọc (overflow-y-auto) độc lập kèm theo custom thanh cuộn (scrollbar-thin).
                */}
                <div className="bg-[#f5f5f5] rounded-3xl h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                    {/* Component Outlet: Nơi React Router render các component con tương ứng với URL hiện tại */}
                    <Outlet />
                </div>
            </div>

            {/* Component Toaster: Hiển thị các thông báo (toast notification) cho toàn bộ layout */}
            <Toaster className={'bg-primary'} />
        </div>
    );
}
