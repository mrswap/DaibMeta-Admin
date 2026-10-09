// src/features/patent/queries/exceptionManagement.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const exceptionMgmtKeys = {
    all: ["exceptionManagement"],
    lists: () => [...exceptionMgmtKeys.all, "list"],
    list: (params) => [...exceptionMgmtKeys.lists(), params],
    byAvailability: (availabilityId) => [
        ...exceptionMgmtKeys.all,
        "byAvailability",
        availabilityId,
    ],
    detail: (id) => [...exceptionMgmtKeys.all, "detail", id],
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

const normalizeException = (ex, availabilityMap = {}) => {
    if (!ex) return null;

    const availability =
        ex.availability ||
        availabilityMap[ex.availability_id] ||
        {};
    const provider = availability.provider || ex.provider || {};
    const appointmentType =
        availability.appointment_type || ex.appointment_type || {};

    return {
        id: ex.id,
        availability_id: ex.availability_id || availability.id || null,
        exception_date: ex.exception_date || null,
        type: ex.type || "blocked",
        start_time: ex.start_time || null,
        end_time: ex.end_time || null,
        reason: ex.reason || "",
        status: ex.status ?? true,
        is_full_day: !ex.start_time && !ex.end_time,
        created_at: ex.created_at || null,
        updated_at: ex.updated_at || null,

        availability,
        provider: {
            id: provider.id || null,
            name: provider.name || provider.full_name || "Unknown",
            role_label:
                provider.role_label ||
                provider.role?.label ||
                provider.role?.name ||
                "",
        },
        appointment_type: {
            id: appointmentType.id || null,
            name: appointmentType.name || "",
            duration: appointmentType.duration || null,
        },
    };
};

const normalizeExceptionList = (body, availabilityMap = {}) => {
    let list = [];
    if (Array.isArray(body?.data)) list = body.data;
    else if (Array.isArray(body?.data?.data)) list = body.data.data;
    else if (Array.isArray(body)) list = body;

    return list.map((ex) => normalizeException(ex, availabilityMap)).filter(Boolean);
};

// ==================== ALL EXCEPTIONS (FAN-OUT) ====================
// Fetches all exceptions by iterating through availabilities.
// This is the fallback since global endpoint doesn't support date range.
export const useAllExceptions = ({
    availabilities = [],
    date_from,
    date_to,
    per_page = 200,
} = {}) => {
    // Build a stable key from availability IDs + date range
    const availabilityIds = availabilities
        .map((a) => a.id)
        .filter(Boolean)
        .sort()
        .join(",");

    return useQuery({
        queryKey: exceptionMgmtKeys.list({
            availabilityIds,
            date_from,
            date_to,
        }),
        queryFn: async () => {
            if (!availabilities.length) {
                return { list: [], meta: { total: 0 } };
            }

            // Build availability map for enrichment
            const availabilityMap = {};
            availabilities.forEach((av) => {
                availabilityMap[av.id] = av;
            });

            // Fan-out: fetch exceptions for each availability in parallel
            const results = await Promise.all(
                availabilities.map((av) =>
                    api
                        .get("/admin/provider-availability-exceptions", {
                            params: {
                                availability_id: av.id,
                                per_page,
                            },
                        })
                        .then((r) =>
                            normalizeExceptionList(r.data, availabilityMap),
                        )
                        .catch(() => []), // Silently skip failed ones
                ),
            );

            // Flatten
            let allExceptions = results.flat();

            // Client-side date range filter
            if (date_from && date_to) {
                allExceptions = allExceptions.filter((ex) => {
                    const d = ex.exception_date;
                    if (!d) return false;
                    return d >= date_from && d <= date_to;
                });
            }

            return {
                list: allExceptions,
                meta: {
                    total: allExceptions.length,
                    per_page,
                    current_page: 1,
                    last_page: 1,
                },
            };
        },
        enabled: availabilities.length > 0,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 2,
    });
};

// ==================== EXCEPTIONS BY AVAILABILITY ====================
export const useExceptionsByAvailability = (availabilityId, params = {}) => {
    return useQuery({
        queryKey: exceptionMgmtKeys.byAvailability(availabilityId),
        queryFn: () =>
            api
                .get("/admin/provider-availability-exceptions", {
                    params: {
                        availability_id: availabilityId,
                        per_page: 200,
                        ...params,
                    },
                })
                .then((r) => normalizeExceptionList(r.data)),
        enabled: !!availabilityId,
        staleTime: 1000 * 60 * 2,
    });
};

// ==================== EXCEPTION DETAIL ====================
export const useExceptionDetail = (id) => {
    return useQuery({
        queryKey: exceptionMgmtKeys.detail(id),
        queryFn: () =>
            api
                .get(`/admin/provider-availability-exceptions/${id}`)
                .then((r) => normalizeException(r.data?.data || r.data)),
        enabled: !!id,
    });
};

// ==================== DELETE EXCEPTION ====================
export const useDeleteExceptionMgmt = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id) =>
            api
                .delete(`/admin/provider-availability-exceptions/${id}`)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: exceptionMgmtKeys.all });
            qc.invalidateQueries({ queryKey: ["bookingCalendar"] });
            qc.invalidateQueries({ queryKey: ["providerAvailabilities"] });
            qc.invalidateQueries({ queryKey: ["availabilityExceptions"] });
            toast.success("Exception removed successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to remove exception"));
        },
    });
};

// ==================== BULK SAVE EXCEPTIONS ====================
export const useBulkSaveExceptionsMgmt = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (payload) =>
            api
                .post("/admin/provider-availability-exceptions/bulk", payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: exceptionMgmtKeys.all });
            qc.invalidateQueries({ queryKey: ["bookingCalendar"] });
            qc.invalidateQueries({ queryKey: ["providerAvailabilities"] });
            qc.invalidateQueries({ queryKey: ["availabilityExceptions"] });
            toast.success("Exceptions saved successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to save exceptions"));
        },
    });
};

// ==================== UTILS ====================
export const toLocalDateString = (val) => {
    if (!val) return "";
    if (typeof val === "string" && val.length === 10 && !val.includes("T")) {
        return val;
    }
    const dt = new Date(val);
    if (isNaN(dt.getTime())) return "";
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export const toShortTime = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val.slice(0, 5);
    return "";
};

export const timeToMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
};

export const minutesToTime = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatTime12 = (t) => {
    if (!t) return "";
    const [h, m] = t.slice(0, 5).split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

export const formatDateFull = (d) => {
    if (!d) return "";
    try {
        return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    } catch {
        return d;
    }
};

export const formatDateShort = (d) => {
    if (!d) return "";
    try {
        return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
        });
    } catch {
        return d;
    }
};

export const getISODay = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const jsDay = dt.getDay();
    return jsDay === 0 ? 7 : jsDay;
};

export const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};