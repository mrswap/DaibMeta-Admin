import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // FormData ke liye Content-Type remove karo
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (config.data && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);