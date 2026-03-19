import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8017/v1",
  withCredentials: true,
});

const USE_MOCK = true;

let mockUsers = [
  { id: "u1", fullName: "Nguyễn Văn Bình", email: "binh@healthhub.com", role: "patient", status: "pending" },
  { id: "u2", fullName: "Trần Thị Hoa", email: "hoa@healthhub.com", role: "doctor", status: "approved" },
  { id: "u3", fullName: "Lê Văn Tâm", email: "tam@healthhub.com", role: "patient", status: "blocked" },
  { id: "u4", fullName: "Phạm Thị Lan", email: "lan@healthhub.com", role: "doctor", status: "pending" },
  { id: "u5", fullName: "Hoàng Minh Tuấn", email: "tuan@healthhub.com", role: "patient", status: "approved" },
  { id: "u6", fullName: "Đỗ Thành Long", email: "long@healthhub.com", role: "patient", status: "approved" },
  { id: "u7", fullName: "Vũ Thị Hương", email: "huong@healthhub.com", role: "doctor", status: "approved" },
  { id: "u8", fullName: "Ngô Bảo Ngọc", email: "ngoc@healthhub.com", role: "patient", status: "pending" },
  { id: "u9", fullName: "Đinh Quang Huy", email: "huy@healthhub.com", role: "doctor", status: "blocked" },
  { id: "u10", fullName: "Bùi Thanh Hà", email: "ha@healthhub.com", role: "admin", status: "pending" },
  { id: "u11", fullName: "Dương Thị Mai", email: "mai@healthhub.com", role: "patient", status: "approved" },
  { id: "u12", fullName: "Lý Quốc Anh", email: "anh@healthhub.com", role: "doctor", status: "approved" },
];

const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function adminLogin(payload) {
  if (!USE_MOCK) {
    const res = await api.post("/admin/auth/login", payload);
    return res.data;
  }

  await wait();
  return {
    success: true,
    data: {
      accessToken:
        "mock.admin.token",
      user: {
        id: "admin-1",
        fullName: "System Admin",
        role: "admin",
        email: payload?.email || "admin@healthhub.com",
      },
    },
  };
}

export async function verifyInviteToken(inviteToken) {
  if (!USE_MOCK) {
    const res = await api.post("/admin/auth/verify-invite", { inviteToken });
    return res.data;
  }

  await wait();
  if (!inviteToken || inviteToken.length < 10) {
    return { success: false, message: "Invite token không hợp lệ hoặc đã hết hạn." };
  }

  return {
    success: true,
    data: {
      inviteId: "inv-001",
      invitedBy: "Super Admin",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

export async function adminRegister(payload) {
  if (!USE_MOCK) {
    const res = await api.post("/admin/auth/register", payload);
    return res.data;
  }

  await wait();
  return {
    success: true,
    data: {
      message: "Đăng ký admin thành công.",
    },
  };
}

export async function getAdminUsers() {
  if (!USE_MOCK) {
    const res = await api.get("/admin/users");
    return res.data;
  }

  await wait();
  return { success: true, data: mockUsers };
}

export async function approveUser(userId) {
  if (!USE_MOCK) {
    const res = await api.patch(`/admin/users/${userId}/approve`);
    return res.data;
  }

  await wait();
  mockUsers = mockUsers.map((u) =>
    u.id === userId ? { ...u, status: "approved" } : u
  );

  return { success: true };
}

export async function deleteUser(userId) {
  if (!USE_MOCK) {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  }

  await wait();
  mockUsers = mockUsers.filter((u) => u.id !== userId);
  return { success: true };
}
