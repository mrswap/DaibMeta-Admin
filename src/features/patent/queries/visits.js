// src/features/patent/queries/visits.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const visitKeys = {
    all: ["visits"],
    lists: () => [...visitKeys.all, "list"],
    list: (filters) => [...visitKeys.lists(), filters],
    details: () => [...visitKeys.all, "detail"],
    detail: (id) => [...visitKeys.details(), id],
    history: (id) => [...visitKeys.detail(id), "history"],
    consultation: (id) => [...visitKeys.detail(id), "consultation"],
    documents: (id) => [...visitKeys.detail(id), "documents"],
    payments: (id) => [...visitKeys.detail(id), "payments"],
    // Slot selector helpers
    providerAvailabilities: (providerId) => [
        "slotSelector",
        "providerAvailabilities",
        providerId,
    ],
    availabilityExceptions: (availabilityId) => [
        "slotSelector",
        "exceptions",
        availabilityId,
    ],
    bookedSlotsByDate: (date) => ["slotSelector", "bookedSlots", date],
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

const normalizeList = (body) => {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.list)) return body.list;
    if (Array.isArray(body.data?.data)) return body.data.data;
    if (Array.isArray(body.data?.list)) return body.data.list;
    return [];
};

// ==================== CONSTANTS ====================
export const VISIT_STATUSES = [
    { value: "waiting", label: "Waiting", color: "warn" },
    { value: "in_consultation", label: "In Consultation", color: "accent" },
    { value: "completed", label: "Completed", color: "brand" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
    { value: "no_show", label: "No Show", color: "danger" },
];

export const VISIT_TYPES = [
    { value: "consultation", label: "Consultation" },
    { value: "follow_up", label: "Follow Up" },
    { value: "walk_in", label: "Walk In" },
];

export const PAYMENT_STATUSES = [
    { value: "free", label: "Free" },
    { value: "unpaid", label: "Unpaid" },
    { value: "partial", label: "Partial" },
    { value: "paid", label: "Paid" },
];

export const DOCUMENT_TYPES = [
    { value: "prescription", label: "Prescription", category: "prescriptions" },
    { value: "pathology", label: "Pathology Report", category: "reports" },
    { value: "ct_scan", label: "CT Scan", category: "reports" },
    { value: "x_ray", label: "X-Ray", category: "reports" },
    { value: "other", label: "Other", category: "other" },
];

export const CONSULTATION_END_SOURCES = [
    { value: "manual", label: "Manual" },
    { value: "auto_slot", label: "Auto (Slot End)" },
];

// ==================== LABEL HELPERS ====================
export const getVisitStatusLabel = (status) => {
    const found = VISIT_STATUSES.find((s) => s.value === status);
    return found?.label || status;
};

export const getVisitTypeLabel = (type) => {
    const found = VISIT_TYPES.find((t) => t.value === type);
    return found?.label || type;
};

export const getPaymentStatusLabel = (status) => {
    const found = PAYMENT_STATUSES.find((p) => p.value === status);
    return found?.label || status;
};

export const getDocumentTypeLabel = (type) => {
    const found = DOCUMENT_TYPES.find((d) => d.value === type);
    return found?.label || type;
};

export const getConsultationEndSourceLabel = (source) => {
    const found = CONSULTATION_END_SOURCES.find((s) => s.value === source);
    return found?.label || source || "—";
};

// ==================== LIFECYCLE ACTION MATRIX ====================
export const getLifecycleActions = (status) => {
    const map = {
        waiting: ["start_consultation", "cancel", "no_show"],
        in_consultation: ["complete", "revert_to_waiting"],
        completed: [],
        cancelled: [],
        no_show: [],
    };
    return map[status] || [];
};

export const LIFECYCLE_ACTION_LABELS = {
    start_consultation: "Start Consultation",
    revert_to_waiting: "Revert to Waiting",
    complete: "Complete",
    cancel: "Cancel",
    no_show: "Mark No Show",
};

export const LIFECYCLE_ACTION_DESCRIPTIONS = {
    start_consultation: "Move visit to consultation. Consultation timer starts.",
    revert_to_waiting: "Move visit back to waiting state.",
    complete: "Mark consultation as completed.",
    cancel: "Cancel this visit.",
    no_show: "Mark patient as no-show.",
};

// ==================== LIST ====================
export const useVisits = (params = {}) => {
    return useQuery({
        queryKey: visitKeys.list(params),
        queryFn: () =>
            api.get("/admin/visits", { params }).then((r) => {
                const body = r.data;
                return {
                    list: normalizeList(body),
                    meta: body.meta || body.data?.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

// ==================== SINGLE ====================
export const useVisit = (id) => {
    return useQuery({
        queryKey: visitKeys.detail(id),
        queryFn: () => api.get(`/admin/visits/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

// ==================== CREATE ====================
export const useCreateVisit = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/visits", payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: visitKeys.all });
            toast.success("Visit created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create visit"));
        },
    });
};

// ==================== UPDATE ====================
export const useUpdateVisit = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/visits/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: visitKeys.all });
            toast.success("Visit updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update visit"));
        },
    });
};

// ==================== LIFECYCLE ====================
export const useVisitLifecycle = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, action }) =>
            api
                .post(`/admin/visits/${id}/lifecycle`, { action })
                .then((r) => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: visitKeys.all });
            toast.success(data?.message || "Visit updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update visit lifecycle"));
        },
    });
};

// ==================== DELETE ====================
export const useDeleteVisit = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) => api.delete(`/admin/visits/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: visitKeys.all });
            toast.success("Visit deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete visit"));
        },
    });
};

// ==================== HISTORY ====================
export const useVisitHistory = (visitId) => {
    return useQuery({
        queryKey: visitKeys.history(visitId),
        queryFn: () =>
            api.get(`/admin/visits/${visitId}/history`).then((r) => {
                const body = r.data;
                return normalizeList(body);
            }),
        enabled: !!visitId,
    });
};

// ==================== CONSULTATION ====================
export const useVisitConsultation = (visitId) => {
    return useQuery({
        queryKey: visitKeys.consultation(visitId),
        queryFn: () =>
            api
                .get(`/admin/visits/${visitId}/consultation`)
                .then((r) => r.data.data),
        enabled: !!visitId,
        retry: false,
    });
};

export const useUpdateConsultation = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ visitId, payload }) =>
            api
                .put(`/admin/visits/${visitId}/consultation`, payload)
                .then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({
                queryKey: visitKeys.consultation(variables.visitId),
            });
            qc.invalidateQueries({
                queryKey: visitKeys.detail(variables.visitId),
            });
            toast.success("Consultation updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update consultation"));
        },
    });
};

