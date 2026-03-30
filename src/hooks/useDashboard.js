import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { patient, logout } = useAuth();

    const loginMethod = location.state?.loginMethod || 'local';

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

    return { patient, hasProfile, displayName, roleLabel, loginMethod, handleLogout, navigate };
};