import { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, FileText, Stethoscope, Droplet, Salad, User, DollarSign } from 'lucide-react';
import api from '../../../../utils/api';
import { motion } from 'framer-motion';

export default function AppointmentBooking() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [patientDescription, setPatientDescription] = useState('');

    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // ================= FETCH SERVICES =================
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoadingServices(true);
                const res = await api.get('/patients/services');
                setServices(res.data.data || []);
            } catch (err) {
                console.error('Fetch services error:', err);
            } finally {
                setLoadingServices(false);
            }
        };

        fetchServices();
    }, []);

    // ================= ICON =================
    const getServiceIcon = (name) => {
        if (!name) return <FileText className="w-5 h-5" />;
        if (name.toLowerCase().includes('đường huyết')) return <Droplet className="w-5 h-5" />;
        if (name.toLowerCase().includes('dinh dưỡng')) return <Salad className="w-5 h-5" />;
        return <Stethoscope className="w-5 h-5" />;
    };

    // ================= DATES =================
    const dates = useMemo(() => {
        const result = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            result.push({
                dateObj: date, // QUAN TRỌNG (dùng để build ISO)
                day: date.getDate(),
                dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                fullDate: date.toLocaleDateString('vi-VN'),
                index: i,
            });
        }

        return result;
    }, []);

    // ================= TIME =================
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

    // ================= DERIVED =================
    const selectedDateObj = selectedDate !== null ? dates[selectedDate] : null;

    const selectedServiceObj = services.find((s) => s._id === selectedService);

    const isFormValid = Boolean(selectedDateObj && selectedTime && selectedService);

    // ================= BUILD DATETIME =================
    const buildDateTime = () => {
        if (!selectedDateObj || !selectedTime) return null;

        const date = new Date(selectedDateObj.dateObj);
        const [hour, minute] = selectedTime.split(':');

        date.setHours(hour);
        date.setMinutes(minute);
        date.setSeconds(0);

        return date.toISOString();
    };

    // ================= SUBMIT =================
    const handleConfirm = async () => {
        if (!isFormValid) return;

        try {
            const payload = {
                appointmentDateTime: buildDateTime(),
                serviceId: selectedService,
                patientDescription,
            };

            const res = await api.post('/patients/appointments', payload);

            console.log('SUCCESS:', res.data);

            // reset form
            setSelectedDate(null);
            setSelectedTime(null);
            setSelectedService(null);
            setPatientDescription('');

            alert('Lịch khám đã được đặt thành công!');
        } catch (error) {
            console.error('ERROR:', error);
            alert(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    };
    return (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* toàn bộ UI của bạn */}

                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 md:gap-8">
                            {/* Left Column - Booking Form */}
                            <div className="space-y-8">
                                {/* Header */}
                                <div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                        Đặt lịch khám
                                    </h1>
                                    <p className="text-sm sm:text-base text-gray-500">
                                        Lên lịch khám và theo dõi tiểu đường của bạn
                                    </p>
                                </div>

                                {/* Date Selection */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <Calendar className="w-5 h-5 text-[#0d7b6d]" />
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Chọn ngày khám</h2>
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3 whitespace-nowrap">
                                        {dates.map((date) => (
                                            <button
                                                key={date.index}
                                                onClick={() => setSelectedDate(date.index)}
                                                className={`
                    relative p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300
                    ${
                        selectedDate === date.index
                            ? 'border-[#0d7b6d] bg-gradient-to-br from-green-50 to-green-100 shadow-md scale-105'
                            : 'border-gray-200 bg-white hover:border-[#0d7b6d] hover:shadow-sm'
                    }
                  `}
                                            >
                                                <div className="text-center">
                                                    <div
                                                        className={`text-xs font-semibold mb-1 ${
                                                            selectedDate === date.index
                                                                ? 'text-[#0d7b6d]'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {date.dayName}
                                                    </div>
                                                    <div
                                                        className={`text-lg sm:text-xl md:text-2xl font-bold ${
                                                            selectedDate === date.index
                                                                ? 'text-[#0d7b6d]'
                                                                : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {date.day}
                                                    </div>
                                                    {date.index === 0 && (
                                                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-emerald-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-bold">
                                                            Hôm nay
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Selection */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <Clock className="w-5 h-5 text-[#0d7b6d]" />
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Chọn khung giờ</h2>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                                disabled={!slot.available}
                                                className={`
                    p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base
                    ${
                        !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                            : selectedTime === slot.time
                            ? 'bg-primary text-white shadow-lg border-2 border-[#0d7b6d] scale-105'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#0d7b6d] hover:shadow-md'
                    }
                  `}
                                            >
                                                {slot.time}
                                                {!slot.available && <div className="text-xs mt-1">Hết chỗ</div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Service Selection */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <FileText className="w-5 h-5 text-[#0d7b6d]" />
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Chọn dịch vụ</h2>
                                    </div>

                                    <div className="space-y-3">
                                        {services.map((service) => (
                                            <button
                                                key={service._id}
                                                onClick={() => setSelectedService(service._id)}
                                                className={`
                    w-full p-5 rounded-xl border-2 transition-all duration-300 flex items-center gap-4
                    ${
                        selectedService === service._id
                            ? 'border-[#0d7b6d] bg-gradient-to-r from-green-50 to-green-100 shadow-md'
                            : 'border-gray-200 bg-white hover:border-[#0d7b6d] hover:shadow-sm'
                    }
                  `}
                                            >
                                                <div
                                                    className={`
                    p-3 rounded-lg transition-colors
                    ${selectedService === service._id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}
                  `}
                                                >
                                                    {getServiceIcon(service.name)}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div
                                                        className={`font-bold ${
                                                            selectedService === service._id
                                                                ? 'text-[#0d7b6d]'
                                                                : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {service.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {service.price.toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>
                                                <div
                                                    className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${selectedService === service._id ? 'border-[#0d7b6d] bg-primary' : 'border-gray-300'}
                  `}
                                                >
                                                    {selectedService === service._id && (
                                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* patientDescription */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">
                                        Mô tả triệu chứng
                                    </label>
                                    <textarea
                                        value={patientDescription}
                                        onChange={(e) => setPatientDescription(e.target.value)}
                                        placeholder="Mô tả triệu chứng hoặc vấn đề của bạn..."
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0d7b6d] transition-colors resize-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            {/* Right Column - Summary Card */}
                            <div className="lg:sticky lg:top-8 h-fit">
                                <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 sm:p-6 shadow-lg border border-blue-100">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                                        Tóm tắt lịch khám
                                    </h2>

                                    <div className="space-y-3 sm:space-y-5 mb-6">
                                        {/* Date */}
                                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                                            <Calendar className="w-5 h-5 text-[#0d7b6d] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Ngày khám</div>
                                                <div className="font-bold text-sm sm:text-base text-gray-900">
                                                    {selectedDateObj ? selectedDateObj.fullDate : '---'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time */}
                                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                                            <Clock className="w-5 h-5 text-[#0d7b6d] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Giờ khám</div>
                                                <div className="font-bold text-sm sm:text-base text-gray-900">
                                                    {selectedTime || '---'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service */}
                                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                                            <FileText className="w-5 h-5 text-[#0d7b6d] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Dịch vụ</div>
                                                <div className="font-bold text-sm sm:text-base text-gray-900">
                                                    {selectedServiceObj?.name || '---'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {patientDescription && (
                                            <div className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                                                <FileText className="w-5 h-5 text-[#0d7b6d] mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Ghi chú</div>
                                                    <div className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                                                        {patientDescription}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-[#0d7b6d]" />
                                            <div className="text-xs sm:text-sm text-gray-600">
                                                Bác sĩ sẽ được phân công tự động
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost */}
                                    <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#0d7b6d] to-[#04d3b8] rounded-lg text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-5 h-5" />
                                                <span className="font-semibold text-sm sm:text-base">Chi phí khám</span>
                                            </div>
                                            <div className="text-xl sm:text-2xl font-bold">
                                                {selectedServiceObj?.price?.toLocaleString('vi-VN') || '---'}đ
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleConfirm}
                                            disabled={!isFormValid}
                                            className={`
                  w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-white transition-all duration-300 text-sm sm:text-base
                  ${
                      isFormValid
                          ? 'bg-primary hover:bg-green-600 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                          : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
                                        >
                                            Xác nhận đặt lịch
                                        </button>

                                        <button
                                            type="button"
                                            className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-gray-700 border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
    );
}

