import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Activity, User } from 'lucide-react';
import { getDoctorPatientDetail, createMedicalRecord } from '../../../services/doctorApi';

// import { Select } from 'radix-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { doctorService } from '@/services/doctorService.js';

export default function DoctorPatientDetail() {
    const { patientId } = useParams();
    const navigate = useNavigate();

    // State quản lý dữ liệu bệnh nhân
    const [patient, setPatient] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(true);
    const [error, setError] = useState('');

    // Setup Form
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Lấy thông tin bệnh nhân khi load trang
    useEffect(() => {
        const fetchPatient = async () => {
            setLoadingPatient(true);
            setError('');
            try {
                const res = await getDoctorPatientDetail(patientId);
                setPatient(res?.data?.data || res?.data || res);
            } catch (err) {
                setError(err.message || 'Không thể tải thông tin bệnh nhân. Vui lòng thử lại.');
            } finally {
                setLoadingPatient(false);
            }
        };

        if (patientId) {
            fetchPatient();
        }
    }, [patientId]);

    // Xử lý gửi Form tạo Bệnh án
    const onSubmit = async (data) => {
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            const truePatientId = patient?._id || patient?.id;

            if (!truePatientId) {
                throw new Error('Không xác định được ID bệnh nhân');
            }

            const res = await doctorService.createMedicalRecord(truePatientId, {
                type: data.type,
                note: data.note,
            });

            // nếu API bạn trả về statusCode
            if (!res || res.statusCode !== 200) {
                throw new Error(res?.message || 'Tạo bệnh án thất bại');
            }

            setSubmitSuccess(true);
            reset();

            setTimeout(() => {
                navigate('/doctor/medical-records');
            }, 1200);
        } catch (err) {
            setSubmitError(err.message || 'Có lỗi xảy ra khi khởi tạo bệnh án.');
        }
    };

    if (loadingPatient) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Activity className="h-6 w-6 animate-spin text-blue-500" />
                    <span>Đang tải hồ sơ bệnh nhân...</span>
                </div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center p-4">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm max-w-md">
                    <User className="mx-auto mb-3 h-12 w-12 text-rose-400" />
                    <p className="mb-4 font-medium text-rose-700">{error || 'Không tìm thấy dữ liệu bệnh nhân.'}</p>
                    <button
                        onClick={() => navigate('/doctor/dashboard')}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
                    >
                        Quay lại Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-secondary/10">
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-y-auto">
                {/* ================= HEADER ================= */}
                <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-primary">Tạo bệnh án cho {patient.fullName}</h1>

                        <p className="text-gray-500 text-sm mt-1">Nhập thông tin lâm sàng và chỉ định xét nghiệm</p>

                        <div className="mt-4 border-l-4 border-primary pl-4 text-sm text-gray-600 italic">
                            “Chẩn đoán đúng là bước đầu của điều trị hiệu quả.”
                        </div>
                    </div>
                </header>

                {/* ================= MAIN ================= */}
                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
                    {/* LEFT: PATIENT INFO */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                                    {patient.fullName?.charAt(0)}
                                </div>

                                <div>
                                    <p className="font-bold text-textColor">{patient.fullName}</p>
                                    <p className="text-xs text-gray-500">ID: {patient._id || patient.id}</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <p>
                                    <b>Giới tính:</b> {patient.gender === 'M' ? 'Nam' : 'Nữ'}
                                </p>
                                <p>
                                    <b>Năm sinh:</b> {patient.birthYear}
                                </p>
                                <p>
                                    <b>SĐT:</b> {patient.phoneNumber}
                                </p>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-gray-600">
                            Hãy kiểm tra kỹ thông tin trước khi gửi chỉ định xét nghiệm.
                        </div>
                    </div>

                    {/* RIGHT: FORM */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="font-bold text-textColor mb-4">Chỉ định xét nghiệm</h2>

                        {/* ALERT */}
                        {submitSuccess && (
                            <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm">
                                Tạo bệnh án thành công!
                            </div>
                        )}

                        {submitError && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{submitError}</div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* TYPE */}
                            <div>
                                <label className="text-sm font-medium text-textColor">Loại xét nghiệm</label>

                                <Select onValueChange={(val) => setValue('type', val)}>
                                    <SelectTrigger className="mt-1 w-full rounded-xl border bg-gray-50 focus:ring-2 focus:ring-primary">
                                        <SelectValue placeholder="Chọn loại xét nghiệm" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="DIABETES_TEST">Xét nghiệm tiểu đường</SelectItem>
                                        <SelectItem value="BLOOD_TEST">Xét nghiệm máu</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" {...register('type', { required: true })} />

                                {errors.type && (
                                    <p className="text-xs text-red-500 mt-1">Vui lòng chọn loại xét nghiệm</p>
                                )}
                            </div>

                            {/* NOTES */}
                            <div>
                                <label className="text-sm font-medium text-textColor">Chẩn đoán lâm sàng</label>

                                <textarea
                                    rows={4}
                                    className="w-full mt-1 p-3 rounded-xl border bg-gray-50 focus:border-primary outline-none"
                                    {...register('note')}
                                />
                            </div>

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 cursor-pointer"
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Tạo bệnh án'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
