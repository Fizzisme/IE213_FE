import React from 'react';
import { User, Phone, Calendar, Users, Activity, Shield, FileText, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/utils/api.js';

export default function PatientInfoForm() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth(); // 2. Lấy hàm refreshUser từ Context

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }, // Thêm isSubmitting để disable nút khi đang gửi
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const payload = {
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                birthYear: parseInt(data.birthYear),
            };

            // 3. Gửi yêu cầu tạo hồ sơ
            await api.post('/patients', payload);

            // 4. CẬP NHẬT LẠI CONTEXT (Rất quan trọng)
            // Lệnh này sẽ gọi lại API /users/me, cập nhật hasProfile: true vào state global
            await refreshUser();

            alert('Hồ sơ đã được lưu thành công!');

            // 5. Điều hướng về dashboard
            // Lúc này dashboard nhận được user.hasProfile = true từ Context và ẩn nút "Tạo hồ sơ"
            navigate('/demo-dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo hồ sơ');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[40%_60%]">
                    {/* Cột trái - Giữ nguyên giao diện đẹp của bạn */}
                    <div className="bg-primary p-10 flex flex-col justify-center text-white">
                        <div className="my-8">
                            <img
                                src="https://images.unsplash.com/photo-1758691462814-485c3672e447?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZm9ybSUyMHBhdGllbnQlMjByZWNvcmRzfGVufDF8fHx8MTc3MzQxNjA4N3ww"
                                alt="Hồ sơ bệnh nhân"
                                className="w-full h-auto object-contain"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4">Hoàn thiện hồ sơ bệnh nhân</h2>
                            <p className="opacity-80 mb-8">
                                Lưu trữ hồ sơ y tế của bạn một cách an toàn. Thông tin của bạn được mã hóa và bảo vệ
                                theo các quy định về bảo mật y tế.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5" />
                                    <span className="text-sm">Tuân thủ HIPAA</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm">Hồ sơ được mã hóa</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải - Form */}
                    <div className="p-12">
                        <div className="flex justify-end mb-6">
                            <button
                                type="button"
                                onClick={() => navigate('/demo-dashboard')}
                                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Trở về
                            </button>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-black mb-2">Thông tin bệnh nhân</h1>
                            <p className="text-gray-500">Vui lòng điền thông tin để tạo hồ sơ y tế của bạn</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Họ và tên */}
                            <div>
                                <label className="block text-sm font-bold text-black mb-2">Họ và tên</label>
                                <div
                                    className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary ${
                                        errors.fullName ? 'border-red-400' : 'border-gray-300'
                                    }`}
                                >
                                    <div className="px-3 py-2.5">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="h-10 w-px bg-gray-300"></div>
                                    <input
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        className="flex-1 px-3 py-2.5 outline-none"
                                        {...register('fullName', { required: true, minLength: 2 })}
                                    />
                                </div>
                                {errors.fullName && (
                                    <span className="text-red-500 text-xs mt-1 block">Họ tên tối thiểu 2 ký tự</span>
                                )}
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-sm font-bold text-black mb-2">Số điện thoại</label>
                                <div
                                    className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary ${
                                        errors.phoneNumber ? 'border-red-400' : 'border-gray-300'
                                    }`}
                                >
                                    <div className="px-3 py-2.5">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="h-10 w-px bg-gray-300"></div>
                                    <input
                                        type="tel"
                                        placeholder="09xxxxxxxx"
                                        className="flex-1 px-3 py-2.5 outline-none"
                                        {...register('phoneNumber', {
                                            required: true,
                                            pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                                        })}
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <span className="text-red-500 text-xs mt-1 block">Số điện thoại không hợp lệ</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Giới tính */}
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">Giới tính</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                                        <div className="px-3 py-2.5">
                                            <Users className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="h-10 w-px bg-gray-300"></div>
                                        <select
                                            className="flex-1 px-3 py-2.5 outline-none bg-white"
                                            {...register('gender')}
                                        >
                                            <option value="M">Nam</option>
                                            <option value="F">Nữ</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Năm sinh */}
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">Năm sinh</label>
                                    <div
                                        className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary ${
                                            errors.birthYear ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                    >
                                        <div className="px-3 py-2.5">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="h-10 w-px bg-gray-300"></div>
                                        <input
                                            type="number"
                                            placeholder="1995"
                                            className="flex-1 px-3 py-2.5 outline-none"
                                            {...register('birthYear', {
                                                required: true,
                                                min: 1900,
                                                max: new Date().getFullYear(),
                                            })}
                                        />
                                    </div>
                                    {errors.birthYear && (
                                        <span className="text-red-500 text-xs mt-1 block">
                                            Vui lòng nhập năm sinh hợp lệ
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-secondary/20 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-600">
                                        Thông tin của bạn được bảo mật theo tiêu chuẩn y tế.
                                    </p>
                                </div>
                            </div>

                            {/* Nút gửi - Thêm trạng thái Loading */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full text-white font-semibold py-3 px-8 rounded-lg transition-all cursor-pointer ${
                                    isSubmitting ? 'bg-primary/10 cursor-not-allowed' : 'bg-primary hover:scale-[1.01]'
                                }`}
                            >
                                {isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ bệnh nhân'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
