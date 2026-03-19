import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Briefcase, BadgeCheck, ShieldAlert } from "lucide-react";
import { adminRegister, verifyInviteToken } from "../../services/adminApi";

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

export default function AdminRegister() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invite = params.get("invite");

  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await verifyInviteToken(invite);
        if (!res?.success) throw new Error(res?.message || "Invite không hợp lệ");
        setVerified(true);
      } catch (err) {
        setError(err?.message || "Không thể xác thực link mời");
      } finally {
        setChecking(false);
      }
    };
    run();
  }, [invite]);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const inviteLabel = useMemo(() => {
    if (checking) return "Đang xác thực invite link...";
    if (verified) return "Invite hợp lệ - bạn có thể tạo tài khoản admin";
    return "Invite không hợp lệ hoặc đã hết hạn";
  }, [checking, verified]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminRegister({ ...form, inviteToken: invite });
      if (!res?.success) throw new Error(res?.message || "Đăng ký thất bại");
      navigate("/admin-login");
    } catch (err) {
      setError(err?.message || "Đăng ký admin thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-100 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm">
          Đang xác thực link mời...
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-100 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Truy cập bị từ chối</h2>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            onClick={() => navigate("/admin-login")}
            className="mt-6 cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-blue-700"
          >
            Quay lại Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 md:p-8">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg md:grid-cols-[40%_60%]">
        {/* Left branding */}
        <aside className="hidden bg-[#3B82F6] p-8 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Admin Invitation</h2>
            <p className="mt-2 text-sm text-white/85">
              Bạn đang truy cập cổng đăng ký quản trị viên qua invite link riêng tư.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4 text-sm">
            <p className="font-semibold">Trạng thái mã mời</p>
            <p className="mt-1 text-white/85">{inviteLabel}</p>
            <p className="mt-3 text-xs text-white/80 break-all">Invite: {invite}</p>
          </div>
        </aside>

        {/* Form */}
        <section className="p-6 md:p-10">
          <div className="mx-auto w-full max-w-xl">
            <h1 className="text-3xl font-bold text-slate-900">Tạo tài khoản Admin</h1>
            <p className="mt-2 text-sm text-slate-500">
              Hoàn tất thông tin để kích hoạt quyền quản trị hệ thống.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field
                icon={User}
                name="fullName"
                placeholder="Họ và tên"
                value={form.fullName}
                onChange={onChange}
                required
              />
              <Field
                icon={Mail}
                type="email"
                name="email"
                placeholder="admin@healthhub.com"
                value={form.email}
                onChange={onChange}
                required
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  icon={Briefcase}
                  name="position"
                  placeholder="Chức vụ"
                  value={form.position}
                  onChange={onChange}
                  required
                />
                <Field
                  icon={Lock}
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Đang đăng ký..." : "Hoàn tất đăng ký admin"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin-login")}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-slate-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Quay lại Admin Login
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
