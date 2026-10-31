// src/features/patent/queries/clinicPrivileges.js

import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";

// ==================== QUERY KEYS ====================
export const clinicPrivilegeKeys = {
    all: ["clinicPrivileges"],
    lists: () => [...clinicPrivilegeKeys.all, "list"],
    list: (params) => [...clinicPrivilegeKeys.lists(), params],
    details: () => [...clinicPrivilegeKeys.all, "detail"],
    detail: (providerId) => [...clinicPrivilegeKeys.details(), providerId],
};

// ==================== PROVIDERS LIST (FOR CARDS) ====================
// Only returns staff whose role.is_provider === true.
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

                    // Only providers
                    list = list.filter((s) => s?.role?.is_provider === true);

                    return { list, meta };
                }),
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });
};

// ==================== SINGLE PROVIDER DETAILS ====================
// GET /admin/providers/{provider}
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