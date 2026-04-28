// services/authService.js
import { BE_URL } from '@/lib/constans.js';

/**
 * Class AuthService
 * Chịu trách nhiệm quản lý toàn bộ luồng xác thực (Authentication) của người dùng.
 * Hỗ trợ nhiều phương thức đăng nhập: truyền thống (NationID) và hiện đại (Web3 Wallet).
 */
class AuthService {
    /**
     * Phương thức bổ trợ (Helper) để thực hiện các HTTP Request.
     * Cấu hình mặc định 'credentials: include' để đảm bảo việc gửi và nhận HttpOnly Cookies.
     * @param {string} endpoint - Đường dẫn API cụ thể.
     * @param {Object} options - Các tùy chỉnh cho fetch (method, body, headers...).
     */
    async request(endpoint, options) {
        const url = `${BE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                // Tự động đính kèm Cookie (Session/JWT) trong mỗi request
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            // Xử lý các phản hồi không thành công từ Server
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Trường hợp phiên làm việc hết hạn (Unauthorized)
                if (response.status === 401) {
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

    /**
     * Kiểm tra trạng thái đăng nhập hiện tại và lấy thông tin người dùng từ Session.
     */
    async getMe() {
        return await this.request('/auth/me');
    }

    /**
     * Đăng nhập bằng phương thức định danh quốc gia (NationID / CCCD).
     * @param {Object} credentials - Thông tin đăng nhập truyền thống.
     */
    async loginNationId(credentials) {
        return await this.request('/auth/login/nationId', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    /**
     * Đăng nhập bằng Ví Blockchain (MetaMask).
     * @param {Object} payload - Bao gồm địa chỉ ví và chữ ký (signature) để xác thực.
     */
    async loginWallet(payload) {
        return await this.request('/auth/login/wallet', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Lấy mã Nonce ngẫu nhiên từ server cho một địa chỉ ví cụ thể.
     * Nonce được dùng để tạo thông điệp ký (Sign message), ngăn chặn tấn công phát lại (Replay Attack).
     */
    async getNonce(walletAddress) {
        return await this.request('/auth/login/wallet', {
            method: 'POST',
            body: JSON.stringify({ walletAddress }),
        });
    }

    /**
     * Kết thúc phiên làm việc của người dùng và xóa Cookies xác thực trên Server/Browser.
     */
    async logout() {
        return await this.request('/auth/logout', {
            method: 'DELETE',
        });
    }
}

// Khởi tạo instance duy nhất của AuthService để quản lý session toàn cục
export const authService = new AuthService();
