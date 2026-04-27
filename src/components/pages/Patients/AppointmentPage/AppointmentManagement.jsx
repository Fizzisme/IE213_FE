import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    User,
    FileText,
    X,
    Eye,
    ChevronDown,
    Plus,
    Filter,
    Stethoscope,
    Droplet,
    Salad,
    CalendarCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

import RescheduleAppointmentModal from './components/RescheduleAppointmentModal';
import { patientService } from '@/services/patientService.js';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

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

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await patientService.getAppointments();
                setAppointments(res?.data || []);
            } catch (err) {
                toast.error(err || 'Lỗi khi đặt hẹn');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const handleReschedule = async ({ appointmentDateTime, description }) => {
        try {
            const res = await patientService.rescheduleAppointment(selectedAppointment.id, {
                appointmentDateTime,
                description,
            });
            if (res) {
                toast.success('Đổi lịch thành công');
                const res2 = await patientService.getAppointments();
                setAppointments(res2?.data || []);
            }
            setIsOpen(false);
        } catch (err) {
            toast.error(err || 'Lỗi khi đổi lịch');
        }
    };

    const handleCancel = async (appointmentId) => {
        try {
            await patientService.cancelAppointment(appointmentId);
            toast.success('Hủy lịch thành công');
            const res = await patientService.getAppointments();
            setAppointments(res?.data || []);
        } catch (e) {
            toast.error(e || 'Hủy lịch thất bại');
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
            time: dateObj.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            }),

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
                    bgColor: 'bg-green-100',
                    textColor: 'text-blue-700',
                    borderColor: 'border-green-300',
                };
            case 'CANCELLED':
                return {
                    label: 'Đã hủy',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-600',
                    borderColor: 'border-gray-300',
                };
        }
    };

    const handleViewDetails = (id) => {
        console.log('Xem chi tiết lịch hẹn:', id);
    };

    const handleViewMedicalRecord = (id) => {
        console.log('Xem hồ sơ bệnh án:', id);
    };

    const handleBookNew = () => {
        navigate('/patient/appointments');
    };

    if (loading) {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0d7b6d] rounded-full animate-spin" />
                    <p className="text-gray-500 text-base">Đang tải lịch hẹn...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            <main className="flex-1 p-4 lg:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Lịch hẹn của bạn</h1>
                                <p className="text-gray-500 text-base md:text-lg">Quản lý và theo dõi các lịch khám</p>
                            </div>
                            <button
                                onClick={handleBookNew}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Đặt lịch mới</span>
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="mb-6 bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Tabs Filter */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        {filterTabs.map((tab) => (
                                            <button
                                                key={tab.value}
                                                onClick={() => setActiveFilter(tab.value)}
                                                className={`
                    px-4 py-2 rounded-lg font-semibold transition-all duration-300
                    ${
                        activeFilter === tab.value
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Filter Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0d7b6d] transition-colors"
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
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                            {timeFilters.map((filter) => (
                                                <button
                                                    key={filter.value}
                                                    onClick={() => {
                                                        setTimeFilter(filter.value);
                                                        setShowTimeDropdown(false);
                                                    }}
                                                    className={`
                      w-full px-4 py-3 text-left text-sm font-semibold transition-colors
                      ${timeFilter === filter.value ? 'bg-green-50 text-[#0d7b6d]' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Appointments List */}
                        {filteredAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAppointments.map((appointment) => {
                                    const statusConfig = getStatusConfig(appointment.status);

                                    return (
                                        <div
                                            key={appointment.id}
                                            className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-green-200"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Left Section - Date & Time */}
                                                <div className="flex items-center gap-4 lg:w-48 shrink-0">
                                                    <div className="p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
                                                        <Calendar className="w-6 h-6 text-textColor" />
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

                                                {/* Middle Section - Service Info */}
                                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                                            {appointment.serviceIcon}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">
                                                                {appointment.serviceName}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                                                <User className="w-4 h-4" />
                                                                <span>
                                                                    {appointment.doctorName || 'Đang chờ phân công'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div>
                                                        <div
                                                            className={`
                          inline-flex items-center px-4 py-2 rounded-lg border-2 font-bold text-sm
                          ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}
                        `}
                                                        >
                                                            {statusConfig.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Section - Actions */}
                                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                                    {appointment.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleCancel(appointment.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span>Hủy lịch</span>
                                                        </button>
                                                    )}

                                                    {appointment.status === 'CONFIRMED' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleViewDetails(appointment.id)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#0d7b6d] text-[#0d7b6d] rounded-lg font-semibold hover:bg-green-50 transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                <span>Xem chi tiết</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewDetails(appointment.id)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 text-blue-700 rounded-lg font-semibold hover:bg-green-100 transition-colors"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                <span className="hidden md:inline">Chuẩn bị hồ sơ</span>
                                                                <span className="md:hidden">Hồ sơ</span>
                                                            </button>
                                                        </>
                                                    )}

                                                    {appointment.status === 'COMPLETED' && (
                                                        <button
                                                            onClick={() => handleViewMedicalRecord(appointment.id)}
                                                            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            <span>Xem hồ sơ bệnh án</span>
                                                        </button>
                                                    )}

                                                    {appointment.status === 'CANCELLED' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAppointment(appointment);
                                                                setIsOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                                        >
                                                            <CalendarCheck className="w-4 h-4" />
                                                            <span>Đặt lại</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description (if exists) */}
                                            {appointment.description && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                        <span className="text-gray-600">{appointment.description}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Calendar className="w-10 h-10 text-textColor" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Bạn chưa có lịch hẹn nào</h3>
                                    <p className="text-gray-500 mb-6">
                                        Đặt lịch khám ngay để được chăm sóc sức khỏe tốt nhất
                                    </p>
                                    <button
                                        onClick={handleBookNew}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Đặt lịch ngay</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Modal */}
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
