import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, User, Shield, BadgeCheck } from "lucide-react";
import { getAdminUserDetail } from "../../services/adminApi";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blocked: "bg-rose-100 text-rose-700 border-rose-200",
};

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-base font-semibold text-slate-900 break-all">{value || "-"}</p>
    </div>
  );
}

export default function AdminUserDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (user) return;
      setLoading(true);
      setError("");
      try {
        const res = await getAdminUserDetail(id);
        const data = res?.data || res;
        if (!data) {
          setError("Không tìm thấy người dùng.");
        } else {
          setUser(data);
        }
      } catch (err) {
        setError(err?.message || "Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, user]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto w-full max-w-4xl">
        <button
          onClick={() => navigate("/admin")}
          className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-300 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Admin Dashboard
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-2xl font-bold text-slate-900">Chi tiết người dùng</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin chi tiết tài khoản được chọn từ dashboard.</p>

          {loading && <p className="mt-6 text-slate-500">Đang tải dữ liệu...</p>}
          {error && <p className="mt-6 text-rose-600">{error}</p>}

          {!loading && !error && user && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Trạng thái tài khoản</p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    STATUS_COLORS[user.status] || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {user.status || "unknown"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard icon={User} label="Họ và tên" value={user.fullName} />
                <InfoCard icon={Mail} label="Email" value={user.email} />
                <InfoCard icon={Shield} label="Vai trò" value={user.role} />
                <InfoCard icon={BadgeCheck} label="User ID" value={user._id || user.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
