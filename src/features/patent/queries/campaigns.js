// src/features/patent/queries/campaigns.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const campaignKeys = {
    all: ["campaigns"],
    lists: () => [...campaignKeys.all, "list"],
    list: (filters) => [...campaignKeys.lists(), filters],
    details: () => [...campaignKeys.all, "detail"],
    detail: (uuid) => [...campaignKeys.details(), uuid],
};

// ==================== LIST ====================
export const useCampaigns = (params = {}, options = {}) => {
    return useQuery({
        queryKey: campaignKeys.list(params),
        queryFn: () =>
            api.get("/admin/notifications/campaigns", { params }).then((r) => {
                const body = r.data;
                return {
                    list: Array.isArray(body.data) ? body.data : body.data?.data || [],
                    meta: body.meta || body.data?.meta || {},
                };
            }),
        keepPreviousData: true,
        ...options,
    });
};

// ==================== SINGLE ====================
export const useCampaign = (uuid) => {
    return useQuery({
        queryKey: campaignKeys.detail(uuid),
        queryFn: () =>
            api
                .get(`/admin/notifications/campaigns/${uuid}`)
                .then((r) => r.data.data), // returns paginated object: { data: [...], total, ... }
        enabled: !!uuid,
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
export const useCreateCampaign = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (payload) => {
            const isFormData = payload instanceof FormData;
            return api
                .post("/admin/notifications/campaigns", payload, {
                    headers: isFormData
                        ? { "Content-Type": "multipart/form-data" }
                        : undefined,
                })
                .then((r) => r.data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            toast.success("Campaign created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create campaign"));
        },
    });
};

// ==================== UPDATE (scheduled only) ====================
export const useUpdateCampaign = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ uuid, payload }) => {
            const isFormData = payload instanceof FormData;
            // Laravel PUT + multipart doesn't parse body → POST + _method=PUT
            if (isFormData) {
                payload.append("_method", "PUT");
                return api
                    .post(`/admin/notifications/campaigns/${uuid}`, payload, {
                        headers: { "Content-Type": "multipart/form-data" },
                    })
                    .then((r) => r.data);
            }
            return api
                .put(`/admin/notifications/campaigns/${uuid}`, payload)
                .then((r) => r.data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            toast.success("Campaign updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update campaign"));
        },
    });
};

// ==================== DELETE (scheduled only) ====================
export const useDeleteCampaign = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (uuid) =>
            api
                .delete(`/admin/notifications/campaigns/${uuid}`)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            toast.success("Campaign deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete campaign"));
        },
    });
};