// src/features/patent/queries/banners.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

export const bannerKeys = {
    all: ["banners"],
    lists: () => [...bannerKeys.all, "list"],
    list: (filters) => [...bannerKeys.lists(), filters],
};

const getErrorMessage = (err, fallback = "Something went wrong") => {
    const data = err.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first)) return first[0];
    }
    return data?.message || fallback;
};

export const useBanners = (params = {}) => {
    return useQuery({
        queryKey: bannerKeys.list(params),
        queryFn: () =>
            api.get("/admin/banners", { params }).then((r) => {
                const body = r.data;
                return {
                    list: body.data || [],
                    meta: body.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

export const useCreateBanner = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/banners", formData).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Banner created");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to create banner")),
    });
};

export const useUpdateBanner = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            api.post(`/admin/banners/${id}?_method=PUT`, formData).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Banner updated");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update banner")),
    });
};

export const useToggleBannerStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/banners/${id}/toggle-status`).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Status updated");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update status")),
    });
};

export const useDeleteBanner = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/banners/${id}`).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Banner deleted");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to delete banner")),
    });
};