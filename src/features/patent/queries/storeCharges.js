// src/features/patent/queries/storeCharges.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const storeChargeKeys = {
    all: ["storeCharges"],
    detail: () => [...storeChargeKeys.all, "detail"],
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
export const useStoreCharges = () => {
    return useQuery({
        queryKey: storeChargeKeys.detail(),
        queryFn: () =>
            api.get("/admin/store/charges").then((r) => {
                const data = r.data.data || {};
                return {
                    delivery_charges: data.delivery_charges || [],
                    processing_charges: data.processing_charges || [],
                    other_charge: data.other_charge || "0",
                };
            }),
    });
};

// ==================== SAVE / UPDATE ====================
export const useSaveStoreCharges = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/store/charges", payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: storeChargeKeys.all });
            toast.success("Charges saved successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to save charges"));
        },
    });
};