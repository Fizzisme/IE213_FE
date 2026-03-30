import { ChevronRight, User } from 'lucide-react';
//import { APPOINTMENTS } from '../../../constants/dashboardData';
export default function AppointmentList() {
    const APPOINTMENTS = [
        {
            doctor: 'BS. Nguyễn Văn A',
            specialty: 'Tim mạch',
            date: '10/03/2026',
            time: '09:00 SA',
            status: 'confirmed',
        },
        { doctor: 'BS. Trần Thị B', specialty: 'Thần kinh', date: '14/03/2026', time: '02:30 CH', status: 'pending' },
        { doctor: 'BS. Lê Văn C', specialty: 'Da liễu', date: '20/03/2026', time: '11:00 SA', status: 'confirmed' },
    ];
    return (
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
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Upcoming Appointments</h2>
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
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{a.doctor}</p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>{a.specialty}</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#475569', fontWeight: 500 }}>{a.date}</p>
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
    );
}
