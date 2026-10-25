// src/features/patent/queries/healthTips.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const healthTipKeys = {
    all: ["health-tips"],
    lists: () => [...healthTipKeys.all, "list"],
    list: (filters) => [...healthTipKeys.lists(), filters],
    details: () => [...healthTipKeys.all, "detail"],
    detail: (id) => [...healthTipKeys.details(), id],
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

// ==================== LIST ====================
export const useHealthTips = (params = {}) => {
    return useQuery({
        queryKey: healthTipKeys.list(params),
        queryFn: () =>
            api.get("/admin/health-tips", { params }).then((r) => {
                const body = r.data;
                const list = Array.isArray(body.data) ? body.data : body.data?.data || [];
                return {
                    list,
                    meta: body.meta || body.data?.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

// ==================== SINGLE ====================
export const useHealthTip = (id) => {
    return useQuery({
        queryKey: healthTipKeys.detail(id),
        queryFn: () => api.get(`/admin/health-tips/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CREATE ====================
export const useCreateHealthTip = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/health-tips", formData).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: healthTipKeys.all });
            toast.success("Health tip created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create health tip"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateHealthTip = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            // Laravel multipart method spoofing (RULE #28)
            api.post(`/admin/health-tips/${id}?_method=PUT`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: healthTipKeys.all });
            qc.invalidateQueries({ queryKey: healthTipKeys.detail(variables.id) });
            toast.success("Health tip updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update health tip"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleHealthTipStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, is_active }) =>
            api.post(`/admin/health-tips/${id}/toggle-status`, { is_active }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: healthTipKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update status"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteHealthTip = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/health-tips/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: healthTipKeys.all });
            toast.success("Health tip deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete health tip"));
        },
    });
};