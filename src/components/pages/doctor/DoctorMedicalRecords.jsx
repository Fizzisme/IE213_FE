import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, FileText, ClipboardList } from 'lucide-react';
import { doctorService } from '@/services/doctorService.js';
import { motion } from 'framer-motion';

const STATUS_LABELS = {
    CREATED: 'Đang chờ Lab',
    HAS_RESULT: 'Cần chẩn đoán',
    DIAGNOSED: 'Đã chẩn đoán',
    COMPLETE: 'Đã hoàn thành',
};

export default function DoctorMedicalRecords() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // "" = Tất cả

    useEffect(() => {
        const fetchRecords = async () => {
            setError('');
            try {
                const res = await doctorService.getDoctorMedicalRecords(filterStatus ? { status: filterStatus } : {});
                const dataList = res?.data?.data || res?.data || res || [];
                setRecords(Array.isArray(dataList) ? dataList : []);
            } catch (err) {
                setError(err.message || 'Không thể tải danh sách bệnh án.');
            }
        };

        fetchRecords();
    }, [filterStatus]);

    // Hàm lấy ID an toàn
    const getRecordId = (r) => r?._id || r?.id;

    return (
        <div className="flex h-full">
            {/* CUỘN TOÀN TRANG ĐỂ ĐẢM BẢO KHÔNG BỊ LỖI TRÊN MOBILE */}
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* flex-1 để khối tự động giãn khi nội dung ngắn */
                    className="w-full max-w-7xl mx-auto flex flex-col flex-1"
                >
                    {/* KHỐI CARD DUY NHẤT BAO GỒM CẢ HEADER VÀ DANH SÁCH */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1">
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
                                            onClick={() => navigate('/doctor')}
                                            className="hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            <ArrowLeft className="h-3 w-3" /> Tổng quan
                                        </button>
                                        <span>/</span>
                                        <span>Bệnh án</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-primary">Quản lý Bệnh án</h1>
                                </div>
                            </div>

                            {/* FILTER */}
                            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto w-full lg:w-auto">
                                {[
                                    { label: 'Tất cả', value: '' },
                                    { label: 'Chờ Lab', value: 'CREATED' },
                                    { label: 'Chẩn đoán', value: 'HAS_RESULT' },
                                    { label: 'Hoàn thành', value: 'COMPLETE' },
                                ].map((item) => (
                                    <button
                                        key={item.label} // Dùng label thay vì value để tránh key rỗng
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

                        {/* ================= TABLE LIST ================= */}
                        <div className="flex-1">
                            {error ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-medium">
                                    {error}
                                </div>
                            ) : records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Không có dữ liệu</h3>
                                    <p className="text-gray-500 text-sm">Chưa có bệnh án nào trong hệ thống.</p>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                                    {/* SỬ DỤNG TABLE HTML CHUẨN (RESPONSIVE) */}
                                    <table className="w-full text-left border-collapse">
                                        {/* THEAD: Ẩn trên mobile, hiện trên md trở lên */}
                                        <thead className="hidden md:table-header-group bg-gray-50">
                                            <tr>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                                    Mã bệnh án
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                                    Bệnh nhân
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">
                                                    Ngày tạo
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">
                                                    Trạng thái
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {records.map((r) => {
                                                const id = getRecordId(r);

                                                return (
                                                    <tr
                                                        key={id}
                                                        /* TR: Chuyển thành dạng block trên mobile, dạng table-row trên màn hình lớn */
                                                        className="block md:table-row hover:bg-gray-50/80 transition-colors duration-200 border-b md:border-none last:border-0"
                                                    >
                                                        {/* ID */}
                                                        <td className="block md:table-cell px-5 py-4 md:py-4">
                                                            <div className="flex flex-col md:block">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Mã bệnh án
                                                                </span>
                                                                <div className="font-bold text-gray-900">{r.type}</div>
                                                                <span className="text-xs font-mono text-gray-500">
                                                                    #{id?.slice(-6)}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* PATIENT */}
                                                        <td className="block md:table-cell px-5 py-2 md:py-4">
                                                            <div className="flex flex-col md:block">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-2">
                                                                    Bệnh nhân
                                                                </span>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                                                                        {r.patientInfo?.fullName?.charAt(0) || 'U'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900 truncate max-w-[200px] lg:max-w-xs">
                                                                            {r.patientInfo?.fullName || 'Unknown'}
                                                                        </p>
                                                                        <p className="text-xs font-medium text-gray-500">
                                                                            {r.patientInfo?.phoneNumber ||
                                                                                'Chưa cập nhật'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* DATE */}
                                                        <td className="block md:table-cell px-5 py-2 md:py-4 md:text-center">
                                                            <div className="flex flex-col md:block">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Ngày tạo
                                                                </span>
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* STATUS */}
                                                        <td className="block md:table-cell px-5 py-2 md:py-4 md:text-center">
                                                            <div className="flex flex-col md:items-center">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">
                                                                    Trạng thái
                                                                </span>
                                                                <span
                                                                    className={` px-3 py-2 text-xs rounded-md font-bold text-center tracking-wide uppercase ${
                                                                        r.status === 'HAS_RESULT'
                                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                            : r.status === 'COMPLETED' ||
                                                                              r.status === 'COMPLETE'
                                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                                            : 'bg-secondary/10 text-secondary border border-blue-200'
                                                                    }`}
                                                                >
                                                                    {STATUS_LABELS[r.status] || r.status}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* ACTION */}
                                                        <td className="block md:table-cell px-5 py-4 md:py-4 md:text-right bg-gray-50/50 md:bg-transparent">
                                                            <div className="flex flex-col md:items-end">
                                                                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mb-2">
                                                                    Hành động
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/doctor/medical-records/${id}/diagnose`,
                                                                        )
                                                                    }
                                                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 cursor-pointer w-full md:w-auto shadow-sm ${
                                                                        r.status === 'HAS_RESULT'
                                                                            ? 'bg-primary text-white hover:bg-green-700 hover:-translate-y-0.5'
                                                                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                                                                    }`}
                                                                >
                                                                    {r.status === 'HAS_RESULT'
                                                                        ? 'Chẩn đoán'
                                                                        : 'Xem chi tiết'}
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
