import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar.jsx';
import MobileSheet from '@/components/Sidebar/MobileSheet.jsx';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.tsx';
import { Bell } from '@/components/animate-ui/icons/bell.tsx';
import { Check, Search, Shield, User, Wallet } from 'lucide-react';
import { Calendar } from '@/components/Calendar/Calendar.tsx';
import { useDashboard } from '@/hooks/useDashboard.js';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';
import { useEffect } from 'react';
import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/patient/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/patient/notifications' },
    { icon: Calendar, label: 'Lịch hẹn của tôi', to: '/patient/appointments-manage' },
    // { icon: Activity, label: 'Sức khỏe', to: '/demo-dashboard/health' },
    //     { icon: Pill, label: 'Thuốc', to: 'demo-dashboard/pills' },
];

export default function PatientLayout() {
    const { patient, roleLabel, loginMethod, hasProfile, onNavigateCreate } = useDashboard();

    const { setUserInfo, setRole, setNavItems, setRenderExtra } = useLayoutStore();

    useEffect(() => {
        setUserInfo(patient);
        setRole(roleLabel);
        setRenderExtra(renderExtra);
        setNavItems(NAV_ITEMS);
    }, [patient, roleLabel]);

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

    return <DashBoardLayout />;
}
