import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore.js';
import { authService } from '@/services/authService.js';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const SPIN_KEYFRAMES = `
   @keyframes btnSpin {
       to { transform: rotate(360deg); }
   }
`;

// Inject keyframes once on mount
if (typeof document !== 'undefined' && !document.getElementById('btnspin-keyframes')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'btnspin-keyframes';
    styleTag.textContent = SPIN_KEYFRAMES;
    document.head.appendChild(styleTag);
}

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
        img: 'https://www.news-medical.net/image-handler/picture/2021/1/shutterstock_1067569886_(1).jpg',
    },
];

const CAROUSEL_INTERVAL = 4000;
const ANIMATION_DELAY = 900;
const ROUTES_BY_ROLE = {
    PATIENT: '/patient/dashboard',
    LAB_TECH: '/lab-tech/dashboard',
    DOCTOR: '/doctor/dashboard',
    ADMIN: '/admin/dashboard',
};

// ── Reusable Components ─────────────────────────────────────────────────────────

const AnimatedButton = ({ onClick, loading, success, children, fullWidth = false, type = 'button' }) => {
    const active = loading || success;
    return (
        <div className={`${fullWidth ? 'w-full flex justify-center' : 'w-36'}`}>
            <button
                type={type}
                onClick={onClick}
                disabled={active}
                className={`h-11 transition-all duration-300 flex items-center justify-center border-none relative overflow-hidden shrink-0
                   ${
                       active
                           ? 'w-11 rounded-full cursor-default'
                           : fullWidth
                           ? 'w-full rounded-lg cursor-pointer'
                           : 'w-36 rounded-lg cursor-pointer'
                   }
                   ${success ? 'bg-primary' : 'bg-teal-700 hover:bg-teal-800'}
               `}
            >
                <span
                    className={`
                       absolute
                       text-white font-semibold text-[15px] whitespace-nowrap pointer-events-none
                       transition-all duration-300
                       ${active ? 'opacity-0 scale-[0.6]' : 'opacity-100 scale-100'}
                   `}
                >
                    {children}
                </span>
                <span
                    className={`
                       absolute w-5 h-5 border-2 border-white/30 border-t-white rounded-full
                       transition-opacity duration-200 ease-in-out
                       ${loading ? 'opacity-100' : 'opacity-0'}
                   `}
                    style={{
                        animation: loading ? 'btnSpin 0.8s linear infinite' : 'none',
                    }}
                />
                <span
                    className={`
                       absolute flex items-center justify-center
                       transition-all duration-300
                       ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                       ${success ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                   `}
                >
                    <Check className="text-white w-5 h-5" />
                </span>
            </button>
        </div>
    );
};

