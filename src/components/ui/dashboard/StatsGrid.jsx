//import { STATS } from '../../../constants/dashboardData';
import { Calendar, Pill, Heart, TrendingUp } from 'lucide-react';
export default function StatsGrid() {
    const STATS = [
        { label: 'Lịch hẹn sắp tới', value: '3', delta: '+1 tuần này', icon: Calendar, color: '#3B82F6' },
        { label: 'Đơn thuốc đang dùng', value: '5', delta: '2 sắp hết hạn', icon: Pill, color: '#8B5CF6' },
        { label: 'Chỉ số sức khỏe', value: '87', delta: '↑ 4 điểm tháng này', icon: Heart, color: '#EF4444' },
        { label: 'Kết quả xét nghiệm chờ', value: '1', delta: 'Dự kiến hôm nay', icon: TrendingUp, color: '#10B981' },
    ];
    return (
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
                            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontWeight: 500 }}>{s.label}</p>
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
    );
}
