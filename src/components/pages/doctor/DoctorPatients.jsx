import React, { useEffect, useMemo, useState } from 'react';
import { Search, Calendar, Phone, CheckCircle, User, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateVN } from '@/utils/formater.js';
import { doctorService } from '@/services/doctorService.js';
import { motion } from 'framer-motion';

export default function DoctorPatients() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await doctorService.getDoctorPatients();
                const data = res?.data || res || [];
                setPatients(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
    }, []);

    // filter
    const filtered = useMemo(() => {
        return patients.filter((p) => {
            const matchSearch =
                p.fullName?.toLowerCase().includes(keyword.toLowerCase()) || p.phoneNumber?.includes(keyword);

            const matchStatus = status ? p.status === status : true;

            return matchSearch && matchStatus;
        });
    }, [patients, keyword, status]);

    const getId = (p) => p?._id || p?.id || p?.userId;

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
                    {/* ================= HEADER ================= */}
                    <header className="bg-white rounded-2xl p-6 shadow mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#04d3b8] flex items-center justify-center text-white shadow-md shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primary">Bệnh nhân</h1>
                                <p className="text-gray-500 text-sm mt-1">Quản lý và kiểm tra bệnh nhân</p>
                            </div>
                        </div>
                    </header>

                    {/* ================= CONTENT BOX ================= */}
                    <div className="bg-white rounded-2xl p-6 shadow flex flex-col flex-1 min-h-0">
                        {/* SEARCH & FILTERS */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 shrink-0">
                            {/* SEARCH */}
                            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full lg:w-80">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tìm theo tên hoặc SĐT..."
                                    className="flex-1 outline-none text-sm bg-transparent text-gray-700"
                                />
                            </div>
                        </div>

                        {/* ================= LIST (THANH CUỘN BÊN TRONG) ================= */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Không có bệnh nhân nào</h3>
                                    <p className="text-gray-500 text-sm">
                                        Chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pb-4">
                                    {filtered.map((p) => {
                                        const id = getId(p);

                                        return (
                                            <div
                                                key={id}
                                                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/30 group flex flex-col"
                                            >
                                                {/* INFO HEADER */}
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-primary font-bold shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                        {p.fullName?.charAt(0)?.toUpperCase() || (
                                                            <User className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden items-center">
                                                        <h3
                                                            className="font-bold text-gray-900 text-base truncate"
                                                            title={p.fullName}
                                                        >
                                                            {p.fullName || 'Bệnh nhân ẩn danh'}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* DETAILS */}
                                                <div className="space-y-2 mb-5 flex-1">
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                        <Phone className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="font-medium">
                                                            {p.phoneNumber || 'Không có SĐT'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="font-medium">
                                                            {formatDateVN(p.createdAt) || 'Chưa có lịch'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* ACTIONS */}
                                                <div className="flex gap-2 mt-auto">
                                                    {p.status === 'PENDING' && (
                                                        <button className="flex-1 text-sm font-semibold bg-primary text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-700 transition-colors shadow-sm cursor-pointer hover:-translate-y-0.5">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Xác nhận</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() =>
                                                            navigate(`/doctor/patients/${p.userId}/create-record`)
                                                        }
                                                        className="flex-1 text-sm font-semibold border-2 border-primary text-primary py-2 rounded-xl hover:bg-primary/5 transition-all cursor-pointer hover:-translate-y-0.5"
                                                    >
                                                        Tạo bệnh án
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
