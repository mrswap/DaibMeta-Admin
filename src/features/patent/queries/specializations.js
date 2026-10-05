import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToast } from '../common/toast/ToastContext';

// ==================== QUERY KEYS ====================
export const specializationKeys = {
    all: ['specializations'],
    lists: () => [...specializationKeys.all, 'list'],
    list: (filters) => [...specializationKeys.lists(), filters],
    details: () => [...specializationKeys.all, 'detail'],
    detail: (id) => [...specializationKeys.details(), id],
    active: () => [...specializationKeys.all, 'active'],
};

// ==================== LIST ====================
export const useSpecializations = (params = {}) => {
    return useQuery({
        queryKey: specializationKeys.list(params),
        queryFn: () =>
            api.get('/admin/specializations', { params }).then((r) => {
                const body = r.data.data || {};
                return {
                    list: body.data || [],
                    meta: body.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

// ==================== SINGLE ====================
export const useSpecialization = (id) => {
    return useQuery({
        queryKey: specializationKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/specializations/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== ACTIVE ====================
export const useActiveSpecializations = () => {
    return useQuery({
        queryKey: specializationKeys.active(),
        queryFn: () =>
            api.get('/admin/specializations/active').then((r) => {
                const body = r.data.data || r.data;
                return Array.isArray(body) ? body : body?.data || [];
            }),
        staleTime: 1000 * 60 * 10,
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
export const useCreateSpecialization = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (payload) =>
            api.post('/admin/specializations', payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: specializationKeys.all });
            toast.success("Specialization created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create specialization"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateSpecialization = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/specializations/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: specializationKeys.all });
            toast.success("Specialization updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update specialization"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteSpecialization = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/specializations/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: specializationKeys.all });
            toast.success("Specialization deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete specialization"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleSpecializationStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/specializations/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: specializationKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};