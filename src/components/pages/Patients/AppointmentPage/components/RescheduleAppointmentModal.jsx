import { useState, useMemo } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RescheduleAppointmentModal({ isOpen, onClose, onConfirm, currentAppointment }) {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [description, setDescription] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    // =========================
    // Thay thế useEffect bằng kỹ thuật: "Adjusting state during render"
    // Giúp loại bỏ lỗi cascading renders của linter
    // =========================
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [prevAppointment, setPrevAppointment] = useState(currentAppointment);

    if (isOpen !== prevIsOpen || currentAppointment !== prevAppointment) {
        setPrevIsOpen(isOpen);
        setPrevAppointment(currentAppointment);

        if (isOpen && currentAppointment) {
            setIsClosing(false);
            const date = new Date(currentAppointment.appointmentDateTime);
            setSelectedDate(date.toLocaleDateString('vi-VN'));
            setSelectedTime(date.toTimeString().slice(0, 5));
            setDescription(currentAppointment.description || '');
        }
    }

    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const disabledTimes = ['09:00', '14:00'];

    // =========================
    // Generate dates (memo để tránh re-render)
    // =========================
    const dates = useMemo(() => {
        const result = [];
        const today = new Date();
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            result.push({
                dayName: weekdays[date.getDay()],
                dayNumber: date.getDate(),
                fullDate: date.toLocaleDateString('vi-VN'),
                isToday: i === 0,
            });
        }

        return result;
    }, []);

    // =========================
    // Build ISO datetime
    // =========================
    const buildDateTime = () => {
        if (!selectedDate || !selectedTime) return null;

        const [day, month, year] = selectedDate.split('/');
        const [hour, minute] = selectedTime.split(':');

        const localDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

        return localDate.toISOString();
    };

    // =========================
    // Validate thời gian quá khứ
    // =========================
    const isPastTime = () => {
        const iso = buildDateTime();
        if (!iso) return true;

        return new Date(iso) <= new Date();
    };

    // =========================
    // Handle close with animation
    // =========================
    const handleCloseWithAnimation = () => {
        setIsClosing(true);
    };

    // =========================
    // Handle confirm
    // =========================
    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) {
            alert('Vui lòng chọn ngày và giờ khám');
            return;
        }

        if (isPastTime()) {
            alert('Không thể chọn thời gian trong quá khứ');
            return;
        }

        if (!onConfirm) return;

        try {
            const appointmentDateTime = buildDateTime();

            await onConfirm({
                appointmentDateTime,
                description,
            });

            // chỉ đóng khi API thành công
            onClose();
        } catch (err) {
            console.error('Reschedule error:', err);
            alert('Đổi lịch thất bại');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence
            // Di chuyển onAnimationComplete ra đây thành onExitComplete
            // Đảm bảo lấy được state `isClosing` mới nhất thay vì closure cũ
            onExitComplete={() => {
                if (isClosing) {
                    onClose();
                }
            }}
        >
            {isOpen && !isClosing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20"
                    onClick={handleCloseWithAnimation}
                >
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0, y: 40 }}
                        transition={{
                            duration: 0.25,
                            ease: 'easeInOut',
                        }}
                        className="bg-white rounded-2xl w-full max-w-105 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-medium text-gray-900">Đặt lại lịch hẹn</h2>
                            <button
                                onClick={handleCloseWithAnimation}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                            {/* Date Picker */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Chọn ngày khám</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {dates.map((date) => (
                                        <button
                                            key={date.fullDate}
                                            onClick={() => setSelectedDate(date.fullDate)}
                                            className={`
                                                relative flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all duration-200
                                                ${
                                                    selectedDate === date.fullDate
                                                        ? 'bg-primary border-2 border-[#0d7b6d] shadow-md'
                                                        : 'bg-white border border-gray-200 hover:border-[#0d7b6d] hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            {date.isToday && (
                                                <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">
                                                    Hôm nay
                                                </span>
                                            )}
                                            <span
                                                className={`text-xs ${
                                                    selectedDate === date.fullDate ? 'text-blue-200' : 'text-gray-500'
                                                }`}
                                            >
                                                {date.dayName}
                                            </span>
                                            <span
                                                className={`text-sm font-bold mt-1 ${
                                                    selectedDate === date.fullDate ? 'text-white' : 'text-gray-900'
                                                }`}
                                            >
                                                {date.dayNumber}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Picker */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Chọn khung giờ</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((time) => {
                                        const isDisabled = disabledTimes.includes(time);
                                        const isSelected = selectedTime === time;

                                        return (
                                            <button
                                                key={time}
                                                onClick={() => !isDisabled && setSelectedTime(time)}
                                                disabled={isDisabled}
                                                className={`
                                                    py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200
                                                    ${
                                                        isSelected
                                                            ? 'bg-primary border-2 border-[#0d7b6d] text-white shadow-md'
                                                            : isDisabled
                                                            ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                                            : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0d7b6d] hover:shadow-sm'
                                                    }
                                                `}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Mô tả thêm (tùy chọn)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Cập nhật mô tả triệu chứng nếu cần..."
                                    className="w-full min-h-20 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0d7b6d] focus:ring-2 focus:ring-blue-100 transition-all resize-none text-sm text-gray-700"
                                />
                            </div>

                            {/* Summary Card */}
                            {(selectedDate || selectedTime) && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                                        TÓM TẮT
                                    </div>
                                    <div className="space-y-2">
                                        {selectedDate && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 font-semibold">Ngày mới:</span>
                                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                                    <Calendar className="w-4 h-4 text-[#0d7b6d]" />
                                                    <span>{selectedDate}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedTime && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 font-semibold">Giờ mới:</span>
                                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                                    <Clock className="w-4 h-4 text-[#0d7b6d]" />
                                                    <span>{selectedTime}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={handleCloseWithAnimation}
                                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
