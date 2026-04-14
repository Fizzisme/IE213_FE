import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Collapsible({ icon: Icon, label, children, defaultOpen = true, openSidebar, labelVariants }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="">
            <div
                onClick={() => setOpen(!open)}
                className={`flex justify-between items-center gap-2 px-3 py-2.5 rounded-sm cursor-pointer font-bold
          ${open ? 'bg-[#EEEEFF] text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}
        `}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" strokeWidth={2.5} />}
                    <motion.p
                        variants={labelVariants}
                        animate={openSidebar ? 'open' : 'closed'}
                        initial="open"
                        className="text-sm font-medium select-none"
                    >
                        {label}
                    </motion.p>
                </div>

                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            <AnimatePresence initial={false}>
                {open && openSidebar && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, opacity: { duration: 0.15 } }}
                        className="overflow-hidden"
                    >
                        <div className="relative ml-6 mt-1">
                            <div className="absolute left-[-5px] top-0 bottom-0 w-[2px] bg-gray-300" />
                            <div className="ml-4 mt-1 flex flex-col gap-1">
                                <SidebarItem label="Dosage guidelines" />
                                <SidebarItem label="Case study" />
                                <SidebarItem label="Treatment protocol" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2.5 mt-2">
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 text-white">
                                <Plus size={12} />
                            </div>
                            <span className="text-sm text-gray-500 hover:text-black cursor-pointer">
                                Thêm tài liệu mới
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SidebarItem({ label }) {
    return <div className="text-sm font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer">{label}</div>;
}
