// // src/features/patent/pages/roles/RoleDetail.jsx

// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiShield,
//   FiUser,
//   FiClock,
//   FiTag,
//   FiList,
//   FiSave,
//   FiLock,
// } from "react-icons/fi";
// import {
//   useRole,
//   useAvailablePermissions,
//   useRolePermissions,
//   useUpdateRolePermissions,
// } from "../../queries/roles";
// import Loader from "../../common/Loader";
// import { usePermission } from "../../hooks/usePermission";

// const humanize = (key = "") =>
//   key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// const formatDate = (dateStr) => {
//   if (!dateStr) return "—";
//   try {
//     return new Date(dateStr).toLocaleString();
//   } catch {
//     return dateStr;
//   }
// };

// const RoleDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { can } = usePermission();

//   // ==================== PERMISSIONS ====================
//   const canView = can("roles", "view");
//   const canManage = can("roles", "manage");

//   const { data: role, isLoading: roleLoading } = useRole(id, {
//     enabled: canView,
//   });
//   const { data: catalogue, isLoading: catalogueLoading } =
//     useAvailablePermissions({ enabled: canView });
//   const { data: assigned, isLoading: assignedLoading } = useRolePermissions(
//     id,
//     {
//       enabled: canView,
//     },
//   );
//   const updatePermissions = useUpdateRolePermissions();

//   const [selectedIds, setSelectedIds] = useState(new Set());
//   const [initialized, setInitialized] = useState(false);

//   // Initialize selection from assigned permissions (once)
//   useEffect(() => {
//     if (!initialized && assigned?.permissionIds) {
//       setSelectedIds(new Set(assigned.permissionIds));
//       setInitialized(true);
//     }
//   }, [assigned?.permissionIds, initialized]);

//   const grouped = catalogue?.grouped || {};

//   const isDirty = useMemo(() => {
//     if (!assigned?.permissionIds) return false;
//     const initial = new Set(assigned.permissionIds);
//     if (initial.size !== selectedIds.size) return true;
//     for (const id of selectedIds) {
//       if (!initial.has(id)) return true;
//     }
//     return false;
//   }, [assigned?.permissionIds, selectedIds]);

//   const togglePermission = (permId) => {
//     if (!canManage) return;
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(permId)) next.delete(permId);
//       else next.add(permId);
//       return next;
//     });
//   };

