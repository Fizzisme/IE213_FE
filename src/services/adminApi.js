import axios from 'axios';
import { BE_URL } from '@/lib/constans.js';

const api = axios.create({
    baseURL: `${BE_URL}`,
    withCredentials: true,
});

function normalizeError(error, fallbackMessage) {
    const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        fallbackMessage;
    return new Error(message);
}

export async function adminLogin(payload) {
    try {
        const res = await api.post('/admins/auth/login', payload);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Đăng nhập admin thất bại');
    }
}

export async function getAdminUsers(params = {}) {
    try {
        const res = await api.get('/admins/users', { params });
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải danh sách người dùng');
    }
}

export async function getAdminUserDetail(userId) {
    try {
        const res = await api.get(`/admins/users/${userId}`);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải chi tiết người dùng');
    }
}

export async function approveUser(userId) {
    try {
        const res = await api.patch(`/admins/users/${userId}/approve`);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Duyệt user thất bại');
    }
}

export async function rejectUser(userId, reason) {
    try {
        const res = await api.patch(`/admins/users/${userId}/reject`, { reason });
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Từ chối user thất bại');
    }
}

export async function reReviewUser(userId) {
    try {
        const res = await api.patch(`/admins/users/${userId}/re-review`);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Phục hồi xét duyệt user thất bại');
    }
}

export async function deleteUser(userId) {
    try {
        const res = await api.delete(`/admins/users/${userId}/soft-delete`);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Xóa user thất bại');
    }
}
