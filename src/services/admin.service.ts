import { fetchClient } from "@/lib/api-client";

export const adminService = {
    async getPatients(page: number, pageSize: number, search?: string, date?: string) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });

        if (search) queryParams.append('search', search);
        if (date) queryParams.append('date', date);

        return fetchClient(`/Admin/patients?${queryParams.toString()}`);
    },

    async getPsychologists(page: number, pageSize: number, search?: string, isVerified?: string, date?: string) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });

        if (search) queryParams.append('search', search);
        if (isVerified && isVerified !== 'all') queryParams.append('isVerified', isVerified);
        if (date) queryParams.append('date', date);

        return fetchClient(`/Admin/psychologists?${queryParams.toString()}`);
    }
};
