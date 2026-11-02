// src/features/patent/queries/healthQuiz.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const healthQuizKeys = {
    // Questions
    questions: () => ["healthQuiz", "questions"],
    questionList: (params) => [...healthQuizKeys.questions(), "list", params],
    questionDetail: (id) => [...healthQuizKeys.questions(), "detail", id],

    // History
    history: () => ["healthQuiz", "history"],
    historyList: (params) => [...healthQuizKeys.history(), "list", params],
    historyDetail: (id) => [...healthQuizKeys.history(), "detail", id],

    // Leaderboard
    leaderboard: () => ["healthQuiz", "leaderboard"],
    leaderboardList: (params) => [...healthQuizKeys.leaderboard(), "list", params],
    leaderboardDetail: (patientId) => [...healthQuizKeys.leaderboard(), "detail", patientId],
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

// Universal paginator normalizer
const normalizePaginator = (body) => {
    const inner = body?.data;

    // Case 1: Laravel paginator → body has data[], total, last_page etc.
    if (Array.isArray(inner)) {
        return {
            list: inner,
            meta: {
                current_page: body.current_page ?? 1,
                last_page: body.last_page ?? 1,
                per_page: body.per_page ?? inner.length,
                total: body.total ?? inner.length,
                from: body.from ?? 1,
                to: body.to ?? inner.length,
            },
        };
    }

    // Case 2: nested "data.data"
    if (inner?.data && Array.isArray(inner.data)) {
        return {
            list: inner.data,
            meta: inner.meta || {
                current_page: inner.current_page ?? 1,
                last_page: inner.last_page ?? 1,
                per_page: inner.per_page ?? inner.data.length,
                total: inner.total ?? inner.data.length,
            },
        };
    }

    // Case 3: body is raw array
    if (Array.isArray(body)) {
        return {
            list: body,
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: body.length,
                total: body.length,
            },
        };
    }

    return { list: [], meta: {} };
};

// ==================== QUESTIONS MANAGEMENT ====================

export const useHealthQuizQuestions = (params = {}) => {
    return useQuery({
        queryKey: healthQuizKeys.questionList(params),
        queryFn: () =>
            api.get("/admin/health-quiz/questions", { params }).then((r) => {
                return normalizePaginator(r.data.data || {});
            }),
        keepPreviousData: true,
    });
};

export const useHealthQuizQuestion = (id) => {
    return useQuery({
        queryKey: healthQuizKeys.questionDetail(id),
        queryFn: () =>
            api.get(`/admin/health-quiz/questions/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });
};

export const useCreateHealthQuizQuestion = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/health-quiz/questions", payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: healthQuizKeys.questions() });
            toast.success("Question created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create question"));
        },
    });
};

export const useUpdateHealthQuizQuestion = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/health-quiz/questions/${id}`, payload).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: healthQuizKeys.questions() });
            qc.invalidateQueries({ queryKey: healthQuizKeys.questionDetail(variables.id) });
            toast.success("Question updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update question"));
        },
    });
};

export const useToggleHealthQuizQuestionStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/health-quiz/questions/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: healthQuizKeys.questions() });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};

export const useDeleteHealthQuizQuestion = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.delete(`/admin/health-quiz/questions/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: healthQuizKeys.questions() });
            toast.success("Question deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete question"));
        },
    });
};

// ==================== QUIZ HISTORY ====================

export const useHealthQuizHistory = (params = {}) => {
    return useQuery({
        queryKey: healthQuizKeys.historyList(params),
        queryFn: () =>
            api.get("/admin/health-quiz/history", { params }).then((r) => {
                return normalizePaginator(r.data.data || {});
            }),
        keepPreviousData: true,
    });
};

export const useHealthQuizAttempt = (attemptId) => {
    return useQuery({
        queryKey: healthQuizKeys.historyDetail(attemptId),
        queryFn: () =>
            api.get(`/admin/health-quiz/history/${attemptId}`).then((r) => r.data.data),
        enabled: !!attemptId,
    });
};

// ==================== LEADERBOARD ====================

export const useHealthQuizLeaderboard = (params = {}) => {
    return useQuery({
        queryKey: healthQuizKeys.leaderboardList(params),
        queryFn: () =>
            api.get("/admin/health-quiz/leaderboard", { params }).then((r) => {
                return normalizePaginator(r.data.data || {});
            }),
        keepPreviousData: true,
    });
};

export const useHealthQuizPatientLeaderboard = (patientId) => {
    return useQuery({
        queryKey: healthQuizKeys.leaderboardDetail(patientId),
        queryFn: () =>
            api.get(`/admin/health-quiz/leaderboard/${patientId}`).then((r) => r.data.data),
        enabled: !!patientId,
    });
};