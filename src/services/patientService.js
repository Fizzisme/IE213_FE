import { BE_URL } from '@/lib/constans.js';

/**
 * Class PatientService
 * Quản lý toàn bộ các tương tác API dành cho phân hệ Bệnh nhân (Patient).
 * Bao gồm các nghiệp vụ: Đặt lịch hẹn, Quản lý hồ sơ y tế, và Điều khiển quyền truy cập Blockchain.
 */
class PatientService {
    /**
     * Phương thức bổ trợ (Helper) thực hiện HTTP Request.
     * Tự động xử lý Base URL, đính kèm Cookie xác thực và bắt lỗi từ phía Server.
     * @param {string} endpoint - Đường dẫn API.
     * @param {Object} options - Các cấu hình cho fetch (method, headers, body...).
     */
    async request(endpoint, options = {}) {
        const url = `${BE_URL}${endpoint}`;

        const response = await fetch(url, {
            // Duy trì phiên làm việc qua HttpOnly Cookie
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
        });

        // Parse dữ liệu JSON an toàn từ phản hồi của Server
        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        // Kiểm tra mã trạng thái HTTP và ném lỗi kèm message từ Backend nếu có
        if (!response.ok) {
            throw new Error(data?.message || data?.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    }

    /**
     * Hàm bóc tách dữ liệu thực tế (unwrap) từ cấu trúc response chuẩn của API.
     */
    unwrap(response) {
        return response?.data ?? response;
    }

    // ================= QUẢN LÝ DỊCH VỤ (SERVICES) =================

    /**
     * Lấy danh sách các dịch vụ khám bệnh hiện có tại cơ sở y tế.
     */
    async getServices() {
        return this.request('/patients/services');
    }

    // ================= QUẢN LÝ LỊCH HẸN (APPOINTMENTS) =================

    /**
     * Lấy danh sách lịch hẹn của chính bệnh nhân đang đăng nhập.
     */
    async getAppointments(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/appointments/me?${query}` : '/patients/appointments/me';
        return this.request(endpoint);
    }

    /**
     * Tạo một đơn đăng ký đặt lịch khám mới.
     */
    async createAppointment(payload) {
        return this.request('/patients/appointments', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Hủy bỏ một lịch hẹn dựa trên ID.
     */
    async cancelAppointment(appointmentId) {
        return this.request(`/patients/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
        });
    }

    /**
     * Thay đổi thời gian hoặc nội dung yêu cầu của một lịch hẹn đã có.
     */
    async rescheduleAppointment(appointmentId, payload) {
        return this.request(`/patients/appointments/${appointmentId}/reschedule`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    // ================= ĐIỀU KHIỂN TRUY CẬP BLOCKCHAIN (ACCESS CONTROL) =================

    /**
     * Lấy metadata cần thiết (địa chỉ ví bác sĩ, địa chỉ contract) để chuẩn bị thực hiện Grant Access.
     */
    async prepareGrantAccess(appointmentId) {
        return this.request(`/patients/appointments/${appointmentId}/prepare-grant-access`);
    }

    /**
     * Gửi txHash sau khi thực hiện giao dịch Grant Access trên MetaMask về Backend để xác minh.
     */
    async verifyGrantAccess(appointmentId, txHashOrPayload) {
        const txHash = typeof txHashOrPayload === 'string' ? txHashOrPayload : txHashOrPayload?.txHash;

        return this.request(`/patients/appointments/${appointmentId}/verify-grant-access`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    /**
     * Lấy metadata cần thiết để chuẩn bị thực hiện giao dịch thu hồi quyền truy cập (Revoke Access).
     */
    async prepareRevokeAccess(appointmentId) {
        return this.request(`/patients/appointments/${appointmentId}/prepare-revoke-access`);
    }

    /**
     * Gửi txHash giao dịch Revoke Access về Backend để cập nhật trạng thái hồ sơ.
     */
    async verifyRevokeAccess(appointmentId, txHashOrPayload) {
        const txHash = typeof txHashOrPayload === 'string' ? txHashOrPayload : txHashOrPayload?.txHash;

        return this.request(`/patients/appointments/${appointmentId}/verify-revoke-access`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    // ================= QUẢN LÝ HỒ SƠ CÁ NHÂN (PROFILE) =================

    /**
     * Lấy thông tin cá nhân chi tiết của bệnh nhân hiện tại.
     */
    async getMe() {
        return this.request('/patients/me');
    }

    /**
     * Khởi tạo Profile bệnh nhân lần đầu tiên sau khi đăng ký tài khoản.
     */
    async createProfile(payload) {
        return this.request('/patients', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    // ================= HỒ SƠ Y TẾ (MEDICAL RECORDS) =================

    /**
     * Truy xuất danh sách bệnh án/hồ sơ y tế điện tử của bệnh nhân.
     */
    async getMedicalRecords(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/medical-records?${query}` : '/patients/medical-records';
        return this.request(endpoint);
    }

    /**
     * Xem chi tiết một hồ sơ y tế cụ thể (Kết quả Lab, chẩn đoán bác sĩ).
     */
    async getMedicalRecordDetail(medicalRecordId) {
        return this.request(`/patients/medical-records/${medicalRecordId}`);
    }

    // ================= QUẢN LÝ THÔNG BÁO (NOTIFICATIONS) =================

    /**
     * Lấy danh sách thông báo cá nhân (nhắc lịch hẹn, kết quả khám...).
     */
    async getNotifications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/notifications/me?${query}` : '/patients/notifications/me';
        return this.request(endpoint);
    }

    /**
     * Đánh dấu một thông báo cụ thể là đã đọc.
     */
    async markNotificationRead(id) {
        return this.request(`/patients/notifications/${id}/read`, {
            method: 'PATCH',
        });
    }

    /**
     * Đánh dấu tất cả thông báo của bệnh nhân là đã đọc.
     */
    async markAllNotificationsRead() {
        return this.request('/patients/notifications/read-all', {
            method: 'PATCH',
        });
    }

    /**
     * Xóa một thông báo khỏi danh sách.
     */
    async deleteNotification(id) {
        return this.request(`/patients/notifications/${id}`, {
            method: 'DELETE',
        });
    }

    /**
     * Xóa toàn bộ hộp thư thông báo.
     */
    async deleteAllNotifications() {
        return this.request('/patients/notifications/delete-all', {
            method: 'DELETE',
        });
    }
}

// Export Singleton Instance của PatientService
export const patientService = new PatientService();
