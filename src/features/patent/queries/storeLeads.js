// src/features/patent/queries/storeLeads.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const storeLeadKeys = {
    all: ["storeLeads"],
    lists: () => [...storeLeadKeys.all, "list"],
    list: (params) => [...storeLeadKeys.lists(), params],
    details: () => [...storeLeadKeys.all, "detail"],
    detail: (id) => [...storeLeadKeys.details(), id],
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
export const useStoreLeads = (params = {}) => {
    return useQuery({
        queryKey: storeLeadKeys.list(params),
        queryFn: () =>
            api.get("/admin/store/leads", { params }).then((r) => {
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
export const useStoreLead = (id) => {
    return useQuery({
        queryKey: storeLeadKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/store/leads/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CHANGE STATUS ====================
export const useChangeStoreLeadStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, status }) =>
            api.post(`/admin/store/leads/${id}/change-status`, { status }).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: storeLeadKeys.all });
            qc.invalidateQueries({ queryKey: storeLeadKeys.detail(variables.id) });
            toast.success("Lead status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update lead status"));
        },
    });
};