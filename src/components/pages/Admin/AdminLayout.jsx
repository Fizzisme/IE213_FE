import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar.jsx';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { ShieldCheck, User } from 'lucide-react';
import { adminService } from '@/services/adminService.js';
import { Users } from '@/components/animate-ui/icons/users.js';
import { Toaster } from '@/components/ui/sonner.js';
import MobileSheet from '@/components/Sidebar/MobileSheet.jsx';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/admin/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/admin/notifications' },
    { icon: Users, label: 'Người dùng', to: '/admin/users' },
];

export default function AdminLayout() {
    const [adminInfo, setAdminInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await adminService.getMe(); // ← nhớ thêm getMe() vào adminService
            if (res?.statusCode === 200) setAdminInfo(res.data); // ← bỏ array wrap
        };
        fetchData();
    }, []);

    const renderExtra = (user) => {
        const navigate = useNavigate();
        return (
            <>
                <div className="p-3 rounded-lg bg-gradient-to-r from-secondary/25 to-primary/25 border">
                    <p className="text-xs text-gray-500">Vai trò</p>
                    <p className="font-mono text-sm font-semibold text-primary">
                        <ShieldCheck className="inline h-4 w-4 mr-1" />
                        Quản trị viên
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/profile')}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 w-full text-left text-textColor transition-colors cursor-pointer"
                >
                    <User size={16} />
                    <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                </button>
            </>
        );
    };

    return (
        <div className="bg-white flex flex-col lg:flex-row h-screen">
            <div className="lg:hidden flex items-center gap-2 px-2 py-3 border-b border-gray-200 bg-white">
                <MobileSheet
                    userInfo={{ ...adminInfo, role: 'Admin', status: 'ACTIVE' }}
                    navItems={NAV_ITEMS}
                    renderExtra={renderExtra}
                />
            </div>

            <Sidebar userInfo={{ ...adminInfo, role: 'Admin' }} navItems={NAV_ITEMS} renderExtra={renderExtra} />

            <div className="flex-1 bg-white p-4 md:p-6 min-w-0 flex flex-col">
                <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-3xl h-full w-full overflow-hidden flex flex-col relative">
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                        <Outlet />
                    </div>
                </div>
            </div>
            <Toaster richColors position="top-right" closeButton />
        </div>
    );
}
