// src/components/pages/Doctor/DoctorPatientDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Phone, Calendar, Users, ShieldAlert, Loader2, ClipboardPlus } from 'lucide-react';
import { ethers } from 'ethers';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { doctorService } from '@/services/doctorService.js';
import { toast } from 'sonner';
import { enforceSepolia } from '@/utils/enforceSepolia.js';
import { motion } from 'framer-motion';

/**
 * Hàm phân tích và chuyển đổi các mã lỗi từ thư viện ethers hoặc từ MetaMask
 * sang các thông báo có ý nghĩa thân thiện với người dùng cuối.
 */
const getReadableBlockchainError = (error) => {
    // Trích xuất chuỗi thông báo lỗi (error message) từ nhiều định dạng trả về khác nhau của Web3
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

/**
 * Component DoctorPatientDetail
 * Giao diện cho phép Bác sĩ xem chi tiết thông tin của Bệnh nhân
 * và tiến hành khởi tạo hồ sơ bệnh án (Medical Record) mới, có tích hợp lưu vết trên Blockchain.
 */
export default function DoctorPatientDetail() {
    const { patientId } = useParams();
    const navigate = useNavigate();

    // Khởi tạo các state để lưu trữ dữ liệu và quản lý trạng thái giao diện
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Sử dụng react-hook-form để quản lý và validate dữ liệu form chỉ định xét nghiệm
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();

    /**
     * useEffect được kích hoạt khi patientId thay đổi.
     * Thực hiện việc fetch dữ liệu chi tiết của bệnh nhân từ server.
     */
    useEffect(() => {
        const fetchPatient = async () => {
            setError('');

            try {
                const res = await doctorService.getDoctorPatientDetail(patientId);
                // Xử lý an toàn các cấu trúc trả về khác nhau từ API
                setPatient(res?.data?.data || res?.data || res);
            } catch (err) {
                setError(err?.message || 'Không thể tải thông tin bệnh nhân. Vui lòng thử lại.');
            }
        };

        if (patientId) {
            fetchPatient();
        }
    }, [patientId]);

    /**
     * Hàm xử lý quá trình nộp form: Khởi tạo hồ sơ bệnh án trên DB và ghi nhận sự kiện lên Smart Contract.
     */
    const onSubmit = async (data) => {
        // Lấy định danh ID của bệnh nhân
        const truePatientId = patient?._id || patient?.id;

        if (!truePatientId) {
            toast.error('Không xác định được ID bệnh nhân');
            return;
        }

        setSubmitError('');
        setSubmitSuccess(false);

        const loadingToast = toast.loading('Đang tạo bệnh án...');

        try {
            // Validation dữ liệu form
            if (!data.type || !data.note) throw new Error('Nhập thiếu dữ liệu');

            // Bước 1: Gửi request lên server để tạo Record trong database
            const res = await doctorService.createMedicalRecord(truePatientId, {
                type: data.type,
                note: data.note,
            });

            const createRes = res.data;

            // Trích xuất các tham số (Metadata) từ server để thực hiện giao dịch Web3
            const medicalRecordId = createRes?.medicalRecordId;
            const recordHash = createRes?.recordHash;
            const blockchain = createRes?.blockchain;
            const contractAddress = blockchain?.contractAddress;
            const method = blockchain?.method;
            const args = Array.isArray(blockchain?.args) ? blockchain.args : [];

            // Xác thực tính đầy đủ của siêu dữ liệu trước khi tương tác với blockchain
            if (!medicalRecordId || !recordHash || !contractAddress || method !== 'createRecord' || args.length < 3) {
                throw new Error(createRes?.message || 'Backend chưa trả đủ metadata blockchain để ký createRecord');
            }

            // Bước 2: Thiết lập kết nối Web3 qua MetaMask
            if (!window.ethereum) {
                throw new Error('Cần cài MetaMask để ký giao dịch blockchain');
            }

            // Ép ví chuyển sang mạng Sepolia
            await enforceSepolia();

            // Yêu cầu quyền truy cập tài khoản từ ví
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Khởi tạo Smart Contract với quyền ghi (signer)
            const contract = new ethers.Contract(
                contractAddress,
                ['function createRecord(string mongoId, address patient, bytes32 _recordHash) external'],
                signer,
            );

            // Bước 3: Mô phỏng giao dịch (static call) để bắt các lỗi logic (revert) trước khi tốn phí gas
            toast.loading('Đang kiểm tra điều kiện blockchain...', { id: loadingToast });
            await contract.createRecord.staticCall(args[0], args[1], args[2]);

            // Bước 4: Thực thi giao dịch thực tế trên mạng lưới
            toast.loading('Vui lòng xác nhận giao dịch trên MetaMask...', { id: loadingToast });
            const tx = await contract.createRecord(args[0], args[1], args[2]);

            // Chờ mạng lưới khai thác (mine) giao dịch vào block
            toast.loading('Đang chờ blockchain xác nhận...', { id: loadingToast });
            await tx.wait();

            // Bước 5: Cập nhật hash giao dịch (txHash) về server để đồng bộ
            toast.loading('Đang xác minh giao dịch với backend...', { id: loadingToast });
            await doctorService.verifyMedicalRecordTx(medicalRecordId, tx.hash);

            // Cập nhật trạng thái giao diện khi hoàn thành toàn bộ luồng
            setSubmitSuccess(true);
            reset();

            toast.success('Tạo hồ sơ bệnh án và xác minh blockchain thành công', {
                id: loadingToast,
            });

            // Chuyển hướng người dùng sang trang danh sách bệnh án
            setTimeout(() => {
                navigate('/doctor/medical-records');
            }, 1200);
        } catch (err) {
            // Xử lý lỗi trong toàn bộ quá trình (bao gồm cả Web2 và Web3)
            const message = getReadableBlockchainError(err);

            // Xử lý một lỗi đặc thù (custom error) từ Smart Contract không có thông báo rõ ràng
            if (message === 'execution reverted (unknown custom error)') {
                setSubmitError('Bệnh nhân đã thu hồi quyền');
                toast.error('Bệnh nhân đã thu hồi quyền', { id: loadingToast });
            } else {
                setSubmitError(message);
                toast.error(message, { id: loadingToast });
            }
        }
    };

    // Render trạng thái lỗi toàn trang (khi không lấy được thông tin bệnh nhân)
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

    // Render giao diện chính của trang
    return (
        <div className="flex h-full bg-gray-50/50">
            {/* Vùng bao bọc cho phép cuộn độc lập nội dung trang */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1"
                >
                    {/* ================= KHU VỰC HEADER ================= */}
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

                    {/* ================= KHU VỰC LƯỚI NỘI DUNG CHÍNH (GRID) ================= */}
                    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
                        {/* CỘT TRÁI: HIỂN THỊ THÔNG TIN CHI TIẾT CỦA BỆNH NHÂN */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                {/* Phần Header của thông tin bệnh nhân */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                                    {/* Tạo Avatar từ chữ cái đầu tiên */}
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

                                {/* Danh sách chi tiết thông tin cá nhân */}
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

                            {/* Khung cảnh báo nhắc nhở bác sĩ */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-amber-800 leading-relaxed">
                                    Hãy kiểm tra kỹ thông tin bệnh nhân trước khi ghi nhận dữ liệu vào hồ sơ y tế.
                                </p>
                            </div>
                        </div>

                        {/* CỘT PHẢI: FORM CHỈ ĐỊNH XÉT NGHIỆM */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                Chỉ định xét nghiệm & Chẩn đoán
                            </h2>

                            {/* Thông báo thao tác thành công (Success state) */}
                            {submitSuccess && (
                                <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Tạo bệnh án thành công! Hệ thống đang chuyển hướng...
                                </div>
                            )}

                            {/* Thông báo lỗi thao tác (Error state) */}
                            {submitError && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200 flex items-start gap-2">
                                    <ShieldAlert className="w-5 h-5 shrink-0" />
                                    {submitError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Nhóm Input chọn loại xét nghiệm */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Loại xét nghiệm yêu cầu <span className="text-red-500">*</span>
                                    </label>

                                    {/* Sử dụng component Select từ shadcn/ui.
                                        Kết nối giá trị đã chọn vào react-hook-form thông qua hàm setValue.
                                    */}
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

                                        {/* Thiết lập position và sideOffset để đảm bảo menu tùy chọn đổ xuống đúng vị trí */}
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

                                    {/* Thẻ input ẩn để react-hook-form thực hiện validation */}
                                    <input type="hidden" {...register('type', { required: true })} />

                                    {errors.type && (
                                        <p className="text-xs font-medium text-red-500 mt-2">
                                            Vui lòng chọn loại xét nghiệm phù hợp.
                                        </p>
                                    )}
                                </div>

                                {/* Nhóm Input ghi chú lâm sàng */}
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

                                {/* Nút Submit */}
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
