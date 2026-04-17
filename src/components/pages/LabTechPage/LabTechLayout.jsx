import Sidebar from '@/components/pages/LabTechPage/Sidebar/Sidebar.jsx';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BE_URL } from '@/lib/constans.js';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { CircleX, Menu } from 'lucide-react';
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/lab-tech/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/lab-tech/notifications' },
];
export default function LabTechLayout() {
    const [labTechInfo, setLabTechInfo] = useState(null);
    const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
    // Fetch thong tin cua lab-tech
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

    const navigate = useNavigate();
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
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border">
                <p className="text-xs text-gray-500">Giấy phép</p>
                <p className="font-mono text-sm font-semibold text-indigo-600">{user?.licenseNumber}</p>
            </div>
        </>
    );
    return (
        <div className="bg-white flex h-screen overflow-hidden hide-scrollbar">
            {/* Sidebar */}
            <Sidebar
                userInfo={{ ...labTechInfo, role: 'Kỹ thuật viên phòng lab' }}
                navItems={NAV_ITEMS}
                renderExtra={renderExtra}
            />

            {/* MOBILE DROPDOWN MENU */}
            {openMobileSidebar && (
                <>
                    {/* OVERLAY */}
                    <div
                        onClick={() => setOpenMobileSidebar(false)}
                        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    />

                    {/* MENU */}
                    <div
                        className={`fixed top-0 left-0 w-full z-50 lg:hidden 
            transform transition-transform duration-300
            ${openMobileSidebar ? 'translate-y-0' : '-translate-y-full'}`}
                    >
                        <div className="bg-white shadow-lg rounded-b-2xl p-3">
                            {/* HEADER */}
                            <header className="flex items-center justify-end mb-2 py-1">
                                <button onClick={() => setOpenMobileSidebar(false)} className="text-sm text-gray-500">
                                    <CircleX className="h-4  w-4" />
                                </button>
                            </header>

                            {/* NAV ITEMS */}
                            <div className="flex flex-col gap-1">
                                {NAV_ITEMS.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.to;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                navigate(item.to);
                                                setOpenMobileSidebar(false);
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition
                        ${isActive ? 'bg-[#EEEEFF] text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* USER */}
                            <div className="mt-3 pt-3 border-t flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                    {labTechInfo?.fullName
                                        ?.split(' ')
                                        .map((w) => w[0])
                                        .slice(0, 2)
                                        .join('')}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{labTechInfo?.fullName}</p>
                                    <p className="text-xs text-gray-500">{labTechInfo?.department}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main */}
            <div className="flex-1 bg-white p-4 xl:p-6 min-w-0">
                <div className="flex justify-end px-2 py-4">
                    <button
                        onClick={() => setOpenMobileSidebar(true)}
                        className="lg:hidden gap-1.5 border-2 p-1.5 rounded-lg items-center shadow-xs "
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                </div>

                <div className="bg-[#f5f5f5] rounded-3xl h-full w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
