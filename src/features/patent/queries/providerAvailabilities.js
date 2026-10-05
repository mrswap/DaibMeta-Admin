import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const availabilityKeys = {
    all: ["providerAvailabilities"],
    lists: () => [...availabilityKeys.all, "list"],
    list: (filters) => [...availabilityKeys.lists(), filters],
    details: () => [...availabilityKeys.all, "detail"],
    detail: (id) => [...availabilityKeys.details(), id],
    preview: () => [...availabilityKeys.all, "preview"],
};

// ==================== LIST ====================
export const useProviderAvailabilities = (params = {}) => {
    return useQuery({
        queryKey: availabilityKeys.list(params),
        queryFn: () =>
            api.get("/admin/provider-availabilities", { params }).then((r) => {
                // Backend: { data: [], links: {}, meta: {} }
                const body = r.data;
                const list = Array.isArray(body.data)
                    ? body.data
                    : body.data?.data || [];
                return {
                    list,
                    meta: body.meta || body.data?.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

// ==================== SINGLE ====================
export const useProviderAvailability = (id) => {
    return useQuery({
        queryKey: availabilityKeys.detail(id),
        queryFn: () =>
            api
                .get(`/admin/provider-availabilities/${id}`)
                .then((r) => r.data.data),
        enabled: !!id,
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

// ==================== PREVIEW ====================
export const usePreviewAvailability = () => {
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api
                .post("/admin/provider-availabilities/preview", payload)
                .then((r) => r.data),
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to generate preview"));
        },
    });
};

// ==================== CREATE ====================
export const useCreateAvailability = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api
                .post("/admin/provider-availabilities", payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: availabilityKeys.all });
            toast.success("Availability created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create availability"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateAvailability = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api
                .put(`/admin/provider-availabilities/${id}`, payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: availabilityKeys.all });
            toast.success("Availability updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update availability"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteAvailability = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/provider-availabilities/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: availabilityKeys.all });
            toast.success("Availability deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete availability"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleAvailabilityStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api
                .post(`/admin/provider-availabilities/${id}/toggle-status`)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: availabilityKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};

// ==================== HELPERS ====================
export const DAY_NAMES = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
};

export const getDayLabel = (num) => DAY_NAMES[num] || "";

export const getDaysLabel = (days = []) =>
    days.map((d) => DAY_NAMES[d]?.slice(0, 3)).join(", ");