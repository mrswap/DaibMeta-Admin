// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { api } from '../../../lib/axios';
// // import { useToast } from '../common/toast/ToastContext';

// // // ==================== QUERY KEYS ====================
// // export const staffKeys = {
// //     all: ['staff'],
// //     lists: () => [...staffKeys.all, 'list'],
// //     list: (filters) => [...staffKeys.lists(), filters],
// //     details: () => [...staffKeys.all, 'detail'],
// //     detail: (id) => [...staffKeys.details(), id],
// // };

// // // ==================== LIST ====================
// // export const useStaff = (params = {}) => {
// //     return useQuery({
// //         queryKey: staffKeys.list(params),
// //         queryFn: () =>
// //             api.get('/admin/staff', { params }).then((r) => {
// //                 const body = r.data.data || {};
// //                 if (body.data && Array.isArray(body.data)) {
// //                     return { list: body.data, meta: body.meta || {} };
// //                 }
// //                 if (Array.isArray(body)) {
// //                     return {
// //                         list: body,
// //                         meta: {
// //                             total: body.length,
// //                             current_page: 1,
// //                             last_page: 1,
// //                             per_page: body.length,
// //                         },
// //                     };
// //                 }
// //                 return { list: [], meta: {} };
// //             }),
// //         keepPreviousData: true,
// //     });
// // };

// // // ==================== SINGLE ====================
// // export const useStaffMember = (id) => {
// //     return useQuery({
// //         queryKey: staffKeys.detail(id),
// //         queryFn: () => api.get(`/admin/staff/${id}`).then((r) => r.data.data),
// //         enabled: !!id,
// //     });
// // };

// // // ==================== HELPERS ====================
// // const getErrorMessage = (err, fallback = "Something went wrong") => {
// //     const data = err.response?.data;
// //     if (data?.errors) {
// //         const first = Object.values(data.errors)[0];
// //         if (Array.isArray(first)) return first[0];
// //     }
// //     return data?.message || fallback;
// // };

// // // ==================== CREATE ====================
// // export const useCreateStaff = () => {
// //     const qc = useQueryClient();
// //     const toast = useToast();
// //     return useMutation({
// //         mutationFn: (payload) =>
// //             api.post('/admin/staff', payload).then((r) => r.data),
// //         onSuccess: () => {
// //             qc.invalidateQueries({ queryKey: staffKeys.all });
// //             toast.success("Staff member created successfully");
// //         },
// //         onError: (err) => {
// //             toast.error(getErrorMessage(err, "Failed to create staff"));
// //         },
// //     });
// // };

// // // ==================== UPDATE ====================
// // export const useUpdateStaff = () => {
// //     const qc = useQueryClient();
// //     const toast = useToast();
// //     return useMutation({
// //         mutationFn: ({ id, payload }) =>
// //             api.put(`/admin/staff/${id}`, payload).then((r) => r.data),
// //         onSuccess: () => {
// //             qc.invalidateQueries({ queryKey: staffKeys.all });
// //             toast.success("Staff member updated successfully");
// //         },
// //         onError: (err) => {
// //             toast.error(getErrorMessage(err, "Failed to update staff"));
// //         },
// //     });
// // };

// // // ==================== DELETE ====================
// // export const useDeleteStaff = () => {
// //     const qc = useQueryClient();
// //     const toast = useToast();
// //     return useMutation({
// //         mutationFn: (id) => api.delete(`/admin/staff/${id}`).then((r) => r.data),
// //         onSuccess: () => {
// //             qc.invalidateQueries({ queryKey: staffKeys.all });
// //             toast.success("Staff member deleted successfully");
// //         },
// //         onError: (err) => {
// //             toast.error(getErrorMessage(err, "Failed to delete staff"));
// //         },
// //     });
// // };

// // // ==================== TOGGLE STATUS ====================
// // export const useToggleStaffStatus = () => {
// //     const qc = useQueryClient();
// //     const toast = useToast();
// //     return useMutation({
// //         mutationFn: (id) =>
// //             api.post(`/admin/staff/${id}/toggle-status`).then((r) => r.data),
// //         onSuccess: () => {
// //             qc.invalidateQueries({ queryKey: staffKeys.all });
// //             toast.success("Status updated successfully");
// //         },
// //         onError: (err) => {
// //             toast.error(getErrorMessage(err, "Failed to toggle status"));
// //         },
// //     });
// // };




// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../../../lib/axios';
// import { useToast } from '../common/toast/ToastContext';

