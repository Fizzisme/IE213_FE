import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ClipboardList, Loader2, AlertTriangle, Eye } from 'lucide-react';
import { patientService } from '@/services/patientService.js';
import { motion } from 'framer-motion';

const STATUS_LABELS = {
    CREATED: 'Đang chờ Lab',
    WAITING_RESULT: 'Lab đang xử lý',
    HAS_RESULT: 'Đã có kết quả',
    DIAGNOSED: 'Đã chẩn đoán',
    COMPLETE: 'Hoàn thành',
    COMPLETED: 'Hoàn thành',
};

const STATUS_CLASSES = {
    CREATED: 'bg-secondary/20 text-secondary ',
    WAITING_RESULT: 'bg-orange-50 text-orange-700 border-orange-200',
    HAS_RESULT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    DIAGNOSED: 'bg-purple-50 text-purple-700 border-purple-200',
    COMPLETE: 'bg-green-50 text-green-700 border-green-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
};

export default function PatientMedicalRecords() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const normalizeStatus = (status) => {
        if (status === 'COMPLETED') return 'COMPLETE';
        return status || '';
    };

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await patientService.getMedicalRecords();
                const dataList = res?.data?.data || res?.data || res || [];
                setRecords(Array.isArray(dataList) ? dataList : []);
            } catch (err) {
                setError(err.message || 'Không thể tải danh sách bệnh án.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const filteredRecords = records.filter((record) => {
        if (!filterStatus) return true;
        return normalizeStatus(record.status) === filterStatus;
    });

    const getRecordId = (record) => record?._id || record?.id;

    const getShortId = (id) => {
        if (!id) return '------';
        return String(id).slice(-6);
    };

    const formatDate = (value) => {
        if (!value) return '--/--/----';
        return new Date(value).toLocaleDateString('vi-VN');
    };

    return (
        <div className="flex h-full">
            {/* KHÓA CUỘN NGOÀI: overflow-hidden */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col h-full overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* CHIA CHIỀU CAO: min-h-0 giúp flex-1 co giãn đúng chuẩn box */
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1 h-full min-h-0"
                >
                    {/* KHỐI CARD DUY NHẤT BAO GỒM CẢ HEADER VÀ DANH SÁCH */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1 min-h-0">
                        {/* ================= HEADER & FILTER ================= */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6 pb-6 border-b border-gray-100 shrink-0">
                            {/* LEFT */}
                            <div className="flex items-center gap-4">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#04d3b8] text-white shadow-md shrink-0">
                                    <ClipboardList className="h-6 w-6" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                        <button
                                            onClick={() => navigate('/patient/dashboard')}
                                            className="hover:text-primary flex items-center gap-1 cursor-pointer transition-colors font-medium"
                                        >
                                            <ArrowLeft className="h-3 w-3" /> Tổng quan
                                        </button>
                                        <span>/</span>
                                        <span>Bệnh án của tôi</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-primary">Hồ sơ bệnh án</h1>
                                </div>
                            </div>

                            {/* FILTER */}
                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 overflow-x-auto w-full lg:w-auto scrollbar-hide">
                                {[
                                    { label: 'Tất cả', value: '' },
                                    { label: 'Chờ Lab', value: 'CREATED' },
                                    { label: 'Đã có kết quả', value: 'HAS_RESULT' },
                                    { label: 'Hoàn thành', value: 'COMPLETE' },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => setFilterStatus(item.value)}
                                        className={`px-4 py-2 text-sm rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all duration-300 flex-1 lg:flex-none text-center ${
                                            filterStatus === item.value
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-gray-500 hover:text-primary hover:bg-white'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ================= DANH SÁCH ================= */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                                    <p className="font-medium text-lg">Đang tải hồ sơ bệnh án...</p>
                                    <p className="text-sm text-gray-400 mt-1">Vui lòng đợi trong giây lát</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <AlertTriangle className="w-8 h-8 text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-red-600 mb-2">Đã xảy ra lỗi</h3>
                                    <p className="text-gray-600 text-center font-medium">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-6 px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-md border border-red-200 hover:bg-red-100 transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : filteredRecords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-16">
                                    <div className="w-20 h-20 bg-gray-50 rounded-md flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không có hồ sơ nào</h3>
                                    <p className="text-gray-500 text-sm max-w-sm">
                                        Bạn chưa có hồ sơ bệnh án nào phù hợp với điều kiện tìm kiếm.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm bg-white">
                                    {/* SỬ DỤNG TABLE HTML CHUẨN (RESPONSIVE) */}
                                    <table className="w-full text-left border-collapse">
                                        {/* THEAD: Ẩn trên mobile, hiện trên lg trở lên */}
                                        <thead className="hidden lg:table-header-group bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[15%]">
                                                    Mã hồ sơ
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[35%]">
                                                    Thông tin lâm sàng
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center w-[15%]">
                                                    Ngày tạo
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center w-[20%]">
                                                    Trạng thái
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right w-[15%]">
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {filteredRecords.map((record) => {
                                                const id = getRecordId(record);

                                                return (
                                                    <tr
                                                        key={id}
                                                        /* TR: Chuyển thành dạng block trên mobile, dạng table-row trên màn hình lớn */
                                                        className="block lg:table-row hover:bg-gray-50/80 transition-colors duration-200 border-b lg:border-none last:border-0"
                                                    >
                                                        {/* MÃ HỒ SƠ */}
                                                        <td className="block lg:table-cell px-5 py-4 lg:px-6">
                                                            <div className="flex flex-col lg:block">
                                                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Mã hồ sơ
                                                                </span>
                                                                <div className="font-bold text-gray-900 text-base">
                                                                    #{getShortId(id)}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* THÔNG TIN LÂM SÀNG */}
                                                        <td className="block lg:table-cell px-5 py-2 lg:py-4 lg:px-6">
                                                            <div className="flex flex-col lg:block">
                                                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Loại hồ sơ & Ghi chú
                                                                </span>
                                                                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary/20 text-secondary font-bold text-xs border border-blue-100 mb-2">
                                                                    {record.type || 'Chưa phân loại'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* NGÀY TẠO */}
                                                        <td className="block lg:table-cell px-5 py-2 lg:py-4 lg:px-6 lg:text-center">
                                                            <div className="flex flex-col lg:items-center">
                                                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Ngày tạo
                                                                </span>
                                                                <span className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                                                    {formatDate(record.createdAt)}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* TRẠNG THÁI */}
                                                        <td className="block lg:table-cell px-5 py-2 lg:py-4 lg:px-6 lg:text-center">
                                                            <div className="flex flex-col lg:items-center">
                                                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Trạng thái hiện tại
                                                                </span>
                                                                <span
                                                                    className={`inline-flex px-3 py-1.5 text-xs rounded-md font-bold uppercase tracking-wider border ${STATUS_CLASSES[
                                                                        record.status
                                                                    ] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                                                >
                                                                    {STATUS_LABELS[record.status] ||
                                                                        record.status ||
                                                                        'KHÔNG XÁC ĐỊNH'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* HÀNH ĐỘNG */}
                                                        <td className="block lg:table-cell px-5 py-4 lg:py-4 lg:px-6 lg:text-right bg-gray-50/50 lg:bg-transparent mt-2 lg:mt-0">
                                                            <div className="flex flex-col lg:items-end">
                                                                <button
                                                                    onClick={() =>
                                                                        navigate(`/patient/medical-records/${id}`)
                                                                    }
                                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-md border-2 border-gray-200 text-textColor bg-white hover:border-primary hover:text-primary transition-all duration-300 w-full lg:w-auto shadow-sm hover:shadow-md cursor-pointer"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
