// src/features/patent/queries/storeSubcategories.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const storeSubcategoryKeys = {
    all: ["storeSubcategories"],
    lists: () => [...storeSubcategoryKeys.all, "list"],
    list: (params) => [...storeSubcategoryKeys.lists(), params],
    details: () => [...storeSubcategoryKeys.all, "detail"],
    detail: (id) => [...storeSubcategoryKeys.details(), id],
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
export const useStoreSubcategories = (params = {}) => {
    return useQuery({
        queryKey: storeSubcategoryKeys.list(params),
        queryFn: () =>
            api.get("/admin/store/subcategories", { params }).then((r) => {
                const body = r.data.data || {};
                if (body.data && Array.isArray(body.data)) {
                    return { list: body.data, meta: body.meta || r.data.meta || {} };
                }
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
export const useStoreSubcategory = (id) => {
    return useQuery({
        queryKey: storeSubcategoryKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/store/subcategories/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CREATE ====================
export const useCreateStoreSubcategory = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/store/subcategories", formData).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeSubcategoryKeys.all });
            toast.success("Subcategory created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create subcategory"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateStoreSubcategory = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            api.post(`/admin/store/subcategories/${id}`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: storeSubcategoryKeys.all });
            qc.invalidateQueries({ queryKey: storeSubcategoryKeys.detail(variables.id) });
            toast.success("Subcategory updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update subcategory"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteStoreSubcategory = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/store/subcategories/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeSubcategoryKeys.all });
            toast.success("Subcategory deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete subcategory"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleStoreSubcategoryStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/store/subcategories/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeSubcategoryKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};