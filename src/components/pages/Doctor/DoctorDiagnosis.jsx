// src/components/pages/Doctor/DoctorDiagnosis.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { AlertTriangle, Stethoscope, Microscope, Loader2 } from 'lucide-react';
import { doctorService } from '@/services/doctorService.js';
import { enforceSepolia } from '@/utils/enforceSepolia.js';
import { motion } from 'framer-motion';

/**
 * Hàm tiện ích xử lý và phiên dịch các lỗi thô từ thư viện ethers/MetaMask
 * thành thông báo thân thiện với người dùng cuối.
 */
const getReadableBlockchainError = (error) => {
    // Trích xuất thông báo lỗi từ nhiều cấu trúc trả về khác nhau của Web3
    const message =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        error?.info?.error?.message ||
        error?.error?.message ||
        'Lỗi không xác định';

    if (/Unauthorized/i.test(message)) {
        return 'Ví MetaMask hiện tại không phải bác sĩ đã tạo hồ sơ hoặc chưa có quyền DOCTOR trên blockchain';
    }

    if (/InvalidState/i.test(message)) {
        return 'Hồ sơ không ở trạng thái hợp lệ để đóng hồ sơ trên blockchain';
    }

    if (/insufficient funds/i.test(message)) {
        return 'Ví MetaMask không đủ SepoliaETH để trả phí gas';
    }

    if (/user rejected|rejected the request|denied|cancelled/i.test(message)) {
        return 'Bạn đã từ chối thao tác trên MetaMask';
    }

    return message;
};

/**
 * Hàm hỗ trợ lấy payload data an toàn từ response API.
 */
const getRecordData = (res) => res?.data?.data || res?.data || res;

/**
 * Hàm định dạng hiển thị tỷ lệ phần trăm Probability của AI.
 */
const formatProbability = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
    const numeric = Number(value);
    // Nếu giá trị trả về <= 1 (dạng thập phân 0.xx), nhân với 100 để hiển thị phần trăm
    return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
};

