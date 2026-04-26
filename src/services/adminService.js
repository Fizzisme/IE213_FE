import { BE_URL } from '@/lib/constans.js';

class AdminService {
    async request(endpoint, options) {
        const url = `${BE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData?.message || errorData?.errors?.[0]?.message || `HTTP error! status: ${response.status}`,
                );
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async adminLogin(payload) {
        return await this.request('/admins/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getAdminUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/admins/users?${query}` : '/admins/users';
        return await this.request(endpoint);
    }

    async getAdminUserDetail(userId) {
        return await this.request(`/admins/users/${userId}`);
    }

    async approveUser(userId) {
        return await this.request(`/admins/users/${userId}/approve`, {
            method: 'PATCH',
        });
    }

    async verifyOnboarding(userId, txHash) {
        return await this.request(`/admins/users/${userId}/verify-onboarding`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    async rejectUser(userId, reason) {
        return await this.request(`/admins/users/${userId}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ reason }),
        });
    }

    async reReviewUser(userId) {
        return await this.request(`/admins/users/${userId}/re-review`, {
            method: 'PATCH',
        });
    }

    async deleteUser(userId) {
        return await this.request(`/admins/users/${userId}/soft-delete`, {
            method: 'DELETE',
        });
    }

    async getMe() {
        return await this.request('/admins/me');
    }
}

export const adminService = new AdminService();
