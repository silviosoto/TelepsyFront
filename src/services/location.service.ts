import { fetchClient } from "@/lib/api-client";

export interface DepartmentUI {
    id: number;
    name: string;
}

export interface CityUI {
    id: number;
    name: string;
    departmentId: number;
}

export const locationService = {
    async getDepartments(): Promise<DepartmentUI[]> {
        const data = await fetchClient('/location/departments');
        return data || [];
    },

    async getCities(departmentId: number): Promise<CityUI[]> {
        if (!departmentId) return [];
        const data = await fetchClient(`/location/departments/${departmentId}/cities`);
        return data || [];
    }
};
