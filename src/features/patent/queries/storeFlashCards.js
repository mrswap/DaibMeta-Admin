// src/features/patent/queries/storeFlashCards.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const storeFlashCardKeys = {
    all: ["storeFlashCards"],
    lists: () => [...storeFlashCardKeys.all, "list"],
    list: (params) => [...storeFlashCardKeys.lists(), params],
    details: () => [...storeFlashCardKeys.all, "detail"],
    detail: (id) => [...storeFlashCardKeys.details(), id],
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
export const useStoreFlashCards = (params = {}) => {
    return useQuery({
        queryKey: storeFlashCardKeys.list(params),
        queryFn: () =>
            api.get("/admin/store/flash-cards", { params }).then((r) => {
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
export const useStoreFlashCard = (id) => {
    return useQuery({
        queryKey: storeFlashCardKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/store/flash-cards/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CREATE ====================
export const useCreateStoreFlashCard = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/store/flash-cards", formData).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeFlashCardKeys.all });
            toast.success("Flash card created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create flash card"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateStoreFlashCard = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            // POST method with _method=PUT for Laravel multipart compatibility
            api.post(`/admin/store/flash-cards/${id}`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: storeFlashCardKeys.all });
            qc.invalidateQueries({ queryKey: storeFlashCardKeys.detail(variables.id) });
            toast.success("Flash card updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update flash card"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteStoreFlashCard = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/store/flash-cards/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeFlashCardKeys.all });
            toast.success("Flash card deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete flash card"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleStoreFlashCardStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/store/flash-cards/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeFlashCardKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};