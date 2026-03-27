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
    },

    async getPsychologistDetails(id: number) {
        return fetchClient(`/Admin/psychologists/${id}`);
    },

    async getPsychologistAppointments(id: number, page: number = 1, pageSize: number = 10, searchTerm?: string, startDate?: string, endDate?: string) {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('pageSize', pageSize.toString());
        if (searchTerm) queryParams.append('searchTerm', searchTerm);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        return fetchClient(`/Admin/psychologists/${id}/appointments?${queryParams.toString()}`);
    },

    async getPsychologistPayments(id: number, page: number = 1, pageSize: number = 10, searchTerm?: string, status?: string, startDate?: string, endDate?: string) {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('pageSize', pageSize.toString());
        if (searchTerm) queryParams.append('searchTerm', searchTerm);
        if (status && status !== 'all') queryParams.append('status', status);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        return fetchClient(`/Admin/psychologists/${id}/payments?${queryParams.toString()}`);
    },

    async approvePsychologist(id: number) {
        return fetchClient(`/Admin/psychologists/${id}/approve`, {
            method: 'POST'
        });
    },

    async rejectPsychologist(id: number, reason: string) {
        return fetchClient(`/Admin/psychologists/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    },

    async getPaymentManagement(psychologistId?: number, patientId?: number, startDate?: string, endDate?: string) {
        const queryParams = new URLSearchParams();
        if (psychologistId) queryParams.append('psychologistId', psychologistId.toString());
        if (patientId) queryParams.append('patientId', patientId.toString());
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        return fetchClient(`/Admin/payments?${queryParams.toString()}`);
    },

    async processPayout(payoutRequest: { psychologistId: number, appointmentIds: number[] }) {
        return fetchClient(`/Admin/payments/payout`, {
            method: 'POST',
            body: JSON.stringify(payoutRequest)
        });
    },

    async getCommissionRate() {
        return fetchClient(`/Admin/commission`);
    },

    async updateCommissionRate(data: { rate: number }) {
        return fetchClient(`/Admin/commission`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async getPackageDiscounts() {
        return fetchClient(`/Admin/packages/discounts`);
    },

    async updatePackageDiscounts(data: { discount4Sessions: number, discount8Sessions: number, discount12Sessions: number }) {
        return fetchClient(`/Admin/packages/discounts`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
};
