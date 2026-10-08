// src/features/patent/queries/bookingCalendar.js

import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";

// ==================== QUERY KEYS ====================
export const bookingCalendarKeys = {
    all: ["bookingCalendar"],
    providers: () => [...bookingCalendarKeys.all, "providers"],
    availabilities: (providerId) => [
        ...bookingCalendarKeys.all,
        "availabilities",
        providerId,
    ],
    allAvailabilities: () => [...bookingCalendarKeys.all, "allAvailabilities"],
    exceptions: (availabilityId) => [
        ...bookingCalendarKeys.all,
        "exceptions",
        availabilityId,
    ],
    bookedSlots: (date) => [
        ...bookingCalendarKeys.all,
        "bookedSlots",
        date,
    ],
};

// ==================== PROVIDERS ====================
export const useCalendarProviders = () => {
    return useQuery({
        queryKey: bookingCalendarKeys.providers(),
        queryFn: () =>
            api
                .get("/admin/staff", { params: { per_page: 100, status: 1 } })
                .then((r) => {
                    const body = r.data.data || {};
                    if (body.data && Array.isArray(body.data)) return body.data;
                    if (Array.isArray(body)) return body;
                    return [];
                }),
        staleTime: 1000 * 60 * 10,
    });
};

// ==================== ALL AVAILABILITIES ====================
export const useAllAvailabilities = () => {
    return useQuery({
        queryKey: bookingCalendarKeys.allAvailabilities(),
        queryFn: () =>
            api
                .get("/admin/provider-availabilities", {
                    params: { per_page: 100, status: 1 },
                })
                .then((r) => {
                    const body = r.data;
                    if (Array.isArray(body.data)) return body.data;
                    if (Array.isArray(body)) return body;
                    return [];
                }),
        staleTime: 1000 * 60 * 5,
    });
};

// ==================== EXCEPTIONS ====================
// Backend URL: /admin/provider-availability-exceptions
export const useExceptionsForCalendar = (availabilityId) => {
    return useQuery({
        queryKey: bookingCalendarKeys.exceptions(availabilityId),
        queryFn: () =>
            api
                .get("/admin/provider-availability-exceptions", {
                    params: { availability_id: availabilityId, per_page: 100 },
                })
                .then((r) => {
                    const body = r.data;
                    if (Array.isArray(body.data)) return body.data;
                    if (Array.isArray(body)) return body;
                    if (Array.isArray(body.data?.data)) return body.data.data;
                    return [];
                }),
        enabled: !!availabilityId,
        staleTime: 1000 * 60 * 5,
    });
};

// ==================== BOOKED SLOTS ====================
export const useBookedSlotsByDate = (date) => {
    return useQuery({
        queryKey: bookingCalendarKeys.bookedSlots(date),
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
                    const body = r.data;
                    let list = [];
                    if (Array.isArray(body.data)) list = body.data;
                    else if (Array.isArray(body)) list = body;
                    else if (Array.isArray(body.data?.data)) list = body.data.data;

                    return list.filter(
                        (a) => a.status !== "cancelled" && a.status !== "no_show",
                    );
                }),
        enabled: !!date,
        staleTime: 1000 * 60 * 1,
    });
};

// ==================== PROVIDER COLORS ====================
// 16 distinct hex colors — NO red, NO green, NO pink (red-family).
// Each color is picked from a DIFFERENT hue family for maximum visual distinction.
// Applied via inline styles — no dependency on Tailwind theme tokens.
export const PROVIDER_COLOR_PALETTE = [
    // ─── BLUES (4) — distinct shades ──────────────────
    { name: "Sky Blue", hex: "#0ea5e9" }, // bright cyan-blue
    { name: "Royal Blue", hex: "#2563eb" }, // pure blue
    { name: "Navy", hex: "#1e3a8a" }, // dark navy blue
    { name: "Deep Blue", hex: "#0c4a6e" }, // very dark blue

    // ─── PURPLES / INDIGO (4) ─────────────────────────
    { name: "Indigo", hex: "#4f46e5" }, // blue-purple
    { name: "Violet", hex: "#8b5cf6" }, // light purple
    { name: "Purple", hex: "#a855f7" }, // pure purple
    { name: "Deep Purple", hex: "#7e22ce" }, // dark purple

    // ─── CYANS / TEALS (3) ────────────────────────────
    { name: "Cyan", hex: "#06b6d4" }, // bright cyan
    { name: "Deep Cyan", hex: "#0e7490" }, // dark cyan
    { name: "Deep Teal", hex: "#0f766e" }, // dark teal (greenish, but very dark)

    // ─── ORANGE / AMBER (2) ───────────────────────────
    { name: "Amber", hex: "#f59e0b" }, // golden yellow
    { name: "Orange", hex: "#ea580c" }, // deep orange

    // ─── GREYS (3) ────────────────────────────────────
    { name: "Slate", hex: "#64748b" }, // grey-blue
    { name: "Steel", hex: "#334155" }, // dark grey
    { name: "Charcoal", hex: "#0f172a" }, // near-black
];

export const getProviderColor = (provider) => {
    if (!provider) return PROVIDER_COLOR_PALETTE[0];
    const key = String(provider.id || provider.name || "");
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % PROVIDER_COLOR_PALETTE.length;
    return PROVIDER_COLOR_PALETTE[idx];
};

// Helper — convert hex to rgba with opacity (for light background tints)
export const hexToLightBg = (hex, opacity = 0.1) => {
    if (!hex) return "transparent";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};