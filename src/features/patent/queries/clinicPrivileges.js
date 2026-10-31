// src/features/patent/queries/clinicPrivileges.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const clinicPrivilegeKeys = {
    all: ["clinicPrivileges"],
    lists: () => [...clinicPrivilegeKeys.all, "list"],
    list: (params) => [...clinicPrivilegeKeys.lists(), params],
    details: () => [...clinicPrivilegeKeys.all, "detail"],
    detail: (providerId) => [...clinicPrivilegeKeys.details(), providerId],

    // Free Services Keys
    freeServices: () => [...clinicPrivilegeKeys.all, "freeServices"],
    freeServicesList: (params) => [...clinicPrivilegeKeys.freeServices(), "list", params],
    freeServiceDetail: (id) => [...clinicPrivilegeKeys.freeServices(), "detail", id],
    availableProviders: (appointmentTypeId) => [
        ...clinicPrivilegeKeys.freeServices(),
        "available-providers",
        appointmentTypeId,
    ],
    masterProviderList: () => [...clinicPrivilegeKeys.all, "master-providers"],
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

// ==================== PROVIDERS LIST (FOR CARDS) ====================
export const useClinicPrivilegeProviders = (params = {}) => {
    return useQuery({
        queryKey: clinicPrivilegeKeys.list(params),
        queryFn: () =>
            api
                .get("/admin/staff", {
                    params: { per_page: 100, status: 1, ...params },
                })
                .then((r) => {
                    const body = r.data.data || {};
                    let list = [];
                    let meta = {};

                    if (Array.isArray(body)) {
                        list = body;
                        meta = r.data.meta || {};
                    } else if (body && Array.isArray(body.data)) {
                        list = body.data;
                        meta = body.meta || r.data.meta || {};
                    }

                    list = list.filter((s) => s?.role?.is_provider === true);
                    return { list, meta };
                }),
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });
};

// ==================== SINGLE PROVIDER DETAILS ====================
export const useClinicPrivilegeProviderDetails = (providerId) => {
    return useQuery({
        queryKey: clinicPrivilegeKeys.detail(providerId),
        queryFn: () =>
            api
                .get(`/admin/providers/${providerId}`)
                .then((r) => r.data?.data ?? null),
        enabled: !!providerId,
        staleTime: 1000 * 60 * 5,
    });
};

// ==================== MASTER PROVIDERS LIST (FALLBACK) ====================
export const useProviderList = () => {
    return useQuery({
        queryKey: clinicPrivilegeKeys.masterProviderList(),
        queryFn: () =>
            api.get("/admin/providers/list").then((r) => {
                const list = r.data?.data || [];
                return Array.isArray(list) ? list : [];
            }),
        staleTime: 1000 * 60 * 5,
    });
};

// ==================== FREE SERVICES ====================

export const useFreeServices = (params = {}) => {
    return useQuery({
        queryKey: clinicPrivilegeKeys.freeServicesList(params),
        queryFn: () =>
            api.get("/admin/free-services", { params }).then((r) => {
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

export const useFreeService = (id) => {
    return useQuery({
        queryKey: clinicPrivilegeKeys.freeServiceDetail(id),
        queryFn: () =>
            api.get(`/admin/free-services/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

export const useAvailableProviders = (appointmentTypeId) => {
    return useQuery({
        queryKey: clinicPrivilegeKeys.availableProviders(appointmentTypeId),
        queryFn: () =>
            api
                .get("/admin/free-services/available-providers", {
                    params: { appointment_type_id: appointmentTypeId },
                })
                .then((r) => {
                    const body = r.data.data || [];
                    return Array.isArray(body) ? body : [];
                }),
        enabled: !!appointmentTypeId,
        staleTime: 1000 * 60 * 2,
    });
};

export const useCreateFreeService = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/free-services", payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: clinicPrivilegeKeys.freeServices() });
            toast.success("Free service created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create free service"));
        },
    });
};

export const useUpdateFreeService = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/free-services/${id}`, payload).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: clinicPrivilegeKeys.freeServices() });
            qc.invalidateQueries({ queryKey: clinicPrivilegeKeys.freeServiceDetail(variables.id) });
            toast.success("Free service updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update free service"));
        },
    });
};

export const useDeleteFreeService = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/free-services/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: clinicPrivilegeKeys.freeServices() });
            toast.success("Free service deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete free service"));
        },
    });
};

export const useToggleFreeServiceStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, status }) =>
            api
                .post(`/admin/free-services/${id}/toggle-status`, { status })
                .then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: clinicPrivilegeKeys.freeServices() });
            qc.invalidateQueries({ queryKey: clinicPrivilegeKeys.freeServiceDetail(variables.id) });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};