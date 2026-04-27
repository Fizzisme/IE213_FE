import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, FileText, Stethoscope, Droplet, Salad, DollarSign } from 'lucide-react';
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

            console.log('[Đặt lịch] Gửi payload:', payload);
            const res = await patientService.createAppointment(payload);
            const data = unwrap(res);
            console.log(data);
            if (!data?.data?._id) {
                throw new Error('Phản hồi từ server không hợp lệ');
            }

            console.log('[Đặt lịch] Thành công, appointmentId:', data.data._id);

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
            <main className="flex-1 p-4 lg:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 md:gap-8">
                            {/* ===== CỘT TRÁI: Form đặt lịch ===== */}
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                        Đặt lịch khám
                                    </h1>
                                    <p className="text-sm sm:text-base text-gray-500">
                                        Đặt lịch khám và theo dõi sức khỏe
                                    </p>
                                </div>

                                {/* Chọn ngày */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <Calendar className="w-5 h-5 text-[#0d7b6d]" />
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Chọn ngày</h2>
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3 whitespace-nowrap">
                                        {dates.map((date) => (
                                            <button
                                                key={date.index}
                                                onClick={() => setSelectedDate(date.index)}
                                                className={cx(
                                                    'relative p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300',
                                                    selectedDate === date.index
                                                        ? 'border-[#0d7b6d] bg-gradient-to-br from-green-50 to-green-100 shadow-md scale-105'
                                                        : 'border-gray-200 bg-white hover:border-[#0d7b6d] hover:shadow-sm',
                                                )}
                                            >
                                                <div className="text-center">
                                                    <div
                                                        className={cx(
                                                            'text-xs font-semibold mb-1',
                                                            selectedDate === date.index
                                                                ? 'text-[#0d7b6d]'
                                                                : 'text-gray-500',
                                                        )}
                                                    >
                                                        {date.dayName}
                                                    </div>
                                                    <div
                                                        className={cx(
                                                            'text-lg sm:text-xl md:text-2xl font-bold',
                                                            selectedDate === date.index
                                                                ? 'text-[#0d7b6d]'
                                                                : 'text-gray-900',
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
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <Clock className="w-5 h-5 text-[#0d7b6d]" />
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Chọn giờ</h2>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                                disabled={!slot.available}
                                                className={cx(
                                                    'p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base',
                                                    !slot.available
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                                                        : selectedTime === slot.time
                                                        ? 'bg-[#0d7b6d] text-white shadow-lg border-2 border-[#0d7b6d] scale-105'
                                                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#0d7b6d] hover:shadow-md',
                                                )}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Chọn dịch vụ */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <FileText className="w-5 h-5 text-[#0d7b6d]" />
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Chọn dịch vụ</h2>
                                    </div>

                                    <div className="space-y-3">
                                        {services.map((service) => {
                                            const active = selectedService === service._id;
                                            return (
                                                <button
                                                    key={service._id}
                                                    onClick={() => setSelectedService(service._id)}
                                                    className={cx(
                                                        'w-full p-5 rounded-xl border-2 transition-all duration-300 flex items-center gap-4',
                                                        active
                                                            ? 'border-[#0d7b6d] bg-gradient-to-r from-green-50 to-green-100 shadow-md'
                                                            : 'border-gray-200 bg-white hover:border-[#0d7b6d] hover:shadow-sm',
                                                    )}
                                                >
                                                    <div
                                                        className={cx(
                                                            'p-3 rounded-lg transition-colors',
                                                            active
                                                                ? 'bg-[#0d7b6d] text-white'
                                                                : 'bg-gray-100 text-gray-600',
                                                        )}
                                                    >
                                                        {getServiceIcon(service.name)}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div
                                                            className={cx(
                                                                'font-bold',
                                                                active ? 'text-[#0d7b6d]' : 'text-gray-900',
                                                            )}
                                                        >
                                                            {service.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {service.description || 'Dịch vụ y tế'}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Mô tả triệu chứng */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">
                                        Mô tả triệu chứng
                                    </label>
                                    <textarea
                                        value={patientDescription}
                                        onChange={(e) => setPatientDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Mô tả triệu chứng của bạn để bác sĩ chuẩn bị tốt hơn..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0d7b6d] transition-colors resize-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            {/* ===== CỘT PHẢI: Tóm tắt lịch khám ===== */}
                            <div className="lg:sticky lg:top-8 h-fit">
                                <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                                        Tóm tắt lịch khám
                                    </h2>

                                    {/* Thông tin đã chọn */}
                                    <div className="space-y-3 sm:space-y-5 mb-6">
                                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                                            <Calendar className="w-5 h-5 text-[#0d7b6d] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Ngày</div>
                                                <div className="font-bold text-sm sm:text-base text-gray-900">
                                                    {selectedDateObj ? selectedDateObj.fullDate : '---'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                                            <Clock className="w-5 h-5 text-[#0d7b6d] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Giờ</div>
                                                <div className="font-bold text-sm sm:text-base text-gray-900">
                                                    {selectedTime || '---'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                                            <FileText className="w-5 h-5 text-[#0d7b6d] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Dịch vụ</div>
                                                <div className="font-bold text-sm sm:text-base text-gray-900">
                                                    {selectedServiceObj?.name || '---'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Giá tiền */}
                                    <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#0d7b6d] to-[#04d3b8] rounded-lg text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-5 h-5" />
                                                <span className="font-semibold text-sm sm:text-base">Phí dịch vụ</span>
                                            </div>
                                            <div className="text-xl sm:text-2xl font-bold">
                                                {selectedServiceObj?.price?.toLocaleString('vi-VN') || '---'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ghi chú hướng dẫn cấp quyền */}
                                    <div className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs sm:text-sm">
                                        💡 Sau khi đặt lịch, vào mục <b>Lịch hẹn của bạn</b> để cấp quyền truy cập hồ sơ
                                        khi bác sĩ xác nhận.
                                    </div>

                                    {/* Các nút hành động */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleConfirm}
                                            disabled={!isFormValid || isCreating}
                                            className={cx(
                                                'w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-white transition-all duration-300 text-sm sm:text-base',
                                                isFormValid && !isCreating
                                                    ? 'bg-[#0d7b6d] hover:bg-green-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                                    : 'bg-gray-300 cursor-not-allowed',
                                            )}
                                        >
                                            {isCreating ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            disabled={isCreating}
                                            className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-gray-700 border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
