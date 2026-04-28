import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, Stethoscope, Microscope, User, Loader2 } from 'lucide-react';
import { patientService } from '@/services/patientService.js';
import { motion } from 'framer-motion';

/**
 * Danh mục nhãn trạng thái (Status Labels)
 * Chuyển đổi mã trạng thái từ backend thành ngôn ngữ tự nhiên để hiển thị cho bệnh nhân.
 */
const STATUS_LABELS = {
    CREATED: 'Đang chờ Lab',
    WAITING_RESULT: 'Lab đang xử lý',
    HAS_RESULT: 'Đã có kết quả Lab',
    DIAGNOSED: 'Đã chẩn đoán',
    COMPLETE: 'Đã hoàn thành',
    COMPLETED: 'Đã hoàn thành',
};

/**
 * Hàm hỗ trợ định dạng tỉ lệ phần trăm (Probability)
 * Chuyển đổi giá trị xác suất từ AI thành dạng % tròn để hiển thị trên UI.
 */
const formatProbability = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
    const numeric = Number(value);
    return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
};

/**
 * Component PatientMedicalRecordDetail
 * Hiển thị chi tiết một hồ sơ y tế cụ thể của bệnh nhân.
 * Bao gồm: Thông tin hành chính, Chỉ định lâm sàng, Kết quả Lab (kèm AI Analysis)
 * và Chẩn đoán cuối cùng từ bác sĩ.
 */
