import Sidebar from '@/components/Sidebar/Sidebar.jsx';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BE_URL } from '@/lib/constans.js';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { CircleX, Menu } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import MobileSheet from '@/components/Sidebar/MobileSheet.jsx';
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/lab-tech/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/lab-tech/notifications' },
];
export default function LabTechLayout() {
    const [labTechInfo, setLabTechInfo] = useState(null);
    // Fetch thong tin cua lab-tech
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`/api/v1/lab-techs/me`, {
                method: 'GET',
                credentials: 'include',
            });
            const resJson = await res.json();
            if (resJson.statusCode === 200) setLabTechInfo(resJson.data);
        };
        fetchData();
    }, []);

    const renderExtra = (user) => (
        <>
            {/* specialization */}
            <div>
                <p className="text-gray-500 mb-1">Chuyên môn</p>
                <div className="flex flex-wrap gap-1">
                    {user?.specialization?.map((sp, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                            {sp}
                        </span>
                    ))}
                </div>
            </div>

            {/* license */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-secondary/25 to-primary/25 border">
                <p className="text-xs text-gray-500">Giấy phép</p>
                <p className="font-mono text-sm font-semibold text-primary">{user?.licenseNumber}</p>
            </div>
        </>
    );
    return (
        <div className="bg-white flex flex-col lg:flex-row h-screen overflow-hidden hide-scrollbar">
            <div className="lg:hidden flex items-center gap-2 px-2 py-3 border-b border-gray-200 bg-white">
                <MobileSheet
                    userInfo={{ ...labTechInfo, role: 'Kỹ thuật viên phòng lab', status: 'ACTIVE' }}
                    navItems={NAV_ITEMS}
                    renderExtra={renderExtra}
                />
            </div>
            {/* Sidebar */}
            <Sidebar
                userInfo={{ ...labTechInfo, role: 'Kỹ thuật viên phòng lab' }}
                navItems={NAV_ITEMS}
                renderExtra={renderExtra}
            />

            {/* Main */}
            <div className="flex-1 bg-white p-4 xl:p-6 min-w-0">
                <div className="bg-[#f5f5f5] rounded-3xl h-full w-full">
                    <Outlet />
                </div>
            </div>
            <Toaster className={'bg-primary'} />
        </div>
    );
}
