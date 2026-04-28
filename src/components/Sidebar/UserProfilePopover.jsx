// src/components/Sidebar/UserProfilePopover.jsx

import { Popover, PopoverContent, PopoverTrigger } from '@/components/animate-ui/components/radix/popover.tsx';
import { motion } from 'motion/react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.tsx';
import { LogOut } from '@/components/animate-ui/icons/log-out.tsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';
import { useAuthStore } from '@/stores/useAuthStore.js';
import { getInitials } from '@/utils/formater.js';

/**
 * Cấu hình variants cho phần thông tin văn bản (tên và vai trò).
 * Điều khiển độ mờ (opacity), chiều rộng tối đa (maxWidth) và khoảng cách lề (marginLeft)
 * để tạo hiệu ứng trượt và ẩn/hiện mượt mà khi Sidebar thay đổi trạng thái.
 */
const userVariants = {
    open: {
        opacity: 1,
        maxWidth: 300,
        marginLeft: '0.75rem',
        transition: {
            maxWidth: { duration: 0.5, ease: 'easeInOut' },
            opacity: { duration: 0.5, ease: 'easeInOut' },
        },
    },
    closed: {
        opacity: 0,
        maxWidth: 0,
        marginLeft: 0,
        transition: {
            opacity: { duration: 0.5, ease: 'easeInOut' },
            maxWidth: { duration: 0.5, ease: 'easeInOut' },
        },
    },
};

/**
 * Component UserProfilePopover
 * Hiển thị tóm tắt hồ sơ người dùng ở cuối Sidebar và cung cấp menu Popover
 * để xem chi tiết thông tin cũng như thực hiện đăng xuất.
 * * @param {boolean} openSidebar - Trạng thái đóng/mở của Sidebar để điều chỉnh UI tương ứng.
 */
export default function UserProfilePopover({ openSidebar }) {
    // Trích xuất hàm logout từ store quản lý xác thực (Auth Store)
    const { logout } = useAuthStore();

    /**
     * Trích xuất dữ liệu người dùng và các hàm render bổ sung từ Layout Store.
     * renderExtra: Một hàm callback cho phép các Layout khác nhau (Admin, Doctor, LabTech)
     * "bơm" thêm các thông tin đặc thù của role đó vào Popover.
     */
    const { userInfo, role, renderExtra } = useLayoutStore();

    return (
        <Popover>
            {/* Trigger: Vùng tương tác để mở Popover */}
            <PopoverTrigger asChild>
                <div
                    className={`flex items-center mt-auto pt-4 cursor-pointer p-2 rounded-lg transition-all duration-100
                        ${openSidebar ? 'hover:bg-gray-100' : 'hover:scale-[1.1]'}`}
                >
                    {/* Avatar: Hiển thị chữ cái đầu tên người dùng, thay đổi kích thước theo Sidebar */}
                    <motion.div
                        animate={
                            openSidebar ? { width: '2rem', height: '2rem' } : { width: '1.75rem', height: '1.75rem' }
                        }
                        transition={{ duration: 0.5 }}
                        className="rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xs"
                    >
                        {getInitials(userInfo?.fullName)}
                    </motion.div>

                    {/* Info Section: Chứa tên và vai trò, tự động ẩn khi Sidebar đóng */}
                    <motion.div
                        variants={userVariants}
                        animate={openSidebar ? 'open' : 'closed'}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <p className="text-sm font-semibold">{userInfo?.fullName}</p>
                        <p className="text-xs text-gray-400">{role}</p>
                    </motion.div>
                </div>
            </PopoverTrigger>

            {/* PopoverContent: Nội dung chi tiết hiển thị khi click vào Trigger */}
            <PopoverContent align="end" side="right" className="w-80">
                <div className="space-y-4">
                    {/* Header thông tin cơ bản */}
                    <div>
                        <p className="font-semibold text-lg">{userInfo?.fullName}</p>
                        <p className="text-sm text-gray-500">{userInfo?.department}</p>
                    </div>

                    {/* Base info: Các trường dữ liệu chung của mọi người dùng */}
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Giới tính</span>
                            <span>
                                {userInfo?.gender === 'M' ? 'Nam' : userInfo?.gender === 'F' ? 'Nữ' : 'Chưa cập nhật'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Trạng thái</span>
                            <span
                                className={`font-medium ${
                                    userInfo?.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'
                                }`}
                            >
                                {userInfo?.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                        </div>

                        {/* Phần mở rộng: Thực hiện render các thông tin đặc thù theo vai trò (nếu có) */}
                        {renderExtra && renderExtra(userInfo)}
                    </div>

                    {/* Action: Nút Đăng xuất */}
                    <AnimateIcon
                        animateOnHover
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg cursor-pointer"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </AnimateIcon>
                </div>
            </PopoverContent>
        </Popover>
    );
}
