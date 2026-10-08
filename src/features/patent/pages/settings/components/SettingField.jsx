import { useState, useEffect, useRef } from "react";
import { FiEye, FiEyeOff, FiLock, FiUpload, FiX } from "react-icons/fi";
import {
  useUpdateSetting,
  useUploadFileSetting,
  getFileUrl,
} from "../../../queries/settings";
import { PhoneInputField, validatePhone } from "../../../common/form";

const formatLabel = (key) => {
  if (!key) return "";
  return key
    .split("_")
    .map((word) => {
      const lower = word.toLowerCase();
      if (["url", "id", "api", "smtp", "ai"].includes(lower)) {
        return lower.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

// Detect if a setting key represents a phone number
const isPhoneKey = (key) => {
  if (!key) return false;
  return /phone|mobile|whatsapp|contact_number|contact_no/i.test(key);
};

const SettingField = ({ setting, value, onChange }) => {
  if (setting.is_sensitive || setting.type === "password") {
    return (
      <SensitiveField setting={setting} value={value} onChange={onChange} />
    );
  }

  switch (setting.type) {
    case "boolean":
      return (
        <BooleanField setting={setting} value={value} onChange={onChange} />
      );
    case "text":
      return (
        <TextareaField setting={setting} value={value} onChange={onChange} />
      );
    case "integer":
      return (
        <NumberField setting={setting} value={value} onChange={onChange} />
      );
    case "url":
      return <UrlField setting={setting} value={value} onChange={onChange} />;
    case "json":
      return <JsonField setting={setting} value={value} onChange={onChange} />;
    case "file":
      return <FileField setting={setting} value={value} />;
    case "string":
    default:
      // Phone-like keys get the PhoneInputField treatment
      if (isPhoneKey(setting.key)) {
        return (
          <PhoneField setting={setting} value={value} onChange={onChange} />
        );
      }
      return (
        <StringField setting={setting} value={value} onChange={onChange} />
      );
  }
};

// ==================== WRAPPER ====================
const FieldWrapper = ({ label, help, children, status }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <label className="text-[13px] font-medium text-ink-800">{label}</label>
      {status === false && (
        <span className="inline-flex items-center rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-500">
          Inactive
        </span>
      )}
    </div>
    {children}
    {help && <p className="text-[11px] leading-relaxed text-ink-500">{help}</p>}
  </div>
);

const inputCls =
  "h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-[13px] text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const textareaCls =
  "w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

// ==================== STRING ====================
const StringField = ({ setting, value, onChange }) => (
  <FieldWrapper label={formatLabel(setting.key)} status={setting.status}>
    <input
      type="text"
      value={value ?? ""}
      maxLength={150}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${formatLabel(setting.key).toLowerCase()}`}
      className={inputCls}
    />
  </FieldWrapper>
);

// ==================== PHONE ====================
const PhoneField = ({ setting, value, onChange }) => (
  <PhoneInputField
    name={setting.key}
    label={formatLabel(setting.key)}
    placeholder={`Enter ${formatLabel(setting.key).toLowerCase()}`}
    defaultCountry="IN"
    isFormik={false}
    value={value ?? ""}
    onChange={(val) => onChange(val || "")}
  />
);

// ==================== TEXTAREA ====================
const TextareaField = ({ setting, value, onChange }) => (
  <FieldWrapper label={formatLabel(setting.key)} status={setting.status}>
    <textarea
      rows={3}
      value={value ?? ""}
      maxLength={500}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${formatLabel(setting.key).toLowerCase()}`}
      className={textareaCls}
    />
  </FieldWrapper>
);

// ==================== NUMBER ====================
const NumberField = ({ setting, value, onChange }) => (
  <FieldWrapper label={formatLabel(setting.key)} status={setting.status}>
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? "" : Number(e.target.value))
      }
      placeholder="0"
      className={inputCls}
    />
  </FieldWrapper>
);

// ==================== URL ====================
const UrlField = ({ setting, value, onChange }) => (
  <FieldWrapper label={formatLabel(setting.key)} status={setting.status}>
    <input
      type="url"
      value={value ?? ""}
      maxLength={500}
      onChange={(e) => onChange(e.target.value)}
      placeholder="https://example.com"
      className={inputCls}
    />
  </FieldWrapper>
);

// ==================== BOOLEAN ====================
const BooleanField = ({ setting, value, onChange }) => {
  const isOn = !!value;
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-ink-200 bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink-800">
          {formatLabel(setting.key)}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-500">
          {isOn ? "Enabled" : "Disabled"}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        onClick={() => onChange(!isOn)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
          isOn ? "bg-brand-600" : "bg-ink-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isOn ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
};

// ==================== JSON ====================
const JsonField = ({ setting, value, onChange }) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof value === "object" && value !== null) {
      setText(JSON.stringify(value, null, 2));
    } else {
      setText(value || "");
    }
  }, [value]);

  const handleChange = (v) => {
    setText(v);
    try {
      const parsed = v.trim() === "" ? null : JSON.parse(v);
      setError("");
      onChange(parsed);
    } catch {
      setError("Invalid JSON format");
    }
  };

  return (
    <FieldWrapper
      label={formatLabel(setting.key)}
      status={setting.status}
      help={!error ? "Enter valid JSON" : undefined}
    >
      <textarea
        rows={5}
        value={text}
        maxLength={5000}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="{ }"
        className={`w-full resize-y rounded-lg border bg-surface px-3 py-2 font-mono text-xs leading-relaxed text-ink-800 outline-none transition ${
          error
            ? "border-danger-500 focus:ring-2 focus:ring-danger-500/15"
            : "border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        }`}
      />
      {error && (
        <p className="text-[11px] font-medium text-danger-600">{error}</p>
      )}
    </FieldWrapper>
  );
};

