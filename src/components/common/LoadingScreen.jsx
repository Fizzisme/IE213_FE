// src/components/common/LoadingScreen.jsx
import React from 'react';

/**
 * Component LoadingScreen
 * Hiển thị loading spinner chiếm toàn bộ khung nhìn.
 * Thường được sử dụng để che giao diện trong quá trình chờ gọi API,
 * kiểm tra trạng thái đăng nhập, hoặc khi lazy load các trang.
 */
export const LoadingScreen = () => (
    // Container bao ngoài cùng:
    // - Chiếm toàn bộ chiều cao màn hình (h-screen)
    // - Căn giữa nội dung hoàn toàn theo cả 2 trục ngang và dọc (flex items-center justify-center)
    // - Phủ màu nền xám nhạt (bg-slate-100)
    <div className="flex items-center justify-center h-screen bg-slate-100">
        {/* Khung chứa các thành phần loading, căn giữa văn bản bên trong */}
        <div className="text-center">
            {/* Spinner:
                - Tạo hình tròn (rounded-full) với kích thước cố định (w-10 h-10)
                - Viền cơ bản màu xám (border-slate-200), riêng viền trên màu xanh chủ đạo (border-t-teal-700)
                - Áp dụng hiệu ứng xoay vòng liên tục của Tailwind (animate-spin)
            */}
            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-700 rounded-full animate-spin mx-auto mb-4" />

            {/* Dòng chữ thông báo đang tải dữ liệu */}
            <p className="text-slate-500 text-sm">Đang tải...</p>
        </div>
    </div>
);