// ==================== FOLLOW-UP ====================
export const useCreateFollowUp = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ visitId, payload }) =>
            api
                .post(`/admin/visits/${visitId}/follow-ups`, payload)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: visitKeys.all });
            toast.success("Follow-up created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create follow-up"));
        },
    });
};

export const useFollowUp = (followUpId) => {
    return useQuery({
        queryKey: [...visitKeys.all, "follow-up", followUpId],
        queryFn: () =>
            api
                .get(`/admin/visits/follow-ups/${followUpId}`)
                .then((r) => r.data.data),
        enabled: !!followUpId,
    });
};

// ==================== DOCUMENTS ====================
export const useVisitDocuments = (visitId) => {
    return useQuery({
        queryKey: visitKeys.documents(visitId),
        queryFn: () =>
            api.get(`/admin/visits/${visitId}/documents`).then((r) => {
                const body = r.data;
                return normalizeList(body);
            }),
        enabled: !!visitId,
    });
};

export const useUploadDocument = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ visitId, documentType, file }) => {
            const formData = new FormData();
            formData.append("document_type", documentType);
            formData.append("file", file);
            return api
                .post(`/admin/visits/${visitId}/documents`, formData)
                .then((r) => r.data);
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({
                queryKey: visitKeys.documents(variables.visitId),
            });
            toast.success("Document uploaded successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to upload document"));
        },
    });
};

export const useDeleteDocument = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ documentId }) =>
            api
                .delete(`/admin/visits/documents/${documentId}`)
                .then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: visitKeys.all });
            toast.success("Document deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete document"));
        },
    });
};

// ==================== PAYMENTS ====================
export const useVisitPayments = (visitId) => {
    return useQuery({
        queryKey: visitKeys.payments(visitId),
        queryFn: () =>
            api.get(`/admin/visits/${visitId}/payments`).then((r) => {
                const body = r.data;
                return normalizeList(body);
            }),
        enabled: !!visitId,
    });
};

export const useCreatePayment = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ visitId, payload }) =>
            api
                .post(`/admin/visits/${visitId}/payments`, payload)
                .then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({
                queryKey: visitKeys.payments(variables.visitId),
            });
            qc.invalidateQueries({
                queryKey: visitKeys.detail(variables.visitId),
            });
            toast.success("Payment entry created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create payment"));
        },
    });
};

// ==================== SLOT SELECTOR HELPERS ====================
// In hooks ko SlotSelector.jsx use karta hai — same file mein hain
// taaki bookingCalendar.js pe depend na karna pade.

// --- Provider Availabilities ---
export const useProviderAvailabilitiesForCalendar = (providerId) => {
    return useQuery({
        queryKey: visitKeys.providerAvailabilities(providerId),
        queryFn: () =>
            api
                .get("/admin/provider-availabilities", {
                    params: {
                        admin_id: providerId,
                        status: 1,
                        per_page: 100,
                    },
                })
                .then((r) => normalizeList(r.data)),
        enabled: !!providerId,
        staleTime: 1000 * 60 * 5,
    });
};

// --- Availability Exceptions ---
export const useExceptionsForCalendar = (availabilityId) => {
    return useQuery({
        queryKey: visitKeys.availabilityExceptions(availabilityId),
        queryFn: () =>
            api
                .get("/admin/availability-exceptions", {
                    params: { availability_id: availabilityId, per_page: 100 },
                })
                .then((r) => normalizeList(r.data)),
        enabled: !!availabilityId,
        staleTime: 1000 * 60 * 5,
    });
};

// --- Booked Slots (all providers, one date) ---
export const useBookedSlotsByDate = (date) => {
    return useQuery({
        queryKey: visitKeys.bookedSlotsByDate(date),
        queryFn: () =>
            api
                .get("/admin/appointments", {
                    params: {
                        date_from: date,
                        date_to: date,
                        per_page: 100,
                    },
                })
                .then((r) => {
                    const list = normalizeList(r.data);
                    // Filter out cancelled/no_show
                    return list.filter(
                        (a) => a.status !== "cancelled" && a.status !== "no_show",
                    );
                }),
        enabled: !!date,
        staleTime: 1000 * 60 * 1,
    });
};