import { fetchClient } from "@/lib/api-client";

export const paymentService = {
    async getPaymentHistory() {
        return fetchClient('/payments/history');
    },

    async getPaymentDetails(id: string) {
        return fetchClient(`/payments/${id}`);
    }
};
