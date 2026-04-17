import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';
import { FileText } from 'lucide-react';
import Collapsible from '@/components/pages/LabTechPage/Collapsible/Collapsible.jsx';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PanelLeftClose } from '@/components/animate-ui/icons/panel-left-close.js';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';
import { motion } from 'motion/react';
import api from '@/utils/api.js';
import UserProfilePopover from '@/components/pages/LabTechPage/UserProfilePopover/UserProfilePopover.jsx';

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
          ${active ? 'bg-[#EEEEFF] text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}
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

export default function Sidebar({ userInfo, navItems, renderExtra }) {
    console.log(userInfo);
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
    const openSidebar = useLayoutStore((s) => s?.openSidebar);
    const toggleSidebar = useLayoutStore((s) => s?.toggleSidebar);

    return (
        <aside
            className={`hidden lg:flex lg:flex-col h-full pr-0 pl-6 pt-10 pb-4 bg-white transition-all duration-500 ease-in-out
        ${openSidebar ? 'w-[250px]' : 'w-[65px]'}
        `}
        >
            {/* Logo */}
            <div
                className={`flex items-center  gap-2 mb-5 font-bold text-lg
       
            `}
            >
                <motion.span
                    variants={labelVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    initial="open"
                    className="font-extrabold text-xl text-indigo-600 overflow-hidden whitespace-nowrap flex-1"
                >
                    HealthHub
                </motion.span>

                <AnimateIcon animateOnHover>
                    <PanelLeftClose
                        onClick={toggleSidebar}
                        className="w-5 h-5 font-medium cursor-pointer text-indigo-600 shrink-0"
                    />
                </AnimateIcon>
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
            <motion.p
                variants={sectionVariants}
                animate={openSidebar ? 'open' : 'closed'}
                initial="open"
                className="text-[10px] font-bold text-gray-400 px-2 mt-4 mb-1 tracking-wider overflow-hidden whitespace-nowrap"
            >
                DỮ LIỆU
            </motion.p>
            {/*Collapsible của database*/}
            <Collapsible icon={FileText} label={'Tài liệu'} openSidebar={openSidebar} labelVariants={labelVariants} />
            {/* User */}
            <UserProfilePopover
                user={userInfo}
                onLogout={onLogout}
                openSidebar={openSidebar}
                renderExtra={renderExtra}
            />
        </aside>
    );
}
