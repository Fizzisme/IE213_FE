import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, FileText, Stethoscope, Droplet, Salad, Info, BadgeDollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { patientService } from '@/services/patientService.js';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const unwrap = (res) => res?.data ?? res;

export default function AppointmentBooking() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [patientDescription, setPatientDescription] = useState('');

    const [services, setServices] = useState([]);
    const [isCreating, setIsCreating] = useState(false);

    // Tải danh sách dịch vụ khi component mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await patientService.getServices();
                const payload = unwrap(res);
                setServices(Array.isArray(payload) ? payload : []);
            } catch (err) {
                console.error('[Dịch vụ] Lỗi tải danh sách dịch vụ:', err);
                toast.error('Không thể tải danh sách dịch vụ');
            }
        };

        fetchServices();
    }, []);

    // Tạo danh sách 7 ngày từ hôm nay
    const dates = useMemo(() => {
        const result = [];
        const today = new Date();

        for (let i = 0; i < 7; i += 1) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            result.push({
                index: i,
                dateObj: date,
                day: date.getDate(),
                dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                fullDate: date.toLocaleDateString('vi-VN'),
            });
        }

        return result;
    }, []);

    const timeSlots = [
        { time: '08:00', available: true },
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: false },
        { time: '16:00', available: true },
    ];

    const selectedDateObj = selectedDate !== null ? dates[selectedDate] : null;
    const selectedServiceObj = services.find((s) => s._id === selectedService);

    const isFormValid = Boolean(selectedDateObj && selectedTime && selectedService);

    const getServiceIcon = (name) => {
        if (!name) return <FileText className="w-5 h-5" />;
        const lower = name.toLowerCase();
        if (lower.includes('duong huyet')) return <Droplet className="w-5 h-5" />;
        if (lower.includes('dinh duong')) return <Salad className="w-5 h-5" />;
        return <Stethoscope className="w-5 h-5" />;
    };

    // Ghép ngày và giờ thành chuỗi ISO
    const buildDateTime = () => {
        if (!selectedDateObj || !selectedTime) return null;

        const date = new Date(selectedDateObj.dateObj.getTime());
        const [hour, minute] = selectedTime.split(':').map(Number);

        date.setHours(hour);
        date.setMinutes(minute);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date.toISOString();
    };

    const resetForm = () => {
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedService(null);
        setPatientDescription('');
    };

    // Xác nhận đặt lịch — sau khi thành công reset form ngay,
    // việc cấp quyền sẽ thực hiện ở trang "Lịch hẹn của bạn"
    // sau khi bác sĩ xác nhận (status CONFIRMED)
    const handleConfirm = async () => {
        if (!isFormValid || isCreating) return;

        setIsCreating(true);
        try {
            const payload = {
                appointmentDateTime: buildDateTime(),
                serviceId: selectedService,
                patientDescription,
            };

            const res = await patientService.createAppointment(payload);
            const data = unwrap(res);

            if (!data?.data?._id) {
                throw new Error('Phản hồi từ server không hợp lệ');
            }

            toast.success('Đặt lịch thành công! Vào mục "Lịch hẹn" để cấp quyền sau khi bác sĩ xác nhận.');
            resetForm();
        } catch (err) {
            console.error('[Đặt lịch] Lỗi:', err);
            toast.error(err?.message || 'Tạo lịch hẹn không thành công');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex h-full">
            {/* MAIN CONTAINER */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto"
                >
                    {/* Header Box */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 sm:pl-4 transition-all duration-500">
                            <h1 className="text-2xl font-bold text-primary">Đặt lịch khám</h1>
                            <p className="text-gray-500 text-sm mt-1">Lựa chọn thời gian và dịch vụ để đăng ký khám</p>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
                        {/* ===== CỘT TRÁI: Form đặt lịch ===== */}
                        <div className="space-y-6">
                            {/* Chọn ngày */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-bold text-gray-900">Chọn ngày</h2>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3 whitespace-nowrap">
                                    {dates.map((date) => (
                                        <button
                                            key={date.index}
                                            onClick={() => setSelectedDate(date.index)}
                                            className={cx(
                                                'relative p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
                                                selectedDate === date.index
                                                    ? 'border-primary bg-green-50 shadow-md scale-[1.02]'
                                                    : 'border-gray-100 bg-gray-50 hover:border-primary/50 hover:bg-white',
                                            )}
                                        >
                                            <div className="text-center">
                                                <div
                                                    className={cx(
                                                        'text-xs font-semibold mb-1',
                                                        selectedDate === date.index ? 'text-primary' : 'text-gray-500',
                                                    )}
                                                >
                                                    {date.dayName}
                                                </div>
                                                <div
                                                    className={cx(
                                                        'text-lg sm:text-xl font-bold',
                                                        selectedDate === date.index ? 'text-primary' : 'text-gray-900',
                                                    )}
                                                >
                                                    {date.day}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chọn giờ */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-bold text-gray-900">Chọn giờ</h2>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot.time}
                                            onClick={() => slot.available && setSelectedTime(slot.time)}
                                            disabled={!slot.available}
                                            className={cx(
                                                'p-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base border-2',
                                                !slot.available
                                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100'
                                                    : selectedTime === slot.time
                                                    ? 'bg-primary text-white border-primary shadow-md scale-[1.02] cursor-pointer'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-primary/50 cursor-pointer',
                                            )}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chọn dịch vụ */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-bold text-gray-900">Chọn dịch vụ</h2>
                                </div>

                                <div className="space-y-3">
                                    {services.map((service) => {
                                        const active = selectedService === service._id;
                                        return (
                                            <button
                                                key={service._id}
                                                onClick={() => setSelectedService(service._id)}
                                                className={cx(
                                                    'w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 cursor-pointer',
                                                    active
                                                        ? 'border-primary bg-green-50 shadow-sm'
                                                        : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-primary/50',
                                                )}
                                            >
                                                <div
                                                    className={cx(
                                                        'p-3 rounded-lg transition-colors',
                                                        active
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white text-gray-500 border border-gray-200',
                                                    )}
                                                >
                                                    {getServiceIcon(service.name)}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div
                                                        className={cx(
                                                            'font-bold text-base',
                                                            active ? 'text-primary' : 'text-gray-900',
                                                        )}
                                                    >
                                                        {service.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                        {service.description || 'Dịch vụ y tế chuyên nghiệp'}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mô tả triệu chứng */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <label className="block text-lg font-bold text-gray-900 mb-3">Mô tả triệu chứng</label>
                                <textarea
                                    value={patientDescription}
                                    onChange={(e) => setPatientDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Mô tả triệu chứng của bạn để bác sĩ chuẩn bị tốt hơn..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none text-sm sm:text-base bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* ===== CỘT PHẢI: Tóm tắt lịch khám ===== */}
                        <div className="lg:sticky lg:top-8 h-fit">
                            <div className="bg-white rounded-2xl p-6 shadow flex flex-col h-full">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt thông tin</h2>

                                {/* Thông tin đã chọn */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-primary">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-500 mb-1">Ngày hẹn</div>
                                            <div className="font-bold text-base text-gray-900">
                                                {selectedDateObj ? selectedDateObj.fullDate : '---'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-primary">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-500 mb-1">Giờ hẹn</div>
                                            <div className="font-bold text-base text-gray-900">
                                                {selectedTime || '---'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-primary">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-500 mb-1">Dịch vụ</div>
                                            <div className="font-bold text-base text-gray-900">
                                                {selectedServiceObj?.name || '---'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Giá tiền */}
                                <div className="mb-6 p-5 bg-gradient-to-r from-primary to-[#04d3b8] rounded-xl text-white shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BadgeDollarSign className={'h-4 w-4 lg:h-6 lg:w-6'} />
                                            <span className="font-semibold text-base">Phí dịch vụ</span>
                                        </div>
                                        <div className="text-xl sm:text-2xl font-bold">
                                            {selectedServiceObj?.price?.toLocaleString('vi-VN') || '---'}
                                        </div>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                <div className="mb-6 p-4 rounded-xl bg-secondary/20 text-primary text-sm flex items-start gap-2">
                                    <Info className={'h-4 w-4 lg:h-6 lg:w-6'} />
                                    <span>
                                        Sau khi đặt lịch, vui lòng vào mục <b>Lịch hẹn của bạn</b> để cấp quyền truy cập
                                        hồ sơ khi bác sĩ xác nhận.
                                    </span>
                                </div>

                                {/* Buttons */}
                                <div className="space-y-3 mt-auto">
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!isFormValid || isCreating}
                                        className={cx(
                                            'w-full py-3 sm:py-4 rounded-xl font-bold text-white transition-all duration-300 text-sm sm:text-base cursor-pointer',
                                            isFormValid && !isCreating
                                                ? 'bg-primary hover:bg-primary/80 shadow-md hover:shadow-lg'
                                                : 'bg-gray-300 cursor-not-allowed',
                                        )}
                                    >
                                        {isCreating ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        disabled={isCreating}
                                        className="w-full py-3 sm:py-4 rounded-xl font-bold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        Hủy thiết lập
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
