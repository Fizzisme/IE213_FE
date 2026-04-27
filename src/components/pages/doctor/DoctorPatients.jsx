import React, { useEffect, useMemo, useState } from 'react';
import { Search, Calendar, Phone, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateVN } from '@/utils/formater.js';
import { doctorService } from '@/services/doctorService.js';
export default function DoctorPatients() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await doctorService.getDoctorPatients();
                const data = res?.data || res || [];
                setPatients(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
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
            <main className="flex-1 p-4 xl:p-6 flex flex-col">
                {/* ================= HEADER ================= */}
                <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Bệnh nhân</h1>
                        <p className="text-gray-500 text-sm mt-1">Quản lý và kiểm tra bệnh nhân</p>
                    </div>

                    {/* FILTER */}
                    <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border">
                        {[
                            { label: 'Tất cả', value: '' },
                            { label: 'Chờ xác nhận', value: 'PENDING' },
                            { label: 'Đã xác nhận', value: 'CONFIRMED' },
                            { label: 'Hoàn thành', value: 'DONE' },
                        ].map((item) => (
                            <button
                                key={item.value}
                                onClick={() => setStatus(item.value)}
                                className={`px-4 py-2 text-sm rounded-lg font-medium ${
                                    status === item.value ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* ================= SEARCH ================= */}
                <div className="mb-4 flex items-center gap-2 border rounded-xl px-3 py-2 bg-white shadow-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm theo tên hoặc SĐT..."
                        className="flex-1 outline-none text-sm"
                    />
                </div>

                {/* ================= LIST ================= */}
                <div className="bg-white rounded-2xl border shadow-sm flex-1 overflow-auto p-5">
                    {loading && <p className="text-gray-500">Đang tải...</p>}

                    {!loading && filtered.length === 0 && (
                        <p className="text-gray-400 text-center">Không có bệnh nhân</p>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((p) => {
                            const id = getId(p);

                            return (
                                <div key={id} className="border rounded-2xl p-4 hover:shadow-md transition">
                                    {/* NAME */}
                                    <h3 className="font-bold text-textColor">{p.fullName}</h3>

                                    {/* INFO */}
                                    <div className="text-sm text-gray-500 mt-2 space-y-1">
                                        <p className="flex items-center gap-1">
                                            <Phone size={14} />
                                            {p.phoneNumber}
                                        </p>

                                        <p className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDateVN(p.createdAt) || 'Chưa có lịch'}
                                        </p>
                                    </div>

                                    {/* ACTION */}
                                    <div className="flex gap-2 mt-4">
                                        {p.status === 'PENDING' && (
                                            <button className="flex-1 text-xs bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-1">
                                                <CheckCircle size={14} />
                                                Xác nhận
                                            </button>
                                        )}

                                        <button
                                            onClick={() => navigate(`/doctor/patients/${p.userId}/create-record`)}
                                            className="flex-1 text-xs border border-primary text-primary py-2 rounded-lg hover:bg-primary/10 cursor-pointer"
                                        >
                                            Tạo bệnh án
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
