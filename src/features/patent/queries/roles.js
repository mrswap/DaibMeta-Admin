// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../../../lib/axios';
// import { useToast } from '../common/toast/ToastContext';

// // ==================== QUERY KEYS ====================
// export const roleKeys = {
//     all: ['roles'],
//     lists: () => [...roleKeys.all, 'list'],
//     list: (filters) => [...roleKeys.lists(), filters],
//     details: () => [...roleKeys.all, 'detail'],
//     detail: (id) => [...roleKeys.details(), id],
// };

// // ==================== LIST ====================
// export const useRoles = (params = {}) => {
//     return useQuery({
//         queryKey: roleKeys.list(params),
//         queryFn: () =>
//             api.get('/admin/roles', { params }).then((r) => {
//                 const body = r.data.data || {};
//                 if (body.data && Array.isArray(body.data)) {
//                     return { list: body.data, meta: body.meta || {} };
//                 }
//                 if (Array.isArray(body)) {
//                     return {
//                         list: body,
//                         meta: {
//                             total: body.length,
//                             current_page: 1,
//                             last_page: 1,
//                             per_page: body.length,
//                         },
//                     };
//                 }
//                 return { list: [], meta: {} };
//             }),
//         keepPreviousData: true,
//     });
// };

// // ==================== SINGLE ====================
// export const useRole = (id) => {
//     return useQuery({
//         queryKey: roleKeys.detail(id),
//         queryFn: () => api.get(`/admin/roles/${id}`).then((r) => r.data.data),
//         enabled: !!id,
//     });
// };

// // ==================== HELPERS ====================
// const getErrorMessage = (err, fallback = "Something went wrong") => {
//     const data = err.response?.data;
//     if (data?.errors) {
//         const first = Object.values(data.errors)[0];
//         if (Array.isArray(first)) return first[0];
//     }
//     return data?.message || fallback;
// };

// // ==================== CREATE ====================
// export const useCreateRole = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: (payload) =>
//             api.post('/admin/roles', payload).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: roleKeys.all });
//             toast.success("Role created successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to create role"));
//         },
//     });
// };

// // ==================== UPDATE ====================
// export const useUpdateRole = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: ({ id, payload }) =>
//             api.put(`/admin/roles/${id}`, payload).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: roleKeys.all });
//             toast.success("Role updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to update role"));
//         },
//     });
// };

// // ==================== DELETE ====================
// export const useDeleteRole = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: (id) => api.delete(`/admin/roles/${id}`).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: roleKeys.all });
//             toast.success("Role deleted successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to delete role"));
//         },
//     });
// };

// // ==================== TOGGLE STATUS ====================
// export const useToggleRoleStatus = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: (id) =>
//             api.post(`/admin/roles/${id}/toggle-status`).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: roleKeys.all });
//             toast.success("Status updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to toggle status"));
//         },
//     });
// };



// src/features/patent/queries/roles.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const roleKeys = {
    all: ["roles"],
    lists: () => [...roleKeys.all, "list"],
    list: (filters) => [...roleKeys.lists(), filters],
    details: () => [...roleKeys.all, "detail"],
    detail: (id) => [...roleKeys.details(), id],
    permissionsCatalogue: () => [...roleKeys.all, "permissions-catalogue"],
    rolePermissions: (id) => [...roleKeys.all, "role-permissions", id],
};

// ==================== LIST ====================
export const useRoles = (params = {}) => {
    return useQuery({
        queryKey: roleKeys.list(params),
        queryFn: () =>
            api.get("/admin/roles", { params }).then((r) => {
                const body = r.data.data || {};
                if (body.data && Array.isArray(body.data)) {
                    return { list: body.data, meta: body.meta || {} };
                }
                if (Array.isArray(body)) {
                    return {
                        list: body,
                        meta: {
                            total: body.length,
                            current_page: 1,
                            last_page: 1,
                            per_page: body.length,
                        },
                    };
                }
                return { list: [], meta: {} };
            }),
        keepPreviousData: true,
    });
};

// ==================== SINGLE ====================
export const useRole = (id) => {
    return useQuery({
        queryKey: roleKeys.detail(id),
        queryFn: () => api.get(`/admin/roles/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== HELPERS ====================
const getErrorMessage = (err, fallback = "Something went wrong") => {
    const data = err.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first)) return first[0];
    }
    return data?.message || fallback;
};

// ==================== CREATE ====================
export const useCreateRole = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/roles", payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.all });
            toast.success("Role created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create role"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateRole = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/roles/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.all });
            toast.success("Role updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update role"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteRole = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) => api.delete(`/admin/roles/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.all });
            toast.success("Role deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete role"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleRoleStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/roles/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};

// ==================== PERMISSIONS CATALOGUE ====================
// API 01 — All available permissions (for the role permission assignment screen)
export const useAvailablePermissions = () => {
    return useQuery({
        queryKey: roleKeys.permissionsCatalogue(),
        queryFn: () =>
            api.get("/admin/roles/permissions").then((r) => {
                const root = r.data ?? {};
                const body = root.data ?? root;

                // Backend may return a flat array OR an object grouped by module.
                if (Array.isArray(body)) {
                    return { list: body, grouped: groupByModule(body) };
                }
                if (body.permissions && Array.isArray(body.permissions)) {
                    return {
                        list: body.permissions,
                        grouped: groupByModule(body.permissions),
                    };
                }

                // Fallback: if body is an object of { module: [ ... ] }
                const flattened = [];
                if (body && typeof body === "object") {
                    Object.entries(body).forEach(([moduleKey, arr]) => {
                        if (Array.isArray(arr)) {
                            arr.forEach((p) => {
                                flattened.push({
                                    ...p,
                                    module: p.module || moduleKey,
                                });
                            });
                        }
                    });
                }
                return { list: flattened, grouped: groupByModule(flattened) };
            }),
        staleTime: 5 * 60 * 1000, // catalogue does not change often
    });
};

// Utility: group a flat list of permissions by their `module` field
const groupByModule = (list = []) => {
    const map = {};
    list.forEach((p) => {
        const module = p.module || "other";
        if (!map[module]) map[module] = [];
        map[module].push(p);
    });
    return map;
};

// ==================== ROLE PERMISSIONS (ASSIGNED) ====================
// API 04 — Permissions currently assigned to a role
export const useRolePermissions = (roleId) => {
    return useQuery({
        queryKey: roleKeys.rolePermissions(roleId),
        queryFn: () =>
            api.get(`/admin/roles/${roleId}/permissions`).then((r) => {
                const body = r.data?.data ?? r.data ?? {};
                const permissions = Array.isArray(body.permissions)
                    ? body.permissions
                    : [];
                const permissionIds = Array.isArray(body.permission_ids)
                    ? body.permission_ids
                    : permissions.map((p) => p.id);
                return {
                    permissions,
                    permissionIds,
                    roleId: body.role_id ?? roleId,
                    roleName: body.role_name ?? "",
                };
            }),
        enabled: !!roleId,
    });
};

// ==================== UPDATE ROLE PERMISSIONS ====================
// API 05 — Full sync of the role's permission set
export const useUpdateRolePermissions = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ roleId, permissionIds }) =>
            api
                .put(`/admin/roles/${roleId}/permissions`, {
                    permission_ids: permissionIds,
                })
                .then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({
                queryKey: roleKeys.rolePermissions(variables.roleId),
            });
            toast.success("Permissions updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update permissions"));
        },
    });
};