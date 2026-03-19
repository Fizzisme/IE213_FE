import { User, Phone, Calendar, Users, Activity, Shield, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function PatientInfoForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dob: parseInt(data.dob),
      };

      await api.post('/auth/create_patient', payload);
      alert("Hồ sơ đã được lưu thành công!");
      navigate('/demo-dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo hồ sơ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%]">
          {/* Left Column - Blue Background */}
          <div className="bg-[#3B82F6] p-10 flex flex-col justify-between text-white">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <span className="text-xl font-semibold">HealthHub</span>
            </div>

            {/* Center Image */}
            <div className="my-8">
              <img
                src="https://images.unsplash.com/photo-1758691462814-485c3672e447?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZm9ybSUyMHBhdGllbnQlMjByZWNvcmRzfGVufDF8fHx8MTc3MzQxNjA4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Patient Records"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Bottom Content */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Complete your patient profile</h2>
              <p className="opacity-80 mb-8">
                Secure your medical records with us. Your information is encrypted and protected under
                healthcare privacy regulations for your safety and confidentiality.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Encrypted Records</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="p-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Patient Information</h1>
              <p className="text-gray-500">Please fill in your details to create your medical profile</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">Full Name</label>
                <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${errors.fullName ? 'border-red-400' : 'border-gray-300'}`}>
                  <div className="flex items-center px-3 py-2.5">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="flex-1 px-3 py-2.5 outline-none"
                    {...register("fullName", { required: true, minLength: 2 })}
                  />
                </div>
                {errors.fullName && <span className="text-red-500 text-xs mt-1 block">Tối thiểu 2 ký tự</span>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">Phone Number</label>
                <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${errors.phoneNumber ? 'border-red-400' : 'border-gray-300'}`}>
                  <div className="flex items-center px-3 py-2.5">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  <input
                    type="tel"
                    placeholder="09xxxxxxxx"
                    className="flex-1 px-3 py-2.5 outline-none"
                    {...register("phoneNumber", {
                      required: true,
                      pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                    })}
                  />
                </div>
                {errors.phoneNumber && <span className="text-red-500 text-xs mt-1 block">Số điện thoại không hợp lệ</span>}
              </div>

              {/* Gender & Year of Birth */}
              <div className="grid grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Gender</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="flex items-center px-3 py-2.5">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-10 w-px bg-gray-300"></div>
                    <select
                      className="flex-1 px-3 py-2.5 outline-none bg-white"
                      {...register("gender")}
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>

                {/* Year of Birth */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Year of Birth</label>
                  <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${errors.dob ? 'border-red-400' : 'border-gray-300'}`}>
                    <div className="flex items-center px-3 py-2.5">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-10 w-px bg-gray-300"></div>
                    <input
                      type="number"
                      placeholder="1995"
                      className="flex-1 px-3 py-2.5 outline-none"
                      {...register("dob", { required: true, min: 1900, max: 2024 })}
                    />
                  </div>
                  {errors.dob && <span className="text-red-500 text-xs mt-1 block">Vui lòng nhập năm sinh</span>}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Your personal information is protected and will only be used for healthcare purposes.
                    We comply with all healthcare privacy regulations.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Save Patient Profile
              </button>

              {/* Footer Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have a profile? </span>
                <a href="#" className="text-emerald-500 font-semibold hover:underline">
                  Go to Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}