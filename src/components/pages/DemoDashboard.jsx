import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity,
    Bell,
    Calendar,
    ChevronRight,
    Heart,
    LogOut,
    Pill,
    Search,
    Shield,
    TrendingUp,
    User,
    Wallet,
    Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// ── Dữ liệu giả cho demo ─────────────────────────────────────────────────────
const STATS = [
    { label: 'Lịch hẹn sắp tới', value: '3', delta: '+1 tuần này', icon: Calendar, color: '#3B82F6' },
    { label: 'Đơn thuốc đang dùng', value: '5', delta: '2 sắp hết hạn', icon: Pill, color: '#8B5CF6' },
    { label: 'Chỉ số sức khỏe', value: '87', delta: '↑ 4 điểm tháng này', icon: Heart, color: '#EF4444' },
    { label: 'Kết quả xét nghiệm chờ', value: '1', delta: 'Dự kiến hôm nay', icon: TrendingUp, color: '#10B981' },
];

const APPOINTMENTS = [
    { doctor: 'BS. Nguyễn Văn A', specialty: 'Tim mạch', date: '10/03/2026', time: '09:00 SA', status: 'confirmed' },
    { doctor: 'BS. Trần Thị B', specialty: 'Thần kinh', date: '14/03/2026', time: '02:30 CH', status: 'pending' },
    { doctor: 'BS. Lê Văn C', specialty: 'Da liễu', date: '20/03/2026', time: '11:00 SA', status: 'confirmed' },
];

const ACTIVITY = [
    { text: 'Đã ghi nhận huyết áp', time: '2 giờ trước', dot: '#3B82F6' },
    { text: 'Đã gia hạn đơn thuốc', time: '1 ngày trước', dot: '#8B5CF6' },
    { text: 'Kết quả xét nghiệm đã tải lên', time: '3 ngày trước', dot: '#10B981' },
    { text: 'Đã đổi lịch hẹn', time: '5 ngày trước', dot: '#F59E0B' },
];

// ── Helper: lấy thông tin user từ state điều hướng ───────────────────────────
// function useAuthState() {
//     const location = useLocation();
//     // AuthPage truyền { user, loginMethod } qua navigate state
//     return location.state || { user: null, loginMethod: 'unknown' };
// }