const MetamaskButtonContent = ({ isIdle }) => (
    <span className="flex items-center gap-3">
        <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
            alt="MetaMask"
            className="w-5 h-5"
            loading="lazy"
        />
        <span className={`font-semibold transition-colors duration-200 ${isIdle ? 'text-white' : 'text-transparent'}`}>
            Đăng nhập bằng MetaMask
        </span>
    </span>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AuthPage() {
    const navigate = useNavigate();
    const loginMetaMask = useAuthStore((s) => s.loginMetaMask);
    const [metamaskBtn, setMetamaskBtn] = useState('idle');
    const [activeSlide, setActiveSlide] = useState(0);
    const hasWallet = !!window.ethereum;

    const nextSlide = useCallback(() => {
        setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(nextSlide, CAROUSEL_INTERVAL);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const handleNavigate = useCallback(
        (role, loginMethod) => {
            const route = ROUTES_BY_ROLE[role];
            if (route) {
                navigate(route, { state: { loginMethod } });
            } else {
                toast.error(`Role không được hỗ trợ: ${role}`);
            }
        },
        [navigate],
    );

    const handleMetaMaskAuth = async () => {
        if (!hasWallet) {
            toast.error('Vui lòng cài đặt metamask');
            return;
        }

        setMetamaskBtn('loading');

        try {
            const { ethers } = await import('ethers');

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            // ✅ Giai đoạn 1: Lấy Nonce
            const phase1 = await authService.getNonce(walletAddress);
            const nonce = phase1?.data?.nonce || phase1?.nonce;

            // Giai đoạn 2: Ký lần 1
            toast.info('Vui lòng ký xác thực đăng nhập...');
            const signature = await signer.signMessage(nonce);

            // Giai đoạn 3: Ký lần 2
            toast.info('Vui lòng ký xác nhận tham gia hệ thống...');
            const msgHash = ethers.keccak256(ethers.toUtf8Bytes('REGISTER_ZUNI_PATIENT'));
            const registrationSignature = await signer.signMessage(ethers.getBytes(msgHash));

            // Giai đoạn 4: Login
            const userData = await loginMetaMask(walletAddress, signature, registrationSignature);

            if (!userData) {
                toast.error('Lỗi: Không nhận được dữ liệu người dùng');
                setMetamaskBtn('idle');
                return;
            }

            setMetamaskBtn('success');
            setTimeout(() => handleNavigate(userData.role, 'metamask'), ANIMATION_DELAY);
        } catch (error) {
            console.error('❌ MetaMask error:', error);
            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                toast.error('Bạn đã từ chối ký xác nhận!');
            } else {
                toast.warning(error.message || 'Kết nối MetaMask thất bại!');
            }
            setMetamaskBtn('idle');
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center p-4 md:p-6 font-sans">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-[40%_60%]">
                    {/* LEFT COLUMN */}
                    <div className="bg-primary p-8 md:p-10 hidden md:flex flex-col text-white gap-10 justify-center">
                        <div className="flex justify-center relative h-56">
                            {SLIDES.map((s, i) => (
                                <img
                                    key={i}
                                    src={s.img}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    style={{
                                        opacity: i === activeSlide ? 1 : 0,
                                        transition: 'opacity 0.6s ease',
                                    }}
                                    alt={s.title}
                                    loading={i === 0 ? 'eager' : 'lazy'}
                                    fetchpriority={i === 0 ? 'high' : 'auto'}
                                />
                            ))}
                        </div>

                        <div>
                            <div className="text-left">
                                <h2 className="text-xl font-semibold mb-2">{SLIDES[activeSlide].title}</h2>
                                <p className="text-sm opacity-80 min-h-[60px]">{SLIDES[activeSlide].desc}</p>
                            </div>

                            <div className="flex justify-center gap-2 mt-4">
                                {SLIDES.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveSlide(i)}
                                        className={`h-2 rounded-full transition-all ${
                                            i === activeSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'
                                        }`}
                                        aria-label={`Slide ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="px-8 pb-8 pt-4 md:p-12 flex flex-col justify-center h-full">
                        {/* Header */}
                        <div className="mb-10">
                            <p className={'flex justify-center items-center'}>
                                <img
                                    src="AEGITAS.png"
                                    alt="logo"
                                    width={200}
                                    height={200}
                                    fetchpriority="high"
                                    loading="eager"
                                />
                            </p>

                            <p className="text-slate-500 text-sm flex justify-center">
                                Kết nối ví MetaMask để truy cập hệ thống{' '}
                                <span className="font-semibold text-primary ml-2">Aegitas</span>
                            </p>
                        </div>

                        {/* Quote */}
                        <div className="mb-10 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="italic text-slate-600 text-sm leading-relaxed">
                                "Not your keys, not your crypto."
                            </p>
                            <p className="text-xs text-slate-400 mt-1 not-italic">— Web3 Principle</p>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-white text-xs text-slate-400 font-medium">
                                    Kết nối ví điện tử
                                </span>
                            </div>
                        </div>

                        {/* Button */}
                        <AnimatedButton
                            onClick={handleMetaMaskAuth}
                            loading={metamaskBtn === 'loading'}
                            success={metamaskBtn === 'success'}
                            fullWidth
                            disabled={!hasWallet}
                        >
                            <MetamaskButtonContent isIdle={metamaskBtn === 'idle'} />
                        </AnimatedButton>
                    </div>
                </div>
                <Toaster className={'bg-primary'} />
            </div>
        </div>
    );
}
