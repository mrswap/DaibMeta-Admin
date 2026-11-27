// // src/features/patent/pages/settings/components/SettingsGroupTab.jsx

// import { useState, useEffect, useMemo, useRef } from "react";
// import { FiSave, FiAlertCircle } from "react-icons/fi";
// import { useUpdateSetting } from "../../../queries/settings";
// import SettingField from "./SettingField";

// // Normalize any backend representation of a boolean
// const parseBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v !== 0;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "1" || s === "true" || s === "yes" || s === "on";
//   }
//   return false;
// };

// // Normalize server value into the shape we store in local state
// const normalizeServerValue = (setting) =>
//   setting.type === "boolean" ? parseBool(setting.value) : setting.value;

// const SettingsGroupTab = ({ group, settings = [], canManage = false }) => {
//   const updateMutation = useUpdateSetting();

//   const [values, setValues] = useState({});
//   const [savingId, setSavingId] = useState(null);

//   // Track which setting ids we've already initialized, so a refetch
//   // (triggered by saving one field) does NOT wipe unsaved edits on others.
//   const initializedRef = useRef(new Set());
//   // Track the last server value we saw per id, so we can detect genuine
//   // server-side changes and re-sync only those fields.
//   const lastServerRef = useRef(new Map());

//   useEffect(() => {
//     setValues((prev) => {
//       const next = { ...prev };
//       let mutated = false;

//       settings.forEach((s) => {
//         const serverVal = normalizeServerValue(s);
//         const lastServer = lastServerRef.current.get(s.id);

//         const isNew = !initializedRef.current.has(s.id);
//         const serverChanged =
//           lastServer !== undefined &&
//           JSON.stringify(lastServer) !== JSON.stringify(serverVal);

//         if (isNew || serverChanged) {
//           next[s.id] = serverVal;
//           initializedRef.current.add(s.id);
//           lastServerRef.current.set(s.id, serverVal);
//           mutated = true;
//         }
//         // If neither: keep whatever the user has in local state (unsaved edit).
//       });

//       return mutated ? next : prev;
//     });
//   }, [settings]);

//   const handleChange = (id, newValue) => {
//     if (!canManage) return;
//     setValues((prev) => ({ ...prev, [id]: newValue }));
//   };

//   const handleSave = (setting) => {
//     if (!canManage) return;
//     setSavingId(setting.id);

//     const payload = {
//       group: setting.group,
//       key: setting.key,
//       value:
//         setting.type === "boolean"
//           ? values[setting.id]
//             ? 1
//             : 0
//           : values[setting.id],
//       type: setting.type,
//       is_public: setting.is_public,
//       status: setting.status,
//     };

//     // Optimistically record the new server value so the refetch that
//     // follows this mutation doesn't treat it as a "server change" and
//     // re-render other fields unnecessarily.
//     const normalized = normalizeServerValue({
//       ...setting,
//       value: payload.value,
//     });
//     lastServerRef.current.set(setting.id, normalized);

//     updateMutation.mutate(
//       { id: setting.id, payload },
//       {
//         onSettled: () => setSavingId(null),
//       },
//     );
//   };

//   const changedCount = useMemo(() => {
//     if (!canManage) return 0;
//     return settings.filter((s) => {
//       const initial = normalizeServerValue(s);
//       return values[s.id] !== initial;
//     }).length;
//   }, [settings, values, canManage]);

//   if (!settings.length) {
//     return (
//       <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
//         <p className="text-sm font-medium text-ink-700">No settings found</p>
//         <p className="mt-1 text-xs text-ink-500">
//           This group has no configuration keys yet.
//         </p>
//       </div>
//     );
//   }

//   const restrictedGroups = ["smtp", "openai", "firebase"];
//   const isRestricted = restrictedGroups.includes(group);

//   return (
//     <div className="space-y-3">
//       {/* Restricted notice */}
//       {isRestricted && (
//         <div className="flex items-start gap-3 rounded-lg border border-warn-200 bg-warn-50/50 px-4 py-3">
//           <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
//           <div className="min-w-0 flex-1">
//             <p className="text-xs font-semibold text-warn-900">
//               Backend-only configuration
//             </p>
//             <p className="mt-0.5 text-xs leading-relaxed text-warn-800">
//               Sensitive credentials are hidden for security. You can update
//               them, but existing values are never shown back.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Settings list */}
//       <div className="divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-100 bg-surface">
//         {settings.map((setting) => {
//           const isSaving = savingId === setting.id;
//           const initialValue = normalizeServerValue(setting);
//           const hasChanged = values[setting.id] !== initialValue;

//           return (
//             <div key={setting.id} className="transition-colors">
//               <div className="px-5 py-5 sm:px-6">
//                 <SettingField
//                   setting={setting}
//                   value={values[setting.id]}
//                   onChange={(v) => handleChange(setting.id, v)}
//                   canManage={canManage}
//                 />

