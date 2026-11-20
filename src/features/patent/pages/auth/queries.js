// import { useMutation, useQuery } from '@tanstack/react-query';
// import { api } from '../../../../lib/axios';
// import { useAuthStore } from '../../../../stores/authStore';

// // ============= LOGIN =============
// export const useLogin = () => {
//     const login = useAuthStore((s) => s.login);

//     return useMutation({
//         mutationFn: (credentials) =>
//             api.post('/admin/auth/login', credentials).then((r) => r.data),

//         onSuccess: (response) => {
//             // Backend: { success, message, data: { admin, token } }
//             const admin = response.data.admin;
//             const token = response.data.token;
//             login(admin, token);
//         },

//         onError: (error) => {
//             console.error('Login failed:', error.response?.data);
//         },
//     });
// };

// // ============= LOGOUT =============
// export const useLogout = () => {
//     const logout = useAuthStore((s) => s.logout);

//     return useMutation({
//         mutationFn: () => api.post('/admin/auth/logout').then((r) => r.data),
//         onSuccess: () => logout(),
//         onError: () => logout(), // fail ho toh bhi local state clear
//     });
// };

// // ============= CURRENT ADMIN (ME) =============
// export const useMe = () => {
//     const token = useAuthStore((s) => s.token);

//     return useQuery({
//         queryKey: ['admin', 'me'],
//         queryFn: () => api.get('/admin/auth/me').then((r) => r.data.data.admin),
//         enabled: !!token,
//         retry: false,
//     });
// };

// src/features/patent/pages/auth/queries.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../lib/axios";
import { useAuthStore } from "../../../../stores/authStore";
import { useToast } from "../../common/toast/ToastContext";

// ============= HELPER =============
const getErrorMessage = (err, fallback = "Something went wrong") => {
    const data = err.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first)) return first[0];
    }
    return data?.message || fallback;
};

// ============= LOGIN =============
export const useLogin = () => {
    const login = useAuthStore((s) => s.login);

    return useMutation({
        mutationFn: (credentials) =>
            api.post("/admin/auth/login", credentials).then((r) => r.data),

        onSuccess: (response) => {
            const admin = response.data.admin;
            const token = response.data.token;
            login(admin, token);
        },

        onError: (error) => {
            console.error("Login failed:", error.response?.data);
        },
    });
};

// ============= LOGOUT =============
export const useLogout = () => {
    const logout = useAuthStore((s) => s.logout);

    return useMutation({
        mutationFn: () => api.post("/admin/auth/logout").then((r) => r.data),
        onSuccess: () => logout(),
        onError: () => logout(),
    });
};

// ============= CURRENT ADMIN (ME) =============
export const useMe = () => {
    const token = useAuthStore((s) => s.token);
    const updateUser = useAuthStore((s) => s.updateUser);

    return useQuery({
        queryKey: ["admin", "me"],
        queryFn: async () => {
            const r = await api.get("/admin/auth/me");
            const payload = r.data?.data || {};

            const admin = payload.admin || null;
            const permissions = Array.isArray(payload.permissions)
                ? payload.permissions
                : [];

            const merged = admin
                ? {
                    ...admin,
                    permissions,
                    role_id: payload.role_id ?? admin.role_id ?? null,
                    role_name: payload.role_name ?? admin.role_name ?? null,
                }
                : null;

            if (merged) updateUser(merged);

            return merged;
        },
        enabled: !!token,
        retry: false,
    });
};

// ============= UPDATE PROFILE =============
export const useUpdateProfile = () => {
    const updateUser = useAuthStore((s) => s.updateUser);
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (payload) =>
            api.put("/admin/auth/profile", payload).then((r) => r.data),

        onSuccess: (response) => {
            const admin =
                response?.data?.admin ||
                response?.data?.data?.admin ||
                response?.data ||
                null;

            if (admin) {
                const existing = useAuthStore.getState().user || {};
                updateUser({
                    ...existing,
                    ...admin,
                    permissions: admin.permissions || existing.permissions || [],
                });
            }

            qc.invalidateQueries({ queryKey: ["admin", "me"] });

            toast.success(response?.message || "Profile updated successfully");
        },

        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update profile"));
        },
    });
};