//   const toggleModule = (permList, checkAll) => {
//     if (!canManage) return;
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       permList.forEach((p) => {
//         if (checkAll) next.add(p.id);
//         else next.delete(p.id);
//       });
//       return next;
//     });
//   };

//   const handleSave = () => {
//     if (!canManage) return;
//     updatePermissions.mutate({
//       roleId: id,
//       permissionIds: Array.from(selectedIds),
//     });
//   };

//   // ==================== PAGE ACCESS GUARD ====================
//   if (!canView) {
//     return (
//       <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
//         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
//           <FiLock className="h-7 w-7" />
//         </div>
//         <h2 className="mt-4 text-lg font-semibold text-ink-900">
//           Access Denied
//         </h2>
//         <p className="mt-1 max-w-md text-sm text-ink-500">
//           You do not have permission to view roles. Please contact your
//           administrator.
//         </p>
//         <button
//           onClick={() => navigate("/roles")}
//           className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
//         >
//           Back to Roles
//         </button>
//       </div>
//     );
//   }

//   if (roleLoading) {
//     return <Loader text="Loading role..." />;
//   }

//   if (!role) {
//     return (
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/roles")}
//             className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
//           >
//             <FiArrowLeft className="h-5 w-5" />
//           </button>
//           <h1 className="text-2xl font-bold text-ink-900">Role Not Found</h1>
//         </div>
//         <div className="rounded-card border border-ink-100 bg-surface p-10 text-center">
//           <p className="text-sm text-ink-500">
//             The role you are looking for does not exist.
//           </p>
//           <button
//             onClick={() => navigate("/roles")}
//             className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
//           >
//             Back to Roles
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const totalSelected = selectedIds.size;
//   const totalAvailable = catalogue?.list?.length || 0;

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={() => navigate("/roles")}
//           className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
//         >
//           <FiArrowLeft className="h-5 w-5" />
//         </button>
//         <div className="flex-1">
//           <h1 className="text-2xl font-bold text-ink-900">{role.label}</h1>
//           <p className="mt-1 text-sm text-ink-500">
//             Role details and permission assignment
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           {role.is_system && (
//             <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-3 py-1 text-xs font-medium text-warn-900">
//               <FiShield className="h-3.5 w-3.5" />
//               System Role
//             </span>
//           )}
//           {role.is_provider && (
//             <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800">
//               Provider
//             </span>
//           )}
//           <span
//             className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//               role.status
//                 ? "bg-brand-50 text-brand-700"
//                 : "bg-ink-100 text-ink-600"
//             }`}
//           >
//             {role.status ? "Active" : "Inactive"}
//           </span>
//         </div>
//       </div>

//       {/* Role Info Card */}
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-3">
//           <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
//             Role Information
//           </p>
//         </div>
//         <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
//           <InfoItem icon={FiTag} label="Role Key">
//             <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs text-ink-700">
//               {role.name}
//             </code>
//           </InfoItem>
//           <InfoItem icon={FiUser} label="Label">
//             {role.label}
//           </InfoItem>
//           <InfoItem icon={FiList} label="Sort Order">
//             {role.sort_order ?? 0}
//           </InfoItem>
//           <div className="sm:col-span-2 lg:col-span-3">
//             <InfoItem icon={FiList} label="Description">
//               {role.description || "—"}
//             </InfoItem>
//           </div>
//           <InfoItem icon={FiClock} label="Created At">
//             {formatDate(role.created_at)}
//           </InfoItem>
//           <InfoItem icon={FiClock} label="Updated At">
//             {formatDate(role.updated_at)}
//           </InfoItem>
//           {typeof role.admins_count === "number" && (
//             <InfoItem icon={FiUser} label="Assigned Admins">
//               {role.admins_count}
//             </InfoItem>
//           )}
//         </div>
//       </div>

//       {/* Permissions Card */}
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         <div className="flex flex-col gap-2 border-b border-ink-100 bg-ink-50/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
//               Permissions
//             </p>
//             <p className="mt-0.5 text-[11px] text-ink-500">
//               {totalSelected} of {totalAvailable} selected
//               {!canManage && " • Read-only"}
//             </p>
//           </div>
//           {canManage && (
//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={!isDirty || updatePermissions.isPending}
//               className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-4 py-2 text-sm font-medium text-btn-primary-text transition-colors hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {updatePermissions.isPending ? (
//                 <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//               ) : (
//                 <FiSave className="h-4 w-4" />
//               )}
//               Save Permissions
//             </button>
//           )}
//         </div>

//         {catalogueLoading || assignedLoading ? (
//           <div className="px-5 py-10">
//             <Loader text="Loading permissions..." />
//           </div>
//         ) : Object.keys(grouped).length === 0 ? (
//           <div className="px-5 py-10 text-center">
//             <p className="text-sm text-ink-500">
//               No permissions available in the system.
//             </p>
//           </div>
//         ) : (
//           <div className="divide-y divide-ink-100">
//             {Object.entries(grouped).map(([module, perms]) => {
//               const allSelected = perms.every((p) => selectedIds.has(p.id));
//               const someSelected = perms.some((p) => selectedIds.has(p.id));
//               return (
//                 <div key={module} className="px-5 py-4">
//                   <div className="mb-3 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <p className="text-sm font-semibold text-ink-900">
//                         {humanize(module)}
//                       </p>
//                       <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
//                         {perms.filter((p) => selectedIds.has(p.id)).length}/
//                         {perms.length}
//                       </span>
//                     </div>
//                     {canManage && (
//                       <button
//                         type="button"
//                         onClick={() => toggleModule(perms, !allSelected)}
//                         className="cursor-pointer text-xs font-medium text-brand-700 hover:text-brand-800"
//                       >
//                         {allSelected ? "Clear all" : "Select all"}
//                       </button>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
//                     {perms.map((perm) => {
//                       const checked = selectedIds.has(perm.id);
//                       return (
//                         <label
//                           key={perm.id}
//                           className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition ${
//                             canManage ? "cursor-pointer" : "cursor-default"
//                           } ${
//                             checked
//                               ? "border-brand-300 bg-brand-50/40"
//                               : "border-ink-200 hover:border-ink-300 hover:bg-ink-50"
//                           }`}
//                         >
//                           <input
//                             type="checkbox"
//                             checked={checked}
//                             disabled={!canManage}
//                             onChange={() => togglePermission(perm.id)}
//                             className="mt-0.5 h-4 w-4 cursor-pointer accent-form-check-accent disabled:cursor-not-allowed disabled:opacity-60"
//                           />
//                           <div className="min-w-0 flex-1">
//                             <p className="text-xs font-medium text-ink-800">
//                               {perm.label || perm.name}
//                             </p>
//                             <p className="mt-0.5 truncate font-mono text-[10px] text-ink-500">
//                               {perm.name}
//                             </p>
//                           </div>
//                         </label>
//                       );
//                     })}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const InfoItem = ({ icon: Icon, label, children }) => (
//   <div className="flex items-start gap-2">
//     <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
//     <div className="min-w-0 flex-1">
//       <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
//         {label}
//       </p>
//       <div className="mt-0.5 break-words text-sm font-medium text-ink-800">
//         {children}
//       </div>
//     </div>
//   </div>
// );

// export default RoleDetail;

// src/features/patent/pages/roles/RoleDetail.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiShield,
  FiUser,
  FiClock,
  FiTag,
  FiList,
  FiSave,
  FiLock,
} from "react-icons/fi";
import {
  useRole,
  useAvailablePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from "../../queries/roles";
import Loader from "../../common/Loader";
import { usePermission } from "../../hooks/usePermission";

const humanize = (key = "") =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};

// Sort permissions within a module: view first, then manage, then others
const sortPermissions = (perms = []) => {
  const rank = (p) => {
    const name = (p.name || "").split(".").pop();
    if (name === "view") return 0;
    if (name === "manage") return 1;
    return 2;
  };
  return [...perms].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return (a.label || a.name || "").localeCompare(b.label || b.name || "");
  });
};

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("roles", "view");
  const canManage = can("roles", "manage");

  const { data: role, isLoading: roleLoading } = useRole(id, {
    enabled: canView,
  });
  const { data: catalogue, isLoading: catalogueLoading } =
    useAvailablePermissions({ enabled: canView });
  const { data: assigned, isLoading: assignedLoading } = useRolePermissions(
    id,
    {
      enabled: canView,
    },
  );
  const updatePermissions = useUpdateRolePermissions();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [initialized, setInitialized] = useState(false);

  // Initialize selection from assigned permissions (once)
  useEffect(() => {
    if (!initialized && assigned?.permissionIds) {
      setSelectedIds(new Set(assigned.permissionIds));
      setInitialized(true);
    }
  }, [assigned?.permissionIds, initialized]);

  const grouped = catalogue?.grouped || {};

  const isDirty = useMemo(() => {
    if (!assigned?.permissionIds) return false;
    const initial = new Set(assigned.permissionIds);
    if (initial.size !== selectedIds.size) return true;
    for (const id of selectedIds) {
      if (!initial.has(id)) return true;
    }
    return false;
  }, [assigned?.permissionIds, selectedIds]);

  // Helper: find the "view" permission of a module from grouped data
  const getViewPermissionId = (module) => {
    const perms = grouped[module] || [];
    const viewPerm = perms.find((p) => (p.name || "").endsWith(".view"));
    return viewPerm?.id;
  };

  // Helper: find the "manage" permission of a module
  const getManagePermission = (module) => {
    const perms = grouped[module] || [];
    return perms.find((p) => (p.name || "").endsWith(".manage"));
  };

  // Toggle a single permission with cascade rules
  const togglePermission = (perm, module) => {
    if (!canManage) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isView = (perm.name || "").endsWith(".view");
      const isManage = (perm.name || "").endsWith(".manage");

      if (next.has(perm.id)) {
        // ---- UNCHECKING ----
        next.delete(perm.id);
        // If unchecking "view", also remove "manage" (manage requires view)
        if (isView) {
          const managePerm = getManagePermission(module);
          if (managePerm) next.delete(managePerm.id);
        }
        // If unchecking "manage", view stays as-is
      } else {
        // ---- CHECKING ----
        next.add(perm.id);
        // If checking "manage", also auto-check "view"
        if (isManage) {
          const viewId = getViewPermissionId(module);
          if (viewId) next.add(viewId);
        }
      }
      return next;
    });
  };

  // Toggle whole module (Select all / Clear all)
  const toggleModule = (module, permList, checkAll) => {
    if (!canManage) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checkAll) {
        permList.forEach((p) => next.add(p.id));
      } else {
        permList.forEach((p) => next.delete(p.id));
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!canManage) return;
    updatePermissions.mutate({
      roleId: id,
      permissionIds: Array.from(selectedIds),
    });
  };

  // ==================== PAGE ACCESS GUARD ====================
  if (!canView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to view roles. Please contact your
          administrator.
        </p>
        <button
          onClick={() => navigate("/roles")}
          className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          Back to Roles
        </button>
      </div>
    );
  }

  if (roleLoading) {
    return <Loader text="Loading role..." />;
  }

  if (!role) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/roles")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-ink-900">Role Not Found</h1>
        </div>
        <div className="rounded-card border border-ink-100 bg-surface p-10 text-center">
          <p className="text-sm text-ink-500">
            The role you are looking for does not exist.
          </p>
          <button
            onClick={() => navigate("/roles")}
            className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  const totalSelected = selectedIds.size;
  const totalAvailable = catalogue?.list?.length || 0;

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/roles")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink-900">{role.label}</h1>
          <p className="mt-1 text-sm text-ink-500">
            Role details and permission assignment
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role.is_system && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-3 py-1 text-xs font-medium text-warn-900">
              <FiShield className="h-3.5 w-3.5" />
              System Role
            </span>
          )}
          {role.is_provider && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800">
              Provider
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              role.status
                ? "bg-brand-50 text-brand-700"
                : "bg-ink-100 text-ink-600"
            }`}
          >
            {role.status ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Role Info Card */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
            Role Information
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={FiTag} label="Role Key">
            <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs text-ink-700">
              {role.name}
            </code>
          </InfoItem>
          <InfoItem icon={FiUser} label="Label">
            {role.label}
          </InfoItem>
          <InfoItem icon={FiList} label="Sort Order">
            {role.sort_order ?? 0}
          </InfoItem>
          <div className="sm:col-span-2 lg:col-span-3">
            <InfoItem icon={FiList} label="Description">
              {role.description || "—"}
            </InfoItem>
          </div>
          <InfoItem icon={FiClock} label="Created At">
            {formatDate(role.created_at)}
          </InfoItem>
          <InfoItem icon={FiClock} label="Updated At">
            {formatDate(role.updated_at)}
          </InfoItem>
          {typeof role.admins_count === "number" && (
            <InfoItem icon={FiUser} label="Assigned Admins">
              {role.admins_count}
            </InfoItem>
          )}
        </div>
      </div>

      {/* Permissions Card */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="flex flex-col gap-2 border-b border-ink-100 bg-ink-50/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Permissions
            </p>
            <p className="mt-0.5 text-[11px] text-ink-500">
              {totalSelected} of {totalAvailable} selected
              {!canManage && " • Read-only"}
            </p>
          </div>
        </div>

        {catalogueLoading || assignedLoading ? (
          <div className="px-5 py-10">
            <Loader text="Loading permissions..." />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-ink-500">
              No permissions available in the system.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {Object.entries(grouped).map(([module, rawPerms]) => {
              const perms = sortPermissions(rawPerms);
              const allSelected = perms.every((p) => selectedIds.has(p.id));
              return (
                <div key={module} className="px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">
                        {humanize(module)}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                        {perms.filter((p) => selectedIds.has(p.id)).length}/
                        {perms.length}
                      </span>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleModule(module, perms, !allSelected)
                        }
                        className="cursor-pointer text-xs font-medium text-brand-700 hover:text-brand-800"
                      >
                        {allSelected ? "Clear all" : "Select all"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {perms.map((perm) => {
                      const checked = selectedIds.has(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition ${
                            canManage ? "cursor-pointer" : "cursor-default"
                          } ${
                            checked
                              ? "border-brand-300 bg-brand-50/40"
                              : "border-ink-200 hover:border-ink-300 hover:bg-ink-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canManage}
                            onChange={() => togglePermission(perm, module)}
                            className="mt-0.5 h-4 w-4 cursor-pointer accent-form-check-accent disabled:cursor-not-allowed disabled:opacity-60"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-ink-800">
                              {perm.label || perm.name}
                            </p>
                            <p className="mt-0.5 truncate font-mono text-[10px] text-ink-500">
                              {perm.name}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Save Bar */}
      {canManage && (
        <div className="sticky bottom-0 z-20 -mx-1 mt-2 border-t border-ink-100 bg-surface/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-ink-500">
              {isDirty ? (
                <span className="font-medium text-warn-700">
                  Unsaved changes
                </span>
              ) : (
                "All changes saved"
              )}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || updatePermissions.isPending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-5 py-2 text-sm font-medium text-btn-primary-text transition-colors hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatePermissions.isPending ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              Save Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <div className="mt-0.5 break-words text-sm font-medium text-ink-800">
        {children}
      </div>
    </div>
  </div>
);

export default RoleDetail;
