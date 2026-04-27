import { useCallback, useEffect } from 'react';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard.js';
import { Bell } from '@/components/animate-ui/icons/bell.js';
import { labTechService } from '@/services/LabTechService.js';
import DashBoardLayout from '@/components/layouts/DashBoardLayout.jsx';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

const DOCUMENTS = [
    { label: 'Dosage guidelines', path: '/lab-tech/documents/dosage' },
    { label: 'Case study', path: '/documents/case-study' },
    { label: 'Treatment protocol', path: '/documents/treatment' },
];

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Trang tổng quan', to: '/lab-tech/dashboard' },
    { icon: Bell, label: 'Thông báo', to: '/lab-tech/notifications' },
];
export default function LabTechLayout() {
    const { setUserInfo, setRole, setNavItems, setRenderExtra } = useLayoutStore();

    // Tránh re-render
    const renderExtra = useCallback(
        (user) => (
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
        ),
        [],
    );

    // Fetch thong tin cua lab-tech
    useEffect(() => {
        const fetchData = async () => {
            const res = await labTechService.getMe();
            if (res.statusCode === 200) {
                setUserInfo(res.data);
                setRole('Kỹ thuật viên phòng lab');
            }
        };
        fetchData();
        setNavItems(NAV_ITEMS);
        setRenderExtra(renderExtra);
    }, []);

    return <DashBoardLayout documents={DOCUMENTS} />;
}
