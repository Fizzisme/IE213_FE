import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore.js';
import { useEffect } from 'react';

export const useDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = useAuthStore((s) => s.patient);
    const logout = useAuthStore((s) => s.logout);

    const stateLoginMethod = location.state?.loginMethod;

    useEffect(() => {
        if (stateLoginMethod) {
            sessionStorage.setItem('loginMethod', stateLoginMethod);
        }
    }, [stateLoginMethod]);

    const loginMethod = stateLoginMethod || sessionStorage.getItem('loginMethod') || 'local';

    const displayName =
        patient?.fullName ||
        patient?.name ||
        (patient?.walletAddress
            ? `${patient.walletAddress.slice(0, 6)}...${patient.walletAddress.slice(-4)}`
            : 'Khách');

    const roleLabel = patient?.role
        ? patient.role.charAt(0).toUpperCase() + patient.role.slice(1).toLowerCase()
        : 'Bệnh nhân';

    const hasProfile = !!patient;

    const handleLogout = async () => {
        await logout();
        navigate('/auth', { replace: true });
    };

    const onNavigateCreate = () => {
        navigate('/patient/create-patient');
    };

    return { patient, hasProfile, displayName, roleLabel, loginMethod, handleLogout, navigate, onNavigateCreate };
};
