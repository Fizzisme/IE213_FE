import { BE_URL } from '@/lib/constans.js';

class PatientService {
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

    // ── DỊCH VỤ ─────────────────────────────────────
    async getServices() {
        return await this.request('/patients/services');
    }

    // ── LỊCH HẸN ────────────────────────────────────
    async getAppointments(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/appointments/me?${query}` : '/patients/appointments/me';
        return await this.request(endpoint);
    }

    async rescheduleAppointment(appointmentId, payload) {
        return await this.request(`/patients/appointments/${appointmentId}/reschedule`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    async createAppointment(payload) {
        return await this.request('/patients/appointments', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async cancelAppointment(appointmentId) {
        return await this.request(`/patients/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
        });
    }

    // ── HỒ SƠ ───────────────────────────────────────
    async getMe() {
        return await this.request('/patients/me');
    }

    async getProfile() {
        return await this.request('/patients/profile');
    }

    async createProfile(payload) {
        return await this.request('/patients', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async updateProfile(payload) {
        return await this.request('/patients/profile', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }

    // ── BỆNH ÁN ─────────────────────────────────────
    async getMedicalRecords(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/medical-records?${query}` : '/patients/medical-records';
        return await this.request(endpoint);
    }

    async getMedicalRecordDetail(recordId) {
        return await this.request(`/patients/medical-records/${recordId}`);
    }

    // ── THÔNG BÁO ───────────────────────────────────────
    async getNotifications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/notifications/me?${query}` : '/patients/notifications/me';
        return await this.request(endpoint);
    }

    async markNotificationRead(id) {
        return await this.request(`/patients/notifications/${id}/read`, {
            method: 'PATCH',
        });
    }

    async markAllNotificationsRead() {
        return await this.request('/patients/notifications/read-all', {
            method: 'PATCH',
        });
    }

    async deleteNotification(id) {
        return await this.request(`/patients/notifications/${id}`, {
            method: 'DELETE',
        });
    }

    async deleteAllNotifications() {
        return await this.request('/patients/notifications/delete-all', {
            method: 'DELETE',
        });
    }
}

export const patientService = new PatientService();
