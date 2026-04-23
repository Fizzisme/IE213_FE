export default function DosagePage() {
    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6 ">
                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dosage Guidelines</h1>
                    <p className="text-sm text-gray-500 mt-1">Hướng dẫn liều dùng cho bệnh nhân tiểu đường</p>
                </div>

                {/* INFO CARD */}
                <div className="bg-white p-5 rounded-2xl shadow">
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Cập nhật: 16/04/2026</span>
                        <span>Tác giả: Lab Tech Team</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                        Tài liệu này cung cấp hướng dẫn liều dùng insulin và các loại thuốc liên quan cho bệnh nhân tiểu
                        đường dựa trên mức glucose máu và tình trạng lâm sàng.
                    </p>
                </div>

                {/* DOSAGE TABLE */}
                <div className="bg-white p-5 rounded-2xl shadow">
                    <h2 className="font-semibold text-lg mb-4">Bảng liều dùng insulin</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="py-2">Glucose (mg/dL)</th>
                                    <th className="py-2">Mức độ</th>
                                    <th className="py-2">Liều insulin</th>
                                    <th className="py-2">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                <tr className="border-b">
                                    <td className="py-2">70 - 130</td>
                                    <td>Bình thường</td>
                                    <td>0 đơn vị</td>
                                    <td>Không cần can thiệp</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">131 - 180</td>
                                    <td>Hơi cao</td>
                                    <td>2 đơn vị</td>
                                    <td>Theo dõi thêm</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">181 - 250</td>
                                    <td>Cao</td>
                                    <td>4 đơn vị</td>
                                    <td>Kiểm tra lại sau 2h</td>
                                </tr>
                                <tr>
                                    <td className="py-2"> 250</td>
                                    <td>Rất cao</td>
                                    <td>6+ đơn vị</td>
                                    <td className="text-red-500 font-medium">Cần can thiệp ngay</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* NOTES */}
                <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl">
                    <h3 className="font-semibold text-yellow-700 mb-2">⚠️ Lưu ý quan trọng</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Không dùng insulin khi glucose dưới 70 mg/dL</li>
                        <li>• Theo dõi dấu hiệu hạ đường huyết</li>
                        <li>• Luôn kiểm tra lại glucose sau khi tiêm</li>
                    </ul>
                </div>

                {/* ACTION */}
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                        Tải PDF
                    </button>

                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                        Chỉnh sửa
                    </button>
                </div>
            </div>
        </div>
    );
}
