import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { setAccessToken } from '@/utils/auth.js';
import { adminLogin } from '@/services/adminApi.js';

function Field({ icon: Icon, ...props }) {
    return (
        <div className="group flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 transition-all duration-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <Icon className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
            <input
                {...props}
                className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 outline-none"
            />
        </div>
    );
}

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ nationId: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await adminLogin(form);
            const token = res?.data?.accessToken;
            if (!token) throw new Error('Không nhận được access token');
            setAccessToken(token);
            navigate('/admin');
        } catch (err) {
            setError(err?.message || 'Đăng nhập admin thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 md:p-8">
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg lg:grid-cols-[42%_58%]">
                {/* Left panel */}
                <aside className="relative hidden overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" />
                    <div className="absolute -left-12 bottom-16 h-52 w-52 rounded-full bg-white/10" />

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-white/90">HealthHub</p>
                            <h1 className="text-xl font-bold">Admin Console</h1>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-5">
                        <h2 className="text-3xl font-bold leading-tight">
                            Quản lý hệ thống y tế <br /> dành cho quản trị viên
                        </h2>
                        <p className="max-w-md text-sm leading-relaxed text-white/85">
                            Đăng nhập vào khu vực quản trị để duyệt tài khoản, giám sát thống kê và kiểm soát vận hành
                            toàn bộ nền tảng.
                        </p>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">
                            <Sparkles className="h-4 w-4" />
                            Giao diện quản trị mới với phân tích trực quan
                        </div>
                    </div>

                    <ul className="relative z-10 space-y-2 text-sm text-white/90">
                        <li>• Duyệt người dùng nhanh</li>
                        <li>• Thống kê trạng thái theo thời gian thực (mock)</li>
                    </ul>
                </aside>

                {/* Right panel */}
                <section className="p-6 sm:p-10">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-blue-600">Welcome back</p>
                            <h2 className="mt-1 text-3xl font-bold text-slate-900">Đăng nhập Admin</h2>
                            <p className="mt-2 text-sm text-slate-500">Chỉ dành cho quản trị viên được cấp quyền.</p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <Field
                                icon={Mail}
                                type="text"
                                name="nationId"
                                placeholder="Nhập CCCD/CMND admin"
                                value={form.nationId}
                                onChange={onChange}
                                required
                            />
                            <Field
                                icon={Lock}
                                type="password"
                                name="password"
                                placeholder="Nhập mật khẩu"
                                value={form.password}
                                onChange={onChange}
                                required
                            />

                            {error && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập Admin'}
                                {!loading && (
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                )}
                            </button>
                        </form>

                        <div className="mt-8 border-t border-slate-200 pt-5 text-center">
                            <button
                                onClick={() => navigate('/auth')}
                                className="cursor-pointer text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
                            >
                                ← Quay về trang đăng nhập chung
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
