// src/features/patent/queries/reports.js

import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";

// ==================== QUERY KEYS ====================
export const reportKeys = {
    all: ["reports"],
    dashboard: (filters) => [...reportKeys.all, "dashboard", filters],
    patients: (filters) => [...reportKeys.all, "patients", filters],
    appointments: (filters) => [...reportKeys.all, "appointments", filters],
    visits: (filters) => [...reportKeys.all, "visits", filters],
    financial: (filters) => [...reportKeys.all, "financial", filters],
    store: (filters) => [...reportKeys.all, "store", filters],
};

// ==================== HELPERS ====================
// Har report response ka structure same hai:
// { success, message, data: { summary, charts, records: { data, current_page, per_page, total, last_page } } }
const normalizeReport = (body) => {
    const data = body?.data || {};
    const records = data?.records || {};
    return {
        summary: data?.summary || {},
        charts: data?.charts || {},
        records: {
            list: Array.isArray(records?.data) ? records.data : [],
            meta: {
                current_page: records?.current_page || 1,
                per_page: records?.per_page || 15,
                total: records?.total || 0,
                last_page: records?.last_page || 1,
            },
        },
    };
};

// Dashboard response alag structure rakhta hai:
// { data: { filters, patients: { summary, charts }, appointments: {...}, visits: {...}, financial: {...}, store: {...} } }
const normalizeDashboard = (body) => {
    const data = body?.data || {};
    return {
        filters: data?.filters || {},
        patients: {
            summary: data?.patients?.summary || {},
            charts: data?.patients?.charts || {},
        },
        appointments: {
            summary: data?.appointments?.summary || {},
            charts: data?.appointments?.charts || {},
        },
        visits: {
            summary: data?.visits?.summary || {},
            charts: data?.visits?.charts || {},
        },
        financial: {
            summary: data?.financial?.summary || {},
            charts: data?.financial?.charts || {},
        },
        store: {
            summary: data?.store?.summary || {},
            charts: data?.store?.charts || {},
        },
    };
};

// ==================== CONSTANTS ====================
export const PERIOD_OPTIONS = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "this_week", label: "This Week" },
    { value: "last_week", label: "Last Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_year", label: "This Year" },
    { value: "custom", label: "Custom" },
    { value: "all", label: "All" },
];

export const DEFAULT_REPORT_FILTERS = {
    period: "this_month",
    from_date: "",
    to_date: "",
    search: "",
};

// ==================== DASHBOARD ====================
// NOTE: Dashboard page baad me banega, lekin service pehle se ready rahegi.
export const useDashboardReport = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: reportKeys.dashboard(filters),
        queryFn: () =>
            api
                .get("/admin/dashboard", { params: filters })
                .then((r) => normalizeDashboard(r.data)),
        keepPreviousData: true,
        ...options,
    });
};

// ==================== PATIENT REPORT ====================
export const usePatientReport = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: reportKeys.patients(filters),
        queryFn: () =>
            api
                .get("/admin/reports/patients", { params: filters })
                .then((r) => normalizeReport(r.data)),
        keepPreviousData: true,
        ...options,
    });
};

// ==================== APPOINTMENT REPORT ====================
export const useAppointmentReport = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: reportKeys.appointments(filters),
        queryFn: () =>
            api
                .get("/admin/reports/appointments", { params: filters })
                .then((r) => normalizeReport(r.data)),
        keepPreviousData: true,
        ...options,
    });
};

// ==================== VISIT REPORT ====================
export const useVisitReport = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: reportKeys.visits(filters),
        queryFn: () =>
            api
                .get("/admin/reports/visits", { params: filters })
                .then((r) => normalizeReport(r.data)),
        keepPreviousData: true,
        ...options,
    });
};

// ==================== FINANCIAL REPORT ====================
export const useFinancialReport = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: reportKeys.financial(filters),
        queryFn: () =>
            api
                .get("/admin/reports/financial", { params: filters })
                .then((r) => normalizeReport(r.data)),
        keepPreviousData: true,
        ...options,
    });
};

// ==================== STORE REPORT ====================
export const useStoreReport = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: reportKeys.store(filters),
        queryFn: () =>
            api
                .get("/admin/reports/store", { params: filters })
                .then((r) => normalizeReport(r.data)),
        keepPreviousData: true,
        ...options,
    });
};