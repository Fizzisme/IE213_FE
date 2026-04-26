import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar.jsx';
import MobileSheet from '@/components/Sidebar/MobileSheet.jsx';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { Check, Menu, Pill, Search, Shield, User, Wallet } from 'lucide-react';
import { Activity } from '@/components/animate-ui/icons/activity.js';
import { Calendar } from '@/components/Calendar/Calendar.js';
import { useDashboard } from '@/hooks/useDashboard.js';
import { Toaster } from '@/components/ui/sonner.js';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/demo-dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/demo-dashboard/notifications' },
    { icon: Calendar, label: 'Lịch hẹn của tôi', to: '/demo-dashboard/appointments-manage' },
    { icon: Activity, label: 'Sức khỏe', to: '/demo-dashboard/health' },
    { icon: Pill, label: 'Thuốc', to: 'demo-dashboard/pills' },
];

export default function DashboardLayout() {
    const { patient, roleLabel, loginMethod, hasProfile, onNavigateCreate } = useDashboard();

    console.log(patient);

    const renderExtra = () => (
        <>
            {/* HEADER */}
            <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border
            ${
                loginMethod === 'metamask'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    : 'bg-green-100 text-blue-700 border-green-300'
            }`}
                >
                    {loginMethod === 'metamask' ? <Wallet size={12} /> : <Shield size={12} />}
                    {loginMethod === 'metamask' ? 'MetaMask' : 'CCCD'}
                </div>
            </div>

            {/* SEARCH */}
            <div className="p-3 border-t">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <Search size={14} className="text-gray-400" />
                    <input placeholder="Tìm hồ sơ, bác sĩ..." className="bg-transparent outline-none text-sm w-full" />
                </div>
            </div>

            {/* ACTIONS */}
            <div className="p-2 space-y-1">
                {hasProfile ? (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50 text-green-700">
                        <Check size={16} />
                        <span className="text-sm font-medium">Hồ sơ đã được thiết lập</span>
                    </div>
                ) : (
                    <button
                        onClick={onNavigateCreate}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left cursor-pointer"
                    >
                        <User size={16} />
                        <span className="text-sm">Tạo hồ sơ y tế</span>
                    </button>
                )}
            </div>
        </>
    );

    return (
        <div className="bg-white flex flex-col lg:flex-row h-screen hide-scrollbar">
            {/* Mobile Top Bar - Đã sửa ở đây */}
            <div className="lg:hidden flex items-center gap-2 px-2 py-3 border-b border-gray-200 bg-white">
                <MobileSheet
                    userInfo={{ ...patient, role: roleLabel, status: 'ACTIVE' }}
                    navItems={NAV_ITEMS}
                    renderExtra={renderExtra}
                />
                <img src="/AEGITAS2.png" height={20} width={80} alt="logo" className="select-none ml-1" />
            </div>

            {/* Desktop Sidebar */}
            <Sidebar
                userInfo={{ ...patient, role: roleLabel, status: 'ACTIVE' }}
                navItems={NAV_ITEMS}
                renderExtra={renderExtra}
            />

            <div className="flex-1 bg-white p-4 lg:p-6 min-w-0 overflow-hidden">
                <div className="bg-[#f5f5f5] rounded-3xl h-full w-full overflow-hidden">
                    <div className="flex h-full">
                        <main className="flex-1 p-4 lg:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>

            <Toaster className={'bg-primary'} />
        </div>
    );
}
