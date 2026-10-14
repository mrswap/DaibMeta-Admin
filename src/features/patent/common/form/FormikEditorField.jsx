// src/features/patent/common/form/FormikEditorField.jsx

import React, { useMemo, useRef } from "react";
import { Field } from "formik";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const MAX_IMAGE_SIZE_MB = 2;

/**
 * FormikEditorField — Lightweight rich text editor wrapper (React Quill)
 *
 * Usage:
 *   <FormikEditorField
 *     name="content"
 *     label="Content"
 *     placeholder="Enter content"
 *     required
 *   />
 */
const FormikEditorField = ({
  name,
  label,
  placeholder = "Write something...",
  required = false,
  className = "",
  minHeight = 200,
}) => {
  const quillRef = useRef(null);

  // ==================== IMAGE UPLOAD HANDLER ====================
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validation
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        alert(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
        return;
      }

      // Convert to base64 and insert
      const reader = new FileReader();
      reader.onload = () => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", reader.result);
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    };
  };

  // ==================== TOOLBAR CONFIG ====================
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
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
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [],
  );

  // ==================== FORMATS ====================
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
  ];

  return (
    <Field name={name}>
      {({ field, form, meta }) => (
        <div className={className}>
          {label && (
            <label className="mb-1.5 block text-sm font-medium text-form-label">
              {label}
              {required && <span className="ml-0.5 text-form-required">*</span>}
            </label>
          )}

          <div
            className="quill-wrapper overflow-hidden rounded-lg border border-form-border bg-form-bg"
            style={{ "--quill-min-height": `${minHeight}px` }}
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={field.value || ""}
              onChange={(html) => form.setFieldValue(name, html)}
              onBlur={() => form.setFieldTouched(name, true)}
              modules={modules}
              formats={formats}
              placeholder={placeholder}
            />
          </div>

          {meta.touched && meta.error && (
            <p className="mt-1 text-xs text-form-error">{meta.error}</p>
          )}
        </div>
      )}
    </Field>
  );
};

export default FormikEditorField;
