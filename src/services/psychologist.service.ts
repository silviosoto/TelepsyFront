import { fetchClient } from "@/lib/api-client";

// Define the interface for the UI model
export interface PsychologistUI {
    id: number;
    firstName: string;
    lastName: string;
    specialization: string;
    city: string;
    gender: string;
    experience: number;
    price: number;
    rating: string;
    reviews: number;
    available: boolean;
    tags: string[];
    profilePicture?: string;
}

// Extended interface for the profile view
export interface PsychologistProfileUI extends PsychologistUI {
    bio: string;
    university: string;
    hobbies: string;
    email: string; // From user/person
    phone: string; // From person
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
            experience: psy.experienceYears || 5,
            price: psy.sessionRate || 100000,
            rating: (4.5).toFixed(1),
            reviews: 42,
            available: true,
            tags: this.extractTags(psy),
            profilePicture: psy.profilePicturePath,
        }));
    },

    extractTags(psy: any): string[] {
        let extractedTags = [psy.specialization, psy.person?.city || 'Online'];
        if (psy.specialties && Array.isArray(psy.specialties)) {
            const dbSpecialties = psy.specialties
                .filter((s: any) => s.specialty)
                .map((s: any) => s.specialty.name);
            if (dbSpecialties.length > 0) {
                extractedTags = dbSpecialties;
            }
        } else {
            extractedTags.push('TCC');
        }
        return extractedTags;
    },

    mapProfileToUI(psy: any): PsychologistProfileUI {
        return {
            ...this.mapToUI([psy])[0],
            bio: psy.bio || 'Especialista comprometido con el bienestar emocional de sus pacientes.',
            university: psy.university || 'Universidad Nacional',
            hobbies: psy.hobbies || 'Lectura, Investigación',
            email: psy.person?.email || 'contacto@telepsy.com',
            phone: psy.person?.phoneNumber || 'Confidencial'
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

