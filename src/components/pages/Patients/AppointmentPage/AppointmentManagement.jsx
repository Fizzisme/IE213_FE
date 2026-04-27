import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Calendar,
    Clock,
    User,
    FileText,
    X,
    ChevronDown,
    Plus,
    Filter,
    Stethoscope,
    Droplet,
    Salad,
    CalendarCheck,
    ShieldCheck,
    ShieldOff,
    Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { toast } from 'sonner';

import RescheduleAppointmentModal from './components/RescheduleAppointmentModal';
import { patientService } from '@/services/patientService.js';
import { enforceSepolia } from '@/utils/enforceSepolia.js';

export default function AppointmentManagement() {
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab');

    const [activeFilter, setActiveFilter] = useState(tabFromUrl || 'ALL');
    const navigate = useNavigate();
    const [open, setIsOpen] = useState(false);
    const [timeFilter, setTimeFilter] = useState('ALL_TIME');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    // State theo dõi lịch hẹn đang được cấp/thu hồi quyền
    const [grantingId, setGrantingId] = useState(null);
    const [revokingId, setRevokingId] = useState(null);

    // Tải danh sách lịch hẹn khi component mount
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await patientService.getAppointments();
                setAppointments(res?.data || []);
            } catch (err) {
                console.error('[Lịch hẹn] Lỗi tải danh sách:', err);
                toast.error('Lỗi khi tải danh sách lịch hẹn');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    // Hàm tải lại danh sách lịch hẹn
    const refreshAppointments = async () => {
        const res = await patientService.getAppointments();
        setAppointments(res?.data || []);
    };

    const handleReschedule = async ({ appointmentDateTime, description }) => {
        try {
            const res = await patientService.rescheduleAppointment(selectedAppointment.id, {
                appointmentDateTime,
                description,
            });
            if (res) {
                toast.success('Đổi lịch thành công');
                await refreshAppointments();
            }
            setIsOpen(false);
        } catch (err) {
            console.error('[Đổi lịch] Lỗi:', err);
            toast.error('Lỗi khi đổi lịch');
        }
    };

    const handleCancel = async (appointmentId) => {
        try {
            await patientService.cancelAppointment(appointmentId);
            toast.success('Hủy lịch thành công');
            await refreshAppointments();
        } catch (err) {
            console.error('[Hủy lịch] Lỗi:', err);
            toast.error('Hủy lịch thất bại');
        }
    };

    // Cấp quyền truy cập hồ sơ cho bác sĩ qua blockchain (MetaMask)
    const handleGrantAccess = async (appointment) => {
        if (grantingId || revokingId) return;

        if (!window.ethereum) {
            toast.error('Cần cài MetaMask để thực hiện thao tác này');
            return;
        }

        const loadingToast = toast.loading('Đang khởi tạo ví...');
        setGrantingId(appointment.id);

        try {
            await enforceSepolia();

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            console.log('[Cấp quyền] Lấy metadata cho lịch hẹn:', appointment.id);
            const prepRes = await patientService.prepareGrantAccess(appointment.id);
            const prep = prepRes?.data ?? prepRes;

            const contractAddress = prep?.contractAddress;
            const doctorWallet = prep?.doctorWallet || prep?.args?.[0];
            const durationHours = Number(prep?.durationHours || prep?.args?.[1] || 24);

            if (!contractAddress || !doctorWallet) {
                throw new Error('Metadata blockchain không hợp lệ — thiếu contractAddress hoặc doctorWallet');
            }

            const contract = new ethers.Contract(
                contractAddress,
                ['function grantAccess(address doctor, uint256 durationHours) external'],
                signer,
            );

            toast.loading('Vui lòng xác nhận giao dịch trên MetaMask...', { id: loadingToast });
            const tx = await contract.grantAccess(doctorWallet, durationHours);

            toast.loading('Đang chờ blockchain xác nhận...', { id: loadingToast });
            await tx.wait();

            await patientService.verifyGrantAccess(appointment.id, tx.hash);

            toast.success('Cấp quyền truy cập hồ sơ thành công!', { id: loadingToast });
            await refreshAppointments();
        } catch (err) {
            console.error('[Cấp quyền] Lỗi:', err);
            toast.error(`Cấp quyền thất bại: ${err?.reason || err?.message || 'Lỗi không xác định'}`, {
                id: loadingToast,
            });
        } finally {
            setGrantingId(null);
        }
    };

    // Thu hồi quyền truy cập hồ sơ của bác sĩ qua blockchain (MetaMask)
    const handleRevokeAccess = async (appointment) => {
        if (grantingId || revokingId) return;

        if (!window.ethereum) {
            toast.error('Cần cài MetaMask để thực hiện thao tác này');
            return;
        }

        const loadingToast = toast.loading('Đang khởi tạo ví...');
        setRevokingId(appointment.id);

        try {
            await enforceSepolia();
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            console.log('[Thu hồi quyền] Lấy metadata cho lịch hẹn:', appointment.id);
            const prepRes = await patientService.prepareRevokeAccess(appointment.id);
            const prep = prepRes?.data ?? prepRes;

            const contractAddress = prep?.contractAddress;
            const doctorWallet = prep?.doctorWallet || prep?.args?.[0];

            if (!contractAddress || !doctorWallet) {
                throw new Error('Metadata blockchain không hợp lệ');
            }

            const contract = new ethers.Contract(
                contractAddress,
                ['function revokeAccess(address doctor) external'],
                signer,
            );

            toast.loading('Vui lòng xác nhận giao dịch trên MetaMask...', { id: loadingToast });
            const tx = await contract.revokeAccess(doctorWallet);

            toast.loading('Đang chờ blockchain xác nhận...', { id: loadingToast });
            await tx.wait();

            await patientService.verifyRevokeAccess(appointment.id, tx.hash);

            toast.success('Thu hồi quyền truy cập thành công!', { id: loadingToast });
            await refreshAppointments();
        } catch (err) {
            console.error('[Thu hồi quyền] Lỗi:', err);
            toast.error(`Thu hồi quyền thất bại: ${err?.reason || err?.message || 'Lỗi không xác định'}`, {
                id: loadingToast,
            });
        } finally {
            setRevokingId(null);
        }
    };

    const getServiceIcon = (name) => {
        if (!name) return <FileText className="w-5 h-5" />;
        if (name.includes('đường huyết')) return <Droplet className="w-5 h-5" />;
        if (name.includes('dinh dưỡng')) return <Salad className="w-5 h-5" />;
        return <Stethoscope className="w-5 h-5" />;
    };

    const formatAppointment = (apt) => {
        const dateObj = new Date(apt.appointmentDateTime);

        return {
            id: apt._id,
            originalDateTime: apt.appointmentDateTime,
            date: dateObj.toLocaleDateString('vi-VN'),
            time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            serviceName: apt.serviceId?.name,
            price: apt.price,
            doctorName: apt.doctorId?.name,
            status: apt.status,
            description: apt.description,
            serviceIcon: getServiceIcon(apt.serviceId?.name),
        };
    };

    const formattedAppointments = appointments.map(formatAppointment);
    const now = new Date();

    const filteredAppointments = formattedAppointments.filter((apt) => {
        const aptDate = new Date(apt.originalDateTime);

        if (activeFilter === 'UPCOMING') {
            if (!(apt.status === 'PENDING' || apt.status === 'CONFIRMED')) return false;
        }
        if (activeFilter === 'COMPLETED' && apt.status !== 'COMPLETED') return false;
        if (activeFilter === 'CANCELLED' && apt.status !== 'CANCELLED') return false;

        if (timeFilter === 'THIS_WEEK') {
            const oneWeekLater = new Date();
            oneWeekLater.setDate(now.getDate() + 7);
            return aptDate >= now && aptDate <= oneWeekLater;
        }
        if (timeFilter === 'THIS_MONTH') {
            return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
        }

        return true;
    });

    const filterTabs = [
        { label: 'Tất cả', value: 'ALL' },
        { label: 'Sắp tới', value: 'UPCOMING' },
        { label: 'Đã hoàn thành', value: 'COMPLETED' },
        { label: 'Đã hủy', value: 'CANCELLED' },
    ];

    const timeFilters = [
        { label: 'Tuần này', value: 'THIS_WEEK' },
        { label: 'Tháng này', value: 'THIS_MONTH' },
        { label: 'Tất cả', value: 'ALL_TIME' },
    ];

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    label: 'Chờ duyệt',
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-700',
                    borderColor: 'border-yellow-300',
                };
            case 'CONFIRMED':
                return {
                    label: 'Đã xác nhận',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-700',
                    borderColor: 'border-green-300',
                };
            case 'COMPLETED':
                return {
                    label: 'Đã hoàn thành',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-700',
                    borderColor: 'border-blue-300',
                };
            case 'CANCELLED':
                return {
                    label: 'Đã hủy',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-600',
                    borderColor: 'border-gray-300',
                };
            default:
                return {
                    label: status,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-600',
                    borderColor: 'border-gray-300',
                };
        }
    };

    const handleViewDetails = (id) => {
        console.log('[Xem chi tiết] lịch hẹn:', id);
    };

    const handleViewMedicalRecord = (id) => {
        console.log('[Xem hồ sơ bệnh án] lịch hẹn:', id);
    };

    const handleBookNew = () => {
        navigate('/patient/appointments');
    };

    if (loading) {
        return (
            <div className="flex h-full">
                <main className="flex-1 p-4 xl:p-6 flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                    <p className="text-gray-500 text-base mt-4">Đang tải lịch hẹn...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            {/* TRẢ LẠI CUỘN CHO TOÀN TRANG (overflow-y-auto) */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* Thêm flex-1 để khối này kéo dài hết main */
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1"
                >
                    {/* Header Box */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 sm:pl-4 transition-all duration-500">
                            <h1 className="text-2xl font-bold text-primary">Lịch hẹn của bạn</h1>
                            <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các lịch khám</p>
                        </div>
                        <button
                            onClick={handleBookNew}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-md font-bold hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Đặt lịch mới</span>
                        </button>
                    </header>

                    {/* Content Box: Thêm flex-1 để tự động giãn đầy không gian trống phía dưới */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1">
                        {/* Filters Area */}
                        <div className="mb-6 pb-4 border-b border-gray-100 shrink-0">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        {filterTabs.map((tab) => (
                                            <button
                                                key={tab.value}
                                                onClick={() => setActiveFilter(tab.value)}
                                                className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 cursor-pointer ${
                                                    activeFilter === tab.value
                                                        ? 'bg-primary text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dropdown lọc theo thời gian */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-md hover:border-primary transition-colors cursor-pointer"
                                    >
                                        <Filter className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-semibold text-gray-700">
                                            {timeFilters.find((f) => f.value === timeFilter)?.label}
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 text-gray-600 transition-transform ${
                                                showTimeDropdown ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {showTimeDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                            {timeFilters.map((filter) => (
                                                <button
                                                    key={filter.value}
                                                    onClick={() => {
                                                        setTimeFilter(filter.value);
                                                        setShowTimeDropdown(false);
                                                    }}
                                                    className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors cursor-pointer ${
                                                        timeFilter === filter.value
                                                            ? 'bg-green-50 text-primary'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Danh sách lịch hẹn */}
                        <div className="space-y-4">
                            {filteredAppointments.length > 0 ? (
                                <>
                                    {filteredAppointments.map((appointment) => {
                                        const statusConfig = getStatusConfig(appointment.status);
                                        const isProcessing =
                                            grantingId === appointment.id || revokingId === appointment.id;

                                        return (
                                            <div
                                                key={appointment.id}
                                                className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-primary/30"
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                    {/* Ngày & Giờ */}
                                                    <div className="flex items-center gap-4 lg:w-48 shrink-0">
                                                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-md">
                                                            <Calendar className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">
                                                                {appointment.date}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                                                                <Clock className="w-4 h-4" />
                                                                <span>{appointment.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Dịch vụ & Bác sĩ */}
                                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div>
                                                                <div className="font-bold text-gray-900">
                                                                    {appointment.serviceName}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Trạng thái */}
                                                        <div>
                                                            <div
                                                                className={`inline-flex items-center px-4 py-2 rounded-md border-2 font-bold text-sm ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                                                            >
                                                                {statusConfig.label}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Các nút hành động */}
                                                    <div className="grid grid-cols-2 gap-2 w-full lg:w-auto shrink-0">
                                                        {appointment.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => handleCancel(appointment.id)}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-md font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                <span>Hủy lịch</span>
                                                            </button>
                                                        )}

                                                        {appointment.status === 'CONFIRMED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleGrantAccess(appointment)}
                                                                    disabled={
                                                                        isProcessing || !!grantingId || !!revokingId
                                                                    }
                                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {grantingId === appointment.id ? (
                                                                        <>
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                            <span>Đang xử lý...</span>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                            <span className="hidden sm:inline">
                                                                                Cấp quyền
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </button>

                                                                <button
                                                                    onClick={() => handleRevokeAccess(appointment)}
                                                                    disabled={
                                                                        isProcessing || !!grantingId || !!revokingId
                                                                    }
                                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-red-300 text-red-600 rounded-md font-semibold hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {revokingId === appointment.id ? (
                                                                        <>
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                            <span>Đang xử lý...</span>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <ShieldOff className="w-4 h-4" />
                                                                            <span className="hidden sm:inline">
                                                                                Thu hồi
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            </>
                                                        )}

                                                        {appointment.status === 'COMPLETED' && (
                                                            <button
                                                                onClick={() => handleViewMedicalRecord(appointment.id)}
                                                                className="flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white rounded-md font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                <span>Xem hồ sơ</span>
                                                            </button>
                                                        )}

                                                        {appointment.status === 'CANCELLED' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAppointment(appointment);
                                                                    setIsOpen(true);
                                                                }}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-600 rounded-md font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                                                            >
                                                                <CalendarCheck className="w-4 h-4" />
                                                                <span>Đặt lại</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {appointment.description && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                            <span className="text-gray-600">
                                                                {appointment.description}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                /* Căn giữa dọc khi trạng thái rỗng */
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Calendar className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có lịch hẹn nào</h3>
                                    <p className="text-gray-500 mb-6 max-w-sm">
                                        Đặt lịch khám ngay hôm nay để được chăm sóc sức khỏe tốt nhất.
                                    </p>
                                    <button
                                        onClick={handleBookNew}
                                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-md font-bold hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Đặt lịch ngay</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal đổi lịch */}
                    <RescheduleAppointmentModal
                        isOpen={open}
                        onClose={() => {
                            setIsOpen(false);
                            setSelectedAppointment(null);
                        }}
                        onConfirm={handleReschedule}
                        currentAppointment={selectedAppointment}
                    />
                </motion.div>
            </main>
        </div>
    );
}
