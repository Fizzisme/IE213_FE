export default function WelcomeBanner({ displayName, roleLabel, loginMethod }) {
    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                borderRadius: 16,
                padding: 'clamp(20px, 5vw, 28px) clamp(20px, 5vw, 32px)',
                marginBottom: 'clamp(20px, 5vw, 28px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: 'fadeUp 0.5s ease both',
                overflow: 'hidden',
                position: 'relative',
                gap: 'clamp(16px, 4vw, 20px)',
            }}
            className="welcome-banner"
        >
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
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(12px, 3vw, 14px)', marginBottom: 4 }}>Chào mừng trở lại 👋</p>
                <h1 style={{ color: 'white', fontSize: 'clamp(20px, 6vw, 26px)', fontWeight: 700, margin: 0 }}>{displayName}</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(12px, 3vw, 14px)', marginTop: 6 }}>
                    Đăng nhập bằng&nbsp;
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
                        padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(10px, 2.5vw, 12px)' }}>Hôm nay</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(14px, 4vw, 18px)' }}>
                        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>
            <style>{`
                @media (min-width: 641px) {
                    .welcome-banner {
                        flex-direction: row !important;
                        align-items: center !important;
                    }
                }
            `}</style>
        </div>
    );
}
