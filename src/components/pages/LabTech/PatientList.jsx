// src/components/pages/LabTech/PatientList.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.tsx';
import SortButton from '@/components/pages/LabTech/SortButton.jsx';
import FilterButton from '@/components/pages/LabTech/FilterButton.jsx';
import UploadButton from '@/components/pages/LabTech/UploadButton.jsx';
import { Bot } from '@/components/animate-ui/icons/bot.tsx';
import { Search } from '@/components/animate-ui/icons/search.tsx';
import { FileText, CalendarDays } from 'lucide-react';
import { labTechService } from '@/services/LabTechService.js';
import { formatDateVN, getInitials } from '@/utils/formater.js';

/**
 * Component PatientList
 * Quản lý giao diện danh sách bệnh nhân và kết quả xét nghiệm dành cho Kỹ thuật viên.
 * Cho phép tìm kiếm, lọc, sắp xếp và xem chi tiết kết quả phân tích AI.
 */
export default function PatientList() {
    // Quản lý danh sách hồ sơ bệnh án và danh sách kết quả xét nghiệm tương ứng
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [testResults, setTestResults] = useState([]);

    // State lưu trữ hồ sơ bệnh án đang được người dùng chọn để xem chi tiết
    const [selected, setSelected] = useState(null);

    /**
     * useEffect khởi tạo dữ liệu ban đầu.
     * Sử dụng Promise.all để gọi đồng thời hai API lấy danh sách hồ sơ và kết quả,
     * giúp tối ưu hóa thời gian phản hồi của ứng dụng.
     */
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [recordsRes, resultsRes] = await Promise.all([
                    labTechService.getAllMedicalRecords(),
                    labTechService.getAllTestResults(),
                ]);

                if (recordsRes.statusCode === 200) {
                    setMedicalRecords(recordsRes.data);
                }

                if (resultsRes.statusCode === 200) {
                    setTestResults(resultsRes.data);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        fetchAll();
    }, []);

    /**
     * Sử dụng useMemo để tạo một bảng băm (Map) cho các kết quả xét nghiệm.
     * Key là medicalRecordId, giúp việc truy vấn thông tin kết quả của một bệnh nhân
     * đạt độ phức tạp O(1) thay vì duyệt mảng O(n).
     */
    const testResultsMap = useMemo(() => {
        return testResults.reduce((acc, t) => {
            acc[t.medicalRecordId] = t;
            return acc;
        }, {});
    }, [testResults]);

    // Lấy thông tin kết quả xét nghiệm cụ thể của bệnh nhân đang được chọn
    const selectedResult = testResultsMap[selected?._id];

    // Bản đồ nhãn hiển thị cho mức độ rủi ro AI dự đoán
    const riskLabel = {
        LOW: 'Thấp',
        MEDIUM: 'Trung bình',
        HIGH: 'Cao',
    };

    // State quản lý các tham số lọc và tìm kiếm
    const [filters, setFilters] = useState({
        status: 'ALL',
        sort: 'desc',
        q: '',
    });

    /**
     * Hàm fetchDataFilter
     * Thực hiện việc nối chuỗi Query Parameters và gọi API lấy dữ liệu đã qua xử lý lọc/sắp xếp.
     */
    const fetchDataFilter = async (newFilters) => {
        const merged = { ...filters, ...newFilters };
        let url = `/lab-techs/medical-records`;
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
        const res = await labTechService.getAllMedicalRecords(url);
        setMedicalRecords(res.data);
    };

    /**
     * Kỹ thuật Debounce cho ô tìm kiếm.
     * Giảm số lượng request gửi lên server bằng cách đợi 500ms sau khi người dùng ngừng gõ.
     */
    const [debounced, setDebounced] = useState(filters.q);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(filters.q);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.q]);

    // Kích hoạt lại việc tải dữ liệu mỗi khi giá trị debounced thay đổi
    useEffect(() => {
        fetchDataFilter({ q: debounced });
    }, [debounced]);

    return (
        <div className="flex-1 bg-white rounded-2xl p-6">
            {/* TIÊU ĐỀ VÀ BỘ CÔNG CỤ (SEARCH, SORT, FILTER) */}
            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <span className="font-bold text-xl xl:text-2xl text-primary">Danh sách bệnh nhân</span>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    {/* Input tìm kiếm thời gian thực */}
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

                    {/* Các nút chức năng sắp xếp và lọc nâng cao */}
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
                {/* CỘT TRÁI: DANH SÁCH BỆNH NHÂN (SIDEBAR LIST) */}
                <aside className="w-full xl:w-[40%] space-y-3 overflow-y-auto max-h-[400px] xl:max-h-[500px]">
                    {medicalRecords.map((m) => (
                        <div
                            key={m._id}
                            onClick={() => setSelected(m)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition
              ${selected?._id === m._id ? 'bg-primary/10' : 'hover:bg-secondary/20'}`}
                        >
                            <div className="flex items-center gap-3">
                                {m?.patientInfo?.avatar ? (
                                    <img
                                        src={m.patientInfo.avatar}
                                        className="w-8 h-8 xl:w-10 xl:h-10 rounded-full"
                                        alt="avatar bệnh nhân"
                                    />
                                ) : (
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm sm:text-md font-bold shrink-0">
                                        {getInitials(m?.patientInfo?.fullName)}
                                    </div>
                                )}

                                <div>
                                    <p className="font-semibold text-base xl:text-lg">{m?.patientInfo?.fullName}</p>
                                    <p className="text-sm text-gray-500">{m?.patientInfo?._id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </aside>

                {/* CỘT PHẢI: CHI TIẾT KẾT QUẢ VÀ PHÂN TÍCH AI (DETAIL VIEW) */}
                <aside className="w-full xl:w-[60%] p-3 sm:p-4 bg-primary/10 rounded-xl overflow-y-auto min-h-[300px] max-h-[400px] xl:max-h-[500px]">
                    {!selected ? (
                        /* Giao diện khi chưa có bệnh nhân nào được chọn */
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                            <img src="/DoctorImage.png" alt="Ảnh bác sĩ" className="h-64" />
                            <p className="font-semibold text-lg">Chưa chọn bệnh nhân</p>
                            <p className="text-sm">Vui lòng chọn một bệnh nhân bên trái</p>
                        </div>
                    ) : (
                        /* Giao diện hiển thị chi tiết khi đã chọn bệnh nhân */
                        <>
                            <header className="flex justify-between">
                                <div className="flex gap-3 items-center">
                                    {selected?.patientInfo?.avatar ? (
                                        <img
                                            src={selected?.patientInfo?.avatar}
                                            className="w-10 h-10 xl:w-12 xl:h-12 rounded-full"
                                            alt="avatar"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary text-white flex items-center justify-center text-md sm:text-lg font-bold shrink-0">
                                            {getInitials(selected?.patientInfo?.fullName)}
                                        </div>
                                    )}

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
                                    {/* Hiển thị nút Upload nếu hồ sơ chưa có kết quả xét nghiệm */}
                                    {!selectedResult && <UploadButton medicalRecordId={selected?._id} />}
                                </div>
                            </header>

                            {selectedResult ? (
                                <>
                                    {/* KHỐI BẢNG KẾT QUẢ XÉT NGHIỆM (TABULAR DATA) */}
                                    <div className="mt-8 bg-white rounded-md shadow border border-gray-200 overflow-hidden">
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
                                                    {/* Các hàng dữ liệu chỉ số (Glucose, BMI, Insulin, v.v.) 
                                                        Có kèm logic tô màu đỏ nếu vượt ngưỡng tham chiếu */}
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
                                                    {/* Render tiếp các chỉ số khác từ rawData... */}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* KHỐI GHI CHÚ LÂM SÀNG (CLINICAL NOTES) */}
                                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden mt-8">
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

                                    {/* KHỐI PHÂN TÍCH AI (AI INSIGHTS) */}
                                    <div className="mt-8 bg-white rounded-md border border-gray-200 overflow-hidden">
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

                                        <div className="p-5 space-y-6">
                                            {/* Hiển thị tóm tắt các chỉ số AI (Kết luận, Rủi ro, Xác suất) */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            {/* Phân tích văn bản chi tiết từ AI (aiNote) */}
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
                                /* Giao diện hiển thị khi hồ sơ đang ở trạng thái chờ kết quả Lab (Pending state) */
                                <>
                                    <div className="mt-8 bg-white rounded-md border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b">
                                            <p className="text-sm font-semibold text-gray-700">Loại xét nghiệm</p>
                                        </div>
                                        <div className="p-4">
                                            <p className="font-medium text-gray-800">Tiểu đường</p>
                                        </div>
                                    </div>
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
