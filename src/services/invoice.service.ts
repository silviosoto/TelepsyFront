import { fetchClient } from "@/lib/api-client";

export interface InvoiceDetail {
    id: number;
    appointmentId?: number;
    description: string;
    unitPrice: number;
    commissionAmount: number;
    total: number;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    issueDate: string;
    totalAmount: number;
    type: number; // 0: ClientPurchase, 1: PsychologistPayout
    status: number; // 0: Issued, 1: Paid, 2: Cancelled, 3: Refunded
    patientId?: number;
    psychologistId?: number;
    paymentId?: number;
    details: InvoiceDetail[];
    payment?: {
        id: number;
        status: string;
        transactionId: string;
        paymentMethod: string;
    };
}

export const invoiceService = {
    async getMyInvoices(): Promise<Invoice[]> {
        const response = await fetchClient<Invoice[]>('/invoice/my-invoices');
        return response || [];
    },

    async getInvoiceById(id: number): Promise<Invoice | null> {
        return fetchClient<Invoice>(`/invoice/${id}`);
    }
};
