import { useState, useEffect, useMemo } from "react";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import { useUpdateSetting } from "../../../queries/settings";
import SettingField from "./SettingField";

const SettingsGroupTab = ({ group, settings = [] }) => {
  const updateMutation = useUpdateSetting();

  const [values, setValues] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const init = {};
    settings.forEach((s) => {
      init[s.id] = s.value;
    });
    setValues(init);
  }, [settings]);

  const handleChange = (id, newValue) => {
    setValues((prev) => ({ ...prev, [id]: newValue }));
  };

  const handleSave = (setting) => {
    setSavingId(setting.id);
    const payload = {
      group: setting.group,
      key: setting.key,
      value: values[setting.id],
      type: setting.type,
      is_public: setting.is_public,
      status: setting.status,
    };

    updateMutation.mutate(
      { id: setting.id, payload },
      {
        onSettled: () => setSavingId(null),
      },
    );
  };

  const changedCount = useMemo(
    () => settings.filter((s) => values[s.id] !== s.value).length,
    [settings, values],
  );

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
      {/* Restricted notice */}
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

      {/* Settings list */}
      <div className="divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-100 bg-surface">
        {settings.map((setting) => {
          const isSaving = savingId === setting.id;
          const hasChanged = values[setting.id] !== setting.value;

          return (
            <div
              key={setting.id}
              className={`transition-colors ${
                hasChanged ? "bg-brand-50/20" : "hover:bg-ink-50/30"
              }`}
            >
              <div className="px-5 py-5 sm:px-6">
                <SettingField
                  setting={setting}
                  value={values[setting.id]}
                  onChange={(v) => handleChange(setting.id, v)}
                />

                {/* Save button — only when changed or saving */}
                {(hasChanged || isSaving) && (
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

      {/* Unsaved indicator */}
      {changedCount > 0 && (
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
