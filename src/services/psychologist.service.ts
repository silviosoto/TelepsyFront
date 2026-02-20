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
}

// Extended interface for the profile view
export interface PsychologistProfileUI extends PsychologistUI {
    bio: string;
    university: string;
    hobbies: string;
    email: string; // From user/person
    phone: string; // From person
}

export const psychologistService = {
    async getVerifiedPsychologists(): Promise<PsychologistUI[]> {
        const data = await fetchClient('/psychologist/verified');

        if (!data) return [];

        // Transform API data to UI model
        return data.map((psy: any) => ({
            id: psy.id,
            firstName: psy.person?.firstName || 'Unknown',
            lastName: psy.person?.lastName || 'Psychologist',
            specialization: psy.specialization,
            city: psy.person?.city || 'Online',
            gender: psy.person?.gender || 'N/A',
            // Generating mock data for UI demo purposes if not available in API yet
            experience: psy.experienceYears || Math.floor(Math.random() * 15) + 3,
            price: psy.sessionRate || 80000 + Math.floor(Math.random() * 5) * 10000,
            rating: (4 + Math.random()).toFixed(1),
            reviews: Math.floor(Math.random() * 100) + 10,
            available: Math.random() > 0.3,
            tags: [psy.specialization, psy.person?.city || 'Online', 'TCC']
        }));
    },

    async updateProfile(id: number, profileData: any) {
        return fetchClient(`/psychologist/${id}/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    async getPsychologistById(id: number): Promise<PsychologistProfileUI | null> {
        const psy = await fetchClient(`/psychologist/${id}`);

        if (!psy) return null;

        return {
            id: psy.id,
            firstName: psy.person?.firstName || 'Unknown',
            lastName: psy.person?.lastName || 'Psychologist',
            specialization: psy.specialization,
            city: psy.person?.city || 'Online',
            gender: psy.person?.gender || 'N/A',
            experience: psy.experienceYears || 5,
            price: psy.sessionRate || 100000,
            rating: (4.5).toFixed(1), // Mock for now
            reviews: 42, // Mock for now
            available: true, // Mock for now
            tags: [psy.specialization, psy.person?.city || 'Online', 'TCC'],
            // Profile specific fields
            bio: psy.bio || 'Especialista comprometido con el bienestar emocional de sus pacientes.',
            university: psy.university || 'Universidad Nacional',
            hobbies: psy.hobbies || 'Lectura, Investigación',
            email: psy.person?.email || 'contacto@telepsy.com', // Note: Email might be on User not Person, check backend if critical
            phone: psy.person?.phoneNumber || 'Confidencial'
        };
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

    async getAvailableTherapies() {
        return fetchClient('/psychologist/available-therapies');
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
    }
};

