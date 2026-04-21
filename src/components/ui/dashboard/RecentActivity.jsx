import { Calendar, Pill, Heart, TrendingUp } from 'lucide-react';

export default function RecentActivity() {
    const ACTIVITY = [
        { text: 'Đã ghi nhận huyết áp', time: '2 giờ trước', dot: '#3B82F6' },
        { text: 'Đã gia hạn đơn thuốc', time: '1 ngày trước', dot: '#8B5CF6' },
        { text: 'Kết quả xét nghiệm đã tải lên', time: '3 ngày trước', dot: '#10B981' },
        { text: 'Đã đổi lịch hẹn', time: '5 ngày trước', dot: '#F59E0B' },
    ];

    return (
        <div
            style={{
                background: 'white',
                borderRadius: 14,
                border: '1px solid #F1F5F9',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                animation: 'fadeUp 0.5s ease 0.43s both',
                minWidth: 0,
            }}
        >
            <div style={{ padding: 'clamp(14px, 3vw, 18px) clamp(14px, 4vw, 22px)', borderBottom: '1px solid #F1F5F9' }}>
                <h2 style={{ margin: 0, fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 700, color: '#0F172A' }}>Hoạt động gần đây</h2>
            </div>
            <div style={{ padding: '8px 0' }}>
                {ACTIVITY.map((a, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'clamp(10px, 2vw, 12px)',
                            padding: 'clamp(10px, 2vw, 12px) clamp(14px, 3vw, 18px)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            minWidth: 0,
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
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 'clamp(12px, 3vw, 14px)', color: '#334155', fontWeight: 500, wordBreak: 'break-word' }}>
                                {a.text}
                            </p>
                            <p style={{ margin: '3px 0 0', fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#94A3B8' }}>{a.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 640px) {
                    h2 {
                        font-size: 14px !important;
                    }
                }
            `}</style>
        </div>
    );
}