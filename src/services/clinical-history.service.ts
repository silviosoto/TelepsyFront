import { fetchClient } from "@/lib/api-client";

export const clinicalHistoryService = {
    async getClinicalHistory(patientId: number) {
        return fetchClient(`/ClinicalHistory/${patientId}`);
    },

    async updateClinicalHistory(patientId: number, data: any) {
        return fetchClient(`/ClinicalHistory/${patientId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
};
