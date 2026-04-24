import { Popover, PopoverContent, PopoverTrigger } from '@/components/animate-ui/components/radix/popover.js';
import { motion } from 'motion/react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';
import { LogOut } from '@/components/animate-ui/icons/log-out.js';
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
export default function UserProfilePopover({
    user,
    openSidebar,
    onLogout,
    renderExtra, // Cho phép inject UI riêng (lab tech, doctor,...)
}) {
    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className={`flex items-center mt-auto pt-4 cursor-pointer p-2 rounded-lg transition-all duration-100
                        ${openSidebar ? 'hover:bg-gray-100' : 'hover:scale-[1.1]'}`}
                >
                    {/* Avatar */}
                    <motion.div
                        animate={
                            openSidebar ? { width: '2rem', height: '2rem' } : { width: '1.75rem', height: '1.75rem' }
                        }
                        transition={{ duration: 0.5 }}
                        className="rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xs"
                    >
                        {getInitials(user?.fullName)}
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        variants={userVariants}
                        animate={openSidebar ? 'open' : 'closed'}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <p className="text-sm font-semibold">{user?.fullName}</p>
                        <p className="text-xs text-gray-400">{user?.role}</p>
                    </motion.div>
                </div>
            </PopoverTrigger>

            <PopoverContent align="end" side="right" className="w-80">
                <div className="space-y-4">
                    {/* Header */}
                    <div>
                        <p className="font-semibold text-lg">{user?.fullName}</p>
                        <p className="text-sm text-gray-500">{user?.department}</p>
                    </div>

                    {/* Base info */}
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Giới tính</span>
                            <span>{user?.gender === 'M' ? 'Nam' : 'Nữ'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Trạng thái</span>
                            <span
                                className={`font-medium ${
                                    user?.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'
                                }`}
                            >
                                {user?.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                        </div>

                        {/* inject thêm phần riêng */}
                        {renderExtra && renderExtra(user)}
                    </div>

                    {/* Logout */}
                    <AnimateIcon
                        animateOnHover
                        onClick={onLogout}
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
