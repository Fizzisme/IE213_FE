import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, FileText, Clock, AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { getDoctorMedicalRecords } from '../../../services/doctorApi';

const STATUS_COLORS = {
    CREATED: 'bg-blue-100 text-blue-700 border-blue-200',
    HAS_RESULT: 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse shadow-sm',
    DIAGNOSED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    COMPLETE: 'bg-slate-100 text-slate-700 border-slate-200',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const STATUS_LABELS = {
    CREATED: 'Đang chờ Lab',
    HAS_RESULT: 'Cần chẩn đoán',
    DIAGNOSED: 'Đã chẩn đoán',
    COMPLETE: 'Đã đóng hồ sơ',
    COMPLETED: 'Đã đóng hồ sơ',
};

export default function DoctorMedicalRecords() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // "" = Tất cả

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getDoctorMedicalRecords(filterStatus ? { status: filterStatus } : {});
                const dataList = res?.data?.data || res?.data || res || [];
                setRecords(Array.isArray(dataList) ? dataList : []);
            } catch (err) {
                setError(err.message || 'Không thể tải danh sách bệnh án.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [filterStatus]);

    // Hàm lấy ID an toàn
    const getRecordId = (r) => r?._id || r?.id;

    return (
        <div className="flex h-full">
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-hidden">
                {/* ================= HEADER ================= */}
                <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                            <ClipboardList className="h-6 w-6" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                <button
                                    onClick={() => navigate('/doctor')}
                                    className="hover:text-primary flex items-center gap-1"
                                >
                                    <ArrowLeft className="h-3 w-3" /> Tổng quan
                                </button>
                                <span>/</span>
                                <span>Bệnh án</span>
                            </div>

                            <h1 className="text-2xl font-bold text-textColor">Quản lý Bệnh án</h1>
                        </div>
                    </div>

                    {/* FILTER */}
                    <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border overflow-x-auto">
                        {[
                            { label: 'Tất cả', value: '' },
                            { label: 'Chờ Lab', value: 'CREATED' },
                            { label: 'Chẩn đoán', value: 'HAS_RESULT' },
                            { label: 'Hoàn thành', value: 'COMPLETED' },
                        ].map((item) => (
                            <button
                                key={item.value}
                                onClick={() => setFilterStatus(item.value)}
                                className={`px-4 py-2 text-sm rounded-lg font-medium whitespace-nowrap cursor-pointer transition ${
                                    filterStatus === item.value
                                        ? 'bg-primary text-white shadow'
                                        : 'text-gray-500 hover:text-primary'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* ================= TABLE CARD ================= */}
                <div className="bg-white rounded-2xl border shadow-sm flex flex-col flex-1 min-h-0">
                    {/* TABLE HEADER */}
                    <div className="p-5 border-b bg-gray-50">
                        <h2 className="font-bold text-textColor">Danh sách bệnh án</h2>
                    </div>

                    {/* TABLE BODY */}
                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center text-gray-500">
                                <Activity className="animate-spin mr-2" />
                                Đang tải dữ liệu...
                            </div>
                        ) : error ? (
                            <div className="flex h-64 items-center justify-center text-red-500">{error}</div>
                        ) : records.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                                <FileText className="mb-2" />
                                Không có dữ liệu
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-400 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Mã</th>
                                        <th className="px-6 py-3 text-left">Bệnh nhân</th>
                                        <th className="px-6 py-3">Ngày</th>
                                        <th className="px-6 py-3">Trạng thái</th>
                                        <th className="px-6 py-3 text-right">Hành động</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.map((r) => {
                                        const id = getRecordId(r);

                                        return (
                                            <tr key={id} className="border-b hover:bg-gray-50 transition">
                                                {/* ID */}
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-textColor">{r.type}</div>
                                                    <span className="text-xs text-gray-400">#{id?.slice(-6)}</span>
                                                </td>

                                                {/* PATIENT */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                                            {r.patientInfo?.fullName?.charAt(0) || 'U'}
                                                        </div>

                                                        <div>
                                                            <p className="font-medium text-textColor">
                                                                {r.patientInfo?.fullName || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {r.patientInfo?.phoneNumber || ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* DATE */}
                                                <td className="px-6 py-4 text-center text-gray-500">
                                                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`px-3 py-1 text-xs rounded-full font-semibold ${
                                                            r.status === 'HAS_RESULT'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : r.status === 'COMPLETED'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                    >
                                                        {STATUS_LABELS[r.status]}
                                                    </span>
                                                </td>

                                                {/* ACTION */}
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/doctor/medical-records/${id}/diagnose`)
                                                        }
                                                        className={`px-4 py-2 text-xs rounded-lg font-semibold transition ${
                                                            r.status === 'HAS_RESULT'
                                                                ? 'bg-primary text-white hover:opacity-90'
                                                                : 'border hover:bg-primary/10 text-primary'
                                                        }`}
                                                    >
                                                        {r.status === 'HAS_RESULT' ? 'Chẩn đoán' : 'Chi tiết'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