// ==================== SENSITIVE ====================
const SensitiveField = ({ setting, value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const [show, setShow] = useState(false);
  const updateMutation = useUpdateSetting();

  if (!editing) {
    return (
      <FieldWrapper label={formatLabel(setting.key)} status={setting.status}>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 bg-ink-50/50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-[13px] text-ink-600">
            <FiLock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium">
              {value ? "Configured" : "Not configured"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 cursor-pointer rounded-md border border-ink-200 bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Change
          </button>
        </div>
      </FieldWrapper>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: setting.id,
        payload: {
          group: setting.group,
          key: setting.key,
          value: localValue,
          type: setting.type,
          is_public: setting.is_public,
          status: setting.status,
        },
      },
      {
        onSuccess: () => {
          setEditing(false);
          setLocalValue("");
          setShow(false);
        },
      },
    );
  };

  return (
    <FieldWrapper
      label={formatLabel(setting.key)}
      status={setting.status}
      help="New value will be saved securely. Existing value cannot be viewed."
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={localValue}
            maxLength={128}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder="Enter new value"
            autoFocus
            className={`${inputCls} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-ink-400 transition hover:text-ink-700"
          >
            {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!localValue || updateMutation.isPending}
            className="flex-1 cursor-pointer rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold text-surface transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setLocalValue("");
              setShow(false);
            }}
            className="flex-1 cursor-pointer rounded-md border border-ink-200 bg-surface px-4 py-2 text-xs font-medium text-ink-700 transition hover:bg-ink-50 sm:flex-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </FieldWrapper>
  );
};

// ==================== FILE ====================
const FileField = ({ setting, value }) => {
  const fileInputRef = useRef(null);
  const uploadMutation = useUploadFileSetting();

  const [localPreview, setLocalPreview] = useState(null);
  const [uploadedValue, setUploadedValue] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentValue = uploadedValue ?? value;
  const displayUrl = localPreview || getFileUrl(currentValue);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setLocalPreview(ev.target.result);
    reader.readAsDataURL(file);

    uploadMutation.mutate(
      { id: setting.id, setting, file },
      {
        onSuccess: (response) => {
          const newValue = response?.data?.value || response?.value || null;
          if (newValue) {
            setUploadedValue(newValue);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: () => {
          setLocalPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  const handleImageClick = () => {
    if (displayUrl) setPreviewOpen(true);
  };

  const isImage = displayUrl && !displayUrl.endsWith(".pdf");

  return (
    <>
      <FieldWrapper label={formatLabel(setting.key)} status={setting.status}>
        <div className="rounded-lg border border-ink-200 bg-surface p-3">
          {displayUrl ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleImageClick}
                title="Click to preview"
                className="group flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-ink-100 bg-ink-50 transition hover:border-brand-300 hover:ring-2 hover:ring-brand-500/20"
              >
                {isImage ? (
                  <img
                    src={displayUrl}
                    alt={setting.key}
                    className="h-full w-full object-contain transition group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-medium text-ink-500">
                    FILE
                  </span>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-ink-700">
                  {uploadMutation.isPending ? "Uploading..." : "Current file"}
                </p>
                <p
                  className="mt-0.5 truncate font-mono text-[10px] text-ink-500"
                  title={currentValue || ""}
                >
                  {localPreview ? "New file selected" : currentValue || "—"}
                </p>
                {isImage && (
                  <p className="mt-0.5 text-[10px] text-brand-600">
                    Click image to preview
                  </p>
                )}
              </div>

              {uploadMutation.isPending && (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              )}
            </div>
          ) : (
            <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-ink-200 bg-ink-50/40">
              <p className="text-xs text-ink-500">No file uploaded yet</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={`file-input-${setting.id}`}
            />
            <label
              htmlFor={`file-input-${setting.id}`}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 ${
                uploadMutation.isPending ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <FiUpload className="h-3.5 w-3.5" />
              {uploadMutation.isPending
                ? "Uploading..."
                : currentValue
                  ? "Replace File"
                  : "Upload File"}
            </label>
          </div>

          <p className="mt-2 text-[10px] text-ink-500">
            Accepted: images. Max size depends on server configuration.
          </p>
        </div>
      </FieldWrapper>

      {/* Preview Modal */}
      {previewOpen && displayUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            title="Close"
          >
            <FiX className="h-5 w-5" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayUrl}
              alt={setting.key}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <p className="mt-3 text-center text-xs text-white/70">
              {formatLabel(setting.key)}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingField;
