import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToast } from '../common/toast/ToastContext';

// ==================== QUERY KEYS ====================
export const patientKeys = {
    all: ['patients'],
    lists: () => [...patientKeys.all, 'list'],
    list: (filters) => [...patientKeys.lists(), filters],
    details: () => [...patientKeys.all, 'detail'],
    detail: (id) => [...patientKeys.details(), id],
    family: (id) => [...patientKeys.all, 'family', id],
};

// ==================== LIST ====================
export const usePatients = (params = {}) => {
    return useQuery({
        queryKey: patientKeys.list(params),
        queryFn: () =>
            api.get('/admin/patients', { params }).then((r) => {
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
export const usePatient = (id) => {
    return useQuery({
        queryKey: patientKeys.detail(id),
        queryFn: () => api.get(`/admin/patients/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== FAMILY MEMBERS ====================
export const useFamilyMembers = (id) => {
    return useQuery({
        queryKey: patientKeys.family(id),
        queryFn: () =>
            api
                .get(`/admin/patients/${id}/family-members`)
                .then((r) => {
                    const body = r.data.data || r.data;
                    return Array.isArray(body) ? body : body?.data || [];
                }),
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
export const useCreatePatient = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post('/admin/patients', payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.all });
            toast.success("Patient created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create patient"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdatePatient = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/patients/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.all });
            toast.success("Patient updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update patient"));
        },
    });
};

// ==================== DELETE ====================
export const useDeletePatient = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/patients/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.all });
            toast.success("Patient deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete patient"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useTogglePatientStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/patients/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};