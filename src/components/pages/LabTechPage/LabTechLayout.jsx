import Sidebar from '@/components/pages/LabTechPage/Sidebar/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
export default function LabTechLayout() {
    return (
        <div className="bg-white flex h-screen overflow-hidden hide-scrollbar">
            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 bg-white p-6 min-w-0">
                <div className="bg-[#f5f5f5] rounded-3xl h-full w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
