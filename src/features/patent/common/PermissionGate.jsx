// src/features/patent/common/PermissionGate.jsx

import { usePermission } from "../hooks/usePermission";

/**
 * Usage:
 *   <PermissionGate resource="patients" action="create">
 *     <button>Add Patient</button>
 *   </PermissionGate>
 *
 *   <PermissionGate permission="roles.view">
 *     <RoleList />
 *   </PermissionGate>
 *
 *   <PermissionGate any={[...]}>...</PermissionGate>
 *   <PermissionGate all={[...]}>...</PermissionGate>
 */
const PermissionGate = ({
  permission,
  resource,
  action,
  any,
  all,
  fallback = null,
  children,
}) => {
  const { has, can, hasAny, hasAll } = usePermission();

  let allowed = true;
  if (permission) {
    allowed = has(permission);
  } else if (resource) {
    allowed = can(resource, action || "view");
  } else if (Array.isArray(any) && any.length) {
    allowed = hasAny(any);
  } else if (Array.isArray(all) && all.length) {
    allowed = hasAll(all);
  }

  return allowed ? children : fallback;
};

export default PermissionGate;
