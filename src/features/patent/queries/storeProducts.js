// src/features/patent/queries/storeProducts.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const storeProductKeys = {
    all: ["storeProducts"],
    lists: () => [...storeProductKeys.all, "list"],
    list: (params) => [...storeProductKeys.lists(), params],
    details: () => [...storeProductKeys.all, "detail"],
    detail: (id) => [...storeProductKeys.details(), id],
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
export const useStoreProducts = (params = {}) => {
    return useQuery({
        queryKey: storeProductKeys.list(params),
        queryFn: () =>
            api.get("/admin/store/products", { params }).then((r) => {
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
export const useStoreProduct = (id) => {
    return useQuery({
        queryKey: storeProductKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/store/products/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CREATE ====================
export const useCreateStoreProduct = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/store/products", formData).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeProductKeys.all });
            toast.success("Product created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create product"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateStoreProduct = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            api.post(`/admin/store/products/${id}`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: storeProductKeys.all });
            qc.invalidateQueries({ queryKey: storeProductKeys.detail(variables.id) });
            toast.success("Product updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update product"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteStoreProduct = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/store/products/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeProductKeys.all });
            toast.success("Product deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete product"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleStoreProductStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/store/products/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeProductKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};