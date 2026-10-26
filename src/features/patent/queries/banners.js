// src/features/patent/queries/banners.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

export const bannerKeys = {
    all: ["banners"],
    lists: () => [...bannerKeys.all, "list"],
};

const getErrorMessage = (err, fallback = "Something went wrong") => {
    const data = err.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first)) return first[0];
    }
    return data?.message || fallback;
};

// GET /admin/settings?group=homepage
export const useBanners = () => {
    return useQuery({
        queryKey: bannerKeys.lists(),
        queryFn: () =>
            api.get("/admin/settings", { params: { group: "homepage" } }).then((r) => {
                const list = r.data.data || [];
                // Sirf homepage banners filter karo aur sort karo key ke hisaab se
                return list
                    .filter((item) => item.key.startsWith("banner_"))
                    .sort((a, b) => a.key.localeCompare(b.key));
            }),
    });
};

// POST /admin/settings
export const useCreateBanner = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/settings", payload).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Banner created");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to create banner")),
    });
};

// PUT /admin/settings/{id}
export const useUpdateBanner = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/settings/${id}`, payload).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Banner updated");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update banner")),
    });
};

// POST /admin/settings/{id}/toggle-status
export const useToggleBannerStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/settings/${id}/toggle-status`).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Status updated");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update status")),
    });
};

// DELETE /admin/settings/{id}
export const useDeleteBanner = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/settings/${id}`).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: bannerKeys.all });
            toast.success(res?.message || "Banner deleted");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to delete banner")),
    });
};