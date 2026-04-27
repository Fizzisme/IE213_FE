import { BE_URL } from '@/lib/constans.js';

class DoctorService {
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

    // ── ME ──────────────────────────────────────────
    async getMe() {
        return await this.request('/doctors/me');
    }

    // ── BỆNH NHÂN ───────────────────────────────────
    async getDoctorPatients(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/patients?${query}` : '/doctors/patients';
        return await this.request(endpoint);
    }

    async getDoctorPatientDetail(patientId) {
        return await this.request(`/doctors/patients/${patientId}`);
    }

    // ── BỆNH ÁN ─────────────────────────────────────
    async createMedicalRecord(patientId, payload) {
        return await this.request(`/doctors/patients/${patientId}/medical-records`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getDoctorMedicalRecords(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/medical-records?${query}` : '/doctors/medical-records';
        return await this.request(endpoint);
    }

    async getDoctorMedicalRecordDetail(recordId) {
        return await this.request(`/doctors/medical-records/${recordId}`);
    }

    async updateDiagnosis(recordId, payload) {
        return await this.request(`/doctors/medical-records/${recordId}/diagnosis`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    // ── KẾT QUẢ XÉT NGHIỆM ──────────────────────────
    async getDoctorTestResults(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/test-results?${query}` : '/doctors/test-results';
        return await this.request(endpoint);
    }

    async getDoctorTestResultDetail(testResultId) {
        return await this.request(`/doctors/test-results/${testResultId}`);
    }

    // ── LỊCH HẸN ────────────────────────────────────
    async getAppointments() {
        return await this.request('/doctors/appointments');
    }

    async updateAppointment(appointmentId, status) {
        return await this.request(`/doctors/appointments/${appointmentId}/update-status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // ── HỒ SƠ ───────────────────────────────────────
    async getDoctorProfile() {
        return await this.request('/doctors/me');
    }
}

export const doctorService = new DoctorService();
