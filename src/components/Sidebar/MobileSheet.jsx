// src/components/Sidebar/MobileSheet.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.tsx';
import UserProfilePopover from '@/components/Sidebar/UserProfilePopover.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';
import Collapsible from '@/components/pages/LabTech/Collapsible.jsx';
import { FileText } from 'lucide-react';
import { useSidebarStore } from '@/stores/useSidebarStore.jsx';

/**
 * Cấu hình variants cho hiệu ứng hiển thị chữ (label).
 * Điều khiển độ rộng tối đa và độ mờ để tạo cảm giác co giãn mượt mà.
 */
const labelVariants = {
    open: {
        opacity: 1,
        maxWidth: 300,
        transition: {
            maxWidth: { duration: 0.5, ease: 'easeInOut' },
            opacity: { duration: 0.2, delay: 0.1 }, // fade in sau khi đã mở rộng
        },
    },
    closed: {
        opacity: 0,
        maxWidth: 0,
        transition: {
            opacity: { duration: 0.1 }, // fade out ngay
            maxWidth: { duration: 0.5, ease: 'easeInOut' },
        },
    },
};

/**
 * Cấu hình variants cho các tiêu đề phân mục (Section).
 * Xử lý việc ẩn/hiện tiêu đề dựa trên chiều cao (maxHeight) và khoảng cách (margin).
 */
const sectionVariants = {
    open: {
        opacity: 1,
        maxHeight: 40,
        marginTop: '1rem',
        marginBottom: '0.25rem',
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
    closed: {
        opacity: 0,
        maxHeight: 0,
        marginTop: 0,
        marginBottom: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
};

/**
 * Component NavItem (Internal)
 * Định nghĩa một mục điều hướng đơn lẻ trong menu di động.
 * Tự động đóng menu (onClose) khi người dùng click chọn một liên kết.
 */
const NavItem = ({ icon: Icon, label, active, to, onClose }) => {
    return (
        <NavLink to={to} onClick={onClose}>
            <AnimateIcon
                animateOnHover
                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer font-semibold mb-2 gap-3
                    ${active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}
                `}
            >
                <Icon className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm select-none">{label}</span>
            </AnimateIcon>
        </NavLink>
    );
};

/**
 * Component MobileSheet
 * Quản lý menu điều hướng dạng trượt (Drawer) dành riêng cho các thiết bị di động (màn hình nhỏ).
 * Sử dụng AnimatePresence để xử lý các animation khi component mount/unmount vào DOM.
 */
export default function MobileSheet({ documents }) {
    // Trích xuất các mục điều hướng và trạng thái Sidebar từ global stores
    const { navItems } = useLayoutStore();
    const { openSidebar } = useSidebarStore();

    // State quản lý trạng thái đóng/mở của Drawer
    const [isOpen, setIsOpen] = useState(false);

    // Lấy thông tin URL hiện tại từ react-router để xác định trạng thái active của menu
    const path = useLocation().pathname;

    /**
     * Hàm đóng menu trượt.
     */
    const handleClose = () => setIsOpen(false);

    return (
        <div className="lg:hidden flex items-center">
            {/* Nút bấm Hamburger (Toggle Button) */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors z-40"
                whileTap={{ scale: 0.95 }}
                aria-label="Mở menu điều hướng"
            >
                {/* Sử dụng ảnh hamburger đã tối ưu để kích hoạt menu */}
                <img src="/hamburger-button.png" className={'w-10 h-10'} alt="" />
            </motion.button>

            {/* Lớp phủ nền (Overlay): Làm tối màn hình khi menu được mở */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose} // Click vào nền để đóng menu
                        className="fixed inset-0 bg-black/30 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Nội dung chính của Mobile Drawer (Trượt từ trái sang) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '-100%' }} // Trạng thái bắt đầu: Ẩn bên trái màn hình
                        animate={{ x: 0 }} // Trạng thái hiển thị
                        exit={{ x: '-100%' }} // Trạng thái khi đóng
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
                    >
                        {/* Header của Drawer: Chứa logo ứng dụng */}
                        <div className="p-6 border-b border-gray-100">
                            <img src="/AEGITAS2.png" height={20} width={80} alt="logo" className="select-none" />
                        </div>

                        {/* Thân menu: Chứa các liên kết điều hướng và tài liệu */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Phân mục: TỔNG QUAN */}
                            <p className="text-xs font-bold text-gray-400 px-2 tracking-wider mb-4 uppercase">
                                Tổng quan
                            </p>

                            {/* Duyệt mảng navItems để render các mục điều hướng chính */}
                            {navItems.map((item, index) => (
                                <NavItem
                                    key={index}
                                    icon={item.icon}
                                    label={item.label}
                                    to={item.to}
                                    active={path === item.to}
                                    onClose={handleClose}
                                />
                            ))}

                            {/* Hiển thị phân mục dữ liệu nếu có danh sách tài liệu (documents) truyền vào */}
                            {documents && (
                                <>
                                    {/* Phân mục: DỮ LIỆU */}
                                    <motion.p
                                        variants={sectionVariants}
                                        animate={openSidebar ? 'open' : 'closed'}
                                        initial="open"
                                        className="text-[10px] font-bold text-gray-400 px-2 mt-4 mb-1 tracking-wider overflow-hidden whitespace-nowrap"
                                    >
                                        DỮ LIỆU
                                    </motion.p>

                                    {/* Menu thu gọn (Collapsible) chứa các tài liệu chuyên ngành */}
                                    <Collapsible
                                        icon={FileText}
                                        label={'Tài liệu'}
                                        openSidebar={openSidebar}
                                        labelVariants={labelVariants}
                                        documents={documents}
                                    />
                                </>
                            )}
                        </div>

                        {/* Footer của Drawer: Chứa thông tin hồ sơ người dùng */}
                        <div className="border-t border-gray-100 p-6">
                            {/* Luôn ép trạng thái openSidebar=true để hiển thị đầy đủ thông tin trên mobile */}
                            <UserProfilePopover openSidebar={true} isMobile={true} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
