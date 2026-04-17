import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { Link } from 'react-router-dom';

const chevronVariants = {
    open: {
        opacity: 1,
        maxWidth: 20,
        transition: { maxWidth: { duration: 0.5, ease: 'easeInOut' }, opacity: { duration: 0.2, delay: 0.1 } },
    },
    closed: {
        opacity: 0,
        maxWidth: 0,
        transition: { opacity: { duration: 0.1 }, maxWidth: { duration: 0.5, ease: 'easeInOut' } },
    },
};

const documents = [
    { label: 'Dosage guidelines', path: '/lab-tech/documents/dosage' },
    { label: 'Case study', path: '/documents/case-study' },
    { label: 'Treatment protocol', path: '/documents/treatment' },
];

export default function Collapsible({ icon: Icon, label, openSidebar, labelVariants }) {
    const [open, setOpen] = useState(true);
    const [ref, { height }] = useMeasure();
    const h = height + 5;
    return (
        <div>
            <div
                onClick={() => setOpen(!open)}
                className={`flex justify-between items-center gap-2 px-3 py-2.5 rounded-sm cursor-pointer font-bold
                    ${open ? 'bg-[#EEEEFF] text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}
                `}
            >
                <div className="flex items-center gap-2">
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

                <motion.div
                    variants={chevronVariants}
                    animate={openSidebar ? 'open' : 'closed'}
                    initial="open"
                    className="overflow-hidden shrink-0"
                >
                    <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} />
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                animate={open && openSidebar ? { h, opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{
                    height: { duration: 0.3, ease: 'easeInOut' },
                    opacity: { duration: 0.15, delay: open && openSidebar ? 0.25 : 0 },
                }}
                className="overflow-hidden"
            >
                <div ref={ref}>
                    <div className="relative ml-6 mt-1">
                        <div className="absolute left-[-5px] top-0 bottom-0 w-[2px] bg-gray-300" />
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            {documents.map((document) => (
                                <SidebarItem label={document.label} key={document.label} path={document.path} />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2.5 mt-2 mb-1">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 text-white shrink-0">
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

function SidebarItem({ label, path }) {
    return (
        <Link to={path}>
            <div className="text-sm font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer">{label}</div>
        </Link>
    );
}
