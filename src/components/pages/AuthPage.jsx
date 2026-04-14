import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import api from '../../utils/api';
// XÓA: import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext'; // Import hook vừa tạo
import { Mail, Lock, Eye, EyeOff, Activity, User, Phone, Calendar, CreditCard, Check } from 'lucide-react';
// ── Carousel slides data ──────────────────────────────────────────────────────
const SLIDES = [
    {
        title: 'Nâng cao hiệu quả chăm sóc sức khỏe',
        desc:
            'Nâng tầm ảnh hưởng của bạn trong ngành y tế. Cải thiện chăm sóc bệnh nhân thông qua kiểm soát dữ liệu chính xác, đặt lịch hẹn liền mạch và quản lý công việc hiệu quả.',
        img:
            'https://images.unsplash.com/photo-1758573467051-71613f7a3444?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwZG9jdG9yJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3MjcyNDg4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        title: 'Đặt lịch khám nhanh chóng, tiện lợi',
        desc:
            'Cho phép bệnh nhân đặt lịch, đổi lịch và hủy hẹn chỉ trong vài giây — giảm tình trạng vắng mặt và giải phóng nhân lực cho đội ngũ y tế.',
        img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    },
    {
        title: 'Quản lý dữ liệu bệnh nhân an toàn',
        desc:
            'Hồ sơ bệnh án tuân thủ chuẩn bảo mật với phân quyền truy cập theo vai trò. Đúng người, đúng thông tin, luôn luôn.',
        img: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    },
    {
        title: 'Phân tích & báo cáo theo thời gian thực',
        desc: 'Theo dõi chỉ số hiệu suất, kết quả điều trị và KPI vận hành từ một bảng điều khiển thống nhất.',
        img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80',
    },
];
// ── Reusable InputField — PHẢI đặt NGOÀI AuthPage ────────────────────────────
const InputField = ({ label, type, icon: Icon, name, placeholder, value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-bold text-black mb-2">{label}</label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
            <div className="flex items-center px-3 py-2.5">
                <Icon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-10 w-px bg-gray-300" />
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={onChange}
                className="flex-1 px-3 py-2.5 outline-none bg-transparent"
                {...props}
            />
        </div>
    </div>
);
// ── Button states ─────────────────────────────────────────────────────────────
// idle → loading → success
function AnimatedButton({ onClick, loading, success, children, fullWidth = false, type = 'button', align }) {
    const active = loading || success;
    return (
        // Wrapper duy trì layout, button bên trong thu nhỏ về center
        <div
            style={{
                width: fullWidth ? '100%' : '150px',
                display: 'flex',
                justifyContent: align === 'center' ? (active ? 'center' : 'flex-start') : 'flex-start',
                transition: 'justify-content 0s',
            }}
        >
            <button
                type={type}
                onClick={onClick}
                disabled={active}
                style={{
                    width: active ? '44px' : fullWidth ? '100%' : '150px',
                    height: '44px',
                    borderRadius: active ? '50%' : '8px',
                    transition: [
                        'width 0.4s cubic-bezier(0.4,0,0.2,1)',
                        'border-radius 0.4s cubic-bezier(0.4,0,0.2,1)',
                        'background-color 0.3s ease',
                    ].join(', '),
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: active ? 'default' : 'pointer',
                    backgroundColor: success ? '#10b981' : '#2563eb',
                    flexShrink: 0,
                    position: 'relative',
                }}
            >
                {/* Idle label — fade out khi active */}
                <span
                    style={{
                        opacity: active ? 0 : 1,
                        transform: active ? 'scale(0.6)' : 'scale(1)',
                        transition: 'opacity 0.2s ease, transform 0.25s ease',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '15px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}
                >
                    {children}
                </span>
                {/* Spinner — hiện khi loading */}
                <span
                    style={{
                        position: 'absolute',
                        width: '20px',
                        height: '20px',
                        border: '2.5px solid rgba(255,255,255,0.35)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: loading ? 'btnSpin 0.7s linear infinite' : 'none',
                        opacity: loading ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                    }}
                />

                {/* Check — pop in khi success */}
                <span
                    style={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: success ? 1 : 0,
                        transform: success ? 'scale(1)' : 'scale(0)',
                        transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                    }}
                >
                    <Check style={{ color: 'white', width: '20px', height: '20px' }} />
                </span>

                <style>{`
      @keyframes btnSpin { to { transform: rotate(360deg); } }
    `}</style>
            </button>
        </div>
    );
}
export default function AuthPage() {
    const navigate = useNavigate();
    const { login, loginMetaMask } = useAuth();
    // Auth state
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nationId: '',
        password: '',
        phoneNumber: '',
    });
    // Button animation state
    const [loginBtn, setLoginBtn] = useState('idle');
    const [metamaskBtn, setMetamaskBtn] = useState('idle');
    const [activeSlide, setActiveSlide] = useState(0);

    // Auto-advance carousel every 4s
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % SLIDES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleNavigationByUser = (loginMethod) => {
        navigate('/demo-dashboard', { state: { loginMethod } });
    };
    const handleTraditionalAuth = async (e) => {
        e.preventDefault();
        setLoginBtn('loading');
        try {
            if (isLoginMode) {
                // GỌI LOGIN TỪ CONTEXT
                await login({
                    nationId: formData.nationId,
                    password: formData.password,
                });

                setLoginBtn('success');
                setTimeout(() => handleNavigationByUser('local'), 900);
            } else {
                // Đăng ký vẫn gọi api trực tiếp vì không liên quan set cookie
                await api.post('/auth/register', formData);
                setLoginBtn('success');
                setTimeout(() => {
                    setLoginBtn('idle');
                    setIsLoginMode(true);
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                }, 900);
            }
        } catch (error) {
            console.error('❌ Auth error:', error.response?.data);
            const d = error.response?.data;
            alert(d?.errors?.[0]?.message || d?.message || 'Có lỗi xảy ra!');
            setLoginBtn('idle');
        }
    };

    const handleMetaMaskAuth = async () => {
        if (!window.ethereum) return alert('Vui lòng cài đặt MetaMask!');
        setMetamaskBtn('loading');
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            const phase1 = await api.post('/auth/login/wallet', { walletAddress });
            const nonce = phase1.data.data?.nonce || phase1.data.nonce;
            const signature = await signer.signMessage(nonce);

            // GỌI LOGIN METAMASK TỪ CONTEXT
            await loginMetaMask(walletAddress, signature);

            setMetamaskBtn('success');
            setTimeout(() => handleNavigationByUser('metamask'), 900);
        } catch (error) {
            console.error('❌ MetaMask error:', error);
            if (error.code === 'ACTION_REJECTED') alert('Đã từ chối ký xác nhận!');
            else alert(error.response?.data?.message || 'Kết nối MetaMask thất bại!');
            setMetamaskBtn('idle');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-6 font-sans">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-[40%_60%]">
                    {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
                    <div className="bg-[#3B82F6] p-8 md:p-10 hidden md:flex flex-col justify-between text-white">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-[#3B82F6]" />
                            </div>
                            <span className="text-xl font-semibold">HealthHub</span>
                        </div>

                        {/* Slide image — fade transition */}
                        <div className="my-8 flex justify-center relative h-56">
                            {SLIDES.map((s, i) => (
                                <img
                                    key={i}
                                    src={s.img}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-contain mix-blend-multiply drop-shadow-2xl rounded-xl"
                                    style={{
                                        opacity: i === activeSlide ? 1 : 0,
                                        transition: 'opacity 0.6s ease',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Slide text — fade transition */}
                        <div style={{ position: 'relative', minHeight: '120px' }}>
                            {SLIDES.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: i === activeSlide ? 1 : 0,
                                        transition: 'opacity 0.5s ease',
                                        pointerEvents: i === activeSlide ? 'auto' : 'none',
                                    }}
                                >
                                    <h2 className="text-2xl font-bold mb-3">{s.title}</h2>
                                    <p className="opacity-80 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Dots */}
                        <div className="flex items-center gap-2 mt-6">
                            {SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveSlide(i)}
                                    style={{
                                        width: i === activeSlide ? '32px' : '8px',
                                        height: '8px',
                                        borderRadius: '9999px',
                                        backgroundColor: i === activeSlide ? 'white' : 'rgba(255,255,255,0.4)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition:
                                            'width 0.35s cubic-bezier(0.4,0,0.2,1), background-color 0.35s ease',
                                        padding: 0,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
                    <div className="p-8 md:p-12">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-black mb-2">
                                {isLoginMode ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
                            </h1>
                            <p className="text-gray-500">
                                {isLoginMode
                                    ? 'Truy cập bảng điều khiển y tế và quản lý hồ sơ bệnh nhân'
                                    : 'Tham gia HealthHub ngay hôm nay để quản lý y tế hiệu quả hơn'}
                            </p>
                        </div>

                        <form onSubmit={handleTraditionalAuth} className="space-y-5">
                            {/* Register-only fields */}
                            {!isLoginMode && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white"></div>
                                    </div>
                                    <InputField
                                        label="Địa chỉ Email"
                                        name="email"
                                        type="email"
                                        placeholder="nguyenvana@gmail.com"
                                        icon={Mail}
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </>
                            )}

                            {/* Shared fields */}
                            <InputField
                                label="Số CCCD/CMND"
                                name="nationId"
                                type="text"
                                placeholder="Nhập số CCCD 12 chữ số hoặc CMND 9 chữ số"
                                icon={CreditCard}
                                value={formData.nationId}
                                onChange={handleInputChange}
                                required
                                pattern="(\d{9}|\d{12})"
                            />

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">Mật khẩu</label>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                                    <div className="flex items-center px-3 py-2.5">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="h-10 w-px bg-gray-300" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                                        onChange={handleInputChange}
                                        required
                                        minLength="8"
                                        className="flex-1 px-3 py-2.5 outline-none bg-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="px-3 py-2.5 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {isLoginMode && (
                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">Ghi nhớ tôi</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="text-sm text-emerald-500 font-medium hover:underline"
                                    >
                                        Quên mật khẩu của bạn?
                                    </button>
                                </div>
                            )}

                            {/* Animated submit button */}
                            <div className="mt-4">
                                <AnimatedButton
                                    type="submit"
                                    loading={loginBtn === 'loading'}
                                    success={loginBtn === 'success'}
                                    align="start"
                                    fullWidth={!isLoginMode}
                                >
                                    {isLoginMode ? 'Đăng nhập' : 'Tạo tài khoản'}
                                </AnimatedButton>
                            </div>

                            {/* Divider */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">
                                        Hoặc kết nối tới ví điện tử của bạn
                                    </span>
                                </div>
                            </div>

                            {/* MetaMask — animated */}
                            <div className="flex justify-center">
                                <AnimatedButton
                                    onClick={handleMetaMaskAuth}
                                    align="center"
                                    loading={metamaskBtn === 'loading'}
                                    success={metamaskBtn === 'success'}
                                    fullWidth
                                >
                                    <span className="flex items-center gap-3">
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                                            alt="MetaMask"
                                            style={{ width: 22, height: 22 }}
                                        />
                                        <span
                                            style={{
                                                color: metamaskBtn === 'idle' ? 'white' : 'transparent',
                                                transition: 'color 0.2s',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Đăng nhập bằng MetaMask
                                        </span>
                                    </span>
                                </AnimatedButton>
                            </div>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="text-gray-600">
                                {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                    setLoginBtn('idle');
                                    setMetamaskBtn('idle');
                                }}
                                className="text-emerald-500 font-semibold hover:underline"
                            >
                                {isLoginMode ? 'Đăng ký' : 'Đăng nhập'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
