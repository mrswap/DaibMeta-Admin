// src/features/patent/queries/storeSeller.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const storeSellerKeys = {
    all: ["storeSeller"],
    detail: () => [...storeSellerKeys.all, "detail"],
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

// ==================== GET ====================
export const useStoreSeller = () => {
    return useQuery({
        queryKey: storeSellerKeys.detail(),
        queryFn: () =>
            api.get("/admin/store/seller-information").then((r) => {
                // Data can be null if no profile exists yet
                return r.data.data || null;
            }),
    });
};

// ==================== SAVE / UPDATE ====================
export const useSaveStoreSeller = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/store/seller-information", formData).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeSellerKeys.all });
            toast.success("Seller information saved successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to save seller information"));
        },
    });
};