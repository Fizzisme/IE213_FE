import { useEffect, useState } from 'react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';

import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { FileText } from 'lucide-react';
import Collapsible from '@/components/pages/LabTechPage/Collapsible/Collapsible.jsx';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { PanelLeftClose } from '@/components/animate-ui/icons/panel-left-close.js';
import { BE_URL } from '@/lib/constans.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/animate-ui/components/radix/popover.js';
import { LogOut } from '@/components/animate-ui/icons/log-out.js';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';
import { AnimatePresence, motion } from 'motion/react';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/lab-tech/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/lab-tech/notifications' },
];

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

const sectionVariants = {
    open: {
        opacity: 1,
        maxHeight: 40,
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
    closed: {
        opacity: 0,
        maxHeight: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
};

const NavItem = ({ icon: Icon, label, active, onClick, to, openSidebar }) => {
    return (
        <NavLink to={to}>
            <AnimateIcon
                animateOnHover
                onClick={onClick}
                className={`flex items-center px-3 py-2.5 rounded-sm cursor-pointer font-bold
          ${active ? 'bg-[#EEEEFF] text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}
          ${openSidebar ? ' gap-2 ' : 'justify-center'}
        `}
            >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
                <motion.span
                    variants={labelVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    initial="open"
                    className="text-sm select-none overflow-hidden whitespace-nowrap"
                >
                    {label}
                </motion.span>
            </AnimateIcon>
        </NavLink>
    );
};

export default function Sidebar() {
    const [activeIndex, setActiveIndex] = useState(0);

    const [labTechInfo, setLabTechInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`${BE_URL}/v1/lab-techs/me`, {
                method: 'GET',
                credentials: 'include',
            });
            const resJson = await res.json();
            if (resJson.statusCode === 200) setLabTechInfo(resJson.data);
        };
        fetchData();
    }, []);
    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };
    // Lấy path của URL
    const path = useLocation().pathname;
    const onLogout = () => {};
    // const [openSidebar, setOpenSidebar] = useState(true);
    //  Lấy ra từ trong store của zustand cách này khiến code không bị re-render
    const openSidebar = useLayoutStore((s) => s?.openSidebar);
    const toggleSidebar = useLayoutStore((s) => s?.toggleSidebar);

    return (
        <aside
            className={`h-full flex flex-col pr-0 pl-6 pt-10 pb-4 bg-white transition-all duration-500 ease-in-out
        ${openSidebar ? 'w-[250px]' : 'w-[65px]'}
        `}
        >
            {/* Logo */}
            <div
                className={`flex items-center  gap-2 mb-5 font-bold text-lg
            ${openSidebar ? 'justify-between' : 'justify-center'}
            `}
            >
                <motion.span
                    variants={labelVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    initial="open"
                    className="font-extrabold text-xl text-indigo-600 overflow-hidden whitespace-nowrap"
                >
                    HealthHub
                </motion.span>

                <AnimateIcon animateOnHover>
                    <PanelLeftClose
                        onClick={toggleSidebar}
                        className="w-5 h-5 font-medium cursor-pointer text-indigo-600"
                    />
                </AnimateIcon>
            </div>

            {/* Search */}
            {/*<motion.div variants={labelVariants} animate={openSidebar ? 'open' : 'closed'} initial="open">*/}

            {/*    <AnimateIcon*/}
            {/*        animateOnHover*/}
            {/*        className=" border-2 p-1 px-[6px] hover:bg-[#f6f6f7] hover:shadow-sm  shadow-xs rounded-md bg-[#f5f5f5] select-none cursor-pointer flex gap-1 items-center"*/}
            {/*    >*/}
            {/*        <Search className={'size-5'} />*/}
            {/*        <input className="flex-1 p-1 text-sm focus:border-none" placeholder="Tìm kiếm" />*/}
            {/*    </AnimateIcon>*/}
            {/*</motion.div>*/}

            {/* GENERAL */}
            <motion.p
                variants={sectionVariants}
                animate={openSidebar ? 'open' : 'closed'}
                initial="open"
                className="text-[10px] font-bold text-gray-400 px-2 mt-4 mb-1 tracking-wider overflow-hidden whitespace-nowrap"
            >
                TỔNG QUAN
            </motion.p>
            <div className="space-y-2">
                {NAV_ITEMS.map((item, index) => (
                    <NavItem
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => setActiveIndex(index)}
                        to={item.to}
                        active={path === item.to}
                        openSidebar={openSidebar}
                    />
                ))}
            </div>

            {/* DATABASES */}
            <motion.p
                variants={sectionVariants}
                animate={openSidebar ? 'open' : 'closed'}
                initial="open"
                className="text-[10px] font-bold text-gray-400 px-2 mt-4 mb-1 tracking-wider overflow-hidden whitespace-nowrap"
            >
                DỮ LIỆU
            </motion.p>
            <Collapsible icon={FileText} label={'Tài liệu'} openSidebar={openSidebar} labelVariants={labelVariants} />
            {/* User */}
            <Popover>
                <PopoverTrigger asChild>
                    <div
                        className={`flex items-center gap-3 mt-auto pt-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg
                            ${openSidebar && 'hover:bg-gray-100'}
                            `}
                    >
                        <div
                            className={`rounded-full bg-indigo-600 text-white flex items-center justify-center 
                                ${openSidebar ? 'w-9 h-9 font-bold' : 'w-7 h-7 font-semibold text-sm'}
                                `}
                        >
                            {getInitials(labTechInfo?.fullName)}
                        </div>

                        <motion.div
                            variants={labelVariants}
                            animate={openSidebar ? 'open' : 'closed'}
                            initial="open"
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <p className="text-sm font-semibold">{labTechInfo?.fullName}</p>
                            <p className="text-xs text-gray-400">{labTechInfo?.department}</p>
                        </motion.div>
                    </div>
                </PopoverTrigger>

                {/* lệch phải */}
                <PopoverContent align="end" side="right" className="w-80">
                    <div className="space-y-4">
                        {/* Header */}
                        <div>
                            <p className="font-semibold text-lg">{labTechInfo?.fullName}</p>
                            <p className="text-sm text-gray-500">{labTechInfo?.department}</p>
                        </div>

                        {/* Info */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Giới tính</span>
                                <span>{labTechInfo?.gender === 'M' ? 'Nam' : 'Nữ'}</span>
                            </div>

                            <div>
                                <p className="text-gray-500 mb-1">Chuyên môn</p>
                                <div className="flex flex-wrap gap-1">
                                    {labTechInfo?.specialization?.map((sp, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                                            {sp}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* License đẹp hơn */}
                            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border">
                                <p className="text-xs text-gray-500">Giấy phép</p>
                                <p className="font-mono text-sm font-semibold text-indigo-600">
                                    {labTechInfo?.licenseNumber}
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Trạng thái</span>
                                <span
                                    className={`font-medium ${
                                        labTechInfo?.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'
                                    }`}
                                >
                                    {labTechInfo?.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Xác thực</span>
                                <span>{labTechInfo?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                            </div>
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
        </aside>
    );
}
