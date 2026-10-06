import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const appointmentKeys = {
    all: ["appointments"],
    lists: () => [...appointmentKeys.all, "list"],
    list: (filters) => [...appointmentKeys.lists(), filters],
    details: () => [...appointmentKeys.all, "detail"],
    detail: (id) => [...appointmentKeys.details(), id],
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
export const useAppointments = (params = {}) => {
    return useQuery({
        queryKey: appointmentKeys.list(params),
        queryFn: () =>
            api.get("/admin/appointments", { params }).then((r) => {
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
export const useAppointment = (id) => {
    return useQuery({
        queryKey: appointmentKeys.detail(id),
        queryFn: () =>
            api.get(`/admin/appointments/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CREATE ====================
export const useCreateAppointment = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/appointments", payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentKeys.all });
            toast.success("Appointment created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create appointment"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateAppointment = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/appointments/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentKeys.all });
            toast.success("Appointment updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update appointment"));
        },
    });
};

// ==================== UPDATE STATUS ====================
export const useUpdateAppointmentStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, status }) =>
            api.post(`/admin/appointments/${id}/status`, { status }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update status"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteAppointment = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/appointments/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: appointmentKeys.all });
            toast.success("Appointment deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete appointment"));
        },
    });
};

// ==================== CONSTANTS & HELPERS ====================
export const APPOINTMENT_STATUSES = [
    { value: "booked", label: "Booked", color: "accent" },
    { value: "confirmed", label: "Confirmed", color: "brand" },
    { value: "checked_in", label: "Checked In", color: "warn" },
    { value: "completed", label: "Completed", color: "brand" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
    { value: "no_show", label: "No Show", color: "danger" },
];

export const BOOKING_SOURCES = [
    { value: "reception", label: "Reception" },
    { value: "walk_in", label: "Walk In" },
    { value: "patient_app", label: "Patient App" },
];

export const getStatusLabel = (status) => {
    const found = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return found?.label || status;
};

// Allowed status transitions (from a given status)
export const getAllowedTransitions = (currentStatus) => {
    const map = {
        booked: ["confirmed", "checked_in", "completed", "cancelled", "no_show"],
        confirmed: ["checked_in", "completed", "cancelled", "no_show"],
        checked_in: ["completed", "cancelled", "no_show"],
        completed: [],
        cancelled: [],
        no_show: [],
    };
    return map[currentStatus] || [];
};