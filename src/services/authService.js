// services/authService.js
import { BE_URL } from '@/lib/constans.js';

class AuthService {
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
                if (response.status === 401) {
                    // Có thể dispatch event hoặc redirect ở đây
                    console.warn('Phiên đăng nhập đã hết hạn');
                }
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

    async getMe() {
        return await this.request('/auth/me');
    }

    async loginNationId(credentials) {
        return await this.request('/auth/login/nationId', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async loginWallet(payload) {
        return await this.request('/auth/login/wallet', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getNonce(walletAddress) {
        return await this.request('/auth/login/wallet', {
            method: 'POST',
            body: JSON.stringify({ walletAddress }),
        });
    }

    async logout() {
        return await this.request('/auth/logout', {
            method: 'DELETE',
        });
    }
}

export const authService = new AuthService();
