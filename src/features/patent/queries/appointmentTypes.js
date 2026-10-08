// src/features/patent/queries/appointmentTypes.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToast } from '../common/toast/ToastContext';

// ==================== QUERY KEYS ====================
export const appointmentTypeKeys = {
    all: ['appointmentTypes'],
    lists: () => [...appointmentTypeKeys.all, 'list'],
    list: (filters) => [...appointmentTypeKeys.lists(), filters],
    details: () => [...appointmentTypeKeys.all, 'detail'],
    detail: (id) => [...appointmentTypeKeys.details(), id],
    active: () => [...appointmentTypeKeys.all, 'active'],
    providers: (roleId, ignoreId) => [
        ...appointmentTypeKeys.all,
        'providers',
        roleId,
        ignoreId,
    ],
};

// ==================== LIST ====================
export const useAppointmentTypes = (params = {}) => {
    return useQuery({
        queryKey: appointmentTypeKeys.list(params),
        queryFn: () =>
            api.get('/admin/appointment-types', { params }).then((r) => {
                const body = r.data;
                // Backend: { success, message, data: [...], meta: {...} }
                // Yahan data direct array hai, meta alag
                return {
                    list: Array.isArray(body.data) ? body.data : [],
                    meta: body.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

// ==================== SINGLE ====================
export const useAppointmentType = (id) => {
    return useQuery({
        queryKey: appointmentTypeKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/appointment-types/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== ACTIVE ====================
export const useActiveAppointmentTypes = (params = {}) => {
    return useQuery({
        queryKey: [...appointmentTypeKeys.active(), params],
        queryFn: () =>
            api
                .get('/admin/appointment-types/active', { params })
                .then((r) => {
                    const body = r.data.data || r.data;
                    return Array.isArray(body) ? body : body?.data || [];
                }),
        staleTime: 1000 * 60 * 10,
    });
};

// ==================== PROVIDERS (for Appointment Type dropdown) ====================
// GET /appointment-types/providers?role_id=2&ignore_id=1
//
// Response:
//   [{ id, name, role: { id, name, label }, status, disabled, disabled_reason }]
//
// - `role_id`  → only providers with this role
// - `ignore_id` (optional) → Appointment Type ID to exclude from duplicate check
//                             (used while editing to keep current provider selectable)
export const useAppointmentTypeProviders = (roleId, ignoreId = null) => {
    const params = {};
    if (roleId) params.role_id = roleId;
    if (ignoreId) params.ignore_id = ignoreId;

    return useQuery({
        queryKey: appointmentTypeKeys.providers(roleId, ignoreId),
        queryFn: () =>
            api
                .get('/admin/appointment-types/providers', { params })
                .then((r) => {
                    const body = r.data.data || r.data;
                    return Array.isArray(body) ? body : body?.data || [];
                }),
        enabled: !!roleId,
        staleTime: 1000 * 60 * 5,
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
export const useCreateAppointmentType = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (payload) =>
            api.post('/admin/appointment-types', payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentTypeKeys.all });
            toast.success("Appointment type created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create appointment type"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateAppointmentType = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/appointment-types/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentTypeKeys.all });
            toast.success("Appointment type updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update appointment type"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteAppointmentType = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/appointment-types/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentTypeKeys.all });
            toast.success("Appointment type deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete appointment type"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleAppointmentTypeStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id) =>
            api
                .post(`/admin/appointment-types/${id}/toggle-status`)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentTypeKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};