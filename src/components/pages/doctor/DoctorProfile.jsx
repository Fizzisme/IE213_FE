import React, { useEffect, useState } from 'react';
import { Activity, Mail, Phone, Building2 } from 'lucide-react';
import { doctorService } from '@/services/doctorService.js';

export default function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await doctorService.getMe();

                setProfile(res?.data);
            } catch (err) {
                setError(err.message || 'Không thể tải thông tin cá nhân.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const getInitials = (name) => {
        if (!name) return 'BS';
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span className="text-slate-500 font-medium">Đang tải hồ sơ...</span>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center p-4">
                <div className="text-center text-rose-500 bg-rose-50 p-6 rounded-2xl border border-rose-200">
                    <p className="font-bold">{error || 'Không tìm thấy hồ sơ cá nhân.'}</p>
                </div>
            </div>
        );
    }
    const formatDate = (date) => {
        if (!date) return 'Chưa cập nhật';
        return new Date(date).toLocaleDateString('vi-VN');
    };

    return (
        <div className="h-full p-6">
            <div className="mx-auto h-full bg-white rounded-3xl shadow-sm  p-6 space-y-8">
                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold text-textColor">Hồ sơ cá nhân</h1>
                    <p className="text-slate-500 text-sm">Quản lý thông tin và chứng chỉ hành nghề</p>
                </div>

                {/* HERO PROFILE */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-secondary-50 border border-primary">
                    {/* AVATAR */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary text-white flex items-center justify-center text-lg sm:text-2xl font-bold shrink-0">
                        {getInitials(profile.fullName)}
                    </div>

                    {/* INFO */}
                    <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-textColor">BS. {profile.fullName}</h2>

                        <p className="text-primary text-sm font-medium">Bác sĩ chuyên khoa</p>

                        {/* CONTACT */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-3 text-sm text-slate-600">
                            <span className="flex items-center gap-2 break-all">
                                <Building2 size={14} />
                                {profile.hospital}
                            </span>

                            <span className="flex items-center gap-2 break-all">
                                <Mail size={14} />
                                {profile.email}
                            </span>

                            <span className="flex items-center gap-2">
                                <Phone size={14} />
                                {profile.phoneNumber || 'Chưa cập nhật'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* THÔNG TIN CÁ NHÂN */}
                    <div className="p-6 rounded-2xl border border-primary bg-white space-y-4">
                        <h3 className="font-semibold text-textColor">Thông tin cá nhân</h3>

                        <div>
                            <p className="text-xs text-slate-400">Giới tính</p>
                            <p className="font-medium text-textColor">
                                {profile.gender === 'M' ? 'Nam' : profile.gender === 'F' ? 'Nữ' : 'Chưa cập nhật'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400">Năm sinh</p>
                            <p className="font-medium text-textColor">{profile?.birthYear || 'Chưa cập nhật'}</p>
                        </div>

                        {/* NEW: CREATED AT */}
                        <div>
                            <p className="text-xs text-slate-400">Ngày tạo hồ sơ</p>
                            <p className="font-medium text-textColor">{formatDate(profile.createdAt)}</p>
                        </div>
                    </div>

                    {/* HÀNH NGHỀ */}
                    <div className="p-6 rounded-2xl border border-primary bg-white space-y-4">
                        <h3 className="font-semibold text-textColor">Thông tin hành nghề</h3>

                        <div>
                            <p className="text-xs text-slate-400 mb-2">Chuyên khoa</p>
                            <div className="flex flex-wrap gap-2">
                                {(profile.specialization || []).map((sp, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                                    >
                                        {sp}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400">License</p>
                            <p className="font-mono bg-slate-100 inline-block px-2 py-1 rounded text-sm text-textColor">
                                {profile.licenseNumber}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400">Trạng thái</p>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    profile.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                {profile.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