export default function DoctorDiagnosis() {
    // Trích xuất ID bệnh án từ URL parameter
    const { medicalRecordId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    // Các state quản lý dữ liệu cục bộ
    const [record, setRecord] = useState(null);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Khởi tạo React Hook Form để quản lý state và validation của form chẩn đoán
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    /**
     * Effect gọi API lấy chi tiết bệnh án khi component được mount hoặc khi ID thay đổi.
     */
    useEffect(() => {
        const fetchDetail = async () => {
            setError('');

            try {
                const res = await doctorService.getDoctorMedicalRecordDetail(medicalRecordId);
                setRecord(getRecordData(res));
            } catch (err) {
                setError(err?.message || 'Không thể tải chi tiết bệnh án.');
            }
        };

        if (medicalRecordId) fetchDetail();
    }, [medicalRecordId]);

    /**
     * Luồng xử lý chính: Submit form chẩn đoán và đóng hồ sơ trên Blockchain (Smart Contract).
     */
    const onSubmit = async (formData) => {
        setSubmitError('');
        setSubmitSuccess(false);

        // Chuẩn hóa ID kết quả xét nghiệm để gửi kèm request
        const testResultId =
            record?.testResult?._id ||
            record?.testResultId?._id ||
            (typeof record?.testResultId === 'string' ? record.testResultId : '');

        // Validation 1: Kiểm tra trạng thái hồ sơ phải có kết quả xét nghiệm
        if (record?.status !== 'HAS_RESULT') {
            setSubmitError('Hồ sơ chưa ở trạng thái HAS_RESULT nên chưa thể chẩn đoán.');
            return;
        }

        // Validation 2: Phải tồn tại ID của Test Result
        if (!testResultId) {
            setSubmitError('Không tìm thấy mã kết quả xét nghiệm để hoàn tất chẩn đoán.');
            return;
        }

        const loadingToast = toast.loading('Đang lưu chẩn đoán...');

        try {
            // Bước 1: Gọi API cập nhật chẩn đoán vào cơ sở dữ liệu (Off-chain)
            // Backend sẽ hash dữ liệu này và trả về thông tin để tương tác Smart Contract
            const diagnosisRes = await doctorService.updateDiagnosis(medicalRecordId, {
                testResultId,
                diagnosis: formData.diagnosis,
                note: formData.prescription || '',
            });

            const diagnosisData = getRecordData(diagnosisRes);
            const blockchain = diagnosisData?.blockchain;

            // Lấy các metadata cần thiết để gọi hàm trên Smart Contract
            const returnedMedicalRecordId = diagnosisData?.medicalRecordId || medicalRecordId;
            const diagnosisHash = diagnosisData?.diagnosisHash;
            const contractAddress = blockchain?.contractAddress;
            const method = blockchain?.method;
            const args = Array.isArray(blockchain?.args) ? blockchain.args : [];

            // Xác thực dữ liệu trả về từ backend trước khi gọi Web3
            if (
                !returnedMedicalRecordId ||
                !diagnosisHash ||
                !contractAddress ||
                method !== 'closeRecord' ||
                args.length < 2
            ) {
                throw new Error(diagnosisData?.message || 'Backend chưa trả đủ metadata blockchain để ký closeRecord');
            }

            // Bước 2: Chuẩn bị môi trường Web3
            if (!window.ethereum) {
                throw new Error('Cần cài MetaMask để ký giao dịch blockchain');
            }

            // Ép buộc người dùng chuyển sang mạng Sepolia testnet
            await enforceSepolia();
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Khởi tạo Smart Contract instance với quyền ghi (signer)
            const contract = new ethers.Contract(
                contractAddress,
                ['function closeRecord(string mongoId, bytes32 _diagnosisHash) external'],
                signer,
            );

            // Bước 3: Mô phỏng giao dịch (staticCall) để phát hiện lỗi sớm (tránh mất phí gas oan)
            toast.loading('Đang kiểm tra điều kiện blockchain...', { id: loadingToast });
            await contract.closeRecord.staticCall(args[0], args[1]);

            // Bước 4: Thực thi giao dịch thật (Gửi transaction lên mạng lưới)
            toast.loading('Đang gọi MetaMask để khóa hồ sơ vĩnh viễn...', { id: loadingToast });
            const tx = await contract.closeRecord(args[0], args[1]);

            // Bước 5: Chờ mạng lưới đưa giao dịch vào block (Mining)
            toast.loading('Đang chờ blockchain xác nhận...', { id: loadingToast });
            const receipt = await tx.wait();
            const txHash = receipt?.hash || tx.hash;

            // Bước 6: Đồng bộ hóa txHash với cơ sở dữ liệu Backend
            toast.loading('Đang xác minh giao dịch với backend...', { id: loadingToast });
            await doctorService.verifyMedicalRecordTx(returnedMedicalRecordId, txHash);

            // Hoàn tất quy trình
            setSubmitSuccess(true);
            toast.success('Hoàn tất chẩn đoán và đồng bộ blockchain thành công', {
                id: loadingToast,
            });

            // Chuyển hướng người dùng về danh sách sau 1.5s
            setTimeout(() => navigate('/doctor/medical-records'), 1500);
        } catch (err) {
            const message = getReadableBlockchainError(err);
            setSubmitError(message);
            toast.error(message, { id: loadingToast });
        }
    };

    // Chuẩn bị dữ liệu hiển thị, sử dụng Optional Chaining (?.) để tránh lỗi null reference
    const isComplete = ['COMPLETE', 'COMPLETED'].includes(record?.status);
    const isWaitingBlockchain = record?.status === 'DIAGNOSED';
    const canDiagnose = record?.status === 'HAS_RESULT';
    const lab = record?.testResult || record?.testResultId;

    // Trích xuất thông tin bệnh nhân linh hoạt từ nhiều cấp độ object khác nhau
    const pInfo = record?.patientInfo || state?.patientInfo;
    const pName = pInfo?.fullName || record?.patientId?.fullName || 'Bệnh nhân ẩn danh';
    const pId = pInfo?._id || (typeof record?.patientId === 'string' ? record?.patientId : record?.patientId?._id);
    const age = pInfo?.birthYear ? `${new Date().getFullYear() - pInfo.birthYear} tuổi` : '--- tuổi';
    const gender = pInfo?.gender === 'M' ? 'Nam' : pInfo?.gender === 'F' ? 'Nữ' : '---';
    const aiNote = record?.testResult?.aiAnalysis?.aiNote;

    return (
        <div className="flex h-full bg-gray-50/30">
            {/* Vùng ngoài cùng sử dụng overflow để khóa thanh cuộn cấp độ trang */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6"
                >
                    {/* ================= HEADER ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-primary mb-1">Kết luận chẩn đoán</h1>
                            <p className="text-gray-500 text-sm">Phân tích kết quả và đóng hồ sơ bệnh án vĩnh viễn</p>
                        </div>

                        {/* Badge hiển thị trạng thái hiện tại của hồ sơ */}
                        <span
                            className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide border-2 ${
                                isComplete
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : isWaitingBlockchain
                                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                                    : canDiagnose
                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                    : 'border-gray-200 bg-gray-100 text-gray-600'
                            }`}
                        >
                            {isComplete
                                ? 'Đã hoàn thành'
                                : isWaitingBlockchain
                                ? 'Đang chờ đồng bộ Blockchain'
                                : canDiagnose
                                ? 'Cần chẩn đoán'
                                : 'Đang chờ kết quả Lab'}
                        </span>
                    </header>

                    {/* ================= GRID CONTENT ================= */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
                        {/* KỘT TRÁI: Khu vực hiển thị thông tin Read-only */}
                        <div className="space-y-6">
                            {/* Khối hiển thị Thông tin bệnh nhân */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Thông tin bệnh nhân
                                </h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-gray-500 font-medium">Họ và Tên:</span>
                                        <span className="font-bold text-gray-900">{pName}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-gray-500 font-medium">Tuổi:</span>
                                        <span className="font-bold text-gray-900">{age}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-gray-500 font-medium">Giới tính:</span>
                                        <span className="font-bold text-gray-900">{gender}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-gray-500 font-medium">Mã ID:</span>
                                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {pId}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Khối hiển thị Phiếu yêu cầu lâm sàng */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Phiếu chỉ định ban đầu
                                </h2>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 font-medium block mb-1">Loại xét nghiệm:</span>
                                        <span className="inline-flex px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg border border-primary/20">
                                            {record?.type || '---'}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-500 font-medium block mb-2">Ghi chú lâm sàng:</span>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm italic text-gray-700 leading-relaxed shadow-inner">
                                            {record?.clinicalNote || record?.note || 'Không có ghi chú.'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Khối hiển thị Kết quả phân tích (Lab + AI) */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Kết quả từ Lab
                                </h2>

                                {lab ? (
                                    <>
                                        {/* Giao diện kết quả phân tích bằng AI */}
                                        <div className="mb-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="mb-1 text-xs font-bold text-primary uppercase tracking-wider">
                                                        AI Phân tích & Dự đoán (
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
                                                            <span className="text-gray-900">{lab.aiAnalysis.risk}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Phần Text giải thích chi tiết từ AI */}
                                            {aiNote && (
                                                <div className="mt-4 border-t border-primary/10 pt-4">
                                                    <p className="mb-2 text-xs font-bold text-primary uppercase">
                                                        Giải thích y khoa từ AI:
                                                    </p>
                                                    <div className="max-h-48 overflow-y-auto rounded-xl border border-white bg-white/80 p-4 text-sm leading-relaxed text-gray-700 shadow-inner">
                                                        {aiNote.split('\n').map((line, idx) => (
                                                            <span key={idx}>
                                                                {line}
                                                                <br />
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lưới hiển thị các chỉ số thô (Raw Data) */}
                                        <h3 className="text-sm font-bold text-gray-900 mb-3">
                                            Chỉ số xét nghiệm chi tiết:
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                                                <span className="text-gray-500 font-medium">Glucose:</span>
                                                <span className="font-bold text-gray-900">
                                                    {lab.rawData?.glucose ?? '---'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                                                <span className="text-gray-500 font-medium">BMI:</span>
                                                <span className="font-bold text-gray-900">
                                                    {lab.rawData?.bmi ?? '---'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                                                <span className="text-gray-500 font-medium">Insulin:</span>
                                                <span className="font-bold text-gray-900">
                                                    {lab.rawData?.insulin ?? '---'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                                                <span className="text-gray-500 font-medium">Huyết áp:</span>
                                                <span className="font-bold text-gray-900">
                                                    {lab.rawData?.bloodPressure ?? '---'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                                                <span className="text-gray-500 font-medium">Độ dày da:</span>
                                                <span className="font-bold text-gray-900">
                                                    {lab.rawData?.skinThickness ?? '---'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                                                <span className="text-gray-500 font-medium">Tuổi:</span>
                                                <span className="font-bold text-gray-900">
                                                    {lab.rawData?.age ?? '---'}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Empty state khi lab chưa trả kết quả
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                        <Microscope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-500">
                                            Chưa có kết quả từ phòng Lab
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KỘT PHẢI: Khu vực Form thao tác (được ghim sticky trên desktop) */}
                        <div className="lg:sticky lg:top-6 h-fit bg-white rounded-2xl p-6 shadow-sm border-x border-b border-gray-100">
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Stethoscope size={20} />
                                </div>
                                Kết luận y khoa
                            </h2>

                            {/* Khối hiển thị thông báo thành công */}
                            {submitSuccess && (
                                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 flex items-center gap-2 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Hồ sơ đã được chẩn đoán và đóng vĩnh viễn trên Blockchain.
                                </div>
                            )}

                            {/* Khối hiển thị lỗi từ Blockchain/Server */}
                            {submitError && (
                                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-start gap-2 shadow-sm">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    {submitError}
                                </div>
                            )}

                            {/* Điều hướng giao diện dựa theo trạng thái của bệnh án */}
                            {isComplete ? (
                                // Giao diện Read-only khi hồ sơ đã đóng xong
                                <div className="space-y-6 text-sm">
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-bold text-center">
                                        Bệnh án này đã hoàn tất quá trình khám.
                                    </div>

                                    <div>
                                        <p className="mb-2 font-bold text-gray-900 uppercase text-xs tracking-wider">
                                            Chẩn đoán cuối cùng
                                        </p>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800 leading-relaxed shadow-inner">
                                            {record?.diagnosis || '---'}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-2 font-bold text-gray-900 uppercase text-xs tracking-wider">
                                            Ghi chú / Phác đồ điều trị
                                        </p>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800 leading-relaxed shadow-inner">
                                            {record?.diagnosisNote || '---'}
                                        </div>
                                    </div>
                                </div>
                            ) : isWaitingBlockchain ? (
                                // Giao diện chờ khi dữ liệu đã lưu DB nhưng chưa xác nhận xong trên mạng lưới
                                <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-center text-sm font-medium text-orange-700 shadow-sm">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-400" />
                                    Hồ sơ đã lưu chẩn đoán ở database và đang chờ hoàn tất bước đồng bộ hợp đồng thông
                                    minh trên Blockchain.
                                </div>
                            ) : !canDiagnose ? (
                                // Giao diện chặn không cho chẩn đoán khi chưa có kết quả Lab
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center text-sm font-medium text-yellow-700 shadow-sm">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                                    Bác sĩ cần chờ phòng Lab trả kết quả phân tích AI trước khi đưa ra kết luận chẩn
                                    đoán.
                                </div>
                            ) : (
                                // Form nhập liệu chính dành cho Bác sĩ
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Kết luận chẩn đoán <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            {...register('diagnosis', { required: true })}
                                            rows={5}
                                            placeholder="Nhập kết luận y khoa dựa trên kết quả Lab..."
                                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-4 outline-none focus:border-primary focus:bg-white transition-colors resize-none shadow-inner text-sm"
                                        />
                                        {errors.diagnosis && (
                                            <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Vui lòng nhập chẩn đoán
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Ghi chú / Phác đồ điều trị (Tùy chọn)
                                        </label>
                                        <textarea
                                            {...register('prescription')}
                                            rows={5}
                                            placeholder="Nhập phác đồ điều trị, đơn thuốc hoặc lời khuyên cho bệnh nhân..."
                                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-4 outline-none focus:border-primary focus:bg-white transition-colors resize-none shadow-inner text-sm"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full rounded-xl py-4 font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                                            isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed opacity-80'
                                                : 'bg-primary hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Đang ký Blockchain & Lưu trữ...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Stethoscope className="w-5 h-5" />
                                                <span>Hoàn tất & Đóng bệnh án</span>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-center font-medium text-gray-400 mt-4">
                                        Lưu ý: Bệnh án sau khi đóng sẽ được lưu trữ vĩnh viễn trên Blockchain và không
                                        thể sửa đổi.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
