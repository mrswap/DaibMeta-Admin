// src/features/patent/queries/serviceManager.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const serviceKeys = {
    all: ["services"],
    lists: () => [...serviceKeys.all, "list"],
    list: (filters) => [...serviceKeys.lists(), filters],
    details: () => [...serviceKeys.all, "detail"],
    detail: (id) => [...serviceKeys.details(), id],
};

export const testKeys = {
    all: ["service-tests"],
    lists: () => [...testKeys.all, "list"],
    list: (serviceId, filters) => [...testKeys.lists(), serviceId, filters],
    detail: (serviceId, id) => [...testKeys.all, "detail", serviceId, id],
};

export const leadKeys = {
    all: ["service-leads"],
    lists: () => [...leadKeys.all, "list"],
    list: (filters) => [...leadKeys.lists(), filters],
    details: () => [...leadKeys.all, "detail"],
    detail: (id) => [...leadKeys.details(), id],
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

// ==================== SERVICES (CATEGORIES) ====================

export const useServices = (params = {}) => {
    return useQuery({
        queryKey: serviceKeys.list(params),
        queryFn: () =>
            api.get("/admin/services", { params }).then((r) => {
                const body = r.data;
                const list = Array.isArray(body.data) ? body.data : body.data?.data || [];
                return {
                    list,
                    meta: body.meta || body.data?.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

export const useService = (id) => {
    return useQuery({
        queryKey: serviceKeys.detail(id),
        queryFn: () => api.get(`/admin/services/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

export const useCreateService = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/services", formData).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            toast.success(res?.message || "Service created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create service"));
        },
    });
};

export const useUpdateService = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            api.post(`/admin/services/${id}?_method=PUT`, formData).then((r) => r.data),
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            qc.invalidateQueries({ queryKey: serviceKeys.detail(variables.id) });
            toast.success(res?.message || "Service updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update service"));
        },
    });
};

export const useToggleServiceStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, is_active }) =>
            api.post(`/admin/services/${id}/toggle-status`, { is_active }).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            toast.success(res?.message || "Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update status"));
        },
    });
};

export const useDeleteService = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/services/${id}`).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            toast.success(res?.message || "Service deleted successfully");
        },
        onError: (err) => {
            const msg = err.response?.status === 409
                ? err.response?.data?.message
                : getErrorMessage(err, "Failed to delete service");
            toast.error(msg);
        },
    });
};

// ==================== SERVICE TESTS (RATE CARD) ====================

export const useServiceTests = (serviceId, params = {}) => {
    return useQuery({
        queryKey: testKeys.list(serviceId, params),
        queryFn: () =>
            api.get(`/admin/services/${serviceId}/tests`, { params }).then((r) => {
                const body = r.data;
                const list = Array.isArray(body.data) ? body.data : body.data?.data || [];
                return {
                    list,
                    meta: body.meta || body.data?.meta || {},
                    range: body.range || null,
                };
            }),
        enabled: !!serviceId,
        keepPreviousData: true,
    });
};

export const useServiceTest = (serviceId, testId) => {
    return useQuery({
        queryKey: testKeys.detail(serviceId, testId),
        queryFn: () => api.get(`/admin/services/${serviceId}/tests/${testId}`).then((r) => r.data.data),
        enabled: !!serviceId && !!testId,
    });
};

export const useCreateServiceTest = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ serviceId, payload }) =>
            api.post(`/admin/services/${serviceId}/tests`, payload).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            qc.invalidateQueries({ queryKey: testKeys.lists() });
            toast.success(res?.message || "Test created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create test"));
        },
    });
};

export const useUpdateServiceTest = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ serviceId, testId, payload }) =>
            api.put(`/admin/services/${serviceId}/tests/${testId}`, payload).then((r) => r.data),
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            qc.invalidateQueries({ queryKey: testKeys.lists() });
            qc.invalidateQueries({ queryKey: testKeys.detail(variables.serviceId, variables.testId) });
            toast.success(res?.message || "Test updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update test"));
        },
    });
};

export const useToggleServiceTestStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ serviceId, testId, is_active }) =>
            api.post(`/admin/services/${serviceId}/tests/${testId}/toggle-status`, { is_active }).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            qc.invalidateQueries({ queryKey: testKeys.lists() });
            toast.success(res?.message || "Test status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update test status"));
        },
    });
};

export const useDeleteServiceTest = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ serviceId, testId }) =>
            api.delete(`/admin/services/${serviceId}/tests/${testId}`).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: serviceKeys.all });
            qc.invalidateQueries({ queryKey: testKeys.lists() });
            toast.success(res?.message || "Test deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete test"));
        },
    });
};

// ==================== SERVICE LEADS ====================

export const useServiceLeads = (params = {}) => {
    return useQuery({
        queryKey: leadKeys.list(params),
        queryFn: () =>
            api.get("/admin/leads", { params }).then((r) => {
                const body = r.data;
                return {
                    list: body.data || [],
                    meta: body.meta || {},
                };
            }),
        keepPreviousData: true,
    });
};

export const useServiceLead = (id) => {
    return useQuery({
        queryKey: leadKeys.detail(id),
        queryFn: () => api.get(`/admin/leads/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

export const useUpdateLeadStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.patch(`/admin/leads/${id}/status`, payload).then((r) => r.data),
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: leadKeys.lists() });
            qc.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
            toast.success(res?.message || "Status updated");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update status")),
    });
};

export const useUpdateLeadNotes = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, admin_notes }) =>
            api.patch(`/admin/leads/${id}/notes`, { admin_notes }).then((r) => r.data),
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: leadKeys.lists() });
            qc.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
            toast.success(res?.message || "Notes updated");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update notes")),
    });
};

// ==================== CONSTANTS ====================
export const DISPLAY_MODES = [
    { value: "direct", label: "Direct Service Listing" },
    { value: "package_only", label: "Only Inside Health Packages" },
];

export const LEAD_STATUSES = [
    { value: "new_lead", label: "New Lead", color: "brand" },
    { value: "viewed", label: "Viewed", color: "accent" },
    { value: "contacted", label: "Contacted", color: "warn" },
    { value: "closed", label: "Closed", color: "danger" },
];

export const getLeadStatusLabel = (status) => {
    const found = LEAD_STATUSES.find((s) => s.value === status);
    return found?.label || status;
};