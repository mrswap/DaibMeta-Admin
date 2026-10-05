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
    slots: (filters) => [...exceptionKeys.all, "slots", filters],
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

// ==================== LIST ====================
export const useAvailabilityExceptions = (params = {}) => {
    return useQuery({
        queryKey: exceptionKeys.list(params),
        queryFn: () =>
            api
                .get("/admin/provider-availability-exceptions", { params })
                .then((r) => {
                    const wrapper = r.data.data || {};
                    const list = Array.isArray(wrapper.data) ? wrapper.data : [];
                    return {
                        list,
                        meta: {
                            current_page: wrapper.current_page || 1,
                            last_page: wrapper.last_page || 1,
                            per_page: wrapper.per_page || 20,
                            total: wrapper.total || 0,
                        },
                    };
                }),
        keepPreviousData: true,
        enabled: !!params.availability_id,
    });
};

// ==================== SLOTS FOR A DATE ====================
export const useSlotsForDate = ({ adminId, appointmentTypeId, date }) => {
    return useQuery({
        queryKey: exceptionKeys.slots({ adminId, appointmentTypeId, date }),
        queryFn: () =>
            api
                .get("/admin/provider-availabilities/slots", {
                    params: {
                        admin_id: adminId,
                        appointment_type_id: appointmentTypeId,
                        date,
                    },
                })
                .then((r) => {
                    const body = r.data;
                    let slotsArray = [];
                    if (Array.isArray(body?.data?.slots)) {
                        slotsArray = body.data.slots;
                    } else if (Array.isArray(body?.data?.data)) {
                        slotsArray = body.data.data;
                    } else if (Array.isArray(body?.slots)) {
                        slotsArray = body.slots;
                    } else if (Array.isArray(body?.data)) {
                        slotsArray = body.data;
                    } else if (Array.isArray(body)) {
                        slotsArray = body;
                    }

                    return slotsArray.map((s) => ({
                        start_time: toShortTime(s.start_time),
                        end_time: toShortTime(s.end_time),
                        status: s.status || (s.available ? "available" : "blocked"),
                        available: s.available ?? s.status === "available",
                        booked_count: s.booked_count || 0,
                        capacity: s.capacity || 1,
                        appointment_id: s.appointment_id || null,
                        exception_id: s.exception_id || null,
                    }));
                }),
        enabled: !!adminId && !!appointmentTypeId && !!date,
        staleTime: 0,
    });
};

// ==================== BULK SAVE ====================
export const useBulkSaveExceptions = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api
                .post("/admin/provider-availability-exceptions/bulk", payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: exceptionKeys.all });
            qc.invalidateQueries({ queryKey: ["providerAvailabilities"] });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to save exceptions"));
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
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to remove exception"));
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
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};

// ==================== UTILS ====================
export const DAY_NAMES = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
};

export const getISODay = (date) => {
    const jsDay = date.getDay();
    return jsDay === 0 ? 7 : jsDay;
};

export const timeToMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

export const minutesToTime = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatTime12 = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

export const formatDateFull = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const formatDateShort = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });
};

export const generateDates = (dateFrom, dateTo, daysOfWeek) => {
    if (!dateFrom || !dateTo || !daysOfWeek?.length) return [];

    const dates = [];
    const [fy, fm, fd] = dateFrom.split("-").map(Number);
    const [ty, tm, td] = dateTo.split("-").map(Number);
    const current = new Date(fy, fm - 1, fd);
    const end = new Date(ty, tm - 1, td);

    while (current <= end) {
        const isoDay = getISODay(current);
        if (daysOfWeek.includes(isoDay)) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, "0");
            const d = String(current.getDate()).padStart(2, "0");
            dates.push({
                dateStr: `${y}-${m}-${d}`,
                dayOfWeek: isoDay,
                dayName: DAY_NAMES[isoDay],
            });
        }
        current.setDate(current.getDate() + 1);
    }
    return dates;
};