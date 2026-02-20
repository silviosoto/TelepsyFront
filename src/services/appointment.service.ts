import { fetchClient } from "@/lib/api-client";

export const appointmentService = {
    async getAppointments() {
        // Can filter by status: scheduled, completed, cancelled
        return fetchClient('/appointments');
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

    async cancelAppointment(id: number) {
        return fetchClient(`/appointments/cancel/${id}`, {
            method: 'PUT' // Changed to PUT as per backend controller
        });
    },

    async getPsychologistAppointments(filter: any) {
        const queryParams = new URLSearchParams();
        if (filter.psychologistId) queryParams.append('psychologistId', filter.psychologistId.toString());
        if (filter.startDate) queryParams.append('startDate', filter.startDate);
        if (filter.endDate) queryParams.append('endDate', filter.endDate);
        if (filter.patientName) queryParams.append('patientName', filter.patientName);
        if (filter.status !== undefined) queryParams.append('status', filter.status.toString());
        queryParams.append('pageNumber', filter.pageNumber?.toString() || '1');
        queryParams.append('pageSize', filter.pageSize?.toString() || '10');

        return fetchClient(`/appointments/search?${queryParams.toString()}`);
    }
};