export default function PatientMedicalRecordDetail() {
    const navigate = useNavigate();
    const { medicalRecordId } = useParams(); // Lấy ID hồ sơ từ URL params

    // Quản lý trạng thái dữ liệu, loading và thông báo lỗi
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Side Effect: Tải dữ liệu chi tiết bệnh án khi component mount hoặc ID thay đổi.
     * Luồng: Gọi API -> Chuẩn hóa data object -> Cập nhật State.
     */
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await patientService.getMedicalRecordDetail(medicalRecordId);
                // Xử lý linh hoạt các định dạng response khác nhau từ backend
                const data = res?.data?.data || res?.data || res;
                setRecord(data);
            } catch (err) {
                console.error('[Hồ sơ y tế] Lỗi tải chi tiết:', err);
                setError(err.message || 'Không thể tải chi tiết bệnh án.');
            } finally {
                setLoading(false);
            }
        };

        if (medicalRecordId) fetchDetail();
    }, [medicalRecordId]);

    // ================= TRẠNG THÁI LOADING (FULL PAGE) =================
    if (loading) {
        return (
            <div className="flex h-full">
                <main className="flex-1 p-4 xl:p-6 flex flex-col items-center justify-center overflow-hidden">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <span className="font-medium text-gray-500 text-lg">Đang tải chi tiết bệnh án...</span>
                </main>
            </div>
        );
    }

    // ================= TRẠNG THÁI LỖI / KHÔNG TÌM THẤY =================
    if (error || !record) {
        return (
            <div className="flex h-full">
                <main className="flex-1 p-4 xl:p-6 flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-full max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-400" />
                        <p className="mb-6 font-bold text-red-700 text-lg">{error || 'Không tìm thấy hồ sơ.'}</p>
                        <button
                            onClick={() => navigate('/patient/medical-records')}
                            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer w-full"
                        >
                            Quay lại danh sách
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Tách dữ liệu phục vụ hiển thị
    const patientInfo = record?.patientInfo || {};
    const lab = record?.testResult;

    // Xác định logic màu sắc cho Badge trạng thái
    const isComplete = ['COMPLETE', 'COMPLETED'].includes(record?.status);
    const isWaitingResult = ['CREATED', 'WAITING_RESULT'].includes(record?.status);

    return (
        <div className="flex h-full bg-gray-50/30">
            {/* Main container cho phép cuộn dọc tự do, hỗ trợ tốt hiển thị các bảng chỉ số dài.
             */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6"
                >
                    {/* ================= PHẦN HEADER & TRẠNG THÁI ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <button
                                onClick={() => navigate('/patient/medical-records')}
                                className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Quay lại danh sách
                            </button>
                            <h1 className="text-2xl font-bold text-primary">Chi tiết hồ sơ y tế</h1>
                            <p className="text-xs text-gray-400 mt-1 font-mono tracking-wider uppercase">
                                ID: {medicalRecordId}
                            </p>
                        </div>

                        {/* Badge hiển thị trạng thái hồ sơ hiện tại */}
                        <span
                            className={`text-center items-center px-5 py-2.5 rounded-md text-sm font-bold tracking-wide border-2 ${
                                isComplete
                                    ? 'bg-primary text-white'
                                    : isWaitingResult
                                    ? 'bg-secondary/20 text-secondary'
                                    : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            }`}
                        >
                            {STATUS_LABELS[record?.status] || record?.status || 'KHÔNG XÁC ĐỊNH'}
                        </span>
                    </header>

                    {/* ================= BỐ CỤC NỘI DUNG (2 CỘT) ================= */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
                        {/* CỘT TRÁI: THÔNG TIN HÀNH CHÍNH & CHỈ ĐỊNH */}
                        <div className="space-y-6">
                            {/* Thông tin cá nhân của bệnh nhân tại thời điểm tạo hồ sơ */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Thông tin cá nhân
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-gray-500 font-medium">Họ và Tên:</span>
                                        <span className="font-bold text-gray-900">{patientInfo.fullName || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-gray-500 font-medium">Giới tính:</span>
                                        <span className="font-bold text-gray-900">
                                            {patientInfo.gender === 'M' ? 'Nam' : 'Nữ'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-gray-500 font-medium">Năm sinh:</span>
                                        <span className="font-bold text-gray-900">
                                            {patientInfo.birthYear || '---'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Chỉ định lâm sàng từ bác sĩ lúc khám ban đầu */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Chỉ định lâm sàng
                                </h2>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 font-medium block mb-1">
                                            Loại yêu cầu xét nghiệm:
                                        </span>
                                        <span className="inline-flex px-3 py-1 bg-primary/10 text-primary font-bold rounded-md border border-primary/20">
                                            {record?.type || '---'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 font-medium block mb-2">
                                            Triệu chứng / Ghi chú:
                                        </span>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm italic text-gray-700 leading-relaxed shadow-inner">
                                            {record?.clinicalNote || record?.note || 'Bác sĩ không để lại ghi chú.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: KẾT QUẢ XÉT NGHIỆM AI & CHẨN ĐOÁN CUỐI CÙNG */}
                        <div className="space-y-6">
                            {/* Kết quả Lab & Phân tích dự báo từ hệ thống AI */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Kết quả phân tích phòng Lab
                                </h2>

                                {lab ? (
                                    <div className="space-y-6 text-sm">
                                        {/* Box phân tích AI: Cung cấp xác suất và đánh giá rủi ro sơ bộ */}
                                        <div className="rounded-md border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-sm">
                                            <p className="mb-1 text-xs font-bold text-primary uppercase tracking-wider">
                                                Hệ thống AI Đánh giá sơ bộ (
                                                {formatProbability(lab.aiAnalysis?.probability)}%)
                                            </p>
                                            <p
                                                className={`text-lg font-black ${
                                                    lab.aiAnalysis?.diabetes ? 'text-red-600' : 'text-green-600'
                                                }`}
                                            >
                                                {lab.aiAnalysis?.diabetes ? 'DƯƠNG TÍNH' : 'ÂM TÍNH'}
                                            </p>
                                            {lab.aiAnalysis?.risk && (
                                                <p className="mt-1 text-sm font-medium text-gray-600">
                                                    Mức rủi ro:{' '}
                                                    <span className="text-gray-900 font-bold">
                                                        {lab.aiAnalysis.risk}
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Hiển thị các chỉ số sinh hóa thô thu thập từ thiết bị y tế */}
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-3">
                                                Bảng chỉ số chi tiết:
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                {[
                                                    { label: 'Glucose', value: lab.rawData?.glucose },
                                                    { label: 'BMI', value: lab.rawData?.bmi },
                                                    { label: 'Insulin', value: lab.rawData?.insulin },
                                                    { label: 'Huyết áp', value: lab.rawData?.bloodPressure },
                                                    { label: 'Độ dày da', value: lab.rawData?.skinThickness },
                                                    { label: 'Tuổi', value: lab.rawData?.age },
                                                ].map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 bg-gray-50 rounded-md border border-gray-100 flex justify-between items-center"
                                                    >
                                                        <span className="text-gray-500 font-medium">{item.label}:</span>
                                                        <span className="font-bold text-gray-900">
                                                            {item.value ?? '---'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                        <Microscope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-500">
                                            Phòng Lab đang xử lý dữ liệu...
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Kết luận của Bác sĩ chuyên khoa (Sticky trên màn hình lớn) */}
                            <div className="lg:sticky lg:top-6 h-fit bg-white rounded-2xl p-6 shadow-sm border-t-emerald-500 border-x border-b border-gray-100">
                                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
                                    Kết luận từ bác sĩ
                                </h2>

                                {record?.diagnosis ? (
                                    <div className="space-y-6 text-sm">
                                        <div>
                                            <p className="mb-2 font-bold text-gray-900 uppercase text-xs tracking-wider">
                                                Chẩn đoán y khoa
                                            </p>
                                            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-800 leading-relaxed shadow-inner">
                                                {record.diagnosis}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="mb-2 font-bold text-gray-900 uppercase text-xs tracking-wider">
                                                Hướng dẫn điều trị
                                            </p>
                                            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-800 leading-relaxed shadow-inner">
                                                {record.diagnosisNote || 'Bác sĩ không để lại hướng dẫn thêm.'}
                                            </div>
                                        </div>
                                        {/* Thông báo xác thực Blockchain đảm bảo tính toàn vẹn của hồ sơ */}
                                        <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 font-medium text-xs">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            Hồ sơ đã được đóng vĩnh viễn trên Blockchain để đảm bảo tính minh bạch.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-6 text-center text-sm font-medium text-yellow-700 shadow-sm">
                                        <Stethoscope className="w-8 h-8 mx-auto mb-3 text-yellow-500 opacity-50" />
                                        Bác sĩ chuyên khoa đang xem xét kết quả và sẽ đưa ra chẩn đoán sớm nhất.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
