import MobileSheet from '@/components/Sidebar/MobileSheet.jsx';
import Sidebar from '@/components/Sidebar/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.js';

export default function DashBoardLayout() {
    return (
        <div className="bg-white flex flex-col lg:flex-row h-screen overflow-hidden">
            <div className="lg:hidden flex items-center gap-2 px-2 py-3 border-b border-gray-200 bg-white">
                <MobileSheet />
            </div>
            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 min-w-0 overflow-hidden p-4 xl:p-6">
                <div className="bg-[#f5f5f5] rounded-3xl h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                    <Outlet />
                </div>
            </div>
            <Toaster className={'bg-primary'} />
        </div>
    );
}
