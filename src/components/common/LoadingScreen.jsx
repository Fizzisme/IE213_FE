import React from 'react';

export const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Đang tải...</p>
        </div>
    </div>
);
