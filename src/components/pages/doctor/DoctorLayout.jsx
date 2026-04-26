import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar.jsx';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { User } from 'lucide-react';
import { doctorService } from '@/services/doctorService.js';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list.js';
import { Users } from '@/components/animate-ui/icons/users.js';
import { Clock3 } from '@/components/animate-ui/icons/clock-3.js';
import { Toaster } from '@/components/ui/sonner.js';
import MobileSheet from '@/components/Sidebar/MobileSheet.jsx';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/doctor/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/doctor/notifications' },
    { icon: ClipboardList, label: 'Quản lý Bệnh án', to: '/doctor/medical-records' },
    { icon: Users, label: 'Bệnh nhân', to: '/doctor/patients' },
    { icon: Clock3, label: 'Lịch hẹn', to: '/doctor/appointments' },
];

export default function DoctorLayout() {
    const [doctorInfo, setDoctorInfo] = useState(null);
    // Fetch thong tin cua doctor
    useEffect(() => {
        const fetchData = async () => {
            const res = await doctorService.getMe();
            if (res.statusCode === 200) setDoctorInfo(res.data);
        };
        fetchData();
    }, []);
    const renderExtra = (user) => {
        const navigate = useNavigate();
        return (
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
                <button
                    onClick={() => navigate('/doctor/profile')}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 w-full text-left text-textColor transition-colors cursor-pointer"
                >
                    <User size={16} />
                    <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                </button>
            </>
        );
    };
    return (
        <div className="bg-white flex flex-col lg:flex-row h-screen overflow-hidden hide-scrollbar">
            <div className="lg:hidden flex items-center gap-2 px-2 py-3 border-b border-gray-200 bg-white">
                <MobileSheet
                    userInfo={{ ...doctorInfo, role: 'Bác sĩ', status: 'ACTIVE' }}
                    navItems={NAV_ITEMS}
                    renderExtra={renderExtra}
                />
            </div>
            {/* Sidebar điều hướng bên trái */}

            <Sidebar userInfo={{ ...doctorInfo, role: 'Bác sĩ' }} navItems={NAV_ITEMS} renderExtra={renderExtra} />

            {/* Vùng nội dung chính bên phải */}
            <div className="flex-1 bg-white p-4 md:p-6 min-w-0 flex flex-col">
                <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-3xl h-full w-full overflow-hidden flex flex-col relative">
                    {/* Outlet sẽ render các trang con (Dashboard, Medical Records...) vào khu vực này */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                        <Outlet />
                    </div>
                </div>
            </div>
            <Toaster className={'bg-primary'} />
        </div>
    );
}
