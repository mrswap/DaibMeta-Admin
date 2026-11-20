// src/features/patent/queries/notifications.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const notificationKeys = {
    all: ["notifications"],
    lists: () => [...notificationKeys.all, "list"],
    list: (filters) => [...notificationKeys.lists(), filters],
    unreadCount: () => [...notificationKeys.all, "unread-count"],
    devices: () => [...notificationKeys.all, "devices"],
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

// Normalize Laravel paginated / plain array / nested responses
const normalizeList = (root) => {
    const body = root?.data ?? root ?? {};
    if (body.data && Array.isArray(body.data)) {
        return { list: body.data, meta: body.meta || root.meta || {} };
    }
    if (body.data?.data && Array.isArray(body.data.data)) {
        return { list: body.data.data, meta: body.data.meta || body.meta || {} };
    }
    if (Array.isArray(body)) {
        return {
            list: body,
            meta: {
                total: body.length,
                current_page: 1,
                last_page: 1,
                per_page: body.length,
            },
        };
    }
    return { list: [], meta: {} };
};

// ==================== NOTIFICATION LIST ====================
export const useNotifications = (params = {}) => {
    return useQuery({
        queryKey: notificationKeys.list(params),
        queryFn: () =>
            api.get("/admin/notifications", { params }).then((r) => {
                return normalizeList(r.data);
            }),
        keepPreviousData: true,
    });
};

// ==================== UNREAD COUNT ====================
export const useUnreadCount = () => {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: () =>
            api.get("/admin/notifications/unread-count").then((r) => {
                const root = r.data ?? {};
                const body = root.data ?? root;
                if (typeof body === "number") return body;
                if (typeof body?.count === "number") return body.count;
                if (typeof body?.unread_count === "number") return body.unread_count;
                if (typeof root?.count === "number") return root.count;
                if (typeof root?.unread_count === "number") return root.unread_count;
                return 0;
            }),
        refetchOnWindowFocus: true,
        staleTime: 30000,
    });
};

// ==================== MARK AS READ ====================
// NOTE: No success toast — read/unread actions should be silent (no toast noise).
export const useMarkAsRead = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/notifications/${id}/read`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.lists() });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to mark as read"));
        },
    });
};

// ==================== MARK AS UNREAD ====================
// NOTE: No success toast — read/unread actions should be silent (no toast noise).
// TODO: Remove this hook entirely for production — added only for testing.
export const useMarkAsUnread = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/notifications/${id}/unread`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.lists() });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to mark as unread"));
        },
    });
};

// ==================== MARK ALL AS READ ====================
export const useMarkAllAsRead = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: () =>
            api.post("/admin/notifications/read-all").then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.lists() });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
            toast.success("All notifications marked as read");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to mark all as read"));
        },
    });
};

// ==================== DELETE NOTIFICATION ====================
export const useDeleteNotification = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/notifications/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.lists() });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
            toast.success("Notification deleted");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete notification"));
        },
    });
};

// ==================== DEVICES ====================
export const useDevices = () => {
    return useQuery({
        queryKey: notificationKeys.devices(),
        queryFn: () =>
            api.get("/admin/notifications/devices").then((r) => {
                return normalizeList(r.data);
            }),
    });
};

export const useRegisterDevice = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api
                .post("/admin/notifications/devices/register", payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.devices() });
            toast.success("Device registered successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to register device"));
        },
    });
};

export const useRemoveDevice = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/notifications/devices/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.devices() });
            toast.success("Device removed successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to remove device"));
        },
    });
};