export default function Demodashboard() {
    const hasProfile = JSON.parse(localStorage.getItem('hasProfile')) ?? false;
    console.log(hasProfile);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. LẤY DATA TỪ CONTEXT THAY VÌ LOCATION STATE
    const { user, logout } = useAuth();

    // 2. KHAI BÁO BIẾN hasProfile ĐỂ TRÁNH LỖI CRASH APP
    const hasProfile = user?.data.hasProfile ?? false;
    // Giữ lại loginMethod từ location state (chỉ dùng để làm đẹp UI)
    // Nếu F5 bị mất state thì mặc định fallback về 'local'
    const loginMethod = location.state?.loginMethod || 'local';

    // 3. SỬA LẠI HÀM LOGOUT GỌI API CLEAR COOKIE
    const handleLogout = async () => {
        await logout(); // Gọi hàm từ AuthContext
        navigate('/auth', { replace: true });
    };

    // Tên hiển thị
    const displayName =
        user?.fullName ||
        user?.name ||
        (user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Khách');

    const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Bệnh nhân';

    // (TÙY CHỌN BẢO VỆ ROUTE): Nếu chưa login mà ráng vào trang này thì đá ra
    // Dù thường thì bạn nên làm một component <PrivateRoute> riêng bọc bên ngoài.
    if (!user) {
        return <div style={{ padding: 20, textAlign: 'center' }}>Vui lòng đăng nhập...</div>;
    }
    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
            {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
            <nav
                style={{
                    background: 'white',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '0 24px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: '#3B82F6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Activity style={{ width: 20, height: 20, color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>HealthHub</span>
                    </div>

                    {/* ── Divider ── */}
                    <div style={{ width: 1, height: 24, background: '#E2E8F0' }} />

                    {/* ── Button Tạo hồ sơ ── */}
                    {hasProfile ? (
                        // ── Đã có hồ sơ ──
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                borderRadius: 8,
                                padding: '6px 14px',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#16A34A',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Check style={{ width: 14, height: 14 }} />
                            Đã có hồ sơ
                        </div>
                    ) : (
                        // ── Chưa có hồ sơ ──
                        <button
                            onClick={() => navigate('/create-patient')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: 8,
                                padding: '6px 14px',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#2563EB',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#3B82F6';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = '#3B82F6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#EFF6FF';
                                e.currentTarget.style.color = '#2563EB';
                                e.currentTarget.style.borderColor = '#BFDBFE';
                            }}
                        >
                            <User style={{ width: 14, height: 14 }} />
                            Tạo hồ sơ bệnh nhân
                        </button>
                    )}
                </div>

                {/* Search */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#F1F5F9',
                        borderRadius: 10,
                        padding: '8px 16px',
                        width: 280,
                    }}
                >
                    <Search style={{ width: 16, height: 16, color: '#94A3B8' }} />
                    <input
                        placeholder="Tìm hồ sơ, bác sĩ..."
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontSize: 14,
                            color: '#475569',
                            width: '100%',
                        }}
                    />
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Login method badge */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: loginMethod === 'metamask' ? '#FEF3C7' : '#EFF6FF',
                            border: `1px solid ${loginMethod === 'metamask' ? '#FCD34D' : '#BFDBFE'}`,
                            borderRadius: 20,
                            padding: '4px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: loginMethod === 'metamask' ? '#92400E' : '#1D4ED8',
                        }}
                    >
                        {loginMethod === 'metamask' ? (
                            <>
                                <Wallet style={{ width: 13, height: 13 }} /> MetaMask
                            </>
                        ) : (
                            <>
                                <Shield style={{ width: 13, height: 13 }} /> Nation ID
                            </>
                        )}
                    </div>

                    {/* Bell */}
                    <button
                        style={{
                            position: 'relative',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                        }}
                    >
                        <Bell style={{ width: 20, height: 20, color: '#64748B' }} />
                        <span
                            style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#EF4444',
                                border: '2px solid white',
                            }}
                        />
                    </button>

                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <User style={{ width: 18, height: 18, color: 'white' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                                {displayName}
                            </div>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>{roleLabel}</div>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'none',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#64748B',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEF2F2';
                            e.currentTarget.style.borderColor = '#FECACA';
                            e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.color = '#64748B';
                        }}
                    >
                        <LogOut style={{ width: 14, height: 14 }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                {/* Welcome banner */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        borderRadius: 16,
                        padding: '28px 32px',
                        marginBottom: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        animation: 'fadeUp 0.5s ease both',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    {/* Background decoration */}
                    <div
                        style={{
                            position: 'absolute',
                            right: -40,
                            top: -40,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.07)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            right: 60,
                            bottom: -60,
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                        }}
                    />

                    <div>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 4 }}>
                            Welcome back 👋
                        </p>
                        <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, margin: 0 }}>{displayName}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6 }}>
                            Signed in via&nbsp;
                            <strong style={{ color: 'white' }}>
                                {loginMethod === 'metamask' ? 'Ví MetaMask' : 'CCCD/CMND'}
                            </strong>
                            &nbsp;· Tài khoản {roleLabel}
                        </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: 12,
                                padding: '12px 20px',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Hôm nay</div>
                            <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── STATS GRID ────────────────────────────────────────────────────── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                        marginBottom: 28,
                    }}
                >
                    {STATS.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                background: 'white',
                                borderRadius: 14,
                                padding: '20px 22px',
                                border: '1px solid #F1F5F9',
                                cursor: 'pointer',
                                animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both`,
                                transition: 'box-shadow 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)')}
                            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontWeight: 500 }}>
                                        {s.label}
                                    </p>
                                    <p style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '6px 0 4px' }}>
                                        {s.value}
                                    </p>
                                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{s.delta}</p>
                                </div>
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 12,
                                        background: `${s.color}18`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── BOTTOM 2-COL ──────────────────────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
                    {/* Appointments */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 14,
                            border: '1px solid #F1F5F9',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            animation: 'fadeUp 0.5s ease 0.35s both',
                        }}
                    >
                        <div
                            style={{
                                padding: '18px 22px',
                                borderBottom: '1px solid #F1F5F9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                                Upcoming Appointments
                            </h2>
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: '#3B82F6',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                View all <ChevronRight style={{ width: 14, height: 14 }} />
                            </button>
                        </div>

                        <div>
                            {APPOINTMENTS.map((a, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px 22px',
                                        borderBottom: i < APPOINTMENTS.length - 1 ? '1px solid #F8FAFC' : 'none',
                                        transition: 'background 0.15s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <User style={{ width: 18, height: 18, color: '#3B82F6' }} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                                                {a.doctor}
                                            </p>
                                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>
                                                {a.specialty}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                                            {a.date}
                                        </p>
                                        <p style={{ margin: '2px 0 4px', fontSize: 12, color: '#94A3B8' }}>{a.time}</p>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: '2px 8px',
                                                borderRadius: 20,
                                                background: a.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7',
                                                color: a.status === 'confirmed' ? '#065F46' : '#92400E',
                                            }}
                                        >
                                            {a.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ duyệt'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 14,
                            border: '1px solid #F1F5F9',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            animation: 'fadeUp 0.5s ease 0.43s both',
                        }}
                    >
                        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1F5F9' }}>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                                Hoạt động gần đây
                            </h2>
                        </div>
                        <div style={{ padding: '8px 0' }}>
                            {ACTIVITY.map((a, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 14,
                                        padding: '12px 22px',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div
                                        style={{
                                            marginTop: 5,
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: a.dot,
                                            flexShrink: 0,
                                            boxShadow: `0 0 0 3px ${a.dot}25`,
                                        }}
                                    />
                                    <div>
                                        <p style={{ margin: 0, fontSize: 14, color: '#334155', fontWeight: 500 }}>
                                            {a.text}
                                        </p>
                                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94A3B8' }}>{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
