import { fetchClient } from "@/lib/api-client";

export interface PsychologyNote {
    id: number;
    patientId: number;
    psychologistId: number;
    appointmentId?: number;
    date: string;
    sessionNumber: number;
    reasonForSession: string;
    evolution: string;
    interventions: string;
    therapeuticPlan: string;
    nextAppointmentDate?: string;
    professionalSignature: string;
}

export const getPsychologyNotes = async (
    patientId: string | number,
    token: string
): Promise<PsychologyNote[]> => {
    return fetchClient<PsychologyNote[]>(`/PsychologyNotes/${patientId}`, {
        method: "GET",
        token,
    }).then(res => res || []);
};

export const createPsychologyNote = async (
    noteData: Partial<PsychologyNote>,
    token: string
): Promise<{ message: string; noteId: number }> => {
    const response = await fetchClient<{ message: string; noteId: number }>(`/PsychologyNotes`, {
        method: "POST",
        body: JSON.stringify(noteData),
        token,
    });
    if (!response) throw new Error("No response from server");
    return response;
};

export const updatePsychologyNote = async (
    noteId: number,
    noteData: Partial<PsychologyNote>,
    token: string
): Promise<{ message: string }> => {
    const response = await fetchClient<{ message: string }>(`/PsychologyNotes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify(noteData),
        token,
    });
    if (!response) throw new Error("No response from server");
    return response;
};
