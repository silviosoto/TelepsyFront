import { fetchClient } from "@/lib/api-client";

export const appointmentService = {
    async getAppointments() {
        // Fetch only appointments for the currently logged-in patient
        return fetchClient('/appointments/my-appointments');
    },

    async getAppointmentById(id: number) {
        return fetchClient(`/appointments/${id}`);
    },

    async createAppointment(appointmentData: any) {
        return fetchClient('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData)
        });
    },

    async initiateBooking(bookingData: { psychologistId: number; therapyId: number; scheduledTime: string }) {
        return fetchClient('/appointments/initiate', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },

    async getCheckoutSummary(appointmentId: number) {
        return fetchClient(`/appointments/checkout-summary/${appointmentId}`);
    },

    async cancelAppointment(id: number) {
        return fetchClient(`/appointments/cancel/${id}`, {
            method: 'PUT' // Changed to PUT as per backend controller
        });
    },

    async getPsychologistAppointments(filter: any) {
        // Fetch all appointments for the psychologist from the existing backend endpoint
        const response = await fetchClient(`/appointments/psychologist/${filter.psychologistId}`);
        const allAppointments: any[] = response || [];

        // Filter locally
        let filtered = allAppointments;
        if (filter.patientName) {
            const searchLower = filter.patientName.toLowerCase();
            filtered = filtered.filter(a =>
                a.patient?.person?.firstName?.toLowerCase().includes(searchLower) ||
                a.patient?.person?.lastName?.toLowerCase().includes(searchLower)
            );
        }
        if (filter.startDate) {
            const startStr = new Date(filter.startDate).toISOString().split('T')[0];
            filtered = filtered.filter(a => new Date(a.scheduledTime).toISOString().split('T')[0] >= startStr);
        }
        if (filter.endDate) {
            const endStr = new Date(filter.endDate).toISOString().split('T')[0];
            filtered = filtered.filter(a => new Date(a.scheduledTime).toISOString().split('T')[0] <= endStr);
        }
        if (filter.status !== undefined) {
            filtered = filtered.filter(a => a.status === filter.status);
        }

        // Paginate
        const page = filter.pageNumber || 1;
        const size = filter.pageSize || 10;
        const startIndex = (page - 1) * size;
        const items = filtered.slice(startIndex, startIndex + size);

        return {
            items,
            totalCount: filtered.length,
            pageNumber: page,
            pageSize: size
        };
    },

    async markAsCompleted(id: number) {
        return fetchClient(`/appointments/${id}/complete`, {
            method: 'PUT'
        });
    },

    async markAsNoShow(id: number) {
        return fetchClient(`/appointments/${id}/noshow`, {
            method: 'PUT'
        });
    },

    async joinAppointment(id: number) {
        return fetchClient(`/appointments/${id}/join`);
    }
};
