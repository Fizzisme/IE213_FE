// src/components/pages/LabTech/Collapsible.jsx

import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { Link } from 'react-router-dom';

/**
 * Cấu hình các trạng thái biến đổi (variants) cho icon mũi tên (Chevron).
 * Điều khiển khả năng hiển thị và độ rộng tối đa khi Sidebar đóng hoặc mở.
 */
const chevronVariants = {
    open: {
        opacity: 1,
        maxWidth: 20,
        transition: {
            maxWidth: { duration: 0.5, ease: 'easeInOut' },
            opacity: { duration: 0.2, delay: 0.1 },
        },
    },
    closed: {
        opacity: 0,
        maxWidth: 0,
        transition: {
            opacity: { duration: 0.1 },
            maxWidth: { duration: 0.5, ease: 'easeInOut' },
        },
    },
};

/**
 * Component Collapsible
 * Tạo ra một menu dạng cây (tree-view) có khả năng đóng/mở nội dung bên trong.
 * Tích hợp chặt chẽ với trạng thái của Sidebar để xử lý hiển thị label và icon.
 * * @param {Component} icon - Icon chính hiển thị bên cạnh label.
 * @param {string} label - Tiêu đề của nhóm menu.
 * @param {boolean} openSidebar - Trạng thái đóng/mở của Sidebar tổng thể.
 * @param {Object} labelVariants - Cấu hình animation cho label truyền từ ngoài vào.
 * @param {Array} documents - Danh sách các tài liệu con để render bên trong menu.
 */
export default function Collapsible({ icon: Icon, label, openSidebar, labelVariants, documents }) {
    // Quản lý trạng thái đóng/mở nội tại của component
    const [open, setOpen] = useState(true);

    /**
     * Sử dụng hook useMeasure để đo lường kích thước thực tế của nội dung bên trong.
     * Điều này giúp hiệu ứng slide down/up mượt mà hơn khi không biết trước chiều cao cụ thể.
     */
    const [ref, { height }] = useMeasure();
    const h = height + 5; // Bổ sung khoảng đệm (padding/margin) cho chiều cao

    return (
        <div>
            {/* Header của menu: Nơi người dùng click để đóng/mở */}
            <div
                onClick={() => setOpen(!open)}
                className={`flex justify-between items-center gap-2 px-3 py-2.5 rounded-sm cursor-pointer font-bold
                    ${open ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-secondary/20'}
                `}
            >
                <div className="flex items-center gap-2">
                    {/* Render icon nếu có, giữ cố định kích thước khi co giãn (shrink-0) */}
                    {Icon && <Icon className="w-4 h-4 shrink-0" strokeWidth={2.5} />}

                    <motion.span
                        variants={labelVariants}
                        animate={openSidebar ? 'open' : 'closed'}
                        initial="open"
                        className="text-sm select-none overflow-hidden whitespace-nowrap"
                    >
                        {label}
                    </motion.span>
                </div>

                {/* Khu vực chứa mũi tên điều hướng: Tự động ẩn khi Sidebar đóng */}
                <motion.div
                    variants={chevronVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    initial="open"
                    className="overflow-hidden shrink-0"
                >
                    {/* Xoay mũi tên dựa trên trạng thái đóng/mở nội tại */}
                    <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} />
                    </motion.div>
                </motion.div>
            </div>

            {/* Vùng chứa nội dung chi tiết (Dropdown content) */}
            <motion.div
                // Chỉ hiển thị nội dung nếu cả component và Sidebar đều ở trạng thái mở
                animate={open && openSidebar ? { h, opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{
                    height: { duration: 0.3, ease: 'easeInOut' },
                    opacity: { duration: 0.15, delay: open && openSidebar ? 0.25 : 0 },
                }}
                className="overflow-hidden"
            >
                {/* Gán ref để useMeasure theo dõi chiều cao thực của div này */}
                <div ref={ref}>
                    <div className="relative ml-6 mt-1">
                        {/* Đường kẻ dọc trang trí bên trái các item con */}
                        <div className="absolute left-[-5px] top-0 bottom-0 w-[2px] bg-gray-300" />

                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            {/* Render danh sách các SidebarItem từ dữ liệu documents */}
                            {documents.map((document) => (
                                <SidebarItem label={document.label} key={document.label} path={document.path} />
                            ))}
                        </div>
                    </div>

                    {/* Nút chức năng bổ sung: Thêm tài liệu mới */}
                    <div className="flex items-center gap-2 ml-2.5 mt-2 mb-1">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white shrink-0">
                            <Plus size={12} />
                        </div>
                        <span className="text-sm text-gray-500 hover:text-black cursor-pointer whitespace-nowrap">
                            Thêm tài liệu mới
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/**
 * Component SidebarItem (Internal)
 * Đại diện cho từng liên kết tài liệu con bên trong menu Collapsible.
 */
function SidebarItem({ label, path }) {
    return (
        <Link to={path}>
            <div className="text-sm text-textColor font-medium px-2 py-1.5 rounded-md hover:bg-secondary/20 cursor-pointer">
                {label}
            </div>
        </Link>
    );
}
