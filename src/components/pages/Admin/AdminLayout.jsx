import React, { useCallback, useEffect, useState } from 'react';

import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { ShieldCheck } from 'lucide-react';
import { adminService } from '@/services/adminService.js';
import { Users } from '@/components/animate-ui/icons/users.js';

import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/admin/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/admin/notifications' },
    { icon: Users, label: 'Người dùng', to: '/admin/users' },
];

export default function AdminLayout() {
    const { setUserInfo, setRole, setNavItems, setRenderExtra } = useLayoutStore();

    const renderExtra = useCallback(() => {
        return (
            <>
                <div className="p-3 rounded-lg bg-gradient-to-r from-secondary/25 to-primary/25 border">
                    <p className="text-xs text-gray-500">Vai trò</p>
                    <p className="font-mono text-sm font-semibold text-primary">
                        <ShieldCheck className="inline h-4 w-4 mr-1" />
                        Quản trị viên
                    </p>
                </div>
            </>
        );
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const res = await adminService.getMe();
            if (res?.statusCode === 200) {
                setUserInfo(res.data);
                setRole('Admin');
            }
        };
        fetchData();
        setRenderExtra(renderExtra);
        setNavItems(NAV_ITEMS);
    }, []);

    return <DashBoardLayout />;
}
