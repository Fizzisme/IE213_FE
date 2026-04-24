import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveUser,
  deleteUser,
  getAdminUsers,
  rejectUser,
  reReviewUser,
} from "../../services/adminApi";
import { clearAccessToken } from "../../utils/auth";
import {
  Users,
  UserCheck,
  ShieldAlert,
  Ban,
  Search,
  Trash2,
  CheckCircle2,
  LogOut,
  Bell,
  Activity,
  PieChart,
  BarChart3,
} from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  inactive: "bg-slate-200 text-slate-700 border-slate-300",
};

const normalizeStatus = (status) => String(status || "").toLowerCase();

function StatCard({ icon: Icon, title, value, hint, color = "indigo" }) {
  const palette = {
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-200",
    amber: "from-amber-500 to-amber-600 shadow-amber-200",
    rose: "from-rose-500 to-rose-600 shadow-rose-200",
  }[color];

  return (
    <div className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${palette} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-900">Thống kê trạng thái người dùng</h3>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const percent = (item.value / max) * 100;
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoleChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-violet-600" />
        <h3 className="font-semibold text-slate-900">Phân bố vai trò</h3>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-800">{percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminUsers();
      setUsers(res?.data || []);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchKeyword =
        u.fullName?.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email?.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : normalizeStatus(u.status) === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [users, keyword, statusFilter]);

  const onApprove = async (userId) => {
    try {
      await approveUser(userId);
      await loadUsers();
    } catch (err) {
      alert(err?.message || "Duyệt user thất bại");
    }
  };

  const onReject = async (userId) => {
    const reason = window.prompt("Nhập lý do từ chối user:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Lý do từ chối không được để trống");
      return;
    }
    try {
      await rejectUser(userId, reason.trim());
      await loadUsers();
    } catch (err) {
      alert(err?.message || "Từ chối user thất bại");
    }
  };

  const onReReview = async (userId) => {
    try {
      await reReviewUser(userId);
      await loadUsers();
    } catch (err) {
      alert(err?.message || "Phục hồi xét duyệt user thất bại");
    }
  };

  const onDelete = async (userId) => {
    const ok = window.confirm("Bạn chắc chắn muốn xóa user này?");
    if (!ok) return;
    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (err) {
      alert(err?.message || "Xóa user thất bại");
    }
  };

  const onLogout = () => {
    clearAccessToken();
    navigate("/admin-login");
  };

  const getUserId = (user) => user?._id || user?.id;

  const onUserRowClick = (user) => {
    const userId = getUserId(user);
    if (!userId) return;
    navigate(`/admin/users/${userId}`, { state: { user } });
  };

  const pendingCount = users.filter((u) => normalizeStatus(u.status) === "pending").length;
  const activeCount = users.filter((u) => normalizeStatus(u.status) === "active").length;
  const rejectedCount = users.filter((u) => normalizeStatus(u.status) === "rejected").length;
  const inactiveCount = users.filter((u) => normalizeStatus(u.status) === "inactive").length;

  const roleMap = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = [
    { label: "Pending", value: pendingCount, barClass: "bg-amber-500" },
    { label: "Active", value: activeCount, barClass: "bg-emerald-500" },
    { label: "Rejected", value: rejectedCount, barClass: "bg-rose-500" },
    { label: "Inactive", value: inactiveCount, barClass: "bg-slate-500" },
  ];

  const roleChartData = [
    { label: "Patient", value: roleMap.patient || 0, barClass: "bg-indigo-500" },
    { label: "Doctor", value: roleMap.doctor || 0, barClass: "bg-violet-500" },
    { label: "Admin", value: roleMap.admin || 0, barClass: "bg-sky-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">HealthHub</p>
              <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-indigo-300 hover:text-indigo-700">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={onLogout}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6">
        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            title="Tổng người dùng"
            value={users.length}
            hint="Toàn hệ thống"
            color="indigo"
          />
          <StatCard
            icon={ShieldAlert}
            title="Chờ duyệt"
            value={pendingCount}
            hint="Cần xử lý"
            color="amber"
          />
          <StatCard
            icon={UserCheck}
            title="Đang hoạt động"
            value={activeCount}
            hint="Tài khoản ACTIVE"
            color="emerald"
          />
          <StatCard
            icon={Ban}
            title="Đã từ chối"
            value={rejectedCount}
            hint="Tài khoản REJECTED"
            color="rose"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StatusChart data={statusChartData} />
          <RoleChart data={roleChartData} />
        </section>

        {/* User management */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Quản lý người dùng</h2>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  placeholder="Tìm tên/email..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-52 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading && <p className="text-slate-500">Đang tải dữ liệu...</p>}
          {error && <p className="text-rose-600">{error}</p>}

          {!loading && !error && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-[1.4fr_1.5fr_.7fr_.8fr_1fr] bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 md:grid">
                <div>Họ tên</div>
                <div>Email</div>
                <div>Role</div>
                <div>Trạng thái</div>
                <div>Hành động</div>
              </div>

              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {filteredUsers.map((u) => (
                  <div
                    key={getUserId(u)}
                    onClick={() => onUserRowClick(u)}
                    className="grid cursor-pointer grid-cols-1 gap-2 px-4 py-4 transition-all hover:bg-indigo-50/40 md:grid-cols-[1.4fr_1.5fr_.7fr_.8fr_1fr] md:items-center"
                  >
                    <div className="font-semibold text-slate-800">{u.fullName}</div>
                    <div className="text-slate-600">{u.email}</div>
                    <div className="text-slate-700">{u.role}</div>
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          STATUS_COLORS[normalizeStatus(u.status)] || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={normalizeStatus(u.status) !== "pending"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove(getUserId(u));
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Duyệt
                      </button>
                      <button
                        disabled={normalizeStatus(u.status) !== "pending"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onReject(getUserId(u));
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                      <button
                        disabled={normalizeStatus(u.status) !== "rejected"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onReReview(getUserId(u));
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Re-review
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(getUserId(u));
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="px-4 py-8 text-center text-slate-500">
                    Không có user phù hợp bộ lọc.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
