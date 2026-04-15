import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, FileText, Wallet, Shield, LogOut, User, Pill } from 'lucide-react';
import { Search, Check, Calendar, Heart } from 'lucide-react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { PanelLeftClose } from '@/components/animate-ui/icons/panel-left-close.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/animate-ui/components/radix/popover.js';
import Collapsible from '@/components/pages/LabTechPage/Collapsible/Collapsible.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/demo-dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/demo-dashboard/notifications' },
    { icon: Calendar, label: 'Lịch hẹn của tôi', to: '/demo-dashboard/appointments' },
    { icon: Heart, label: 'Sức khỏe', to: '/demo-dashboard/health' },
    { icon: Pill, label: 'Thuốc', to: 'demo-dashboard/pills'}
];

/* ================== ANIMATION ================== */
const labelVariants = {
    open: {
        opacity: 1,
        maxWidth: 300,
        transition: { duration: 0.3 },
    },
    closed: {
        opacity: 0,
        maxWidth: 0,
        transition: { duration: 0.2 },
    },
};

const sectionVariants = {
    open: {
        opacity: 1,
        maxHeight: 40,
        marginTop: '1rem',
        transition: { duration: 0.3 },
    },
    closed: {
        opacity: 0,
        maxHeight: 0,
        marginTop: 0,
        transition: { duration: 0.2 },
    },
};

const userVariants = {
    open: {
        opacity: 1,
        maxWidth: 300,
        marginLeft: '0.75rem',
        transition: { duration: 0.3 },
    },
    closed: {
        opacity: 0,
        maxWidth: 0,
        marginLeft: 0,
        transition: { duration: 0.2 },
    },
};

/* ================== NAV ITEM ================== */
const NavItem = ({ icon: Icon, label, active, to, openSidebar }) => {
    return (
        <NavLink to={to}>
            <div
                className={`flex items-center px-3 py-2.5 rounded-sm font-bold mb-2 cursor-pointer
                ${active ? 'bg-[#EEEEFF] text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}
                ${openSidebar ? 'gap-2' : 'justify-center'}
            `}
            >
                <Icon className="w-5 h-5" strokeWidth={2.5} />

                <motion.span
                    variants={labelVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    className="text-sm overflow-hidden whitespace-nowrap"
                >
                    {label}
                </motion.span>
            </div>
        </NavLink>
    );
};

/* ================== SIDEBAR ================== */
export default function Sidebar({ displayName, roleLabel, loginMethod, hasProfile, onNavigateCreate, onLogout }) {
    const path = useLocation().pathname;

    const openSidebar = useLayoutStore((s) => s.openSidebar);
    const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);

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
        <aside
            className={`h-full flex flex-col pl-6 pt-10 pb-4 bg-white transition-all duration-500 ease-in-out
            ${openSidebar ? 'w-[250px]' : 'w-[65px]'}`}
        >
            {/* ===== LOGO ===== */}
            <div className={`flex items-center mb-5 ${openSidebar ? 'justify-between' : 'justify-center'}`}>
                <motion.div
                    variants={labelVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    className="flex items-center gap-2 text-indigo-600 font-bold overflow-hidden"
                >
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Activity className="text-white w-5 h-5" />
                    </div>
                    <span>HealthHub</span>
                </motion.div>

                {/* 🔥 FIX: onClick đặt trực tiếp, KHÔNG bọc AnimateIcon */}
                <div onClick={toggleSidebar} className="cursor-pointer p-1">
                    <PanelLeftClose className="w-5 h-5 text-indigo-600" />
                </div>
            </div>

            {/* ===== SECTION ===== */}
            <motion.p
                variants={sectionVariants}
                animate={openSidebar ? 'open' : 'closed'}
                className="text-[10px] font-bold text-gray-400 px-2 py-2"
            >
                TỔNG QUAN
            </motion.p>

            {NAV_ITEMS.map((item, i) => (
                <NavItem key={i} {...item} active={path === item.to} openSidebar={openSidebar} />
            ))}

            {/* ===== DATA ===== */}
            <motion.p
                variants={sectionVariants}
                animate={openSidebar ? 'open' : 'closed'}
                className="text-[10px] font-bold text-gray-400 px-2 mt-4"
            >
                DỮ LIỆU
            </motion.p>

            <Collapsible icon={FileText} label="Tài liệu" openSidebar={openSidebar} />

            {/* ===== USER ===== */}
            <Popover>
                <PopoverTrigger asChild>
                    <div className="flex items-center mt-auto pt-4 p-1 cursor-pointer hover:bg-gray-100 rounded-lg">
                        {/* Avatar */}
                        <motion.div
                            animate={
                                openSidebar
                                    ? { width: '2.25rem', height: '2.25rem' }
                                    : { width: '1.8rem', height: '1.8rem' }
                            }
                            className="rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
                        >
                            {getInitials(displayName)}
                        </motion.div>

                        {/* Info */}
                        <motion.div
                            variants={userVariants}
                            animate={openSidebar ? 'open' : 'closed'}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <p className="text-sm font-semibold">{displayName}</p>
                            <p className="text-xs text-gray-400">{roleLabel}</p>

                            <div
                                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                                ${
                                    loginMethod === 'metamask'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                                {loginMethod === 'metamask' ? <Wallet size={10} /> : <Shield size={10} />}
                                {loginMethod === 'metamask' ? 'MetaMask' : 'CCCD'}
                            </div>
                        </motion.div>
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    align="end"
                    side="right"
                    className="w-80 p-0 rounded-xl overflow-hidden shadow-xl border"
                >
                    {/* HEADER */}
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                {getInitials(displayName)}
                            </div>

                            <div>
                                <p className="font-semibold text-sm">{displayName}</p>
                                <p className="text-xs text-gray-500">{roleLabel}</p>
                            </div>
                        </div>

                        <div
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border
            ${
                loginMethod === 'metamask'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
            }`}
                        >
                            {loginMethod === 'metamask' ? <Wallet size={12} /> : <Shield size={12} />}
                            {loginMethod === 'metamask' ? 'MetaMask' : 'CCCD'}
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className="p-3 border-t">
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                            <Search size={14} className="text-gray-400" />
                            <input
                                placeholder="Tìm hồ sơ, bác sĩ..."
                                className="bg-transparent outline-none text-sm w-full"
                            />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="p-2 space-y-1">
                        {hasProfile ? (
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50 text-green-700">
                                <Check size={16} />
                                <span className="text-sm font-medium">Hồ sơ đã được thiết lập</span>
                            </div>
                        ) : (
                            <button
                                onClick={onNavigateCreate}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left"
                            >
                                <User size={16} />
                                <span className="text-sm">Tạo hồ sơ y tế</span>
                            </button>
                        )}

                        <button
                            onClick={onLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 w-full text-left"
                        >
                            <LogOut size={16} />
                            <span className="text-sm">Đăng xuất tài khoản</span>
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </aside>
    );
}
