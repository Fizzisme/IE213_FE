import { BE_URL } from '@/lib/constans.js';

class DoctorService {
    async request(endpoint, params, options) {
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }
    async getMe() {
        try {
            return await this.request('/doctors/me');
        } catch (error) {
            console.error('Lỗi getMe ở doctor:', error);
            return null;
        }
    }

    async getAppointments() {
        try {
            return await this.request('/doctors/appointments');
        } catch (error) {
            console.error('Lỗi getAppointments ở doctor', error);
            return null;
        }
    }

    async updateAppointment(appointmentId, status) {
        try {
            return await this.request(`/doctors/appointments/${appointmentId}/update-status`, null, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error('Lỗi updateAppointment ở doctor', error);
            return null;
        }
    }

    async createMedicalRecord(patientId, payload) {
        try {
            return await this.request(`/doctors/patients/${patientId}/medical-records`, null, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Lỗi createMedicalRecord ở doctor', error);
            return null;
        }
    }
}

export const doctorService = new DoctorService();
