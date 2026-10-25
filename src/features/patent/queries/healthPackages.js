// src/features/patent/queries/healthPackages.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const packageKeys = {
    all: ["health-packages"],
    lists: () => [...packageKeys.all, "list"],
    list: (filters) => [...packageKeys.lists(), filters],
    details: () => [...packageKeys.all, "detail"],
    detail: (id) => [...packageKeys.details(), id],
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

// ==================== PACKAGES ====================

export const useHealthPackages = (params = {}) => {
    return useQuery({
        queryKey: packageKeys.list(params),
        queryFn: () =>
            api.get("/admin/health-service-packages", { params }).then((r) => {
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

export const useHealthPackage = (id) => {
    return useQuery({
        queryKey: packageKeys.detail(id),
        queryFn: () => api.get(`/admin/health-service-packages/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

export const useCreateHealthPackage = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/health-service-packages", formData).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: packageKeys.all });
            toast.success("Package created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create package"));
        },
    });
};

export const useUpdateHealthPackage = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            // Laravel multipart method spoofing
            api.post(`/admin/health-service-packages/${id}?_method=PUT`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: packageKeys.all });
            qc.invalidateQueries({ queryKey: packageKeys.detail(variables.id) });
            toast.success("Package updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update package"));
        },
    });
};

export const useToggleHealthPackageStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, is_active }) =>
            api.post(`/admin/health-service-packages/${id}/toggle-status`, { is_active }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: packageKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update status"));
        },
    });
};

export const useDeleteHealthPackage = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/health-service-packages/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: packageKeys.all });
            toast.success("Package deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete package"));
        },
    });
};

// ==================== AVAILABLE SERVICES (For Checkboxes) ====================

export const useAllServicesForPackage = () => {
    return useQuery({
        queryKey: ["services", "for-package"],
        queryFn: () =>
            api.get("/admin/services", { params: { per_page: 100 } }).then((r) => {
                // Backend response can be nested
                const body = r.data;
                const list = Array.isArray(body.data) ? body.data : body.data?.data || [];
                return list;
            }),
    });
};