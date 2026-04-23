'use client';
import { useEffect, useMemo, useState } from 'react';
import { Upload } from '@/components/animate-ui/icons/upload.js';
import { SlidersHorizontal } from '@/components/animate-ui/icons/sliders-horizontal.js';
import { ArrowUpDown } from '@/components/animate-ui/icons/arrow-up-down.js';
import { BE_URL } from '@/lib/constans.js';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';
import SortButton from '@/components/pages/LabTech/LabTechPage/SortButton/SortButton.jsx';
import FilterButton from '@/components/pages/LabTech/LabTechPage/FilterButton/FilterButton.jsx';
import UploadButton from '@/components/pages/LabTech/LabTechPage/UploadButton/UploadButton.jsx';
import { Bot } from '@/components/animate-ui/icons/bot.js';
import ZoomOut from '@/components/animate-ui/icons/zoom-out.jsx';
import { Search } from '@/components/animate-ui/icons/search.js';
import {
    CheckCircle2,
    Activity,
    Scale,
    Droplets,
    FileText,
    LineChart,
    CalendarDays,
    AlertTriangle,
} from 'lucide-react';

const mockPatients = [
    {
        id: 1,
        name: 'Brad Duncan',
        time: '9:30',
        type: 'Cardiogram',
        avatar: 'https://i.pravatar.cc/40?img=1',
        complaints: ['Heart pain', 'High pressure', 'Dizziness'],
        blood: '1K ul',
        lastChecked: '05.12.2023',
    },
    {
        id: 2,
        name: 'Alison Cooper',
        time: '9:00',
        type: 'Online consultation',
        avatar: 'https://i.pravatar.cc/40?img=2',
    },
    {
        id: 3,
        name: 'Linda Huston',
        time: '12:00',
        type: 'Annual check-up',
        avatar: 'https://i.pravatar.cc/40?img=3',
    },
    {
        id: 4,
        name: 'Murack Culhane',
        time: '12:40',
        type: 'Online consultation',
        avatar: 'https://i.pravatar.cc/40?img=4',
    },
    {
        id: 4,
        name: 'Murack Culhane',
        time: '12:40',
        type: 'Online consultation',
        avatar: 'https://i.pravatar.cc/40?img=4',
    },
    {
        id: 4,
        name: 'Murack Culhane',
        time: '12:40',
        type: 'Online consultation',
        avatar: 'https://i.pravatar.cc/40?img=4',
    },
    {
        id: 4,
        name: 'Murack Culhane',
        time: '12:40',
        type: 'Online consultation',
        avatar: 'https://i.pravatar.cc/40?img=4',
    },
    {
        id: 4,
        name: 'Murack Culhane',
        time: '12:40',
        type: 'Online consultation',
        avatar: 'https://i.pravatar.cc/40?img=4',
    },
];