// // ==================== QUERY KEYS ====================
// export const staffKeys = {
//     all: ['staff'],
//     lists: () => [...staffKeys.all, 'list'],
//     list: (filters) => [...staffKeys.lists(), filters],
//     details: () => [...staffKeys.all, 'detail'],
//     detail: (id) => [...staffKeys.details(), id],
// };

// export const profileSectionKeys = {
//     all: ['profile-sections'],
//     lists: () => [...profileSectionKeys.all, 'list'],
//     list: (providerId) => [...profileSectionKeys.lists(), providerId],
// };

// // ==================== STAFF LIST ====================
// export const useStaff = (params = {}) => {
//     return useQuery({
//         queryKey: staffKeys.list(params),
//         queryFn: () =>
//             api.get('/admin/staff', { params }).then((r) => {
//                 const body = r.data.data || {};
//                 if (body.data && Array.isArray(body.data)) {
//                     return { list: body.data, meta: body.meta || {} };
//                 }
//                 if (Array.isArray(body)) {
//                     return {
//                         list: body,
//                         meta: {
//                             total: body.length,
//                             current_page: 1,
//                             last_page: 1,
//                             per_page: body.length,
//                         },
//                     };
//                 }
//                 return { list: [], meta: {} };
//             }),
//         keepPreviousData: true,
//     });
// };

// // ==================== STAFF SINGLE ====================
// export const useStaffMember = (id) => {
//     return useQuery({
//         queryKey: staffKeys.detail(id),
//         queryFn: () => api.get(`/admin/staff/${id}`).then((r) => r.data.data),
//         enabled: !!id,
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

// // ==================== STAFF CREATE ====================
// export const useCreateStaff = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: (payload) =>
//             api.post('/admin/staff', payload).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: staffKeys.all });
//             toast.success("Staff member created successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to create staff"));
//         },
//     });
// };

// // ==================== STAFF UPDATE ====================
// export const useUpdateStaff = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: ({ id, payload }) =>
//             api.put(`/admin/staff/${id}`, payload).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: staffKeys.all });
//             toast.success("Staff member updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to update staff"));
//         },
//     });
// };

// // ==================== STAFF DELETE ====================
// export const useDeleteStaff = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: (id) => api.delete(`/admin/staff/${id}`).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: staffKeys.all });
//             toast.success("Staff member deleted successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to delete staff"));
//         },
//     });
// };

// // ==================== STAFF TOGGLE STATUS ====================
// export const useToggleStaffStatus = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: (id) =>
//             api.post(`/admin/staff/${id}/toggle-status`).then((r) => r.data),
//         onSuccess: () => {
//             qc.invalidateQueries({ queryKey: staffKeys.all });
//             toast.success("Status updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to toggle status"));
//         },
//     });
// };

// // ==================== PROVIDER PROFILE SECTIONS ====================

// // 1. List Profile Sections
// export const useProfileSections = (providerId) => {
//     return useQuery({
//         queryKey: profileSectionKeys.list(providerId),
//         queryFn: () =>
//             api.get(`/admin/providers/${providerId}/profile-sections`, {
//                 params: { per_page: 5 }
//             }).then((r) => {
//                 const body = r.data;
//                 const list = Array.isArray(body.data) ? body.data : body.data?.data || [];
//                 return {
//                     list,
//                     meta: body.meta || body.data?.meta || {},
//                 };
//             }),
//         enabled: !!providerId,
//     });
// };

// // 2. Create Profile Section
// export const useCreateProfileSection = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: ({ providerId, formData }) =>
//             api.post(`/admin/providers/${providerId}/profile-sections`, formData).then((r) => r.data),
//         onSuccess: (_, variables) => {
//             qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
//             toast.success("Profile section created successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to create profile section"));
//         },
//     });
// };

// // 3. Update Profile Section
// export const useUpdateProfileSection = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: ({ providerId, sectionId, formData }) =>
//             // Using POST with _method=PUT for multipart compatibility
//             api.post(`/admin/providers/${providerId}/profile-sections/${sectionId}`, formData).then((r) => r.data),
//         onSuccess: (_, variables) => {
//             qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
//             toast.success("Profile section updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to update profile section"));
//         },
//     });
// };

// // 4. Delete Profile Section
// export const useDeleteProfileSection = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: ({ providerId, sectionId }) =>
//             api.delete(`/admin/providers/${providerId}/profile-sections/${sectionId}`).then((r) => r.data),
//         onSuccess: (_, variables) => {
//             qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
//             toast.success("Profile section deleted successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to delete profile section"));
//         },
//     });
// };

