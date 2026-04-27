import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Collapsible from '@/components/pages/LabTech/LabTechPage/Collapsible/Collapsible.jsx';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.tsx';
import api from '@/utils/api.js';
import UserProfilePopover from '@/components/pages/LabTech/LabTechPage/UserProfilePopover/UserProfilePopover.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

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

export default function MobileSheet() {
    const { navItems } = useLayoutStore();

    const [isOpen, setIsOpen] = useState(false);
    const path = useLocation().pathname;
    const navigate = useNavigate();

    const onLogout = async () => {
        try {
            await api.delete('/auth/logout');
            navigate('/');
            setIsOpen(false);
        } catch (e) {
            console.log(e);
        }
    };

    const handleClose = () => setIsOpen(false);

    return (
        <div className="lg:hidden flex items-center">
            {/* Hamburger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors z-40"
                whileTap={{ scale: 0.95 }}
            >
                <img src="/hamburger-button.png" className={'w-10 h-10'} alt="" />
            </motion.button>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/30 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Drawer Sheet */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <img src="/AEGITAS2.png" height={20} width={80} alt="logo" className="select-none" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* GENERAL */}
                            <p className="text-xs font-bold text-gray-400 px-2 tracking-wider mb-4 uppercase">
                                Tổng quan
                            </p>
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

                            {/* DATABASES
                            <p className="text-xs font-bold text-gray-400 px-2 mt-6 mb-4 tracking-wider uppercase">
                                Dữ liệu
                            </p>
                            <Collapsible
                                icon={FileText}
                                label="Tài liệu"
                                openSidebar={true}
                                labelVariants={labelVariants}
                                isMobile={true}
                            /> */}
                        </div>

                        {/* Footer - User Profile */}
                        <div className="border-t border-gray-100 p-6">
                            <UserProfilePopover onLogout={onLogout} openSidebar={true} isMobile={true} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
