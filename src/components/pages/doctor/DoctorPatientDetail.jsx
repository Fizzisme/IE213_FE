import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Activity, User, Phone, Calendar, Users, ShieldAlert, Loader2, ClipboardPlus } from 'lucide-react';
import { ethers } from 'ethers';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { doctorService } from '@/services/doctorService.js';
import { toast } from 'sonner';
import { enforceSepolia } from '@/utils/enforceSepolia.js';
import { motion } from 'framer-motion';

const getReadableBlockchainError = (error) => {
    const message =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        error?.info?.error?.message ||
        error?.error?.message ||
        'Lỗi không xác định';

    if (/NoAccess/i.test(message)) {
        return 'Bác sĩ hiện chưa được bệnh nhân cấp quyền truy cập hồ sơ trên blockchain';
    }

    if (/Unauthorized/i.test(message)) {
        return 'Ví MetaMask hiện tại chưa có quyền DOCTOR trên blockchain';
    }

    if (/insufficient funds/i.test(message)) {
        return 'Ví MetaMask không đủ SepoliaETH để trả phí gas';
    }

    if (/user rejected|rejected the request|denied|cancelled/i.test(message)) {
        return 'Bạn đã từ chối thao tác trên MetaMask';
    }

    return message;
};

export default function DoctorPatientDetail() {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();

    useEffect(() => {
        const fetchPatient = async () => {
            setError('');

            try {
                const res = await doctorService.getDoctorPatientDetail(patientId);
                setPatient(res?.data?.data || res?.data || res);
            } catch (err) {
                setError(err?.message || 'Không thể tải thông tin bệnh nhân. Vui lòng thử lại.');
            }
        };

        if (patientId) {
            fetchPatient();
        }
    }, [patientId]);

    const onSubmit = async (data) => {
        const truePatientId = patient?._id || patient?.id;

        if (!truePatientId) {
            toast.error('Không xác định được ID bệnh nhân');
            return;
        }

        setSubmitError('');
        setSubmitSuccess(false);

        const loadingToast = toast.loading('Đang tạo bệnh án...');

        try {
            if (!data.type || !data.note) throw new Error('Nhập thiếu dữ liệu');

            const res = await doctorService.createMedicalRecord(truePatientId, {
                type: data.type,
                note: data.note,
            });

            const createRes = res.data;

            const medicalRecordId = createRes?.medicalRecordId;
            const recordHash = createRes?.recordHash;
            const blockchain = createRes?.blockchain;
            const contractAddress = blockchain?.contractAddress;
            const method = blockchain?.method;
            const args = Array.isArray(blockchain?.args) ? blockchain.args : [];

            if (!medicalRecordId || !recordHash || !contractAddress || method !== 'createRecord' || args.length < 3) {
                throw new Error(createRes?.message || 'Backend chưa trả đủ metadata blockchain để ký createRecord');
            }

            if (!window.ethereum) {
                throw new Error('Cần cài MetaMask để ký giao dịch blockchain');
            }

            await enforceSepolia();

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                contractAddress,
                ['function createRecord(string mongoId, address patient, bytes32 _recordHash) external'],
                signer,
            );

            toast.loading('Đang kiểm tra điều kiện blockchain...', { id: loadingToast });
            await contract.createRecord.staticCall(args[0], args[1], args[2]);

            toast.loading('Vui lòng xác nhận giao dịch trên MetaMask...', { id: loadingToast });
            const tx = await contract.createRecord(args[0], args[1], args[2]);

            toast.loading('Đang chờ blockchain xác nhận...', { id: loadingToast });
            await tx.wait();

            toast.loading('Đang xác minh giao dịch với backend...', { id: loadingToast });
            await doctorService.verifyMedicalRecordTx(medicalRecordId, tx.hash);

            setSubmitSuccess(true);
            reset();

            toast.success('Tạo hồ sơ bệnh án và xác minh blockchain thành công', {
                id: loadingToast,
            });

            setTimeout(() => {
                navigate('/doctor/medical-records');
            }, 1200);
        } catch (err) {
            const message = getReadableBlockchainError(err);

            if (message === 'execution reverted (unknown custom error)') {
                setSubmitError('Bệnh nhân đã thu hồi quyền');
                toast.error('Bệnh nhân đã thu hồi quyền', { id: loadingToast });
            } else {
                setSubmitError(message);
                toast.error(message, { id: loadingToast });
            }
        }
    };

    if (error || !patient) {
        return (
            <div className="flex h-full">
                <main className="flex-1 p-4 xl:p-6 flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm max-w-md w-full">
                        <User className="mx-auto mb-4 h-14 w-14 text-red-400" />
                        <p className="mb-6 font-bold text-red-700 text-lg">
                            {error || 'Không tìm thấy dữ liệu bệnh nhân.'}
                        </p>
                        <button
                            onClick={() => navigate('/doctor/dashboard')}
                            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer w-full"
                        >
                            Quay lại trang chủ
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50/50">
            {/* CUỘN TOÀN TRANG (An toàn tuyệt đối cho Mobile) */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1"
                >
                    {/* ================= HEADER ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#04d3b8] flex items-center justify-center text-white shadow-md shrink-0">
                                <ClipboardPlus className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primary">Tạo bệnh án</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Nhập thông tin lâm sàng và chỉ định xét nghiệm
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* ================= GRID CONTENT ================= */}
                    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
                        {/* LEFT: THÔNG TIN BỆNH NHÂN */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-primary flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
                                        {patient.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-xl font-bold text-gray-900">{patient.fullName}</p>
                                        <p className="text-xs font-mono text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                            ID: {patient._id || patient.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Users className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Giới tính</p>
                                            <p className="text-sm font-bold text-gray-700">
                                                {patient.gender === 'M'
                                                    ? 'Nam'
                                                    : patient.gender === 'F'
                                                    ? 'Nữ'
                                                    : 'Không xác định'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Năm sinh</p>
                                            <p className="text-sm font-bold text-gray-700">{patient.birthYear}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Phone className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">
                                                Số điện thoại
                                            </p>
                                            <p className="text-sm font-bold text-gray-700">{patient.phoneNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-amber-800 leading-relaxed">
                                    Hãy kiểm tra kỹ thông tin bệnh nhân trước khi ghi nhận dữ liệu vào hồ sơ y tế.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: FORM CHỈ ĐỊNH */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                Chỉ định xét nghiệm & Chẩn đoán
                            </h2>

                            {submitSuccess && (
                                <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Tạo bệnh án thành công! Hệ thống đang chuyển hướng...
                                </div>
                            )}

                            {submitError && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200 flex items-start gap-2">
                                    <ShieldAlert className="w-5 h-5 shrink-0" />
                                    {submitError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Loại xét nghiệm yêu cầu <span className="text-red-500">*</span>
                                    </label>

                                    <Select onValueChange={(val) => setValue('type', val, { shouldValidate: true })}>
                                        <SelectTrigger
                                            className={`w-full rounded-xl border-2 px-4 py-6 bg-gray-50 focus:ring-0 focus:border-primary transition-colors cursor-pointer text-base ${
                                                errors.type
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-gray-200 hover:bg-white'
                                            }`}
                                        >
                                            <SelectValue placeholder="-- Chọn loại xét nghiệm --" />
                                        </SelectTrigger>

                                        {/* Thêm position="popper" và sideOffset để ép nó tụt xuống dưới */}
                                        <SelectContent
                                            position="popper"
                                            sideOffset={4}
                                            className="rounded-xl border-gray-200 shadow-lg bg-white z-50"
                                        >
                                            <SelectItem
                                                value="DIABETES_TEST"
                                                className="py-3 cursor-pointer font-medium hover:bg-gray-50 focus:bg-gray-50"
                                            >
                                                Xét nghiệm bệnh tiểu đường
                                            </SelectItem>
                                            <SelectItem
                                                value="BLOOD_TEST"
                                                className="py-3 cursor-pointer font-medium hover:bg-gray-50 focus:bg-gray-50"
                                            >
                                                Xét nghiệm máu tổng quát
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <input type="hidden" {...register('type', { required: true })} />

                                    {errors.type && (
                                        <p className="text-xs font-medium text-red-500 mt-2">
                                            Vui lòng chọn loại xét nghiệm phù hợp.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Ghi chú / Chẩn đoán lâm sàng <span className="text-red-500">*</span>
                                    </label>

                                    <textarea
                                        rows={6}
                                        placeholder="Nhập chi tiết các triệu chứng, đánh giá sơ bộ và lý do chỉ định xét nghiệm..."
                                        className={`w-full px-4 py-4 rounded-xl border-2 bg-gray-50 focus:bg-white outline-none transition-colors resize-none text-base ${
                                            errors.note
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200 focus:border-primary'
                                        }`}
                                        {...register('note', { required: true })}
                                    />

                                    {errors.note && (
                                        <p className="text-xs font-medium text-red-500 mt-2">
                                            Vui lòng nhập chẩn đoán lâm sàng.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer ${
                                            isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-primary hover:bg-primary/80 hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Đang ký Blockchain & Lưu trữ...</span>
                                            </>
                                        ) : (
                                            'Khởi tạo bệnh án y tế'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
