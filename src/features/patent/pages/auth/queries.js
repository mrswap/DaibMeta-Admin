// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { api } from "../../../../lib/axios";
// import { useAuthStore } from "../../../../stores/authStore";
// import { useToast } from "../../common/toast/ToastContext";

// // ============= HELPER =============
// const getErrorMessage = (err, fallback = "Something went wrong") => {
//     const data = err.response?.data;
//     if (data?.errors) {
//         const first = Object.values(data.errors)[0];
//         if (Array.isArray(first)) return first[0];
//     }
//     return data?.message || fallback;
// };

// // ============= LOGIN =============
// export const useLogin = () => {
//     const login = useAuthStore((s) => s.login);

//     return useMutation({
//         mutationFn: (credentials) =>
//             api.post("/admin/auth/login", credentials).then((r) => r.data),

//         onSuccess: (response) => {
//             const admin = response.data.admin;
//             const token = response.data.token;
//             login(admin, token);
//         },

//         onError: (error) => {
//             console.error("Login failed:", error.response?.data);
//         },
//     });
// };

// // ============= LOGOUT =============
// export const useLogout = () => {
//     const logout = useAuthStore((s) => s.logout);

//     return useMutation({
//         mutationFn: () => api.post("/admin/auth/logout").then((r) => r.data),
//         onSuccess: () => logout(),
//         onError: () => logout(),
//     });
// };

// // ============= CURRENT ADMIN (ME) =============
// export const useMe = () => {
//     const token = useAuthStore((s) => s.token);
//     const updateUser = useAuthStore((s) => s.updateUser);

//     return useQuery({
//         queryKey: ["admin", "me"],
//         queryFn: async () => {
//             const r = await api.get("/admin/auth/me");
//             const payload = r.data?.data || {};

//             const admin = payload.admin || null;
//             const permissions = Array.isArray(payload.permissions)
//                 ? payload.permissions
//                 : [];

//             const merged = admin
//                 ? {
//                     ...admin,
//                     permissions,
//                     role_id: payload.role_id ?? admin.role_id ?? null,
//                     role_name: payload.role_name ?? admin.role_name ?? null,
//                 }
//                 : null;

//             if (merged) updateUser(merged);

//             return merged;
//         },
//         enabled: !!token,
//         retry: false,
//     });
// };

// // ============= UPDATE PROFILE =============
// export const useUpdateProfile = () => {
//     const updateUser = useAuthStore((s) => s.updateUser);
//     const qc = useQueryClient();
//     const toast = useToast();

//     return useMutation({
//         mutationFn: (payload) =>
//             api.put("/admin/auth/profile", payload).then((r) => r.data),

//         onSuccess: (response) => {
//             const admin =
//                 response?.data?.admin ||
//                 response?.data?.data?.admin ||
//                 response?.data ||
//                 null;

//             if (admin) {
//                 const existing = useAuthStore.getState().user || {};
//                 updateUser({
//                     ...existing,
//                     ...admin,
//                     permissions: admin.permissions || existing.permissions || [],
//                 });
//             }

//             qc.invalidateQueries({ queryKey: ["admin", "me"] });

//             toast.success(response?.message || "Profile updated successfully");
//         },

//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to update profile"));
//         },
//     });
// };

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
            // ✅ Pura data pass karo taaki is_provider bhi chala jaye
            const payload = response.data;
            const token = payload.token;

            // admin object ke andar is_provider merge karke bhej rahe hain
            login(
                { ...payload.admin, is_provider: payload.is_provider },
                token
            );
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
                    // ✅ API se is_provider add karo
                    is_provider: payload.is_provider === true,
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
                    // ✅ Purana is_provider bacha ke rakho
                    is_provider: existing.is_provider === true,
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