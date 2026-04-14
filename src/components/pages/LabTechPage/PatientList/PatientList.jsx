'use client';
import { useEffect, useMemo, useState } from 'react';
import { Upload } from '@/components/animate-ui/icons/upload.js';
import { SlidersHorizontal } from '@/components/animate-ui/icons/sliders-horizontal.js';
import { ArrowUpDown } from '@/components/animate-ui/icons/arrow-up-down.js';
import { BE_URL } from '@/lib/constans.js';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';
import SortButton from '@/components/pages/LabTechPage/SortButton/SortButton.jsx';
import FilterButton from '@/components/pages/LabTechPage/FilterButton/FilterButton.jsx';
import UploadButton from '@/components/pages/LabTechPage/UploadButton/UploadButton.jsx';
import { Bot } from '@/components/animate-ui/icons/bot.js';
import ZoomOut from '@/components/animate-ui/icons/zoom-out.jsx';
import { Search } from '@/components/animate-ui/icons/search.js';

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
    });

    const fetchDataFilter = async (newFilters) => {
        let url = `${BE_URL}/v1/lab-techs/medical-records`;

        const params = [];

        if (newFilters.status !== 'ALL') {
            params.push(`status=${newFilters.status}`);
        }

        if (newFilters.sort) {
            params.push(`sort=${newFilters.sort}`);
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

    const handleSearch = (event) => {
        console.log(event.target.value());
    };
    return (
        <div className="flex-1 bg-white rounded-2xl p-6">
            <header className="flex justify-between">
                <span className="font-bold text-3xl">Danh sách bệnh nhân</span>
                <div className="flex gap-2">
                    <AnimateIcon
                        animateOnHover
                        className=" border-2 p-1 px-[6px] hover:bg-[#f6f6f7] hover:shadow-sm  shadow-xs rounded-md bg-[#f5f5f5] select-none cursor-pointer flex gap-1 items-center"
                    >
                        <Search className={'size-5'} />
                        <input
                            onClick={handleSearch}
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

            <div className="flex gap-12 mt-4 ">
                {/* LEFT */}
                <aside className="flex-2 space-y-3 overflow-y-auto max-h-[500px] ">
                    {medicalRecords.map((m) => (
                        <div
                            key={m._id}
                            onClick={() => setSelected(m)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition
              ${selected?._id === m._id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <img src={m.patientInfo.avatar} className="w-12 h-12 rounded-full" alt="" />
                                <div>
                                    <p className="font-semibold text-xl">{m?.patientInfo?.fullName}</p>
                                    <p className="text-sm text-gray-500">{m?.patientInfo?._id}</p>
                                </div>
                            </div>

                            <span
                                className={`text-sm px-4 py-1.5 rounded-full ${
                                    m.createdAt === '9:30' ? 'bg-red-500 text-white' : 'bg-gray-200'
                                }`}
                            >
                                {formatDateVN(m.createdAt)}
                            </span>
                        </div>
                    ))}
                </aside>

                {/* RIGHT */}
                {/*<PatientList*/}
                {/*    selected={selected}*/}
                {/*    selectedResult={selectedResult}*/}
                {/*    formatDateVN={formatDateVN}*/}
                {/*    riskLabel={riskLabel}*/}
                {/*/>*/}
                <aside className="flex-3 p-4 bg-[#f5f5f5] rounded-xl overflow-y-auto max-h-[650px]">
                    {!selected ? (
                        // EMPTY STATE
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                            <div className="text-5xl mb-3">🧑‍⚕️</div>
                            <p className="font-semibold text-lg">Chưa chọn bệnh nhân</p>
                            <p className="text-sm">Vui lòng chọn một bệnh nhân bên trái</p>
                        </div>
                    ) : (
                        // NORMAL UI
                        <>
                            <header className="flex justify-between">
                                <div className="flex gap-3">
                                    <img
                                        src={selected?.patientInfo?.avatar}
                                        className="w-18 h-18 rounded-full"
                                        alt=""
                                    />
                                    <div className="pt-1">
                                        <h2 className="font-bold text-2xl">{selected?.patientInfo?.fullName}</h2>
                                        <p className="text-sm text-gray-500">
                                            {2026 - selected?.patientInfo?.birthYear} tuổi •{' '}
                                            {selected?.patientInfo?.gender === 'M' ? 'Nam' : 'Nữ'}
                                        </p>
                                        <p className="text-sm text-gray-500">{selected?.patientInfo?._id}</p>
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
                                    {/* GLUCOSE CARD */}
                                    <div className="mt-4">
                                        <p className="text-lg font-semibold">Thông tin chỉ số</p>

                                        <div className="mt-2 bg-white p-4 rounded-xl">
                                            <p className="text-sm font-semibold">Glucose</p>
                                            <p className="text-2xl font-bold text-indigo-600">
                                                {selectedResult?.rawData?.glucose} mg/dL
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">Bình thường: 70 - 140 mg/dL</p>

                                            {/* fake chart */}
                                            <div className="mt-3 h-10 flex items-end gap-1">
                                                {[8, 12, 6, 10, 14, 9, 11].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-2 bg-indigo-400 rounded"
                                                        style={{ height: `${h * 3}px` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* BMI + INSULIN */}
                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                        {/* BMI */}
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-sm font-semibold">BMI</p>
                                            <p className="text-xl font-bold">{selectedResult?.rawData?.bmi}</p>
                                            <p className="text-xs text-gray-500">
                                                {selectedResult?.rawData?.bmi > 30 ? 'Béo phì' : 'Bình thường'}
                                            </p>
                                        </div>

                                        {/* INSULIN */}
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-sm font-semibold">Insulin</p>
                                            <p className="text-xl font-bold">{selectedResult?.rawData?.insulin}</p>
                                            <p className="text-xs text-gray-500">Bình thường: 16 - 166 µU/mL</p>
                                        </div>

                                        {/* SKIN THICKNESS */}
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-sm font-semibold">Độ dày của da</p>
                                            <p className="text-xl font-bold">
                                                {selectedResult?.rawData?.skinThickness} mm
                                            </p>
                                            <p className="text-xs text-gray-500">Bình thường: ~10 - 50 mm</p>
                                        </div>
                                    </div>
                                    {/* BLOOD PRESSURE */}
                                    <div className="mt-4 bg-white p-4 rounded-xl">
                                        <p className="text-sm font-semibold">Huyết áp</p>
                                        <p className="text-xl font-bold">
                                            {selectedResult?.rawData?.bloodPressure} mmHg
                                        </p>
                                    </div>
                                    {/* NOTE */}
                                    <div className="mt-4">
                                        <div className="flex justify-between">
                                            <p className="text-lg font-semibold">Ghi chú</p>
                                            <p className="text-gray-500 text-sm">{formatDateVN(selected?.createdAt)}</p>
                                        </div>

                                        <div className="mt-2 bg-white p-4 rounded-xl">
                                            <p>{selected?.note || '--'}</p>
                                        </div>
                                    </div>
                                    {/* STATUS */}
                                    <div className="mt-4">
                                        <p className="text-lg text-green-700 font-semibold">Trạng thái</p>

                                        <div className="mt-2 p-4 rounded-xl bg-green-50 border border-green-200">
                                            <p className="text-green-600 font-medium">Đã có kết quả xét nghiệm</p>
                                        </div>
                                    </div>
                                    {/* AI ANALYST */}
                                    <div className="mt-4">
                                        <p className="text-lg font-semibold text-indigo-600">Phân tích</p>

                                        <div className="mt-2 bg-white p-4 rounded-xl border">
                                            {/* HEADER */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <Bot animateOnHover className="text-indigo-600 cursor-pointer" />
                                                <p className="font-semibold text-md text-indigo-600">Trợ lý AI</p>
                                            </div>

                                            {/* RESULT */}

                                            <div className="space-y-2">
                                                <p className="">
                                                    <span className="font-medium">Chẩn đoán:</span>{' '}
                                                    <span
                                                        className={`font-semibold ${
                                                            selectedResult?.aiAnalysis?.diabetes
                                                                ? 'text-red-500'
                                                                : 'text-green-600'
                                                        }`}
                                                    >
                                                        {selectedResult?.aiAnalysis?.diabetes
                                                            ? 'Có nguy cơ tiểu đường'
                                                            : 'Không có dấu hiệu tiểu đường'}
                                                    </span>
                                                </p>

                                                {/* PROBABILITY */}
                                                <p className="">
                                                    <span className="font-medium">Xác suất:</span>{' '}
                                                    {selectedResult?.aiAnalysis?.probability}%
                                                </p>
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 h-2 rounded-full">
                                                        <div
                                                            className="h-2 bg-indigo-500 rounded-full"
                                                            style={{
                                                                width: `${selectedResult?.aiAnalysis?.probability ||
                                                                    0}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* RISK */}
                                                <p>
                                                    <span className="font-medium">Tỷ lệ mắc bệnh:</span>{' '}
                                                    <span
                                                        className={`font-semibold ${
                                                            selectedResult?.aiAnalysis?.risk === 'HIGH'
                                                                ? 'text-red-500'
                                                                : selectedResult?.aiAnalysis?.risk === 'MEDIUM'
                                                                ? 'text-yellow-500'
                                                                : 'text-green-600'
                                                        }`}
                                                    >
                                                        {riskLabel[selectedResult?.aiAnalysis?.risk] ||
                                                            'Không xác định'}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* AI NOTE */}
                                            <p className="mt-2 font-medium">Ghi Chú</p>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg  text-gray-600">
                                                {selectedResult?.aiAnalysis?.aiNote || 'Không có ghi chú từ AI'}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {' '}
                                    <div className="mt-4">
                                        <p className="text-lg font-semibold text-gray-500">Loại xét nghiệm</p>
                                        <div className="mt-2 bg-white p-4 rounded-xl">
                                            <p className="font-semibold">Tiểu đường</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between">
                                            <p className="text-lg font-semibold">Ghi chú</p>
                                            <p className="font-semibold text-gray-500">
                                                {formatDateVN(selected?.createdAt)}
                                            </p>
                                        </div>
                                        <div className="mt-2 bg-white p-4 rounded-lg">
                                            <p className="font-medium">{selected?.note || '--'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-lg text-yellow-700 font-semibold">Trạng thái</p>
                                        <div className="mt-2 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                                            <p className="text-yellow-600">Chưa có kết quả xét nghiệm</p>
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
