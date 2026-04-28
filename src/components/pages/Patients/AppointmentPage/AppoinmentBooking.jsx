import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, FileText, Stethoscope, Droplet, Salad, Info, BadgeDollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { patientService } from '@/services/patientService.js';

/**
 * Hàm tiện ích: Ghép các class CSS có điều kiện thành một chuỗi duy nhất.
 * Lọc bỏ các giá trị falsy (null, undefined, false) trước khi nối lại.
 */
const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Hàm tiện ích: Chuẩn hóa cấu trúc phản hồi từ API.
 * Lưu ý: Một số endpoint trả về { data: [...] }, một số trả về thẳng [...].
 * Hàm này đảm bảo luôn lấy được payload thực sự, bất kể cấu trúc bọc ngoài.
 */
const unwrap = (res) => res?.data ?? res;

/**
 * Component AppointmentBooking
 * Trang đặt lịch khám dành cho Bệnh nhân.
 * Cho phép chọn ngày, giờ, dịch vụ và nhập mô tả triệu chứng
 * trước khi xác nhận tạo lịch hẹn với bác sĩ.
 */
export default function AppointmentBooking() {
    // Quản lý trạng thái các lựa chọn của người dùng trên form
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [patientDescription, setPatientDescription] = useState('');

    // Danh sách dịch vụ tải về từ API và trạng thái loading khi submit
    const [services, setServices] = useState([]);
    const [isCreating, setIsCreating] = useState(false);

    /**
     * Side Effect: Tải danh sách dịch vụ khám khi component lần đầu mount.
     * Mảng dependency rỗng [] đảm bảo chỉ gọi API đúng một lần duy nhất.
     */
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

    /**
     * Tối ưu hóa hiệu suất (Performance) bằng kỹ thuật Memoization.
     * Sử dụng useMemo để tính toán danh sách 7 ngày kế tiếp đúng một lần,
     * tránh tính lại mỗi khi component re-render vì lý do không liên quan.
     * Lưu ý: Tháng trong đối tượng Date của JavaScript bắt đầu từ 0 (tháng 3 là index 2).
     */
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

    /**
     * Dữ liệu các khung giờ khám cố định trong ngày.
     * Lưu ý: Thuộc tính available=false đánh dấu giờ đã kín — button sẽ bị disabled,
     * không cho phép người dùng chọn.
     */
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

    // Tra cứu object đầy đủ của ngày và dịch vụ đang được chọn từ danh sách
    const selectedDateObj = selectedDate !== null ? dates[selectedDate] : null;
    const selectedServiceObj = services.find((s) => s._id === selectedService);

    // Form chỉ hợp lệ khi cả 3 trường bắt buộc đều đã được chọn
    const isFormValid = Boolean(selectedDateObj && selectedTime && selectedService);

    /**
     * Hàm trả về icon phù hợp dựa trên tên dịch vụ.
     * Lưu ý: So sánh theo chuỗi tiếng Việt không dấu (lowercase) để tránh lỗi encoding.
     * Mặc định trả về icon FileText nếu không khớp bất kỳ điều kiện nào.
     */
    const getServiceIcon = (name) => {
        if (!name) return <FileText className="w-5 h-5" />;
        const lower = name.toLowerCase();
        if (lower.includes('duong huyet')) return <Droplet className="w-5 h-5" />;
        if (lower.includes('dinh duong')) return <Salad className="w-5 h-5" />;
        return <Stethoscope className="w-5 h-5" />;
    };

    /**
     * Hàm xây dựng chuỗi ISO 8601 từ ngày và giờ đã chọn riêng lẻ.
     * Lưu ý: Tạo bản sao của dateObj (getTime()) trước khi setHours để tránh
     * mutate trực tiếp object gốc trong mảng dates — tránh bug khó phát hiện.
     */
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

    // Đưa toàn bộ form về trạng thái ban đầu sau khi đặt lịch thành công hoặc người dùng hủy
    const resetForm = () => {
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedService(null);
        setPatientDescription('');
    };

    /**
     * Xử lý sự kiện xác nhận đặt lịch.
     * Lưu ý: Reset form ngay sau khi API thành công — không chờ bác sĩ xác nhận.
     * Việc cấp quyền truy cập hồ sơ được thực hiện riêng ở trang "Lịch hẹn của bạn"
     * sau khi bác sĩ chuyển trạng thái lịch hẹn sang CONFIRMED.
     */
    const handleConfirm = async () => {
        // Chặn submit khi form chưa hợp lệ hoặc đang trong quá trình gọi API
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
            // Luôn tắt trạng thái loading dù thành công hay thất bại
            setIsCreating(false);
        }
    };

    return (
        <div className="flex h-full">
            {/* ================= MAIN CONTAINER ================= */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                {/* Sử dụng motion.div từ framer-motion để tạo hiệu ứng trượt nhẹ (y: 30 -> 0) khi trang tải */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto"
                >
                    {/* ================= PHẦN HEADER TỔNG QUAN ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 sm:pl-4 transition-all duration-500">
                            <h1 className="text-2xl font-bold text-primary">Đặt lịch khám</h1>
                            <p className="text-gray-500 text-sm mt-1">Lựa chọn thời gian và dịch vụ để đăng ký khám</p>
                        </div>
                    </header>

                    {/* Layout 2 cột: Cột trái (60%) chứa form, Cột phải (40%) chứa tóm tắt */}
                    <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
                        {/* ===== CỘT TRÁI: Form đặt lịch ===== */}
                        <div className="space-y-6">
                            {/* ================= CHỌN NGÀY ================= */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-bold text-gray-900">Chọn ngày</h2>
                                </div>

                                {/* Hiển thị 7 ngày kế tiếp dưới dạng các nút bấm có thể chọn */}
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
                                                {/* Tên thứ trong tuần (Th 2, Th 3...) */}
                                                <div
                                                    className={cx(
                                                        'text-xs font-semibold mb-1',
                                                        selectedDate === date.index ? 'text-primary' : 'text-gray-500',
                                                    )}
                                                >
                                                    {date.dayName}
                                                </div>
                                                {/* Số ngày trong tháng */}
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

                            {/* ================= CHỌN GIỜ ================= */}
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
                                                // 3 trạng thái hiển thị: đã kín (xám) | đang chọn (xanh đậm) | còn trống (trắng)
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

                            {/* ================= CHỌN DỊCH VỤ ================= */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-bold text-gray-900">Chọn dịch vụ</h2>
                                </div>

                                <div className="space-y-3">
                                    {services.map((service) => {
                                        // Kiểm tra dịch vụ này có đang được chọn không để áp dụng style active
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
                                                {/* Icon dịch vụ — nền xanh khi active, nền trắng khi chưa chọn */}
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
                                                    {/* Giới hạn mô tả 2 dòng bằng line-clamp để tránh vỡ layout */}
                                                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                        {service.description || 'Dịch vụ y tế chuyên nghiệp'}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ================= MÔ TẢ TRIỆU CHỨNG ================= */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <label className="block text-lg font-bold text-gray-900 mb-3">Mô tả triệu chứng</label>
                                {/* Trường tùy chọn — giúp bác sĩ chuẩn bị trước khi khám */}
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
                        {/* sticky giữ panel này cố định khi người dùng cuộn cột trái */}
                        <div className="lg:sticky lg:top-8 h-fit">
                            <div className="bg-white rounded-2xl p-6 shadow flex flex-col h-full">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt thông tin</h2>

                                {/* ================= THÔNG TIN ĐÃ CHỌN ================= */}
                                <div className="space-y-4 mb-8">
                                    {/* Hiển thị '---' khi chưa có lựa chọn để tránh ô trống gây mất thẩm mỹ */}
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

                                {/* ================= PHÍ DỊCH VỤ ================= */}
                                {/* Gradient từ màu primary sang accent để tạo điểm nhấn thị giác */}
                                <div className="mb-6 p-5 bg-gradient-to-r from-primary to-[#04d3b8] rounded-xl text-white shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BadgeDollarSign className={'h-4 w-4 lg:h-6 lg:w-6'} />
                                            <span className="font-semibold text-base">Phí dịch vụ</span>
                                        </div>
                                        {/* Định dạng số tiền theo chuẩn tiếng Việt (dấu chấm phân cách hàng nghìn) */}
                                        <div className="text-xl sm:text-2xl font-bold">
                                            {selectedServiceObj?.price?.toLocaleString('vi-VN') || '---'}
                                        </div>
                                    </div>
                                </div>

                                {/* ================= GHI CHÚ QUY TRÌNH ================= */}
                                <div className="mb-6 p-4 rounded-xl bg-secondary/20 text-primary text-sm flex items-start gap-2">
                                    <Info className={'h-4 w-4 lg:h-6 lg:w-6'} />
                                    <span>
                                        Sau khi đặt lịch, vui lòng vào mục <b>Lịch hẹn của bạn</b> để cấp quyền truy cập
                                        hồ sơ khi bác sĩ xác nhận.
                                    </span>
                                </div>

                                {/* ================= NÚT HÀNH ĐỘNG ================= */}
                                <div className="space-y-3 mt-auto">
                                    {/* Nút xác nhận: disabled khi form chưa hợp lệ hoặc đang gọi API */}
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
                                        {/* Phản hồi trực quan: đổi label thành "Đang xử lý..." khi đang gọi API */}
                                        {isCreating ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                                    </button>

                                    {/* Nút hủy: reset toàn bộ form về trạng thái ban đầu */}
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