export default function PatientList() {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [testResults, setTestResults] = useState([]);

    const [selected, setSelected] = useState(null);
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [recordsRes, resultsRes] = await Promise.all([
                    fetch(`${BE_URL}/v1/lab-techs/medical-records`, {
                        credentials: 'include',
                    }),
                    fetch(`${BE_URL}/v1/lab-techs/test-results`, {
                        credentials: 'include',
                    }),
                ]);

                const [recordsJson, resultsJson] = await Promise.all([recordsRes.json(), resultsRes.json()]);

                if (recordsJson.statusCode === 200) {
                    setMedicalRecords(recordsJson.data);
                }

                if (resultsJson.statusCode === 200) {
                    setTestResults(resultsJson.data);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        fetchAll();
    }, []);
    const formatDateVN = (date) => {
        return new Date(date).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    };
    const testResultsMap = useMemo(() => {
        return testResults.reduce((acc, t) => {
            acc[t.medicalRecordId] = t;
            return acc;
        }, {});
    }, [testResults]);

    const selectedResult = testResultsMap[selected?._id];
    const riskLabel = {
        LOW: 'Thấp',
        MEDIUM: 'Trung bình',
        HIGH: 'Cao',
    };

    const [filters, setFilters] = useState({
        status: 'ALL',
        sort: 'desc',
        q: '',
    });

    const fetchDataFilter = async (newFilters) => {
        const merged = { ...filters, ...newFilters };
        let url = `${BE_URL}/v1/lab-techs/medical-records`;

        const params = [];

        if (merged.status !== 'ALL') {
            params.push(`status=${merged.status}`);
        }

        if (merged.sort) {
            params.push(`sort=${merged.sort}`);
        }

        if (merged.q) {
            params.push(`q=${encodeURIComponent(merged.q)}`);
        }

        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }

        const res = await fetch(url, {
            credentials: 'include',
        });

        const data = await res.json();
        setMedicalRecords(data.data);
    };

    const [debounced, setDebounced] = useState(filters.q);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(filters.q);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.q]);

    useEffect(() => {
        fetchDataFilter({ q: debounced });
    }, [debounced]);

    return (
        <div className="flex-1 bg-white rounded-2xl p-6">
            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <span className="font-bold text-xl xl:text-2xl text-primary">Danh sách bệnh nhân</span>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <AnimateIcon
                        animateOnHover
                        className=" border-2 px-1.5 hover:bg-[#f6f6f7] hover:shadow-sm  shadow-xs rounded-lg bg-[#f5f5f5] select-none cursor-pointer flex gap-1.5 items-center"
                    >
                        <Search className={'size-4'} />
                        <input
                            value={filters.q}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    q: e.target.value,
                                }))
                            }
                            className="flex-1 p-1 text-sm outline-none border-none"
                            placeholder="Tìm kiếm"
                        />
                    </AnimateIcon>
                    <SortButton
                        side={'bottom'}
                        align={'end'}
                        sideOffset={10}
                        filters={filters}
                        setFilters={setFilters}
                        fetchDataFilter={fetchDataFilter}
                    />
                    <FilterButton
                        side={'bottom'}
                        align={'end'}
                        sideOffset={10}
                        filters={filters}
                        setFilters={setFilters}
                        fetchDataFilter={fetchDataFilter}
                    />
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 xl:gap-8 mt-4">
                {/* LEFT */}
                <aside className="w-full xl:w-[40%] space-y-3 overflow-y-auto max-h-[400px] xl:max-h-[500px]">
                    {medicalRecords.map((m) => (
                        <div
                            key={m._id}
                            onClick={() => setSelected(m)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition
              ${selected?._id === m._id ? 'bg-primary/10' : 'hover:bg-secondary/20'}`}
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={m.patientInfo.avatar}
                                    className="w-8 h-8 xl:w-10 xl:h-10 rounded-full"
                                    alt=""
                                />
                                <div>
                                    <p className="font-semibold text-base xl:text-lg">{m?.patientInfo?.fullName}</p>
                                    <p className="text-sm text-gray-500">{m?.patientInfo?._id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </aside>

                {/* RIGHT */}

                <aside className="w-full xl:w-[60%] p-3 sm:p-4 bg-primary/10 rounded-xl overflow-y-auto min-h-[300px] max-h-[400px] xl:max-h-[500px]">
                    {!selected ? (
                        // EMPTY STATE
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                            <img src="/DoctorImage.png" alt="Ảnh bác sĩ" className="h-64" />
                            <p className="font-semibold text-lg">Chưa chọn bệnh nhân</p>
                            <p className="text-sm">Vui lòng chọn một bệnh nhân bên trái</p>
                        </div>
                    ) : (
                        // NORMAL UI
                        <>
                            <header className="flex justify-between">
                                <div className="flex gap-3 items-center">
                                    <img
                                        src={selected?.patientInfo?.avatar}
                                        className="w-10 h-10 xl:w-12 xl:h-12 rounded-full"
                                        alt=""
                                    />
                                    <div>
                                        <h2 className="font-bold text-lg lg:text:xl">
                                            {selected?.patientInfo?.fullName}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {2026 - selected?.patientInfo?.birthYear} tuổi •{' '}
                                            {selected?.patientInfo?.gender === 'M' ? 'Nam' : 'Nữ'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex">
                                    {!selectedResult && <UploadButton medicalRecordId={selected?._id} />}
                                    {/*<ZoomOut />*/}
                                </div>
                            </header>
                            {selectedResult ? (
                                <>
                                    {' '}
                                    <div className="mt-8 bg-white rounded-md shadow border border-gray-200 overflow-hidden">
                                        {/* HEADER */}
                                        <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <p className="text-sm font-semibold text-gray-700">
                                                    Kết quả xét nghiệm
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <CalendarDays className="w-4 h-4" />
                                                {formatDateVN(selected?.createdAt)}
                                            </div>
                                        </div>

                                        {/* TABLE */}
                                        <div className={'w-full overflow-x-auto'}>
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100 text-gray-600">
                                                    <tr>
                                                        <th className="text-left px-4 py-2">Xét nghiệm</th>
                                                        <th className="text-left px-4 py-2">Kết quả</th>
                                                        <th className="text-left px-4 py-2">Trị số tham chiếu</th>
                                                        <th className="text-left px-4 py-2">Đơn vị</th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y">
                                                    {/* GLUCOSE */}
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">Glucose</td>
                                                        <td
                                                            className={`px-4 py-3 font-semibold ${
                                                                selectedResult?.rawData?.glucose > 140
                                                                    ? 'text-red-500'
                                                                    : 'text-[#0d7b6d]'
                                                            }`}
                                                        >
                                                            {selectedResult?.rawData?.glucose}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">70 - 140</td>
                                                        <td className="px-4 py-3 text-gray-500">mg/dL</td>
                                                    </tr>

                                                    {/* BMI */}
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">BMI</td>
                                                        <td
                                                            className={`px-4 py-3 font-semibold ${
                                                                selectedResult?.rawData?.bmi > 30
                                                                    ? 'text-red-500'
                                                                    : 'text-[#0d7b6d]'
                                                            }`}
                                                        >
                                                            {selectedResult?.rawData?.bmi}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">18.5 - 24.9</td>
                                                        <td className="px-4 py-3 text-gray-500">kg/m²</td>
                                                    </tr>

                                                    {/* INSULIN */}
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">Insulin</td>
                                                        <td className="px-4 py-3 font-semibold text-textColor">
                                                            {selectedResult?.rawData?.insulin}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">16 - 166</td>
                                                        <td className="px-4 py-3 text-gray-500">µU/mL</td>
                                                    </tr>

                                                    {/* BLOOD PRESSURE */}
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">Huyết áp</td>
                                                        <td className="px-4 py-3 font-semibold text-textColor">
                                                            {selectedResult?.rawData?.bloodPressure}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">~120/80</td>
                                                        <td className="px-4 py-3 text-gray-500">mmHg</td>
                                                    </tr>

                                                    {/* SKIN THICKNESS */}
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">Độ dày da</td>
                                                        <td className="px-4 py-3 font-semibold text-textColor">
                                                            {selectedResult?.rawData?.skinThickness}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">10 - 50</td>
                                                        <td className="px-4 py-3 text-gray-500">mm</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {/*Note*/}
                                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden mt-8">
                                        {/* HEADER */}
                                        <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <p className="text-sm font-semibold text-gray-700">Ghi chú lâm sàng</p>
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <CalendarDays className="w-4 h-4" />
                                                {formatDateVN(selected?.createdAt)}
                                            </div>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="p-4 space-y-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Nhận định:</p>
                                                <p className="text-gray-800 font-medium">
                                                    {selected?.note || 'Không có'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Khuyến nghị:</p>
                                                <p className="text-gray-800">Theo dõi chỉ số đường huyết định kỳ.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 bg-white rounded-md border border-gray-200 overflow-hidden">
                                        {/* HEADER */}
                                        <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Bot className="w-5 h-5 text-[#0d7b6d]" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">Phân tích AI</p>
                                                    <p className="text-xs text-gray-500">
                                                        Đánh giá hỗ trợ (không thay thế chẩn đoán bác sĩ)
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="text-xs text-gray-400 border px-2 py-1 rounded-md">
                                                Verified
                                            </span>
                                        </div>

                                        {/* BODY */}
                                        <div className="p-5 space-y-6">
                                            {/* TOP: METRICS */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* KẾT LUẬN */}
                                                <div className="p-4 border rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Kết luận</p>
                                                    <p
                                                        className={`text-sm font-semibold ${
                                                            selectedResult?.aiAnalysis?.diabetes
                                                                ? 'text-red-600'
                                                                : 'text-emerald-600'
                                                        }`}
                                                    >
                                                        {selectedResult?.aiAnalysis?.diabetes
                                                            ? 'Có nguy cơ tiểu đường'
                                                            : 'Chưa ghi nhận dấu hiệu'}
                                                    </p>
                                                </div>

                                                {/* RISK */}
                                                <div className="p-4 border rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Mức rủi ro</p>
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${
                                                            selectedResult?.aiAnalysis?.risk === 'HIGH'
                                                                ? 'bg-red-50 text-red-600'
                                                                : selectedResult?.aiAnalysis?.risk === 'MEDIUM'
                                                                ? 'bg-yellow-50 text-yellow-600'
                                                                : 'bg-emerald-50 text-emerald-600'
                                                        }`}
                                                    >
                                                        {riskLabel[selectedResult?.aiAnalysis?.risk] ||
                                                            'Không xác định'}
                                                    </span>
                                                </div>

                                                {/* PROBABILITY */}
                                                <div className="p-4 border rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Xác suất</p>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-xl font-bold text-gray-800">
                                                            {selectedResult?.aiAnalysis?.probability || 0}%
                                                        </p>
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-2 bg-[#0d7b6d]"
                                                                style={{
                                                                    width: `${selectedResult?.aiAnalysis?.probability ||
                                                                        0}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BOTTOM: NOTE FULL WIDTH */}
                                            <div className="border rounded-lg bg-gray-50 p-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                                    Phân tích chi tiết
                                                </p>

                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                    {selectedResult?.aiAnalysis?.aiNote ||
                                                        'Không có dữ liệu phân tích từ AI.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* LOẠI XÉT NGHIỆM */}
                                    <div className="mt-8 bg-white rounded-md border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b">
                                            <p className="text-sm font-semibold text-gray-700">Loại xét nghiệm</p>
                                        </div>

                                        <div className="p-4">
                                            <p className="font-medium text-gray-800">Tiểu đường</p>
                                        </div>
                                    </div>

                                    {/* GHI CHÚ */}
                                    <div className="mt-6 bg-white rounded-md border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                                            <p className="text-sm font-semibold text-gray-700">Ghi chú lâm sàng</p>
                                            <p className="text-xs text-gray-500">{formatDateVN(selected?.createdAt)}</p>
                                        </div>

                                        <div className="p-4">
                                            <p className="text-sm text-gray-800 leading-relaxed">
                                                {selected?.note || 'Không có ghi chú'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* TRẠNG THÁI */}
                                    <div className="mt-6 bg-white rounded-md border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b">
                                            <p className="text-sm font-semibold text-gray-700">Trạng thái</p>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-md w-fit">
                                                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                <p className="text-sm font-medium">Chưa có kết quả xét nghiệm</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
}
