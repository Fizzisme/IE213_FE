import { BE_URL } from '@/lib/constans.js';

class DoctorService {
    async request(endpoint, options = {}) {
        const url = `${BE_URL}${endpoint}`;

        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.message || data?.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    }

    // ---- ME ----
    async getMe() {
        return this.request('/doctors/me');
    }

    // ---- PATIENTS ----
    async getDoctorPatients(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/patients?${query}` : '/doctors/patients';
        return this.request(endpoint);
    }

    async getDoctorPatientDetail(patientId) {
        return this.request(`/doctors/patients/${patientId}`);
    }

    // ---- MEDICAL RECORDS ----
    async createMedicalRecord(patientId, payload) {
        return this.request(`/doctors/patients/${patientId}/medical-records`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getDoctorMedicalRecords(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/medical-records?${query}` : '/doctors/medical-records';
        return this.request(endpoint);
    }

    async getDoctorMedicalRecordDetail(recordId) {
        return this.request(`/doctors/medical-records/${recordId}`);
    }

    async updateDiagnosis(recordId, payload) {
        return this.request(`/doctors/medical-records/${recordId}/diagnosis`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    async verifyMedicalRecordTx(recordId, txHash) {
        return this.request(`/doctors/medical-records/${recordId}/verify-tx`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    async verifyMedicalRecordIntegrity(recordId) {
        return this.request(`/doctors/medical-records/${recordId}/verify`);
    }

    // ---- TEST RESULTS ----
    async getDoctorTestResults(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/doctors/test-results?${query}` : '/doctors/test-results';
        return this.request(endpoint);
    }

    async getDoctorTestResultDetail(testResultId) {
        return this.request(`/doctors/test-results/${testResultId}`);
    }

    // ---- APPOINTMENTS ----
    async getAppointments() {
        return this.request('/doctors/appointments');
    }

    async updateAppointment(appointmentId, status) {
        return this.request(`/doctors/appointments/${appointmentId}/update-status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }
}

export const doctorService = new DoctorService();
