export default function WelcomeBanner({ displayName, roleLabel, loginMethod }) {
    return (
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
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 4 }}>Chào mừng trở lại 👋</p>
                <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, margin: 0 }}>{displayName}</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6 }}>
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
                        padding: '12px 20px',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Hôm nay</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>
        </div>
    );
}
