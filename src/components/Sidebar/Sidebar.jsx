import { AnimateIcon } from '@/components/animate-ui/icons/icon.tsx';
import { FileText } from 'lucide-react';
import Collapsible from '@/components/pages/LabTech/LabTechPage/Collapsible/Collapsible.jsx';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PanelLeftClose } from '@/components/animate-ui/icons/panel-left-close.tsx';
import { useSidebarStore } from '@/stores/useSidebarStore.jsx';
import { motion } from 'motion/react';
import api from '@/utils/api.js';
import UserProfilePopover from '@/components/pages/LabTech/LabTechPage/UserProfilePopover/UserProfilePopover.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

// Variants cho label
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
// Variants cho section
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
// Component NavItem
const NavItem = ({ icon: Icon, label, active, to, openSidebar }) => {
    return (
        <NavLink to={to}>
            <AnimateIcon
                animateOnHover
                className={`flex items-center px-3 py-2.5 rounded-sm cursor-pointer font-bold mb-2
          ${active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-secondary/20'}
          ${openSidebar ? ' gap-2 ' : 'justify-center'}
        `}
            >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
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
    const { navItems } = useLayoutStore();

    // Lấy path của URL
    const path = useLocation().pathname;
    const navigate = useNavigate();
    // Hàm logout
    const onLogout = async () => {
        try {
            await api.delete('/auth/logout');
            navigate('/');
        } catch (e) {
            console.log(e);
        }
    };
    //  Lấy ra từ trong store của zustand cách này khiến code không bị re-render
    const openSidebar = useSidebarStore((s) => s?.openSidebar);
    const toggleSidebar = useSidebarStore((s) => s?.toggleSidebar);
    return (
        <aside
            className={`hidden lg:flex lg:flex-col h-full pr-0 pl-6 pt-10 pb-4 bg-white transition-all duration-500 ease-in-out
        ${openSidebar ? 'w-[250px]' : 'w-[65px]'}
        `}
        >
            {/* Logo */}

            <div className="flex items-center">
                {/* Logo + Icon swap khi hover */}
                <motion.div className="relative group" onClick={!openSidebar ? toggleSidebar : undefined}>
                    {/* Logo — ẩn khi hover lúc sidebar đóng */}
                    <img
                        src="/AEGITAS2.png"
                        height={20}
                        width={80}
                        alt="logo"
                        className={`transition-all duration-200 select-none
                ${!openSidebar ? 'group-hover:opacity-0 group-hover:scale-90 mb-2' : ''}
            `}
                    />

                    {/* Icon — chỉ xuất hiện khi sidebar đóng + hover */}
                    {!openSidebar && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center
                                        opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100
                                        transition-all duration-200 cursor-pointer
                                        ${!openSidebar ? 'mb-2' : ''}`}
                        >
                            <PanelLeftClose className="w-5 h-5 text-primary" />
                        </div>
                    )}
                </motion.div>

                {/* Icon toggle — chỉ hiện khi sidebar mở */}
                <motion.div
                    variants={labelVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    initial="open"
                    className="ml-auto overflow-hidden"
                >
                    <AnimateIcon animateOnHover>
                        <PanelLeftClose
                            onClick={toggleSidebar}
                            className="w-5 h-5 font-medium cursor-pointer text-primary"
                        />
                    </AnimateIcon>
                </motion.div>
            </div>

            {/* GENERAL */}
            <motion.p
                variants={sectionVariants}
                animate={openSidebar ? 'open' : 'closed'}
                initial="open"
                className="text-[10px] font-bold text-gray-400 px-2 tracking-wider overflow-hidden whitespace-nowrap"
            >
                TỔNG QUAN
            </motion.p>
            {/* Nav Items */}
            {navItems.map((item, index) => (
                <NavItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    to={item.to}
                    active={path === item.to}
                    openSidebar={openSidebar}
                />
            ))}

            {/* DATABASES */}
            {/* <motion.p
                variants={sectionVariants}
                animate={openSidebar ? 'open' : 'closed'}
                initial="open"
                className="text-[10px] font-bold text-gray-400 px-2 mt-4 mb-1 tracking-wider overflow-hidden whitespace-nowrap"
            >
                DỮ LIỆU
            </motion.p> */}
            {/*Collapsible của database*/}
            {/* <Collapsible icon={FileText} label={'Tài liệu'} openSidebar={openSidebar} labelVariants={labelVariants} /> */}
            {/* User */}
            <UserProfilePopover onLogout={onLogout} openSidebar={openSidebar} />
        </aside>
    );
}
