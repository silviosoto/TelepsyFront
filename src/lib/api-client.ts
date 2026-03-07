import { API_CONFIG } from "@/config";

const API_URL = API_CONFIG.BASE_URL;

interface RequestOptions extends RequestInit {
    token?: string;
}

export async function fetchClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T | null> {
    const headers = new Headers(options.headers);
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    if (options.token) {
        headers.set('Authorization', `Bearer ${options.token}`);
    } else {
        // Try to get token from localStorage if client-side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `Error ${response.status}: ${response.statusText}`);
        }

        // Check if response has content before parsing
        const contentType = response.headers.get("content-type");
        if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
            return null;
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        throw error;
    }
}
