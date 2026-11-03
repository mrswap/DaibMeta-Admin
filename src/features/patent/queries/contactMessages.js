// src/features/patent/queries/contactMessages.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const contactMessageKeys = {
    all: ["contactMessages"],
    lists: () => [...contactMessageKeys.all, "list"],
    list: (params) => [...contactMessageKeys.lists(), params],
    details: () => [...contactMessageKeys.all, "detail"],
    detail: (id) => [...contactMessageKeys.details(), id],
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

// Universal paginator normalizer
const normalizePaginator = (body) => {
    const inner = body?.data;

    // Case 1: Laravel paginator → body has data[], total, last_page etc.
    if (Array.isArray(inner)) {
        return {
            list: inner,
            meta: {
                current_page: body.current_page ?? 1,
                last_page: body.last_page ?? 1,
                per_page: body.per_page ?? inner.length,
                total: body.total ?? inner.length,
                from: body.from ?? 1,
                to: body.to ?? inner.length,
            },
        };
    }

    // Case 2: nested "data.data"
    if (inner?.data && Array.isArray(inner.data)) {
        return {
            list: inner.data,
            meta: inner.meta || {
                current_page: inner.current_page ?? 1,
                last_page: inner.last_page ?? 1,
                per_page: inner.per_page ?? inner.data.length,
                total: inner.total ?? inner.data.length,
            },
        };
    }

    // Case 3: body is raw array
    if (Array.isArray(body)) {
        return {
            list: body,
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: body.length,
                total: body.length,
            },
        };
    }

    return { list: [], meta: {} };
};

// ==================== LIST ====================
export const useContactMessages = (params = {}) => {
    return useQuery({
        queryKey: contactMessageKeys.list(params),
        queryFn: () =>
            api.get("/admin/contact-messages", { params }).then((r) => {
                return normalizePaginator(r.data.data || {});
            }),
        keepPreviousData: true,
    });
};

// ==================== SINGLE ====================
export const useContactMessage = (id) => {
    return useQuery({
        queryKey: contactMessageKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/contact-messages/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== UPDATE STATUS ====================
export const useUpdateContactMessageStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, status }) =>
            api.post(`/admin/contact-messages/${id}/status`, { status }).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: contactMessageKeys.all });
            qc.invalidateQueries({ queryKey: contactMessageKeys.detail(variables.id) });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update status"));
        },
    });
};