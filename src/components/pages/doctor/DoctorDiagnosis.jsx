import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Activity, FileText, AlertTriangle, Stethoscope, Microscope, User } from 'lucide-react';
import { getDoctorMedicalRecordDetail, updateDiagnosis } from '../../../services/doctorApi';

export default function DoctorDiagnosis() {
    const { medicalRecordId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                // Gọi API lấy chi tiết
                const res = await getDoctorMedicalRecordDetail(medicalRecordId);
                const data = res?.data?.data || res?.data || res;
                setRecord(data);
            } catch (err) {
                setError(err.message || 'Không thể tải chi tiết bệnh án.');
            } finally {
                setLoading(false);
            }
        };
        if (medicalRecordId) fetchDetail();
    }, [medicalRecordId]);

    const onSubmit = async (formData) => {
        setSubmitError('');
        try {
            const testResultId = record?.testResult?._id || formData.fallbackTestResultId;

            if (record.status === 'CREATED') {
                throw new Error('Chưa có kết quả xét nghiệm từ phòng Lab. Không thể chẩn đoán.');
            }

            if (!testResultId) {
                throw new Error('Không tìm thấy mã Kết quả Xét nghiệm. Vui lòng thử lại.');
            }

            await updateDiagnosis(medicalRecordId, {
                testResultId: testResultId,
                diagnosis: formData.diagnosis,
                // ✅ SỬA LẠI Ở ĐÂY: Dùng key 'notes' để gửi lên BE thay vì 'prescription'
                notes: formData.prescription || '',
            });

            setSubmitSuccess(true);
            setTimeout(() => navigate('/doctor/medical-records'), 1500);
        } catch (err) {
            setSubmitError(err.message || 'Lưu chẩn đoán thất bại.');
        }
    };

    if (loading)
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Activity className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span className="text-slate-500 font-medium">Đang tải hồ sơ chẩn đoán...</span>
            </div>
        );

    if (error || !record)
        return (
            <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center p-4">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm max-w-md">
                    <AlertTriangle className="mx-auto mb-3 h-12 w-12 text-rose-400" />
                    <p className="mb-4 font-medium text-rose-700">{error || 'Không tìm thấy hồ sơ.'}</p>
                    <button
                        onClick={() => navigate('/doctor/medical-records')}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );

    const isDone = ['COMPLETE', 'COMPLETED', 'DIAGNOSED'].includes(record?.status);
    const canDiagnose = record?.status === 'HAS_RESULT';
    const lab = record?.testResult;

    // Xử lý thông tin bệnh nhân
    const pInfo = record.patientInfo || state?.patientInfo;
    const pName = pInfo?.fullName || record.patientId?.fullName || 'Bệnh nhân ẩn danh';
    const pId = pInfo?._id || (typeof record.patientId === 'string' ? record.patientId : record.patientId?._id);
    const age = pInfo?.birthYear ? `${new Date().getFullYear() - pInfo.birthYear} tuổi` : '--- tuổi';
    const gender = pInfo?.gender === 'M' ? 'Nam' : pInfo?.gender === 'F' ? 'Nữ' : '---';

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="mx-auto max-w-6xl">
                {/* ================= HEADER ================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <h1 className="text-2xl font-bold text-textColor mb-5">Kết luận chẩn đoán</h1>

                    {/* STATUS */}
                    <span
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border ${
                            isDone
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : canDiagnose
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                    >
                        {isDone ? 'Đã hoàn thành' : canDiagnose ? 'Cần chẩn đoán' : 'Đang chờ Lab'}
                    </span>
                </div>

                {/* ================= MAIN ================= */}
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
                    {/* ===== LEFT ===== */}
                    <div className="space-y-6">
                        {/* PATIENT INFO */}
                        <div className="bg-white border rounded-2xl p-5 shadow-sm">
                            <h2 className="font-bold mb-4 flex items-center gap-2">
                                <User size={16} /> Thông tin bệnh nhân
                            </h2>

                            <div className="space-y-2 text-sm">
                                <p>
                                    <b>Tên:</b> {pName}
                                </p>
                                <p>
                                    <b>Tuổi:</b> {age}
                                </p>
                                <p>
                                    <b>Giới tính:</b> {gender}
                                </p>
                                <p className="text-xs text-gray-400">ID: {pId}</p>
                            </div>
                        </div>

                        {/* MEDICAL RECORD */}
                        <div className="bg-white border rounded-2xl p-5 shadow-sm">
                            <h2 className="font-bold mb-4 flex items-center gap-2">
                                <FileText size={16} /> Phiếu chỉ định
                            </h2>

                            <div className="space-y-3 text-sm">
                                <p>
                                    <b>Loại:</b> <span className="text-primary font-semibold">{record.type}</span>
                                </p>

                                <p>
                                    <b>Ghi chú:</b>
                                </p>
                                <div className="bg-gray-50 border rounded-xl p-3 text-xs italic text-gray-600">
                                    {record.note || 'Không có'}
                                </div>
                            </div>
                        </div>

                        {/* LAB RESULT */}
                        <div className="bg-white border rounded-2xl p-5 shadow-sm">
                            <h2 className="font-bold mb-4 flex items-center gap-2">
                                <Microscope size={16} /> Kết quả Lab
                            </h2>

                            {lab ? (
                                <>
                                    {/* AI RESULT */}
                                    <div className="mb-4 p-4 rounded-xl border bg-primary/5">
                                        <p className="text-xs text-primary font-semibold mb-1">
                                            AI Phân tích ({Math.round(lab.aiAnalysis?.probability * 100)}%)
                                        </p>

                                        <p className="text-lg font-bold">
                                            {lab.aiAnalysis?.diabetes ? 'DƯƠNG TÍNH' : 'ÂM TÍNH'}
                                        </p>
                                    </div>

                                    {/* RAW DATA */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>Glucose: {lab.rawData?.glucose}</div>
                                        <div>BMI: {lab.rawData?.bmi}</div>
                                        <div>Insulin: {lab.rawData?.insulin}</div>
                                        <div>Huyết áp: {lab.rawData?.bloodPressure}</div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400 text-sm">Chưa có kết quả từ Lab</p>
                            )}
                        </div>
                    </div>

                    {/* ===== RIGHT ===== */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm h-fit sticky top-6">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <Stethoscope size={16} /> Kết luận
                        </h2>

                        {isDone ? (
                            <div className="space-y-4 text-sm">
                                <div className="p-3 bg-emerald-50 border rounded-xl text-emerald-700">
                                    Hồ sơ đã hoàn thành
                                </div>

                                <div>
                                    <p className="font-semibold mb-1">Chẩn đoán</p>
                                    <div className="bg-gray-50 border rounded-xl p-3">{record.diagnosis || '---'}</div>
                                </div>

                                <div>
                                    <p className="font-semibold mb-1">Đơn thuốc</p>
                                    <div className="bg-gray-50 border rounded-xl p-3">{record.note || '---'}</div>
                                </div>
                            </div>
                        ) : !canDiagnose ? (
                            <div className="p-4 bg-yellow-50 border rounded-xl text-yellow-700 text-sm">
                                Chưa có kết quả Lab để chẩn đoán
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* DIAGNOSIS */}
                                <div>
                                    <label className="text-sm font-semibold">Kết luận *</label>
                                    <textarea
                                        {...register('diagnosis', { required: true })}
                                        rows={5}
                                        className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:border-primary outline-none"
                                    />
                                </div>

                                {/* NOTE */}
                                <div>
                                    <label className="text-sm font-semibold">Đơn thuốc</label>
                                    <textarea
                                        {...register('prescription')}
                                        rows={4}
                                        className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:border-primary outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Xác nhận chẩn đoán'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
