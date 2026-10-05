import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/axios';
import { useAuthStore } from '../../../../stores/authStore';

// ============= LOGIN =============
export const useLogin = () => {
    const login = useAuthStore((s) => s.login);

    return useMutation({
        mutationFn: (credentials) =>
            api.post('/admin/auth/login', credentials).then((r) => r.data),

        onSuccess: (response) => {
            // Backend: { success, message, data: { admin, token } }
            const admin = response.data.admin;
            const token = response.data.token;
            login(admin, token);
        },

        onError: (error) => {
            console.error('Login failed:', error.response?.data);
        },
    });
};

// ============= LOGOUT =============
export const useLogout = () => {
    const logout = useAuthStore((s) => s.logout);

    return useMutation({
        mutationFn: () => api.post('/admin/auth/logout').then((r) => r.data),
        onSuccess: () => logout(),
        onError: () => logout(), // fail ho toh bhi local state clear
    });
};

// ============= CURRENT ADMIN (ME) =============
export const useMe = () => {
    const token = useAuthStore((s) => s.token);

    return useQuery({
        queryKey: ['admin', 'me'],
        queryFn: () => api.get('/admin/auth/me').then((r) => r.data.data.admin),
        enabled: !!token,
        retry: false,
    });
};