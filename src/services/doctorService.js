import { BE_URL } from '@/lib/constans.js';

/**
 * Class DoctorService
 * Cung cấp các phương thức tương tác với API dành riêng cho Bác sĩ (Doctor).
 * Quản lý vòng đời bệnh án, thực hiện chẩn đoán và xác thực tính toàn vẹn của dữ liệu y tế.
 */
class DoctorService {
    /**
     * Phương thức bổ trợ (Helper) để thực hiện các HTTP Request.
     * Tự động xử lý Base URL, định dạng JSON và bắt lỗi API tập trung.
     * @param {string} endpoint - Đường dẫn API cụ thể.
     * @param {Object} options - Các tùy chỉnh cho fetch (method, body, headers...).
     */
    async request(endpoint, options = {}) {
        const url = `${BE_URL}${endpoint}`;

        const response = await fetch(url, {
            // Đảm bảo gửi kèm HttpOnly Cookies để xác thực phiên làm việc của Bác sĩ
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
        });

        // Parse dữ liệu JSON an toàn
        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        // Xử lý lỗi trả về từ Server dựa trên mã trạng thái HTTP
        if (!response.ok) {
            throw new Error(data?.message || data?.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    }

    // ================= PHẦN THÔNG TIN CÁ NHÂN (ME) =================

    /**
     * Lấy thông tin chi tiết của bác sĩ hiện tại đang đăng nhập.
     */
    async getMe() {
        return this.request('/doctors/me');
    }

    // ================= QUẢN LÝ BỆNH NHÂN (PATIENTS) =================

    /**
     * Lấy danh sách bệnh nhân thuộc quyền quản lý hoặc đã từng thăm khám.
     */
    async getDoctorPatients(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/patients?${query}` : '/doctors/patients';
        return this.request(endpoint);
    }

    /**
     * Xem thông tin chi tiết và tiền sử của một bệnh nhân cụ thể.
     */
    async getDoctorPatientDetail(patientId) {
        return this.request(`/doctors/patients/${patientId}`);
    }

    // ================= HỒ SƠ Y TẾ (MEDICAL RECORDS) =================

    /**
     * Khởi tạo hồ sơ bệnh án mới cho một bệnh nhân (Chỉ định xét nghiệm/lâm sàng).
     */
    async createMedicalRecord(patientId, payload) {
        return this.request(`/doctors/patients/${patientId}/medical-records`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Lấy danh sách toàn bộ hồ sơ y tế mà bác sĩ đã xử lý hoặc được cấp quyền.
     */
    async getDoctorMedicalRecords(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/medical-records?${query}` : '/doctors/medical-records';
        return this.request(endpoint);
    }

    /**
     * Xem chi tiết một hồ sơ bệnh án cụ thể kèm kết quả Lab.
     */
    async getDoctorMedicalRecordDetail(recordId) {
        return this.request(`/doctors/medical-records/${recordId}`);
    }

    /**
     * Cập nhật kết luận chẩn đoán và hướng dẫn điều trị vào hồ sơ bệnh án.
     */
    async updateDiagnosis(recordId, payload) {
        return this.request(`/doctors/medical-records/${recordId}/diagnosis`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Xác thực giao dịch lưu trữ hồ sơ bệnh án trên Blockchain.
     * Gửi mã giao dịch (txHash) để backend đối soát tính minh bạch.
     */
    async verifyMedicalRecordTx(recordId, txHash) {
        return this.request(`/doctors/medical-records/${recordId}/verify-tx`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    /**
     * Kiểm tra tính toàn vẹn của hồ sơ bằng cách so khớp dữ liệu gốc với Blockchain.
     */
    async verifyMedicalRecordIntegrity(recordId) {
        return this.request(`/doctors/medical-records/${recordId}/verify`);
    }

    // ================= KẾT QUẢ XÉT NGHIỆM (TEST RESULTS) =================

    /**
     * Truy xuất danh sách kết quả xét nghiệm từ phòng Lab gửi về.
     */
    async getDoctorTestResults(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/test-results?${query}` : '/doctors/test-results';
        return this.request(endpoint);
    }

    /**
     * Xem chi tiết các chỉ số sinh hóa trong một kết quả xét nghiệm.
     */
    async getDoctorTestResultDetail(testResultId) {
        return this.request(`/doctors/test-results/${testResultId}`);
    }

    // ================= LỊCH HẸN (APPOINTMENTS) =================

    /**
     * Lấy danh sách các lịch hẹn khám bệnh đã được đăng ký với bác sĩ.
     */
    async getAppointments() {
        return this.request('/doctors/appointments');
    }

    /**
     * Cập nhật trạng thái lịch hẹn (Xác nhận/Hủy/Hoàn thành).
     */
    async updateAppointment(appointmentId, status) {
        return this.request(`/doctors/appointments/${appointmentId}/update-status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }
}

// Export singleton instance để sử dụng trong toàn bộ phân hệ Doctor
export const doctorService = new DoctorService();
