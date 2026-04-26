// src/services/doctorApi.js
import api from '@/utils/api.js';

// Hàm chuẩn hóa lỗi (tương tự như adminApi)

function normalizeError(error, fallbackMessage) {
    const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        fallbackMessage;
    return new Error(message);
}

// ==========================================
// 1. QUẢN LÝ BỆNH NHÂN
// ==========================================

export async function getDoctorPatients(params = {}) {
    try {
        const res = await api.get('/doctors/patients', { params });
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải danh sách bệnh nhân');
    }
}

export async function getDoctorPatientDetail(patientId) {
    try {
        const res = await api.get(`/doctors/patients/${patientId}`);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải thông tin bệnh nhân');
    }
}

// ==========================================
// 2. TẠO & QUẢN LÝ BỆNH ÁN (MEDICAL RECORDS)
// ==========================================

export async function createMedicalRecord(patientId, payload) {
    try {
        const res = await api.post(`/doctors/patients/${patientId}/medical-records`, payload);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Tạo bệnh án / Chỉ định xét nghiệm thất bại');
    }
}

export async function getDoctorMedicalRecords(params = {}) {
    // params có thể truyền vào { status: 'CREATED,HAS_RESULT' }
    try {
        const res = await api.get('/doctors/medical-records', { params });
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải danh sách bệnh án');
    }
}

export async function getDoctorMedicalRecordDetail(recordId) {
    try {
        const res = await api.get(`/doctors/medical-records/${recordId}`);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải chi tiết bệnh án');
    }
}

export async function updateDiagnosis(recordId, payload) {
    // payload: { testResultId: "...", diagnosis: "..." }
    try {
        const res = await api.patch(`/doctors/medical-records/${recordId}/diagnosis`, payload);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Cập nhật chẩn đoán thất bại');
    }
}

// ==========================================
// 3. KẾT QUẢ XÉT NGHIỆM (TEST RESULTS)
// ==========================================

export async function getDoctorTestResults(params = {}) {
    try {
        const res = await api.get('/doctors/test-results', { params });
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải danh sách kết quả xét nghiệm');
    }
}

export async function getDoctorTestResultDetail(testResultId) {
    try {
        const res = await api.get(`/doctors/test-results/${testResultId}`);
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải chi tiết kết quả xét nghiệm');
    }
}
export async function getDoctorProfile() {
    try {
        const res = await api.get('/doctors/me');
        return res.data;
    } catch (error) {
        throw normalizeError(error, 'Không thể tải thông tin hồ sơ cá nhân');
    }
}
