import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Users,
    Activity,
    FilePlus,
    Calendar as CalendarIcon,
    Phone,
    Clock,
    Video,
    Users as UsersIcon,
    Coffee,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getDoctorPatients } from '../../../services/doctorApi';

// Import Calendar component (Giống với LabTechPage)
import { Calendar } from '@/components/ui/calendar';
import PatientChart from '@/components/pages/LabTech/LabTechPage/PatientChart/PatientChart.jsx';
import { Button } from '@/components/ui/button.js';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';

// Mock data cho Lịch trình khám bệnh của Bác sĩ
const DOCTOR_SCHEDULE = [
    {
        title: 'Tư vấn trực tuyến',
        sub: 'Nguyễn Thị Lan',
        time: '09:00 – 09:30',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        icon: Video,
    },
    {
        title: 'Khám tim mạch',
        sub: 'Trần Văn Bình',
        time: '09:30 – 10:00',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        icon: Activity,
    },
    {
        title: 'Nghỉ giải lao',
        sub: '15 phút',
        time: '',
        color: 'text-slate-400',
        bg: 'bg-slate-100',
        icon: Coffee,
        isBreak: true,
    },
    {
        title: 'Hội chẩn khoa',
        sub: 'Phòng họp B',
        time: '10:45 – 11:45',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        icon: UsersIcon,
    },
];

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State Bệnh nhân
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');

    // State Lịch (Calendar)
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const loadPatients = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getDoctorPatients();
                const dataList = res?.data || res || [];
                setPatients(Array.isArray(dataList) ? dataList : []);
            } catch (err) {
                setError(err.message || 'Không thể tải danh sách bệnh nhân');
            } finally {
                setLoading(false);
            }
        };
        loadPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        return patients.filter((p) => {
            const searchStr = keyword.toLowerCase();
            return p.fullName?.toLowerCase().includes(searchStr) || p.phoneNumber?.includes(searchStr);
        });
    }, [patients, keyword]);

    const getPatientId = (patient) => patient?.userId || patient?._id || patient?.id;

    // Events đánh dấu trên lịch
    const myEvents = [{ id: 'khamBenh', label: 'Lịch khám', color: '#3B82F6', dates: [new Date()] }];

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 p-4 xl:p-6 flex flex-col overflow-x-hidden overflow-y-auto h-full">
                {/* ================= HEADER ================= */}
                <header className="bg-white rounded-2xl p-6 shadow mb-6 flex flex-col lg:flex-row lg:items-center justify-center gap-6">
                    {/* LEFT */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-primary">
                            Mừng bạn quay lại, BS. {user?.fullName || 'Chuyên khoa'}
                        </h1>

                        <p className="text-gray-500 text-sm mt-1">Chúc bạn một ngày khám bệnh hiệu quả</p>

                        <div className="mt-6 lg:border-l-4 border-primary pl-4 italic text-gray-600 w-full">
                            “Nghề y là nghề của trái tim và trách nhiệm.”
                            <span className="block mt-2 text-xs text-gray-400 not-italic">— Medical Ethics</span>
                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                            Mỗi quyết định của bạn ảnh hưởng trực tiếp đến sức khỏe bệnh nhân.
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4">
                        {/* IMAGE */}
                        <div className="hidden lg:flex items-center">
                            <img src="/doctor-welcome.png" alt="doctor welcome" className="max-h-[200px]" />
                        </div>
                    </div>
                </header>

                <PatientChart />

                {/* ================= MAIN CONTENT ================= */}
                <div className="grid xl:grid-cols-[1fr_320px] gap-6 flex-1 min-h-0">
                    {/* LEFT: PATIENT LIST */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0">
                        {/* HEADER */}
                        <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-lg font-bold text-textColor">Danh sách bệnh nhân</h2>

                            <AnimateIcon
                                animateOnHover
                                className="border-2 px-1.5 hover:bg-[#f6f6f7] hover:shadow-sm  shadow-xs rounded-lg bg-[#f5f5f5] select-none cursor-pointer flex gap-1.5 items-center"
                            >
                                <Search className={'size-4'} />
                                <input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tìm kiếm..."
                                    className="flex-1 p-1 text-sm outline-none border-none"
                                />
                            </AnimateIcon>
                        </div>

                        {/* LIST */}
                        <div className="p-5 overflow-y-auto flex-1">
                            {loading && <p>Đang tải...</p>}
                            {error && <p className="text-red-500">{error}</p>}

                            <div className="grid gap-4 lg:grid-cols-2">
                                {filteredPatients.map((p) => {
                                    const pId = getPatientId(p);
                                    return (
                                        <div key={pId} className="border rounded-2xl p-4 hover:shadow-md transition">
                                            <p className="font-bold text-textColor">{p.fullName}</p>

                                            <p className="text-sm text-gray-500">{p.phoneNumber}</p>

                                            <Button
                                                onClick={() => navigate(`/doctor/patients/${pId}/create-record`)}
                                                className="mt-3 text-xs bg-primary text-white px-3 py-1 rounded-lg cursor-pointer"
                                            >
                                                Tạo bệnh án
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: SCHEDULE */}
                    <div className="hidden lg:block">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            captionLayout="dropdown"
                            events={myEvents}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
