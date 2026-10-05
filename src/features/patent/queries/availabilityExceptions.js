import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const exceptionKeys = {
    all: ["availabilityExceptions"],
    lists: () => [...exceptionKeys.all, "list"],
    list: (filters) => [...exceptionKeys.lists(), filters],
    details: () => [...exceptionKeys.all, "detail"],
    detail: (id) => [...exceptionKeys.details(), id],
};

// ==================== LIST ====================
export const useAvailabilityExceptions = (params = {}) => {
    return useQuery({
        queryKey: exceptionKeys.list(params),
        queryFn: () =>
            api
                .get("/admin/provider-availability-exceptions", { params })
                .then((r) => {
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
        enabled: !!params.availability_id,
    });
};

// ==================== SINGLE ====================
export const useAvailabilityException = (id) => {
    return useQuery({
        queryKey: exceptionKeys.detail(id),
        queryFn: () =>
            api
                .get(`/admin/provider-availability-exceptions/${id}`)
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

// ==================== CREATE ====================
export const useCreateException = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api
                .post("/admin/provider-availability-exceptions", payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: exceptionKeys.all });
            qc.invalidateQueries({ queryKey: ["providerAvailabilities"] });
            toast.success("Exception created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create exception"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateException = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api
                .put(`/admin/provider-availability-exceptions/${id}`, payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: exceptionKeys.all });
            qc.invalidateQueries({ queryKey: ["providerAvailabilities"] });
            toast.success("Exception updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update exception"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteException = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api
                .delete(`/admin/provider-availability-exceptions/${id}`)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: exceptionKeys.all });
            qc.invalidateQueries({ queryKey: ["providerAvailabilities"] });
            toast.success("Exception deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete exception"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleExceptionStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api
                .post(`/admin/provider-availability-exceptions/${id}/toggle-status`)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: exceptionKeys.all });
            qc.invalidateQueries({ queryKey: ["providerAvailabilities"] });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};