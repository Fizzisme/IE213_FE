import { ChevronRight, User } from 'lucide-react';

export default function AppointmentList() {
    const APPOINTMENTS = [
        { doctor: 'BS. Nguyễn Văn A', specialty: 'Tim mạch', date: '10/03/2026', time: '09:00 SA', status: 'confirmed' },
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
                minWidth: 0,
            }}
        >
            <div
                style={{
                    padding: '18px 22px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
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
                        whiteSpace: 'nowrap',
                    }}
                >
                    View all <ChevronRight style={{ width: 14, height: 14 }} />
                </button>
            </div>
            <div>
                {APPOINTMENTS.map((a, i) => (
                    <div
                        key={i}
                        className="appointment-row"
                        style={{
                            display: 'flex',
                            // Chú ý: style mặc định ở đây sẽ bị ghi đè bởi class .appointment-row trong thẻ <style> bên dưới
                            alignItems: 'center',
                            padding: '16px 22px',
                            borderBottom: i < APPOINTMENTS.length - 1 ? '1px solid #F8FAFC' : 'none',
                            transition: 'background 0.15s',
                            cursor: 'pointer',
                            gap: 16,
                        }}
                    >
                        {/* Box 1: Bác sỹ & Chuyên khoa */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <User style={{ width: 18, height: 18, color: '#3B82F6' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {a.doctor}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {a.specialty}
                                </p>
                            </div>
                        </div>
                        
                        {/* Box 2: Thông tin ngày giờ - Thêm class để xử lý responsive */}
                        <div className="appointment-meta" style={{ textAlign: 'right' }}>
                            <div className="date-time-group" style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ margin: 0, fontSize: 13, color: '#475569', fontWeight: 500 }}>{a.date}</p>
                                <p style={{ margin: '2px 0 4px', fontSize: 12, color: '#94A3B8' }}>{a.time}</p>
                            </div>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: 20,
                                    background: a.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7',
                                    color: a.status === 'confirmed' ? '#065F46' : '#92400E',
                                    display: 'inline-block',
                                }}
                            >
                                {a.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ duyệt'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .appointment-row:hover {
                    background: #F8FAFC;
                }

                /* Xử lý khi màn hình nhỏ hơn 800px */
                @media (max-width: 800px) {
                    .appointment-row {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 12px !important;
                    }

                    .appointment-meta {
                        text-align: left !important;
                        width: 100%;
                        padding-left: 54px; /* Căn lề thẳng với phần tên (40px icon + 14px gap) */
                    }

                    .date-time-group {
                        flex-direction: row !important;
                        gap: 12px;
                        align-items: center;
                        margin-bottom: 6px;
                    }

                    .date-time-group p {
                        margin: 0 !important;
                    }
                }

                @media (max-width: 640px) {
                    h2 { font-size: 14px !important; }
                }
            `}</style>
        </div>
    );
}