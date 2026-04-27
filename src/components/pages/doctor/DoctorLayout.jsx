import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { User } from 'lucide-react';
import { doctorService } from '@/services/doctorService.js';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list.js';
import { Users } from '@/components/animate-ui/icons/users.js';
import { Clock3 } from '@/components/animate-ui/icons/clock-3.js';

import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/doctor/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/doctor/notifications' },
    { icon: ClipboardList, label: 'Quản lý Bệnh án', to: '/doctor/medical-records' },
    { icon: Users, label: 'Bệnh nhân', to: '/doctor/patients' },
    { icon: Clock3, label: 'Lịch hẹn', to: '/doctor/appointments' },
];

export default function DoctorLayout() {
    const { setUserInfo, setRole, setRenderExtra, setNavItems } = useLayoutStore();
    const navigate = useNavigate();
    const renderExtra = useCallback(
        (user) => {
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
        },
        [navigate],
    );

    // Fetch thong tin cua doctor
    useEffect(() => {
        const fetchData = async () => {
            const res = await doctorService.getMe();
            if (res.statusCode === 200) {
                setUserInfo(res.data);
                setRole('Bác sĩ');
            }
        };
        fetchData();
        setRenderExtra(renderExtra);
        setNavItems(NAV_ITEMS);
    }, []);

    return <DashBoardLayout />;
}
