import { Activity, Bell, Search, Shield, User, Wallet, Check, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
export default function DashboardNavbar({
    displayName,
    roleLabel,
    loginMethod,
    hasProfile,
    onNavigateCreate,
    onLogout,
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hàm tiện ích: Đóng menu sau khi điều hướng
    const handleMobileAction = (action) => {
        setMobileMenuOpen(false);
        if (action) action();
    };

    return (
        <nav className="nav-container">
            {/* LEFT: Logo & Profile Status */}
            <div className="nav-left">
                {/* Profile Badge (Desktop) */}
                <div className="desktop-only">
                    {hasProfile ? (
                        <div className="badge badge-success">
                            <Check style={{ width: 14, height: 14 }} /> <span>Đã có hồ sơ</span>
                        </div>
                    ) : (
                        <button onClick={onNavigateCreate} className="btn-create">
                            <User style={{ width: 14, height: 14 }} /> Tạo hồ sơ
                        </button>
                    )}
                </div>
            </div>

            {/* CENTER: Search (Desktop) */}
            <div className="search-container desktop-only">
                <Search style={{ width: 16, height: 16, color: '#94A3B8' }} />
                <input placeholder="Tìm hồ sơ, bác sĩ..." />
            </div>

            {/* RIGHT: Actions (Desktop) */}
            <div className="nav-right desktop-only">
                <div className={`method-badge ${loginMethod === 'metamask' ? 'warning' : 'info'}`}>
                    {loginMethod === 'metamask' ? <Wallet size={13} /> : <Shield size={13} />}
                    {loginMethod === 'metamask' ? ' Ví MetaMask' : 'CCCD/CMND'}
                </div>

                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot" />
                </button>

                <div className="user-profile">
                    <div className="avatar">
                        <User size={18} color="white" />
                    </div>
                    <div className="user-info">
                        <div className="user-name">{displayName}</div>
                        <div className="user-role">{roleLabel}</div>
                    </div>
                </div>

                <button onClick={onLogout} className="btn-logout">
                    <LogOut size={14} /> Logout
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* --- NÂNG CẤP: MOBILE DROPDOWN MENU --- */}
            {mobileMenuOpen && (
                <>
                    {/* Nền tối phía sau menu */}
                    <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />

                    <div className="mobile-menu">
                        {/* Phân vùng 1: Thông tin User */}
                        <div className="mobile-user-section">
                            <div className="user-profile">
                                <div className="avatar">
                                    <User size={18} color="white" />
                                </div>
                                <div>
                                    <div className="user-name">{displayName}</div>
                                    <div className="user-role">{roleLabel}</div>
                                </div>
                            </div>
                            <div className={`method-badge ${loginMethod === 'metamask' ? 'warning' : 'info'}`}>
                                {loginMethod === 'metamask' ? <Wallet size={12} /> : <Shield size={12} />}
                                <span>{loginMethod === 'metamask' ? 'Ví MetaMask' : 'CCCD/CMND'}</span>
                            </div>
                        </div>

                        <div className="mobile-divider" />

                        {/* Phân vùng 2: Tìm kiếm */}
                        <div className="mobile-search-wrapper">
                            <div className="search-container mobile-search">
                                <Search size={16} color="#94A3B8" />
                                <input placeholder="Tìm hồ sơ, bác sĩ..." />
                            </div>
                        </div>

                        <div className="mobile-divider" />

                        {/* Phân vùng 3: Hành động */}
                        <div className="mobile-actions">
                            {!hasProfile ? (
                                <button
                                    onClick={() => handleMobileAction(onNavigateCreate)}
                                    className="mobile-action-btn text-primary"
                                >
                                    <div className="action-icon bg-blue-50 text-blue-600">
                                        <User size={18} />
                                    </div>
                                    <span>Tạo hồ sơ y tế mới</span>
                                </button>
                            ) : (
                                <div className="mobile-action-btn cursor-default">
                                    <div className="action-icon bg-green-50 text-green-600">
                                        <Check size={18} />
                                    </div>
                                    <span className="text-green-700 font-medium">Hồ sơ đã được thiết lập</span>
                                </div>
                            )}

                            <button
                                onClick={() => handleMobileAction(onLogout)}
                                className="mobile-action-btn text-danger"
                            >
                                <div className="action-icon bg-red-50 text-red-600">
                                    <LogOut size={18} />
                                </div>
                                <span>Đăng xuất tài khoản</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .nav-container {
                    background: white;
                    border-bottom: 1px solid #E2E8F0;
                    padding: 0 20px;
                    min-height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                }
                .nav-left, .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .logo-icon {
                    width: 36px; height: 36px; border-radius: 10px;
                    background: #0d7b6d; display: flex; align-items: center; justify-content: center;
                }
                .logo-text { font-weight: 700; fontSize: 18px; color: #0F172A; }
                
                .divider { width: 1px; height: 24px; background: #E2E8F0; }

                /* Search Bar */
                .search-container {
                    display: flex; align-items: center; gap: 8px;
                    background: #F1F5F9; border-radius: 10px; padding: 8px 16px;
                    flex: 1; max-width: 320px; margin: 0 20px;
                }
                .search-container input {
                    background: transparent; border: none; outline: none;
                    font-size: 14px; width: 100%; color: #0F172A;
                }

                /* Badges & Buttons */
                .badge {
                    display: flex; align-items: center; gap: 6px;
                    padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
                    white-space: nowrap;
                }
                .badge-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; }
                
                .btn-create {
                    display: flex; align-items: center; gap: 6px;
                    background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;
                    padding: 6px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: #2563EB;
                    transition: 0.2s;
                }
                .btn-create:hover { background: #0d7b6d; color: white; }

                .btn-logout {
                    display: flex; align-items: center; gap: 6px;
                    background: white; border: 1px solid #E2E8F0; border-radius: 8px;
                    padding: 6px 12px; cursor: pointer; color: #64748B; font-weight: 500;
                    transition: 0.2s;
                }
                .btn-logout:hover { background: #FEF2F2; color: #EF4444; border-color: #FECACA; }

                .icon-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 50%; transition: background 0.2s;}
                .icon-btn:hover { background: #F1F5F9; }
                .notification-dot {
                    position: absolute; top: 2px; right: 4px; width: 8px; height: 8px;
                    border-radius: 50%; background: #EF4444; border: 2px solid white;
                }

                .user-profile { display: flex; align-items: center; gap: 10px; white-space: nowrap }
                .avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: linear-gradient(135deg, #0d7b6d, #8B5CF6);
                    display: flex; align-items: center; justify-content: center;
                }
                .user-name { font-size: 14px; font-weight: 600; color: #0F172A; }
                .user-role { font-size: 12px; color: #64748B; font-weight: 500; }

                .method-badge {
                    display: flex; align-items: center; gap: 4px; border-radius: 20px;
                    padding: 4px 10px; font-size: 12px; font-weight: 600;
                    white-space: nowrap;
                }
                .method-badge.warning { background: #FEF3C7; border: 1px solid #FCD34D; color: #92400E; }
                .method-badge.info { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; }

                /* === DESKTOP / MOBILE LOGIC === */
                .desktop-only { display: none; }
                .mobile-toggle { 
                    display: flex; background: #F8FAFC; border: none; cursor: pointer; 
                    color: #0F172A; padding: 8px; border-radius: 8px; transition: 0.2s;
                }
                .mobile-toggle:active { background: #E2E8F0; }
                
                @media (min-width: 768px) {
                    .desktop-only { display: flex; }
                    .mobile-toggle, .mobile-menu, .mobile-overlay { display: none !important; }
                }
                
                @media (min-width: 1024px) {
                    .lg-only { display: block; }
                }
                
                @media (max-width: 767px) {
                    .logo-text { font-size: 16px; }
                    .nav-container { padding: 0 16px; }
                    .logo-icon { width: 32px; height: 32px; }
                    .logo-icon svg { width: 16px !important; height: 16px !important; }
                }

                /* === NÂNG CẤP CSS MOBILE MENU === */
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .mobile-overlay {
                    position: fixed;
                    top: 64px; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(2px);
                    z-index: 40;
                    animation: fadeIn 0.2s ease-out;
                }

                .mobile-menu {
                    position: absolute; 
                    top: 64px; left: 0; right: 0;
                    background: white; 
                    border-radius: 0 0 20px 20px;
                    display: flex; flex-direction: column;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    z-index: 50;
                    animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                .mobile-user-section {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px; background: #F8FAFC;
                }

                .mobile-divider {
                    height: 1px; background: #E2E8F0; width: 100%;
                }

                .mobile-search-wrapper {
                    padding: 16px 20px;
                }
                .mobile-search {
                    max-width: 100%; margin: 0; height: 44px;
                }

                .mobile-actions {
                    padding: 12px 12px 20px 12px;
                    display: flex; flex-direction: column; gap: 4px;
                }

                .mobile-action-btn {
                    display: flex; align-items: center; gap: 14px;
                    width: 100%; padding: 12px; background: transparent; 
                    border: none; border-radius: 12px;
                    font-size: 15px; font-weight: 500; text-align: left; 
                    cursor: pointer; transition: background 0.15s;
                }
                .mobile-action-btn:active, .mobile-action-btn:hover { background: #F1F5F9; }
                .cursor-default:active, .cursor-default:hover { background: transparent; cursor: default;}

                .action-icon {
                    width: 36px; height: 36px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                }
                
                .text-primary { color: #0F172A; }
                .text-danger { color: #EF4444; }
                .bg-blue-50 { background: #EFF6FF; }
                .text-blue-600 { color: #2563EB; }
                .bg-red-50 { background: #FEF2F2; }
                .text-red-600 { color: #DC2626; }
                .bg-green-50 { background: #F0FDF4; }
                .text-green-600 { color: #16A34A; }
            `}</style>
        </nav>
    );
}
