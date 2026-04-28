import { BE_URL } from '@/lib/constans.js';

/**
 * Class AdminService
 * Cung cấp các phương thức tương tác với API dành riêng cho quản trị viên (Admin).
 * Quản lý vòng đời người dùng, phê duyệt tài khoản và xác thực giao dịch onboarding.
 */
class AdminService {
    /**
     * Phương thức bổ trợ (Helper) để thực hiện các HTTP Request.
     * Tự động cấu hình Base URL, Headers và xử lý lỗi tập trung cho toàn bộ service.
     * @param {string} endpoint - Đường dẫn API cụ thể.
     * @param {Object} options - Các tùy chỉnh cho fetch (method, body, headers...).
     */
    async request(endpoint, options) {
        const url = `${BE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                // Đảm bảo gửi kèm Cookies (Session/JWT) cho các request yêu cầu định danh
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            // Xử lý lỗi HTTP: Trích xuất message từ backend để ném lỗi cụ thể
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

    // ================= PHẦN XÁC THỰC (AUTHENTICATION) =================

    /**
     * Thực hiện đăng nhập cho tài khoản quản trị viên.
     */
    async adminLogin(payload) {
        return await this.request('/admins/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Lấy thông tin tài khoản admin hiện tại đang đăng nhập (Check session).
     */
    async getMe() {
        return await this.request('/admins/me');
    }

    // ================= QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT) =================

    /**
     * Lấy danh sách tất cả người dùng kèm theo các tham số lọc (phân trang, trạng thái...).
     */
    async getAdminUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/admins/users?${query}` : '/admins/users';
        return await this.request(endpoint);
    }

    /**
     * Lấy thông tin chi tiết của một người dùng cụ thể dựa trên ID.
     */
    async getAdminUserDetail(userId) {
        return await this.request(`/admins/users/${userId}`);
    }

    /**
     * Phê duyệt (Approve) người dùng để họ có quyền truy cập hệ thống.
     */
    async approveUser(userId) {
        return await this.request(`/admins/users/${userId}/approve`, {
            method: 'PATCH',
        });
    }

    /**
     * Xác minh giao dịch Onboarding của người dùng trên Blockchain.
     * Gửi txHash về backend để kiểm tra tính hợp lệ của việc khởi tạo tài khoản.
     */
    async verifyOnboarding(userId, txHash) {
        return await this.request(`/admins/users/${userId}/verify-onboarding`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    /**
     * Từ chối (Reject) yêu cầu đăng ký của người dùng kèm theo lý do cụ thể.
     */
    async rejectUser(userId, reason) {
        return await this.request(`/admins/users/${userId}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ reason }),
        });
    }

    /**
     * Chuyển trạng thái người dùng về "Cần xem xét lại" (Re-review).
     */
    async reReviewUser(userId) {
        return await this.request(`/admins/users/${userId}/re-review`, {
            method: 'PATCH',
        });
    }

    /**
     * Xóa mềm (Soft delete) người dùng khỏi hệ thống.
     * Dữ liệu vẫn được giữ lại trong DB nhưng trạng thái sẽ được đánh dấu là đã xóa.
     */
    async deleteUser(userId) {
        return await this.request(`/admins/users/${userId}/soft-delete`, {
            method: 'DELETE',
        });
    }
}

// Export một instance duy nhất (Singleton) để sử dụng xuyên suốt ứng dụng
export const adminService = new AdminService();
