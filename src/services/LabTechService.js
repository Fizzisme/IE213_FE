import { BE_URL } from '@/lib/constans.js';

/**
 * Class LabTechService
 * Quản lý các yêu cầu API dành cho Kỹ thuật viên phòng Lab (Lab Technician).
 * Tập trung vào việc truy xuất danh sách hồ sơ y tế cần xét nghiệm và quản lý kết quả đầu ra.
 */
class LabTechService {
    /**
     * Phương thức bổ trợ (Helper) thực hiện HTTP Request.
     * Tự động đính kèm credentials để duy trì phiên làm việc và cấu hình headers mặc định.
     * @param {string} endpoint - Đường dẫn API.
     * @param {Object} params - Các tham số query (nếu có).
     * @param {Object} options - Tùy chỉnh bổ sung cho fetch.
     */
    async request(endpoint, params, options) {
        const url = `${BE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                // Cho phép gửi kèm HttpOnly Cookies để xác thực quyền Lab Tech
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            // Xử lý lỗi hệ thống nếu mã trạng thái HTTP không nằm trong khoảng 200-299
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // ================= PHẦN THÔNG TIN CÁ NHÂN (ME) =================

    /**
     * Lấy thông tin tài khoản của kỹ thuật viên hiện tại đang đăng nhập.
     */
    async getMe() {
        try {
            return await this.request('/lab-techs/me');
        } catch (error) {
            console.error('Lỗi getMe ở lab tech:', error);
            return null;
        }
    }

    // ================= QUẢN LÝ HỒ SƠ Y TẾ (MEDICAL RECORDS) =================

    /**
     * Truy xuất danh sách các hồ sơ y tế mà kỹ thuật viên phòng Lab cần xử lý.
     * Hỗ trợ nạp dữ liệu theo URL (cho trường hợp phân trang) hoặc endpoint mặc định.
     * @param {string} url - URL cụ thể (thường dùng cho các liên kết phân trang từ backend).
     */
    async getAllMedicalRecords(url) {
        try {
            if (url) return await this.request(`${url}`);
            else return await this.request('/lab-techs/medical-records');
        } catch (error) {
            console.error('Lỗi getAllMedicalRecords ở lab tech:', error);
            return null;
        }
    }

    // ================= QUẢN LÝ KẾT QUẢ XÉT NGHIỆM (TEST RESULTS) =================

    /**
     * Lấy danh sách toàn bộ các kết quả xét nghiệm đã được thực hiện hoặc đang xử lý trong Lab.
     */
    async getAllTestResults() {
        try {
            return await this.request('/lab-techs/test-results');
        } catch (error) {
            console.error('Lỗi getAllTestResult ở lab tech:', error);
            return null;
        }
    }
}

// Khởi tạo và xuất instance Singleton của LabTechService
export const labTechService = new LabTechService();