//                 {/* Save button — only when changed or saving, AND canManage */}
//                 {canManage && (hasChanged || isSaving) && (
//                   <div className="mt-3 flex justify-end">
//                     <button
//                       type="button"
//                       onClick={() => handleSave(setting)}
//                       disabled={isSaving}
//                       className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
//                         isSaving
//                           ? "cursor-wait bg-ink-100 text-ink-500"
//                           : "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
//                       }`}
//                     >
//                       {isSaving ? (
//                         <>
//                           <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-400 border-t-transparent" />
//                           Saving
//                         </>
//                       ) : (
//                         <>
//                           <FiSave className="h-3.5 w-3.5" />
//                           Save
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Unsaved indicator */}
//       {canManage && changedCount > 0 && (
//         <div className="pointer-events-none sticky bottom-4 z-10 flex justify-end">
//           <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-2 shadow-md">
//             <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-warn-100 px-1 text-[11px] font-bold tabular-nums text-warn-800">
//               {changedCount}
//             </span>
//             <span className="text-xs font-medium text-ink-700">
//               unsaved {changedCount === 1 ? "change" : "changes"}
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SettingsGroupTab;

// src/features/patent/pages/settings/components/SettingsGroupTab.jsx

import { useState, useEffect, useMemo } from "react";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import { useUpdateSetting } from "../../../queries/settings";
import SettingField from "./SettingField";

const parseBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "on";
  }
  return false;
};

const normalizeServerValue = (setting) => {
  if (!setting) return "";
  if (setting.type === "boolean") return parseBool(setting.value);
  return setting.value !== null && setting.value !== undefined
    ? String(setting.value)
    : "";
};

const SettingsGroupTab = ({ group, settings = [], canManage = false }) => {
  const updateMutation = useUpdateSetting();
  const [values, setValues] = useState({});
  const [savingId, setSavingId] = useState(null);

  // API se data aane par state update karo
  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev };
      let changed = false;
      settings.forEach((s) => {
        if (next[s.id] === undefined) {
          next[s.id] = normalizeServerValue(s);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [settings]);

  const handleChange = (id, newValue) => {
    if (!canManage) return;
    setValues((prev) => ({ ...prev, [id]: newValue }));
  };

  const handleSave = (setting) => {
    if (!canManage) return;
    setSavingId(setting.id);

    const payload = {
      group: setting.group,
      key: setting.key,
      value:
        setting.type === "boolean"
          ? values[setting.id]
            ? 1
            : 0
          : values[setting.id],
      type: setting.type,
      is_public: setting.is_public,
      status: setting.status,
    };

    updateMutation.mutate(
      { id: setting.id, payload },
      { onSettled: () => setSavingId(null) },
    );
  };

  const changedCount = useMemo(() => {
    if (!canManage) return 0;
    return settings.filter((s) => {
      const initial = normalizeServerValue(s);
      return values[s.id] !== initial;
    }).length;
  }, [settings, values, canManage]);

  if (!settings.length) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
        <p className="text-sm font-medium text-ink-700">No settings found</p>
        <p className="mt-1 text-xs text-ink-500">
          This group has no configuration keys yet.
        </p>
      </div>
    );
  }

  const restrictedGroups = ["smtp", "openai", "firebase"];
  const isRestricted = restrictedGroups.includes(group);

  return (
    <div className="space-y-3">
      {isRestricted && (
        <div className="flex items-start gap-3 rounded-lg border border-warn-200 bg-warn-50/50 px-4 py-3">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-warn-900">
              Backend-only configuration
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-warn-800">
              Sensitive credentials are hidden for security. You can update
              them, but existing values are never shown back.
            </p>
          </div>
        </div>
      )}

      <div className="divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-100 bg-surface">
        {settings.map((setting) => {
          const isSaving = savingId === setting.id;
          const initialValue = normalizeServerValue(setting);
          const currentValue =
            values[setting.id] !== undefined
              ? values[setting.id]
              : initialValue;
          const hasChanged = currentValue !== initialValue;

          return (
            <div key={setting.id} className="transition-colors">
              <div className="px-5 py-5 sm:px-6">
                <SettingField
                  // ✅ THE FIX: Force SettingField (and ReactQuill) to remount when server data arrives
                  key={`${setting.id}-${currentValue?.length || 0}`}
                  setting={setting}
                  value={currentValue}
                  onChange={(v) => handleChange(setting.id, v)}
                  canManage={canManage}
                />

                {canManage && (hasChanged || isSaving) && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSave(setting)}
                      disabled={isSaving}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isSaving
                          ? "cursor-wait bg-ink-100 text-ink-500"
                          : "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-400 border-t-transparent" />
                          Saving
                        </>
                      ) : (
                        <>
                          <FiSave className="h-3.5 w-3.5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canManage && changedCount > 0 && (
        <div className="pointer-events-none sticky bottom-4 z-10 flex justify-end">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-2 shadow-md">
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-warn-100 px-1 text-[11px] font-bold tabular-nums text-warn-800">
              {changedCount}
            </span>
            <span className="text-xs font-medium text-ink-700">
              unsaved {changedCount === 1 ? "change" : "changes"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsGroupTab;
