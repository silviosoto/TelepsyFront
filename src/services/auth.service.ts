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
    },

    getRole() {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    return user.role;
                } catch (e) {
                    console.error("Error parsing user from localStorage", e);
                }
            }
        }
        return null;
    },

    async forgotPassword(email: string) {
        return fetchClient('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    async resetPassword(data: any) {
        return fetchClient('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};
