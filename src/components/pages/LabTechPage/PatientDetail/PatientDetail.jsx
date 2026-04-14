import UploadButton from '@/components/pages/LabTechPage/UploadButton/UploadButton.jsx';
import { Bot } from '@/components/animate-ui/icons/bot.js';

export default function PatientDetail({ selected, selectedResult, formatDateVN, riskLabel, medicalRecordId }) {
    return (
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
                            <img src={selected?.patientInfo?.avatar} className="w-18 h-18 rounded-full" alt="" />
                            <div className="pt-1">
                                <h2 className="font-bold text-2xl">{selected?.patientInfo?.fullName}</h2>
                                <p className="text-sm text-gray-500">
                                    {2026 - selected?.patientInfo?.birthYear} tuổi •{' '}
                                    {selected?.patientInfo?.gender === 'M' ? 'Nam' : 'Nữ'}
                                </p>
                                <p className="text-sm text-gray-500">{selected?.patientInfo?._id}</p>
                            </div>
                        </div>

                        {!selectedResult && <UploadButton medicalRecordId={selected?._id} />}
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
                                    <p className="text-xl font-bold">{selectedResult?.rawData?.skinThickness} mm</p>
                                    <p className="text-xs text-gray-500">Bình thường: ~10 - 50 mm</p>
                                </div>
                            </div>
                            {/* BLOOD PRESSURE */}
                            <div className="mt-4 bg-white p-4 rounded-xl">
                                <p className="text-sm font-semibold">Huyết áp</p>
                                <p className="text-xl font-bold">{selectedResult?.rawData?.bloodPressure} mmHg</p>
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
                                                        width: `${selectedResult?.aiAnalysis?.probability || 0}%`,
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
                                                {riskLabel[selectedResult?.aiAnalysis?.risk] || 'Không xác định'}
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
                                    <p className="font-semibold text-gray-500">{formatDateVN(selected?.createdAt)}</p>
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
    );
}
