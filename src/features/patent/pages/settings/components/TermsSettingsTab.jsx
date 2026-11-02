// src/features/patent/pages/settings/components/TermsSettingsTab.jsx

import { useState, useEffect, useMemo } from "react";
import { FiSave } from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Loader from "../../../common/Loader";
import {
  useContentPage,
  useUpdateContentPage,
  useCreateContentPage,
} from "../../../queries/contentPages";

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

const TermsSettingsTab = () => {
  // isLoading true hoga jab tak API fetch nahi hoti
  const { data: response, isLoading } = useContentPage("terms_and_conditions");

  // Safe data extraction
  const apiData = response?.data || response;

  const updateMutation = useUpdateContentPage();
  const createMutation = useCreateContentPage();

  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isQuillReady, setIsQuillReady] = useState(false);

  // Data aate hi content set karo aur Quill ko ready karo
  useEffect(() => {
    if (apiData) {
      setContent(apiData.content || "");
      setIsQuillReady(true);
    }
  }, [apiData]);

  const hasChanged = useMemo(() => {
    const initialContent = apiData?.content || "";
    return content !== initialContent;
  }, [content, apiData]);

  // 🔥 FIX: Jab tak API loading hai ya Quill ready nahi hai, tab tak loader dikhao
  if (isLoading || !isQuillReady) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-ink-100 bg-surface">
        <Loader />
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("key", "terms_and_conditions");
    formData.append("heading", apiData?.heading || "Terms and Conditions");
    formData.append("content", content);

    if (apiData?.id) {
      formData.append("_method", "PUT");
      updateMutation.mutate(
        { id: apiData.id, payload: formData },
        { onSettled: () => setIsSaving(false) },
      );
    } else {
      createMutation.mutate(formData, {
        onSettled: () => setIsSaving(false),
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-ink-100 bg-surface">
        <div className="px-5 py-5 sm:px-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-ink-800">
                Terms and Conditions Content
              </label>
            </div>

            <div
              className="quill-wrapper overflow-hidden rounded-lg border border-form-border bg-form-bg"
              style={{ "--quill-min-height": "300px" }}
            >
              {/* value={content} use karo */}
              <ReactQuill
                theme="snow"
                value={content}
                onChange={(val) => setContent(val)}
                modules={quillModules}
                placeholder="Write your terms and conditions here..."
              />
            </div>
          </div>

          {(hasChanged || isSaving) && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !content}
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

export default TermsSettingsTab;
