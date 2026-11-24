// src/features/patent/pages/visits/components/tabs/DocumentsTab.jsx

import { useState, useRef, useEffect } from "react";
import {
  FiUpload,
  FiCamera,
  FiTrash2,
  FiFile,
  FiImage,
  FiFileText,
  FiDownload,
  FiX,
  FiLock,
  FiEye,
  FiCheckCircle,
} from "react-icons/fi";
import {
  useVisitDocuments,
  useUploadDocument,
  useDeleteDocument,
  DOCUMENT_TYPES,
  getDocumentTypeLabel,
} from "../../../../queries/visits";
import Loader from "../../../../common/Loader";
import ConfirmModal from "../../../../common/ConfirmModal";
import { usePermission } from "../../../../hooks/usePermission";

// ==================== HELPERS ====================
const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const getFileIcon = (type, mime) => {
  if (mime?.startsWith("image/")) return FiImage;
  if (type === "prescription") return FiFileText;
  return FiFile;
};

const isImageFile = (mime) => mime?.startsWith("image/");

// Mobile/tablet: native camera app (capture input). Desktop: webcam modal.
const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
};

// ==================== MAIN ====================
const DocumentsTab = ({ visitId }) => {
  const { can } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("documents", "view");
  const canManage = can("documents", "manage");

  const { data: documents = [], isLoading } = useVisitDocuments(
    canView ? visitId : null,
  );

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const [selectedType, setSelectedType] = useState(
    DOCUMENT_TYPES[0]?.value || "other",
  );
  const [confirm, setConfirm] = useState({ open: false, item: null });

  // Server document preview (file_url se)
  const [preview, setPreview] = useState(null);

  // Abhi select/click kiya hua file — submit hone tak API hit nahi hogi
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingUrl, setPendingUrl] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Desktop webcam modal
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Camera modal khulte hi stream start, band hote hi stop
  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("unsupported");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) {
          setCameraError(
            "Camera open nahi ho paya. Browser me camera permission allow karein (HTTPS zaroori hai) ya Choose File se photo select karein.",
          );
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraReady(false);
    };
  }, [cameraOpen]);

  const handleTakePhoto = () => {
    if (isMobileDevice()) {
      // Mobile: phone ka native camera khulega
      cameraInputRef.current?.click();
    } else {
      // Desktop/laptop: system ka webcam modal khulega
      setCameraError("");
      setCameraReady(false);
      setCameraOpen(true);
    }
  };

  const closeCamera = () => setCameraOpen(false);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setPendingFile(file); // preview + Submit panel me jayegi
        setCameraOpen(false);
      },
      "image/jpeg",
      0.92,
    );
  };

  // Pending image ka local preview URL banao / cleanup karo
  useEffect(() => {
    if (!pendingFile || !isImageFile(pendingFile.type)) {
      setPendingUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  // ==================== FILE SELECT (NO API CALL) ====================
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && canManage) setPendingFile(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const clearPending = () => {
    setPendingFile(null);
  };

  // ==================== SUBMIT (API HIT) ====================
  const handleSubmit = () => {
    if (!pendingFile || !canManage) return;

    uploadMutation.mutate(
      {
        visitId,
        documentType: selectedType,
        file: pendingFile,
      },
      {
        onSuccess: () => {
          setPendingFile(null);
        },
      },
    );
  };

  const handleDeleteClick = (item) => {
    if (!canManage) return;
    setConfirm({ open: true, item });
  };

  const handleConfirmDelete = () => {
    if (!canManage) return;
    const { item } = confirm;
    if (!item) return;
    deleteMutation.mutate(
      { documentId: item.id },
      { onSettled: () => setConfirm({ open: false, item: null }) },
    );
  };

  // ==================== ACCESS DENIED ====================
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-900">Access Denied</p>
        <p className="mt-1 max-w-sm text-xs text-ink-500">
          You do not have permission to view documents. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  // ==================== LOADING ====================
  if (isLoading) return <Loader text="Loading documents..." />;

  const PendingIcon = pendingFile
    ? getFileIcon(selectedType, pendingFile.type)
    : FiFile;

  return (
    <div className="space-y-4">
      {/* Upload section — only if canManage */}
      {canManage && (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
          <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FiUpload className="h-4 w-4 text-ink-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Upload Document
              </p>
            </div>
          </div>

          <div className="space-y-3 p-4">
            {/* Document type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Document Type <span className="text-form-required">*</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={uploadMutation.isPending}
                className="h-10 w-full rounded-lg border border-form-border bg-surface px-3 text-sm outline-none focus:border-brand-500 disabled:opacity-60"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Select buttons */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiUpload className="h-4 w-4" />
                Choose File
              </button>

              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={uploadMutation.isPending}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiCamera className="h-4 w-4" />
                Take Photo
              </button>
            </div>

            {/* Selected file preview + Submit */}
            {pendingFile && (
              <div className="space-y-3 rounded-xl border border-ink-200 bg-ink-50/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                    Selected File
                  </p>
                  <button
                    type="button"
                    onClick={clearPending}
                    disabled={uploadMutation.isPending}
                    title="Remove"
                    className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-800 disabled:opacity-60"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>

                {pendingUrl ? (
                  <div className="overflow-hidden rounded-lg border border-ink-100 bg-surface p-2">
                    <img
                      src={pendingUrl}
                      alt={pendingFile.name}
                      className="mx-auto max-h-64 w-auto rounded-md object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-ink-100 bg-surface p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <PendingIcon className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-ink-500">
                      Preview not available for this file type.
                    </p>
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {pendingFile.name}
                  </p>
                  <p className="text-[11px] text-ink-500">
                    {getDocumentTypeLabel(selectedType)} ·{" "}
                    {formatFileSize(pendingFile.size)}
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={clearPending}
                    disabled={uploadMutation.isPending}
                    className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploadMutation.isPending}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-surface shadow-sm transition-all hover:bg-brand-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiCheckCircle className="h-4 w-4" />
                    {uploadMutation.isPending ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-ink-400">
              Supported: images, PDF, DOC, DOCX. Take Photo mobile par phone ka
              camera aur laptop/PC par webcam kholta hai. Photo khinchne ke baad
              preview dekh kar Submit karein.
            </p>
          </div>
        </div>
      )}

      {/* Documents list */}
      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiFile className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm font-medium text-ink-700">No documents yet</p>
          <p className="mt-1 text-xs text-ink-500">
            {canManage
              ? "Upload a file or take a photo to attach it to this visit."
              : "No documents have been uploaded for this visit."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {documents.map((doc) => {
            const Icon = getFileIcon(doc.document_type, doc.mime_type);
            const image = isImageFile(doc.mime_type);
            const docName =
              doc.original_name || doc.file_name || doc.name || "Document";

            return (
              <div
                key={doc.id}
                className="overflow-hidden rounded-xl border border-ink-100 bg-surface"
              >
                <div className="flex items-start gap-3 p-3">
                  {image && doc.file_url ? (
                    <button
                      type="button"
                      onClick={() => setPreview(doc)}
                      title="Preview"
                      className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-ink-100 bg-ink-50"
                    >
                      <img
                        src={doc.file_url}
                        alt={docName}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon className="h-4 w-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {docName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-500">
                      {getDocumentTypeLabel(doc.document_type)} ·{" "}
                      {formatFileSize(doc.file_size)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-400">
                      {formatDateTime(doc.created_at)}
                      {doc.uploaded_by?.name && ` · ${doc.uploaded_by.name}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {image && doc.file_url && (
                      <button
                        type="button"
                        onClick={() => setPreview(doc)}
                        title="Preview"
                        className="cursor-pointer rounded-lg p-1.5 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
                      >
                        <FiEye className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download"
                        className="cursor-pointer rounded-lg p-1.5 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
                      >
                        <FiDownload className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(doc)}
                        title="Delete"
                        className="cursor-pointer rounded-lg p-1.5 text-danger-500 transition hover:bg-danger-50"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop webcam modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeCamera} />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink-900">Take Photo</p>
              <button
                type="button"
                onClick={closeCamera}
                className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-black">
              {cameraError ? (
                <div className="px-4 py-10 text-center text-xs text-white">
                  {cameraError}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => setCameraReady(true)}
                  className="mx-auto max-h-[60vh] w-full object-contain"
                />
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCamera}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-surface shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiCamera className="h-4 w-4" />
                  Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview modal — file_url use hota hai */}
      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setPreview(null)}
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-ink-900">
                {preview.original_name ||
                  preview.file_name ||
                  preview.name ||
                  "Document"}
              </p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-ink-50/40 p-3">
              <img
                src={preview.file_url}
                alt={preview.original_name || "Document"}
                className="mx-auto max-h-[65vh] w-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation — only if canManage */}
      {canManage && (
        <ConfirmModal
          open={confirm.open}
          title="Delete Document"
          message="Are you sure you want to delete this document? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirm({ open: false, item: null })}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default DocumentsTab;
