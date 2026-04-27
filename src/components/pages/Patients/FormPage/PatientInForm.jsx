import React from 'react';
import { User, Phone, Calendar, Users, Shield, FileText, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore.js';
import { patientService } from '@/services/patientService.js';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function PatientInfoForm() {
    const navigate = useNavigate();
    const refreshUser = useAuthStore((s) => s.refreshUser);

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

            await patientService.createProfile(payload);
            await refreshUser();

            toast.success('Hồ sơ đã được lưu thành công!');
            navigate('/patient/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Có lỗi xảy ra khi tạo hồ sơ');
        }
    };

    return (
        <div className="flex h-full">
            {/* Chuyển về overflow-y-auto cho toàn trang để an toàn trên mobile, bỏ ép chiều cao h-full */}
            <main className="flex-1 p-4 lg:p-6 flex flex-col overflow-x-hidden overflow-y-auto bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    /* Để khối tự do căn giữa mà không bị ép chiều cao */
                    className="w-full max-w-6xl mx-auto my-auto"
                >
                    {/* KHỐI CARD BAO GỒM TOÀN BỘ NỘI DUNG (Tự giãn theo nội dung) */}
                    <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
                        {/* Cột trái - Giữ nguyên giao diện, màu sắc */}
                        <div className="hidden md:flex md:w-2/5 bg-primary p-10 flex-col justify-center text-white shrink-0">
                            <div className="my-8">
                                <img
                                    src="https://images.unsplash.com/photo-1758691462814-485c3672e447?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZm9ybSUyMHBhdGllbnQlMjByZWNvcmRzfGVufDF8fHx8MTc3MzQxNjA4N3ww"
                                    alt="Hồ sơ bệnh nhân"
                                    className="w-full h-auto object-contain shadow-sm"
                                />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold mb-4">Hoàn thiện hồ sơ bệnh nhân</h2>
                                <p className="opacity-90 mb-8 leading-relaxed">
                                    Lưu trữ hồ sơ y tế của bạn một cách an toàn. Thông tin của bạn được mã hóa và bảo vệ
                                    theo các quy định nghiêm ngặt nhất về bảo mật y tế.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <Shield className="w-5 h-5 text-green-200" />
                                        <span className="text-sm font-medium">Tuân thủ tiêu chuẩn bảo mật HIPAA</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <FileText className="w-5 h-5 text-green-200" />
                                        <span className="text-sm font-medium">Hồ sơ được mã hóa đầu cuối</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải - Form (Bỏ thanh cuộn, để form ôm vừa vặn nội dung) */}
                        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center">
                            {/* Header di động */}
                            <div className="md:hidden flex items-center justify-center bg-primary text-white p-6 -mx-6 -mt-6 mb-8 rounded-b-3xl shadow-sm">
                                <Shield className="w-8 h-8 mr-3" />
                                <h2 className="text-xl font-bold">Hồ sơ y tế an toàn</h2>
                            </div>

                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin bệnh nhân</h1>
                                <p className="text-gray-500 font-medium">
                                    Vui lòng điền đầy đủ thông tin để khởi tạo hồ sơ y tế điện tử của bạn
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                                {/* Họ và tên */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Họ và tên</label>
                                    <div
                                        className={`flex items-center border-2 rounded-xl overflow-hidden focus-within:ring-0 focus-within:border-primary transition-colors ${
                                            errors.fullName
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-200 bg-gray-50 hover:bg-white'
                                        }`}
                                    >
                                        <div className="px-4 py-3">
                                            <User
                                                className={`w-5 h-5 ${
                                                    errors.fullName ? 'text-red-400' : 'text-gray-400'
                                                }`}
                                            />
                                        </div>
                                        <div className="h-8 w-px bg-gray-200"></div>
                                        <input
                                            type="text"
                                            placeholder="Nguyễn Văn A"
                                            className="flex-1 px-4 py-3 outline-none bg-transparent text-gray-900 font-medium"
                                            {...register('fullName', { required: true, minLength: 2 })}
                                        />
                                    </div>
                                    {errors.fullName && (
                                        <span className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Họ tên tối thiểu 2 ký tự
                                        </span>
                                    )}
                                </div>

                                {/* Số điện thoại */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Số điện thoại</label>
                                    <div
                                        className={`flex items-center border-2 rounded-xl overflow-hidden focus-within:ring-0 focus-within:border-primary transition-colors ${
                                            errors.phoneNumber
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-200 bg-gray-50 hover:bg-white'
                                        }`}
                                    >
                                        <div className="px-4 py-3">
                                            <Phone
                                                className={`w-5 h-5 ${
                                                    errors.phoneNumber ? 'text-red-400' : 'text-gray-400'
                                                }`}
                                            />
                                        </div>
                                        <div className="h-8 w-px bg-gray-200"></div>
                                        <input
                                            type="tel"
                                            placeholder="09xxxxxxxx"
                                            className="flex-1 px-4 py-3 outline-none bg-transparent text-gray-900 font-medium tracking-wide"
                                            {...register('phoneNumber', {
                                                required: true,
                                                pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                                            })}
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <span className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Số điện thoại không hợp lệ
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Giới tính */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Giới tính</label>
                                        <div className="flex items-center border-2 border-gray-200 bg-gray-50 hover:bg-white rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                                            <div className="px-4 py-3">
                                                <Users className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="h-8 w-px bg-gray-200"></div>
                                            <select
                                                className="flex-1 px-4 py-3 outline-none bg-transparent text-gray-900 font-medium cursor-pointer"
                                                {...register('gender')}
                                            >
                                                <option value="M">Nam</option>
                                                <option value="F">Nữ</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Năm sinh */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Năm sinh</label>
                                        <div
                                            className={`flex items-center border-2 rounded-xl overflow-hidden focus-within:ring-0 focus-within:border-primary transition-colors ${
                                                errors.birthYear
                                                    ? 'border-red-400 bg-red-50'
                                                    : 'border-gray-200 bg-gray-50 hover:bg-white'
                                            }`}
                                        >
                                            <div className="px-4 py-3">
                                                <Calendar
                                                    className={`w-5 h-5 ${
                                                        errors.birthYear ? 'text-red-400' : 'text-gray-400'
                                                    }`}
                                                />
                                            </div>
                                            <div className="h-8 w-px bg-gray-200"></div>
                                            <input
                                                type="number"
                                                placeholder="1995"
                                                className="flex-1 px-4 py-3 outline-none bg-transparent text-gray-900 font-medium"
                                                {...register('birthYear', {
                                                    required: true,
                                                    min: 1900,
                                                    max: new Date().getFullYear(),
                                                })}
                                            />
                                        </div>
                                        {errors.birthYear && (
                                            <span className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                                                <Shield className="w-3 h-3" /> Nhập năm sinh hợp lệ
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Ghi chú bảo mật */}
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-8 flex items-start gap-3 shadow-sm">
                                    <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-800 font-medium leading-relaxed">
                                        Bằng việc lưu hồ sơ, bạn đồng ý với các điều khoản bảo mật của chúng tôi. Dữ
                                        liệu sẽ được lưu trữ an toàn trên hệ thống Blockchain.
                                    </p>
                                </div>

                                {/* Nút gửi */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full text-white cursor-pointer font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg mt-8 flex items-center justify-center gap-2 ${
                                        isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                            : 'bg-primary hover:bg-primary/80 hover:-translate-y-0.5'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Đang mã hóa & lưu hồ sơ...</span>
                                        </>
                                    ) : (
                                        'Tạo hồ sơ y tế'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
