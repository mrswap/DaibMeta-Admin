// src/features/patent/queries/storeCategories.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const storeCategoryKeys = {
    all: ["storeCategories"],
    lists: () => [...storeCategoryKeys.all, "list"],
    list: (params) => [...storeCategoryKeys.lists(), params],
    details: () => [...storeCategoryKeys.all, "detail"],
    detail: (id) => [...storeCategoryKeys.details(), id],
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
export const useStoreCategories = (params = {}) => {
    return useQuery({
        queryKey: storeCategoryKeys.list(params),
        queryFn: () =>
            api.get("/admin/store/categories", { params }).then((r) => {
                const body = r.data.data || {};
                // Handle typical Laravel paginator wrapped inside "data"
                if (body.data && Array.isArray(body.data)) {
                    return { list: body.data, meta: body.meta || r.data.meta || {} };
                }
                // Handle direct array
                if (Array.isArray(body)) {
                    return {
                        list: body,
                        meta: r.data.meta || {
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
export const useStoreCategory = (id) => {
    return useQuery({
        queryKey: storeCategoryKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/store/categories/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CREATE ====================
export const useCreateStoreCategory = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/store/categories", formData).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeCategoryKeys.all });
            toast.success("Category created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create category"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateStoreCategory = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            // Using POST for update as per doc (multipart form data)
            api.post(`/admin/store/categories/${id}`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: storeCategoryKeys.all });
            qc.invalidateQueries({ queryKey: storeCategoryKeys.detail(variables.id) });
            toast.success("Category updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update category"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteStoreCategory = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/store/categories/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeCategoryKeys.all });
            toast.success("Category deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete category"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleStoreCategoryStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/store/categories/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeCategoryKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};