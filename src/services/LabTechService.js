import { BE_URL } from '@/lib/constans.js';

class LabTechService {
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
            return await this.request('/lab-techs/me');
        } catch (error) {
            console.error('Lỗi getMe ở lab tech:', error);
            return null;
        }
    }

    async getAllMedicalRecords(url) {
        try {
            if (url) return await this.request(`${url}`);
            else return await this.request('/lab-techs/medical-records');
        } catch (error) {
            console.error('Lỗi getAllMedicalRecords ở lab tech:', error);
            return null;
        }
    }

    async getAllTestResults() {
        try {
            return await this.request('/lab-techs/test-results');
        } catch (error) {
            console.error('Lỗi getAllTestResult ở lab tech:', error);
        }
    }
}

export const labTechService = new LabTechService();
