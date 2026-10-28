import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const contentPageKeys = {
    all: ["content-pages"],
    lists: () => [...contentPageKeys.all, "list"],
    list: (filters) => [...contentPageKeys.lists(), filters],
    details: () => [...contentPageKeys.all, "detail"],
    detail: (key) => [...contentPageKeys.details(), key],
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

// ==================== SINGLE (PUBLIC GET) ====================
export const useContentPage = (key) => {
    return useQuery({
        queryKey: contentPageKeys.detail(key),
        queryFn: () =>
            api.get(`/content-pages/key/${key}`).then((r) => r.data?.data || null),
        enabled: !!key,
    });
};

// ==================== CREATE ====================
export const useCreateContentPage = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/content-pages", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contentPageKeys.all });
            toast.success("Content page created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create content page"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateContentPage = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.post(`/admin/content-pages/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            }).then((r) => r.data),
        onSuccess: (data, variables) => {
            qc.invalidateQueries({ queryKey: contentPageKeys.all });
            toast.success("Content page updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update content page"));
        },
    });
};

// ==================== CONSTANTS ====================
export const CONTENT_PAGE_KEYS = [
    { value: "terms_and_conditions", label: "Terms and Conditions" },
    { value: "know_about_menstrual_period", label: "Know About Menstrual Period" },
    { value: "period_pain_relief", label: "Period Pain Relief" },
    { value: "period_hygiene", label: "Period Hygiene" },
    { value: "food_lifestyle", label: "Food & Lifestyle" },
    { value: "warning_signs", label: "Warning Signs" },
    { value: "myths_vs_facts", label: "Myths vs Facts" },
    { value: "seller_info", label: "Seller Information" },
];