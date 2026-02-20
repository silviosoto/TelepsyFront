import { fetchClient } from "@/lib/api-client";

export const authService = {
    async login(credentials: any) {
        return fetchClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async register(userData: any) {
        return fetchClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async logout() {
        localStorage.removeItem('token');
        // Add any server-side cleanup if necessary
    },

    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};
