// src/features/patent/hooks/usePermission.js

import { useCallback, useMemo } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useMe } from "../pages/auth/queries";

export const usePermission = () => {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);

    // Trigger /auth/me in background to fetch fresh permissions
    const { isLoading: isMeLoading } = useMe();

    const isSuperAdmin = user?.is_super_admin === true;

    const permissionNames = useMemo(() => {
        if (isSuperAdmin) return null; // null = allow all
        const list = Array.isArray(user?.permissions) ? user.permissions : [];
        return new Set(list.map((p) => p.name));
    }, [isSuperAdmin, user?.permissions]);

    const has = useCallback(
        (permission) => {
            if (!permission) return true;
            if (!user || !token) return false;
            if (isSuperAdmin) return true;
            if (!permissionNames) return false;
            return permissionNames.has(permission);
        },
        [user, token, isSuperAdmin, permissionNames]
    );

    const can = useCallback(
        (resource, action = "view") => {
            if (!resource) return true;
            if (!user || !token) return false;
            if (isSuperAdmin) return true;
            if (!permissionNames) return false;

            const directKey = `${resource}.${action}`;
            if (permissionNames.has(directKey)) return true;

            if (action !== "manage") {
                const manageKey = `${resource}.manage`;
                if (permissionNames.has(manageKey)) return true;
            }

            return false;
        },
        [user, token, isSuperAdmin, permissionNames]
    );

    return {
        has,
        can,
        isSuperAdmin,
        // Expose loading so pages can avoid firing restricted API calls too early
        isLoading: isMeLoading && !isSuperAdmin,
    };
};