// src/features/patent/queries/homeCms.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

export const homeCmsKeys = {
    all: ["home-cms"],
    bookingCard: () => [...homeCmsKeys.all, "booking-card"],
    featureCards: () => [...homeCmsKeys.all, "feature-cards"],
};

const getErrorMessage = (err, fallback = "Something went wrong") => {
    const data = err.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first)) return first[0];
    }
    return data?.message || fallback;
};

// ==================== FETCH ALL HOME CMS DATA ====================
const useHomeCmsData = () => {
    return useQuery({
        queryKey: ["home-cms-master"],
        queryFn: () => api.get("/admin/home-cms").then((r) => r.data.data),
    });
};

// ==================== BOOKING CARD ====================
export const useBookingCard = () => {
    const { data, isLoading, error } = useHomeCmsData();
    const bookingSection = data?.sections?.find((s) => s.type === "booking_card");
    const bookingCard = bookingSection?.items?.[0] || null;
    return { data: bookingCard, isLoading, error };
};

export const useUpdateBookingCard = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (formData) =>
            api.post("/admin/home-cms/booking-card", formData).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ["home-cms-master"] });
            toast.success(res?.message || "Booking card updated");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update")),
    });
};

// ==================== FEATURE CARDS ====================
export const useFeatureCards = () => {
    const { data, isLoading, error } = useHomeCmsData();
    const featureSection = data?.sections?.find((s) => s.type === "feature_cards");
    let cards = featureSection?.items || [];

    cards = [...cards].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Yahan data: cards return kar rahe hain
    return { data: cards, isLoading, error };
};

export const useUpdateFeatureCard = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, formData }) =>
            api.post(`/admin/home-cms/feature-cards/${id}?_method=PUT`, formData).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ["home-cms-master"] });
            toast.success(res?.message || "Card updated successfully");
        },
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update")),
    });
};