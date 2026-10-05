import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToast } from '../common/toast/ToastContext';

// ==================== QUERY KEYS ====================
export const staffKeys = {
    all: ['staff'],
    lists: () => [...staffKeys.all, 'list'],
    list: (filters) => [...staffKeys.lists(), filters],
    details: () => [...staffKeys.all, 'detail'],
    detail: (id) => [...staffKeys.details(), id],
};

// ==================== LIST ====================
export const useStaff = (params = {}) => {
    return useQuery({
        queryKey: staffKeys.list(params),
        queryFn: () =>
            api.get('/admin/staff', { params }).then((r) => {
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
export const useStaffMember = (id) => {
    return useQuery({
        queryKey: staffKeys.detail(id),
        queryFn: () => api.get(`/admin/staff/${id}`).then((r) => r.data.data),
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
export const useCreateStaff = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post('/admin/staff', payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Staff member created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create staff"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateStaff = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/staff/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Staff member updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update staff"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteStaff = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) => api.delete(`/admin/staff/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Staff member deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete staff"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleStaffStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/staff/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};