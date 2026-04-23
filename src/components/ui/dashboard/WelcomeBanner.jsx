export default function WelcomeBanner({ displayName, roleLabel, loginMethod }) {
    return (
        <div className="min-h-32 md:min-h-40 relative mb-5 md:mb-7 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 to-teal-400 p-6 md:p-8 lg:p-10 md:flex md:items-center md:justify-between gap-4 md:gap-6 lg:gap-8 animate-fade-up " style={{ minHeight: 'clamp(128px, 25vh, 220px)' }}>
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5" />
            <div className="absolute right-16 -bottom-16 w-40 h-40 rounded-full bg-white/5" />

            {/* Left content */}
            <div className="relative z-10">
                <p className="text-xs md:text-sm text-white/75 mb-1">Chào mừng trở lại 👋</p>
                <h1 className="text-xl md:text-3xl font-bold text-white m-0">
                    {displayName}
                </h1>
                <p className="text-xs md:text-sm text-white/70 mt-1.5">
                    Đăng nhập bằng&nbsp;
                    <strong className="text-white font-semibold">
                        {loginMethod === 'metamask' ? 'Ví MetaMask' : 'CCCD/CMND'}
                    </strong>
                    &nbsp;· Tài khoản {roleLabel}
                </p>
            </div>

            {/* Right date box */}
            <div className="relative z-10 text-right mt-4 md:mt-0">
                <div className="inline-block bg-white/10 backdrop-blur rounded-xl px-3 md:px-5 py-2 md:py-3 border border-white/10">
                    <div className="text-[10px] md:text-xs text-white/80">Hôm nay</div>
                    <div className="font-bold text-sm md:text-lg text-white">
                        {new Date().toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-up {
                    animation: fadeUp 0.5s ease both;
                }
            `}</style>
        </div>
    );
}