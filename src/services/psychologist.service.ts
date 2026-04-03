import { fetchClient } from "@/lib/api-client";

// Define the interface for the UI model
export interface PsychologistUI {
    id: number;
    firstName: string;
    lastName: string;
    specialization: string;
    city: string;
    gender: string;
    documentType: string;
    documentNumber: string;
    experience: number;
    price: number;
    rating: string;
    reviews: number;
    available: boolean;
    tags: string[];
    profilePicture?: string;
    isVerified: boolean;
    services: string[];
    specialties: string[];
}

// Extended interface for the profile view
export interface PsychologistProfileUI extends PsychologistUI {
    bio: string;
    university: string;
    hobbies: string;
    email: string; // From user/person
    phone: string; // From person
    state: string; // From person (Department)
    licenseNumber: string;
    paymentAccount?: string;
}

export interface PatientListItemUI {
    id: number;
    fullName: string;
    profilePicturePath?: string;
    lastAppointmentDate?: string;
    sessionCount: number;
    email?: string;
    phone?: string;
}

export const psychologistService = {
    async getVerifiedPsychologists(): Promise<PsychologistUI[]> {
        const data = await fetchClient('/psychologist/verified');

        if (!data) return [];
        return this.mapToUI(data);
    },

    // Refactored mapping to avoid duplication
    mapToUI(data: any[]): PsychologistUI[] {
        return data.map((psy: any) => ({
            id: psy.id,
            firstName: psy.person?.firstName || 'Unknown',
            lastName: psy.person?.lastName || 'Psychologist',
            specialization: psy.specialization,
            city: psy.person?.city || 'Online',
            gender: psy.person?.gender || 'N/A',
            documentType: psy.person?.documentType || '',
            documentNumber: psy.person?.documentNumber || '',
            experience: psy.experienceYears || 5,
            price: psy.sessionRate || 100000,
            rating: (4.5).toFixed(1),
            reviews: 42,
            available: true,
            tags: this.extractTags(psy),
            profilePicture: psy.profilePicturePath,
            isVerified: psy.isVerified || false,
            services: psy.therapies?.filter((t: any) => t.therapy).map((t: any) => t.therapy.name) || [],
            specialties: psy.specialties?.filter((s: any) => s.specialty).map((s: any) => s.specialty.name) || [],
        }));
    },

    extractTags(psy: any): string[] {
        const tags: string[] = [];

        // Add city or Online status
        const city = psy.person?.city;
        if (city && city !== 'Sin ciudad' && city !== 'Online') {
            tags.push(city);
        } else {
            tags.push('Online');
        }

        // Add specialization only if it's not "Pendiente"
        if (psy.specialization && psy.specialization !== 'Pendiente') {
            tags.push(psy.specialization);
        }

        // Add specialties from the list if they exist
        if (psy.specialties && Array.isArray(psy.specialties)) {
            const dbSpecialties = psy.specialties
                .filter((s: any) => s.specialty)
                .map((s: any) => s.specialty.name);

            dbSpecialties.forEach((s: string) => {
                if (!tags.includes(s)) tags.push(s);
            });
        }

        return tags;
    },

    async getProductivityReport(id: number, startDate?: string, endDate?: string) {
        let url = `/psychologist/${id}/productivity-report`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        return fetchClient(url);
    },

    mapProfileToUI(psy: any): PsychologistProfileUI {
        return {
            ...this.mapToUI([psy])[0],
            bio: psy.bio || '',
            university: psy.university || '',
            hobbies: psy.hobbies || '',
            email: psy.person?.user?.email || psy.person?.email || '',
            phone: psy.person?.phoneNumber || '',
            state: psy.person?.state || '',
            licenseNumber: psy.licenseNumber || '',
            paymentAccount: psy.paymentAccount || ''
        };
    },

    async updateProfile(id: number, profileData: any) {
        return fetchClient(`/psychologist/${id}/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    async updateProfilePicture(id: number, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return fetchClient(`/psychologist/${id}/upload-profile-picture`, {
            method: 'POST',
            body: formData
        });
    },

    async getPsychologistById(id: number): Promise<PsychologistProfileUI | null> {
        const psy = await fetchClient(`/psychologist/${id}`);
        if (!psy) return null;
        return this.mapProfileToUI(psy);
    },

    async getPsychologistByUserId(userId: string): Promise<PsychologistProfileUI | null> {
        const psy = await fetchClient(`/psychologist/by-user/${userId}`);
        if (!psy) return null;
        return this.mapProfileToUI(psy);
    },

    async getAvailability(id: number, date?: string) {
        return fetchClient(`/psychologist/${id}/availability${date ? `?date=${date}` : ''}`);
    },

    async search(filters: any) {
        return fetchClient('/psychologist/search', {
            method: 'POST',
            body: JSON.stringify(filters)
        });
    },

    async getAvailableTherapies(query?: string, limit?: number) {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (limit) params.append('limit', limit.toString());
        const queryString = params.toString();
        return fetchClient(`/psychologist/available-therapies${queryString ? `?${queryString}` : ''}`);
    },

    async getServices(id: number) {
        return fetchClient(`/psychologist/${id}/services`);
    },

    async updateService(id: number, serviceData: { therapyId: number, rate: number, isActive: boolean }) {
        return fetchClient(`/psychologist/${id}/services`, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        });
    },

    async getSchedule(id: number) {
        return fetchClient(`/psychologist/${id}/schedule`);
    },

    async updateSchedule(id: number, schedules: { dayOfWeek: number, startTime: string, endTime: string }[]) {
        return fetchClient(`/psychologist/${id}/schedule`, {
            method: 'PUT',
            body: JSON.stringify(schedules)
        });
    },

    async getAvailableSpecialties(query?: string, limit?: number) {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (limit) params.append('limit', limit.toString());
        const queryString = params.toString();
        return fetchClient(`/psychologist/available-specialties${queryString ? `?${queryString}` : ''}`);
    },

    async getPsychologistSpecialties(id: number) {
        return fetchClient(`/psychologist/${id}/specialties`);
    },

    async updatePsychologistSpecialty(id: number, specialtyData: { specialtyId: number, isActive: boolean }) {
        return fetchClient(`/psychologist/${id}/specialties`, {
            method: 'PUT',
            body: JSON.stringify(specialtyData)
        });
    },

    async getPatients(id: number): Promise<PatientListItemUI[]> {
        const data = await fetchClient(`/psychologist/${id}/patients`);
        return data || [];
    }
};

