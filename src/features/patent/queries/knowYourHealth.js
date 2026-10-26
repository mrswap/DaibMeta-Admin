// src/features/patent/queries/knowYourHealth.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

export const kydKeys = {
    all: (category) => ["know-your-health", category],
    lists: (category) => [...kydKeys.all(category), "list"],
    list: (category, filters) => [...kydKeys.lists(category), filters],
    details: (category) => [...kydKeys.all(category), "detail"],
    detail: (category, id) => [...kydKeys.details(category), id],
};

const getErrorMessage = (err, fallback = "Something went wrong") => {
    const data = err.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first)) return first[0];
    }
    return data?.message || fallback;
};

export const useKnowYourHealthList = (category, params = {}) => {
    return useQuery({
        queryKey: kydKeys.list(category, params),
        queryFn: () =>
            api.get(`/admin/know-your-health/${category}`, { params }).then((r) => {
                const body = r.data;
                return {
                    list: Array.isArray(body.data) ? body.data : body.data?.data || [],
                    meta: body.meta || body.data?.meta || {},
                };
            }),
        enabled: !!category,
        keepPreviousData: true,
    });
};

export const useKnowYourHealthSingle = (category, id) => {
    return useQuery({
        queryKey: kydKeys.detail(category, id),
        queryFn: () => api.get(`/admin/know-your-health/${category}/${id}`).then((r) => r.data.data),
        enabled: !!category && !!id,
    });
};

export const useCreateKnowYourHealth = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ category, formData }) =>
            api.post(`/admin/know-your-health/${category}`, formData).then((r) => r.data),
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: kydKeys.lists(variables.category) });
            toast.success(res?.message || "Created successfully");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to create")),
    });
};

export const useUpdateKnowYourHealth = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ category, id, formData }) =>
            api.post(`/admin/know-your-health/${category}/${id}`, formData).then((r) => r.data),
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: kydKeys.lists(variables.category) });
            qc.invalidateQueries({ queryKey: kydKeys.detail(variables.category, variables.id) });
            toast.success(res?.message || "Updated successfully");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update")),
    });
};

export const useDeleteKnowYourHealth = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ category, id }) =>
            api.delete(`/admin/know-your-health/${category}/${id}`).then((r) => r.data),
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: kydKeys.lists(variables.category) });
            toast.success(res?.message || "Deleted successfully");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to delete")),
    });
};