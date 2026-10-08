// src/features/patent/pages/visits/components/tabs/DocumentsTab.jsx

import { useState, useRef, useMemo } from "react";
import {
  FiUpload,
  FiTrash2,
  FiFile,
  FiImage,
  FiX,
  FiPaperclip,
  FiExternalLink,
} from "react-icons/fi";
import {
  useVisitDocuments,
  useUploadDocument,
  useDeleteDocument,
  DOCUMENT_TYPES,
} from "../../../../queries/visits";
import { FilterSelect } from "../../../../common/form";
import Loader from "../../../../common/Loader";
import ConfirmModal from "../../../../common/ConfirmModal";

// ==================== HELPERS ====================
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const getFileUrl = (filePath) => {
  if (!filePath) return "#";
  if (filePath.startsWith("http")) return filePath;
  const base = "https://daibmeta.netswaptech.com";
  return `${base}/${filePath.replace(/^\/+/, "")}`;
};

// ==================== MAIN ====================
const DocumentsTab = ({ visitId }) => {
  const { data: documents, isLoading } = useVisitDocuments(visitId);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [docType, setDocType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, item: null });

  const fileInputRef = useRef(null);

  // Group documents by type
  const grouped = useMemo(() => {
    const groups = {};
    DOCUMENT_TYPES.forEach((t) => {
      groups[t.value] = [];
    });
    (Array.isArray(documents) ? documents : []).forEach((doc) => {
      const key = doc.document_type || "other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    });
    return groups;
  }, [documents]);

  const totalDocs = Array.isArray(documents) ? documents.length : 0;

  // ==================== HANDLERS ====================
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!docType || !selectedFile) return;
    uploadMutation.mutate(
      {
        visitId,
        documentType: docType.value,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          handleUploadCancel();
        },
      },
    );
  };

  const handleUploadCancel = () => {
    setUploadOpen(false);
    setDocType(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteClick = (item) => {
    setConfirm({ open: true, item });
  };

  const handleDeleteConfirm = () => {
    const { item } = confirm;
    if (!item) return;
    deleteMutation.mutate(
      { documentId: item.id },
      {
        onSettled: () => setConfirm({ open: false, item: null }),
      },
    );
  };

  // ==================== LOADING ====================
  if (isLoading) return <Loader text="Loading documents..." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 bg-ink-50/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FiPaperclip className="h-4 w-4 text-ink-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
            Medical Documents
          </p>
          <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
            {totalDocs}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
        >
          <FiUpload className="h-3.5 w-3.5" />
          Upload Document
        </button>
      </div>

      {/* Upload form */}
      {uploadOpen && (
        <div className="overflow-hidden rounded-xl border border-brand-200 bg-brand-50/30">
          <div className="flex items-center justify-between border-b border-brand-200 bg-brand-50/60 px-4 py-2.5">
            <p className="text-xs font-semibold text-brand-900">
              Upload New Document
            </p>
            <button
              type="button"
              onClick={handleUploadCancel}
              disabled={uploadMutation.isPending}
              className="cursor-pointer rounded-md p-1 text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Document Type <span className="text-form-required">*</span>
              </label>
              <FilterSelect
                value={docType}
                onChange={setDocType}
                options={DOCUMENT_TYPES.map((d) => ({
                  value: d.value,
                  label: d.label,
                }))}
                placeholder="Select document type..."
                isClearable
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                File <span className="text-form-required">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id={`doc-upload-${visitId}`}
                />
                <label
                  htmlFor={`doc-upload-${visitId}`}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
                >
                  <FiUpload className="h-3.5 w-3.5" />
                  {selectedFile ? "Change File" : "Choose File"}
                </label>
                {selectedFile && (
                  <span className="truncate text-xs text-ink-600">
                    {selectedFile.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-ink-500">
                Accepted: PDF, JPEG, PNG, WebP
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-brand-200 pt-3">
              <button
                type="button"
                onClick={handleUploadCancel}
                disabled={uploadMutation.isPending}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!docType || !selectedFile || uploadMutation.isPending}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiUpload className="h-3.5 w-3.5" />
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalDocs === 0 && !uploadOpen && (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiPaperclip className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm font-medium text-ink-700">No documents</p>
          <p className="mt-1 text-xs text-ink-500">
            Upload prescriptions, reports, or other medical documents.
          </p>
        </div>
      )}

      {/* Grouped documents */}
      {totalDocs > 0 && (
        <div className="space-y-4">
          {DOCUMENT_TYPES.map((type) => {
            const items = grouped[type.value] || [];
            if (items.length === 0) return null;

            return (
              <div
                key={type.value}
                className="overflow-hidden rounded-xl border border-ink-100 bg-surface"
              >
                <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                    {type.label}
                  </p>
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
                    {items.length}
                  </span>
                </div>

                <div className="divide-y divide-ink-100">
                  {items.map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      onDelete={() => handleDeleteClick(doc)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={confirm.open}
        title="Delete Document"
        message={`Are you sure you want to delete "${
          confirm.item?.original_name || "this document"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirm({ open: false, item: null })}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

// ==================== DOCUMENT ROW ====================
const DocumentRow = ({ doc, onDelete }) => {
  const isImage = doc.mime_type?.startsWith("image/");
  const Icon = isImage ? FiImage : FiFile;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">
          {doc.original_name || "—"}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-500">
          <span>{formatFileSize(doc.file_size)}</span>
          <span>·</span>
          <span>{formatDate(doc.created_at)}</span>
          {doc.uploaded_by?.name && (
            <>
              <span>·</span>
              <span>by {doc.uploaded_by.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {doc.file_path && (
          <a
            href={getFileUrl(doc.file_path)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open document"
            className="cursor-pointer rounded-lg p-1.5 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <FiExternalLink className="h-4 w-4" />
          </a>
        )}
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          className="cursor-pointer rounded-lg p-1.5 text-danger-500 transition hover:bg-danger-50"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DocumentsTab;
