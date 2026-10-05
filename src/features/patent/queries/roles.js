import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToast } from '../common/toast/ToastContext';

// ==================== QUERY KEYS ====================
export const roleKeys = {
    all: ['roles'],
    lists: () => [...roleKeys.all, 'list'],
    list: (filters) => [...roleKeys.lists(), filters],
    details: () => [...roleKeys.all, 'detail'],
    detail: (id) => [...roleKeys.details(), id],
};

// ==================== LIST ====================
export const useRoles = (params = {}) => {
    return useQuery({
        queryKey: roleKeys.list(params),
        queryFn: () =>
            api.get('/admin/roles', { params }).then((r) => {
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
            api.post('/admin/roles', payload).then((r) => r.data),
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