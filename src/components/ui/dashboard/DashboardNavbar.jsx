import { Activity, Bell, Search, Shield, User, Wallet, Check, LogOut } from 'lucide-react';

export default function DashboardNavbar({
    displayName,
    roleLabel,
    loginMethod,
    hasProfile,
    onNavigateCreate,
    onLogout,
}) {
    return (
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
            {/* Logo + Profile button */}
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
                <div style={{ width: 1, height: 24, background: '#E2E8F0' }} />
                {hasProfile ? (
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
                        }}
                    >
                        <Check style={{ width: 14, height: 14 }} /> Đã có hồ sơ
                    </div>
                ) : (
                    <button
                        onClick={onNavigateCreate}
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
                        <User style={{ width: 14, height: 14 }} /> Tạo hồ sơ bệnh nhân
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

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                <button
                    style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
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
                <button
                    onClick={onLogout}
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
                    <LogOut style={{ width: 14, height: 14 }} /> Logout
                </button>
            </div>
        </nav>
    );
}
