import { fetchClient } from "@/lib/api-client";

export const patientService = {
    async getProfile() {
        return fetchClient('/patient/profile');
    },

    async updateProfile(profileData: any) {
        return fetchClient('/patient/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    async getHistory() {
        return fetchClient('/patient/history'); // Mock endpoint for now
    },

    async getStats() {
        return fetchClient('/patient/stats'); // Mock endpoint
    }
};