// // 5. Toggle Profile Section Status
// export const useToggleProfileSectionStatus = () => {
//     const qc = useQueryClient();
//     const toast = useToast();
//     return useMutation({
//         mutationFn: ({ providerId, sectionId }) =>
//             api.post(`/admin/providers/${providerId}/profile-sections/${sectionId}/toggle-status`).then((r) => r.data),
//         onSuccess: (_, variables) => {
//             qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
//             toast.success("Status updated successfully");
//         },
//         onError: (err) => {
//             toast.error(getErrorMessage(err, "Failed to toggle status"));
//         },
//     });
// };


// src/features/patent/queries/staff.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

// ==================== QUERY KEYS ====================
export const staffKeys = {
    all: ["staff"],
    lists: () => [...staffKeys.all, "list"],
    list: (filters) => [...staffKeys.lists(), filters],
    details: () => [...staffKeys.all, "detail"],
    detail: (id) => [...staffKeys.details(), id],
};

export const profileSectionKeys = {
    all: ["profile-sections"],
    lists: () => [...profileSectionKeys.all, "list"],
    list: (providerId) => [...profileSectionKeys.lists(), providerId],
};

// ==================== STAFF LIST ====================
export const useStaff = (params = {}) => {
    return useQuery({
        queryKey: staffKeys.list(params),
        queryFn: () =>
            api.get("/admin/staff", { params }).then((r) => {
                const body = r.data.data || {};
                if (body.data && Array.isArray(body.data)) {
                    return { list: body.data, meta: body.meta || {} };
                }
                if (Array.isArray(body)) {
                    return {
                        list: body,
                        meta: {
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

// ==================== STAFF SINGLE ====================
export const useStaffMember = (id) => {
    return useQuery({
        queryKey: staffKeys.detail(id),
        queryFn: () => api.get(`/admin/staff/${id}`).then((r) => r.data.data),
        enabled: !!id,
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

// ==================== STAFF CREATE ====================
export const useCreateStaff = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (payload) =>
            api.post("/admin/staff", payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Staff member created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create staff"));
        },
    });
};

// ==================== STAFF UPDATE ====================
export const useUpdateStaff = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, payload }) => {
            // Check if payload is FormData (for image uploads)
            if (payload instanceof FormData) {
                payload.append("_method", "PUT");
                return api.post(`/admin/staff/${id}`, payload).then((r) => r.data);
            }
            return api.put(`/admin/staff/${id}`, payload).then((r) => r.data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            qc.invalidateQueries({ queryKey: staffKeys.detail() });
            toast.success("Staff member updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update staff"));
        },
    });
};

// ==================== STAFF DELETE ====================
export const useDeleteStaff = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) => api.delete(`/admin/staff/${id}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Staff member deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete staff"));
        },
    });
};

// ==================== STAFF TOGGLE STATUS ====================
export const useToggleStaffStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: (id) =>
            api.post(`/admin/staff/${id}/toggle-status`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};

// ==================== PROVIDER PROFILE SECTIONS ====================

export const useProfileSections = (providerId) => {
    return useQuery({
        queryKey: profileSectionKeys.list(providerId),
        queryFn: () =>
            api.get(`/admin/providers/${providerId}/profile-sections`, {
                params: { per_page: 5 },
            }).then((r) => {
                const body = r.data;
                const list = Array.isArray(body.data) ? body.data : body.data?.data || [];
                return {
                    list,
                    meta: body.meta || body.data?.meta || {},
                };
            }),
        enabled: !!providerId,
    });
};

export const useCreateProfileSection = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ providerId, formData }) =>
            api.post(`/admin/providers/${providerId}/profile-sections`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
            toast.success("Profile section created successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to create profile section"));
        },
    });
};

export const useUpdateProfileSection = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ providerId, sectionId, formData }) =>
            api.post(`/admin/providers/${providerId}/profile-sections/${sectionId}`, formData).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
            toast.success("Profile section updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to update profile section"));
        },
    });
};

export const useDeleteProfileSection = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ providerId, sectionId }) =>
            api.delete(`/admin/providers/${providerId}/profile-sections/${sectionId}`).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
            toast.success("Profile section deleted successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete profile section"));
        },
    });
};

export const useToggleProfileSectionStatus = () => {
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ providerId, sectionId }) =>
            api.post(`/admin/providers/${providerId}/profile-sections/${sectionId}/toggle-status`).then((r) => r.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: profileSectionKeys.list(variables.providerId) });
            toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to toggle status"));
        },
    });
};