// src/features/patent/pages/settings/components/ClinicPrivilegesSettingsTab.jsx

import { useState, useEffect, useMemo } from "react";
import { FiSave } from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Loader from "../../../common/Loader";
import { useSettings, useUpdateSetting } from "../../../queries/settings";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

const ClinicPrivilegesSettingsTab = () => {
  const { data: allSettings, isLoading } = useSettings();
  const updateMutation = useUpdateSetting();

  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isQuillReady, setIsQuillReady] = useState(false);

  // Find the clinic_privileges setting record
  const settingRecord = useMemo(() => {
    return (allSettings || []).find((s) => s.group === "clinic_privileges");
  }, [allSettings]);

  // Initialize from parsed JSON
  useEffect(() => {
    if (settingRecord) {
      try {
        const parsed = settingRecord.value
          ? typeof settingRecord.value === "string"
            ? JSON.parse(settingRecord.value)
            : settingRecord.value
          : {};
        setTitle(parsed.title || "");
        setButtonName(parsed.button_name || "");
        setDescription(parsed.description || "");
        setContent(parsed.content || "");
      } catch (e) {
        console.error("Failed to parse clinic_privileges JSON:", e);
      }
      setIsQuillReady(true);
    }
  }, [settingRecord]);

  // Determine if any changes were made
  const hasChanged = useMemo(() => {
    if (!settingRecord) return false;
    try {
      const parsed = settingRecord.value
        ? typeof settingRecord.value === "string"
          ? JSON.parse(settingRecord.value)
          : settingRecord.value
        : {};
      return (
        title !== (parsed.title || "") ||
        buttonName !== (parsed.button_name || "") ||
        description !== (parsed.description || "") ||
        content !== (parsed.content || "")
      );
    } catch {
      return true;
    }
  }, [title, buttonName, description, content, settingRecord]);

  if (isLoading || !isQuillReady) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-ink-100 bg-surface">
        <Loader />
      </div>
    );
  }

  if (!settingRecord) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
        <p className="text-sm font-medium text-ink-700">Setting not found</p>
        <p className="mt-1 text-xs text-ink-500">
          The clinic_privileges group is missing from the backend configuration.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);

    // Save as JSON object (backend type is json)
    const payloadValue = {
      title: title.trim(),
      button_name: buttonName.trim(),
      description: description.trim(),
      content: content,
    };

    updateMutation.mutate(
      {
        id: settingRecord.id,
        payload: {
          group: settingRecord.group,
          key: settingRecord.key,
          value: payloadValue,
          type: settingRecord.type, // json
          is_public: settingRecord.is_public,
          status: settingRecord.status,
        },
      },
      {
        onSettled: () => setIsSaving(false),
      },
    );
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-ink-100 bg-surface">
        <div className="px-5 py-5 sm:px-6 space-y-6">
          {/* Title and Button Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-ink-800">
                Title
              </label>
              <input
                type="text"
                value={title}
                maxLength={150}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-[13px] text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-ink-800">
                Button Name
              </label>
              <input
                type="text"
                value={buttonName}
                maxLength={50}
                onChange={(e) => setButtonName(e.target.value)}
                placeholder="Enter button name"
                className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-[13px] text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-ink-800">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-ink-800">
              Content
            </label>
            <div
              className="quill-wrapper overflow-hidden rounded-lg border border-form-border bg-form-bg"
              style={{ "--quill-min-height": "300px" }}
            >
              <ReactQuill
                theme="snow"
                value={content}
                onChange={(val) => setContent(val)}
                modules={quillModules}
                placeholder="Write the content here..."
              />
            </div>
          </div>

          {/* Save Button */}
          {(hasChanged || isSaving) && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved indicator */}
      {hasChanged && !isSaving && (
        <div className="pointer-events-none sticky bottom-4 z-10 flex justify-end">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-2 shadow-md">
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-warn-100 px-1 text-[11px] font-bold tabular-nums text-warn-800">
              1
            </span>
            <span className="text-xs font-medium text-ink-700">
              unsaved change
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicPrivilegesSettingsTab;
