import { BE_URL } from '@/lib/constans.js';

class PatientService {
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

    unwrap(response) {
        return response?.data ?? response;
    }

    // ---- SERVICES ----
    async getServices() {
        return this.request('/patients/services');
    }

    // ---- APPOINTMENTS ----
    async getAppointments(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/appointments/me?${query}` : '/patients/appointments/me';
        return this.request(endpoint);
    }

    async createAppointment(payload) {
        return this.request('/patients/appointments', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async cancelAppointment(appointmentId) {
        return this.request(`/patients/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
        });
    }

    async rescheduleAppointment(appointmentId, payload) {
        return this.request(`/patients/appointments/${appointmentId}/reschedule`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    // ---- BLOCKCHAIN ACCESS CONTROL ----
    async prepareGrantAccess(appointmentId) {
        return this.request(`/patients/appointments/${appointmentId}/prepare-grant-access`);
    }

    async verifyGrantAccess(appointmentId, txHashOrPayload) {
        const txHash = typeof txHashOrPayload === 'string' ? txHashOrPayload : txHashOrPayload?.txHash;

        return this.request(`/patients/appointments/${appointmentId}/verify-grant-access`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    async prepareRevokeAccess(appointmentId) {
        return this.request(`/patients/appointments/${appointmentId}/prepare-revoke-access`);
    }

    async verifyRevokeAccess(appointmentId, txHashOrPayload) {
        const txHash = typeof txHashOrPayload === 'string' ? txHashOrPayload : txHashOrPayload?.txHash;

        return this.request(`/patients/appointments/${appointmentId}/verify-revoke-access`, {
            method: 'POST',
            body: JSON.stringify({ txHash }),
        });
    }

    // ---- PROFILE ----
    async getMe() {
        return this.request('/patients/me');
    }

    async createProfile(payload) {
        return this.request('/patients', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    // Aliases for backward compatibility
    async getProfile() {
        return this.getMe();
    }

    async updateProfile() {
        throw new Error('Endpoint /patients/profile is not available in current backend routes.');
    }

    // ---- MEDICAL RECORDS (not available in current backend patient routes) ----
    async getMedicalRecords() {
        throw new Error('Endpoint /patients/medical-records is not available in current backend routes.');
    }

    async getMedicalRecordDetail() {
        throw new Error('Endpoint /patients/medical-records/:id is not available in current backend routes.');
    }

    // ---- NOTIFICATIONS ----
    async getNotifications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/patients/notifications/me?${query}` : '/patients/notifications/me';
        return this.request(endpoint);
    }

    async markNotificationRead(id) {
        return this.request(`/patients/notifications/${id}/read`, {
            method: 'PATCH',
        });
    }

    async markAllNotificationsRead() {
        return this.request('/patients/notifications/read-all', {
            method: 'PATCH',
        });
    }

    async deleteNotification(id) {
        return this.request(`/patients/notifications/${id}`, {
            method: 'DELETE',
        });
    }

    async deleteAllNotifications() {
        return this.request('/patients/notifications/delete-all', {
            method: 'DELETE',
        });
    }
}

export const patientService = new PatientService();
