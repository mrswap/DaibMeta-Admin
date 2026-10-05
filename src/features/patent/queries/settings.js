// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../../../lib/axios';
// import { useToast } from '../common/toast/ToastContext';

// // ==================== QUERY KEYS ====================
// export const settingsKeys = {
//     all: ['settings'],
//     lists: () => [...settingsKeys.all, 'list'],
//     list: (filters) => [...settingsKeys.lists(), filters],
//     byGroup: (group) => [...settingsKeys.all, 'group', group],
// };

// // ==================== LIST ====================
// export const useSettings = (params = {}) => {
//     return useQuery({
//         queryKey: params.group
//             ? settingsKeys.byGroup(params.group)
//             : settingsKeys.list(params),
//         queryFn: () =>
//             api.get('/admin/settings', { params }).then((r) => {
//                 const body = r.data.data || r.data;
//                 return Array.isArray(body) ? body : body?.data || [];
//             }),
//     });
// };

// // ==================== HELPERS ====================
// const getErrorMessage = (err, fallback = "Something went wrong") => {
//     const data = err.response?.data;
//     if (data?.errors) {
//         const first = Object.values(data.errors)[0];
//         if (Array.isArray(first)) return first[0];
//     }
//     return data?.message || fallback;
// };

// // ==================== UPDATE NORMAL SETTING ====================
// export const useUpdateSetting = () => {
//     const qc = useQueryClient();
//     const toast = useToast();

//     return useMutation({
//         mutationFn: ({ id, payload }) =>
//             api.put(`/admin/settings/${id}`, payload).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: settingsKeys.all });
//             toast.success("Setting updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to update setting"));
//         },
//     });
// };

// // ==================== UPLOAD FILE SETTING ====================
// export const useUploadFileSetting = () => {
//     const qc = useQueryClient();
//     const toast = useToast();

//     return useMutation({
//         mutationFn: ({ id, setting, file }) => {
//             const formData = new FormData();
//             // Laravel method spoofing — PUT simulate karo POST ke through
//             formData.append("_method", "PUT");
//             formData.append("group", setting.group);
//             formData.append("key", setting.key);
//             formData.append("type", setting.type || "file");
//             formData.append("file", file);
//             formData.append("is_public", setting.is_public ? "1" : "0");
//             formData.append("status", setting.status ? "1" : "0");

//             // POST use karo, _method=PUT se Laravel PUT treat karega
//             return api
//                 .post(`/admin/settings/${id}`, formData)
//                 .then((r) => r.data);
//         },
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: settingsKeys.all });
//             toast.success("File uploaded successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to upload file"));
//         },
//     });
// };

// // ==================== TOGGLE STATUS ====================
// export const useToggleSettingStatus = () => {
//     const qc = useQueryClient();
//     const toast = useToast();

//     return useMutation({
//         mutationFn: (id) =>
//             api.post(`/admin/settings/${id}/toggle-status`).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: settingsKeys.all });
//             toast.success("Status updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to toggle status"));
//         },
//     });
// };

// // ==================== UTIL: Group settings ====================
// export const groupSettings = (settingsArray = []) => {
//     const map = {};
//     settingsArray.forEach((s) => {
//         if (!map[s.group]) map[s.group] = [];
//         map[s.group].push(s);
//     });
//     return map;
// };

// // ==================== UTIL: File URL ====================
// export const getFileUrl = (path) => {
//     if (!path) return null;
//     if (
//         path.startsWith("http://") ||
//         path.startsWith("https://") ||
//         path.startsWith("data:")
//     ) {
//         return path;
//     }
//     const baseURL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "";
//     return `${baseURL}/${path.replace(/^\/+/, "")}`;
// };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToast } from '../common/toast/ToastContext';

// ==================== QUERY KEYS ====================
export const settingsKeys = {
    all: ['settings'],
    lists: () => [...settingsKeys.all, 'list'],
    list: (filters) => [...settingsKeys.lists(), filters],
    byGroup: (group) => [...settingsKeys.all, 'group', group],
};

// ==================== LIST ====================
export const useSettings = (params = {}) => {
    return useQuery({
        queryKey: params.group
            ? settingsKeys.byGroup(params.group)
            : settingsKeys.list(params),
        queryFn: () =>
            api.get('/admin/settings', { params }).then((r) => {
                const body = r.data.data || r.data;
                return Array.isArray(body) ? body : body?.data || [];
            }),
    });
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

// ==================== UTIL: File to Base64 ====================
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

// ==================== UPDATE NORMAL SETTING ====================
export const useUpdateSetting = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.put(`/admin/settings/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
            toast.success("Setting updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update setting"));
        },
    });
};

// ==================== UPLOAD FILE SETTING (BASE64) ====================
export const useUploadFileSetting = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async ({ id, setting, file }) => {
            const base64 = await fileToBase64(file);

            // JSON payload with base64 value
            const payload = {
                group: setting.group,
                key: setting.key,
                type: setting.type || "file",
                value: base64, // base64 string
                is_public: setting.is_public,
                status: setting.status,
            };

            return api.put(`/admin/settings/${id}`, payload).then((r) => r.data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
            toast.success("File uploaded successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to upload file"));
        },
    });
};

// ==================== TOGGLE STATUS ====================
export const useToggleSettingStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/settings/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};

// ==================== UTIL: Group settings ====================
export const groupSettings = (settingsArray = []) => {
    const map = {};
    settingsArray.forEach((s) => {
        if (!map[s.group]) map[s.group] = [];
        map[s.group].push(s);
    });
    return map;
};

// ==================== UTIL: File URL ====================
export const getFileUrl = (path) => {
    if (!path) return null;
    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:")
    ) {
        return path;
    }
    const baseURL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "";
    return `${baseURL}/${path.replace(/^\/+/, "")}`;
};