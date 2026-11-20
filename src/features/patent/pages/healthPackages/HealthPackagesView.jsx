// src/features/patent/pages/healthPackages/HealthPackagesView.jsx

import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiTag,
  FiFileText,
  FiMessageSquare,
  FiLock,
} from "react-icons/fi";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import {
  useHealthPackage,
  useDeleteHealthPackage,
} from "../../queries/healthPackages";
import { usePermission } from "../../hooks/usePermission";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `₹${Number(value).toFixed(2)}`;
};

const HealthPackagesView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canView = can("services", "view");
  const canManage = can("services", "manage");

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: pkg, isLoading } = useHealthPackage(id, { enabled: canView });
  const deleteMutation = useDeleteHealthPackage();

  const safeContent = useMemo(
    () => (pkg?.content ? DOMPurify.sanitize(pkg.content) : ""),
    [pkg?.content],
  );

  const handleConfirmDelete = () => {
    if (!canManage) return;
    deleteMutation.mutate(id, {
      onSuccess: () => navigate("/health-packages"),
      onSettled: () => setDeleteOpen(false),
    });
  };

  if (permLoading && !canView) return <Loader text="Checking permissions..." />;

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
          You do not have permission to view health packages.
        </p>
        <button
          onClick={() => navigate("/health-packages")}
          className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading package details..." />;
  if (!pkg || pkg.is_health_package === false)
    return <div className="p-16 text-center">Package not found</div>;

  const packagePrice = Number(pkg.service_price || 0);
  const offerPrice = Number(pkg.offer_price || 0);
  const discountPercent =
    packagePrice > 0 && offerPrice < packagePrice
      ? Math.round(((packagePrice - offerPrice) / packagePrice) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/health-packages")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              {pkg.name}
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              Health Package Details
            </p>
          </div>
        </div>

        {/* Option A: Hide Edit/Delete if !canManage */}
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/health-packages/${id}/edit`)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              <FiEdit2 className="h-4 w-4" /> Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-danger-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger-600"
            >
              <FiTrash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Rest of the UI remains the same... */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
        {/* ... (Image, description, pricing, etc.) ... */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
            <div className="flex aspect-square w-full items-center justify-center bg-ink-50 p-4">
              {pkg.image ? (
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <FiImage className="h-12 w-12 text-ink-300" />
              )}
            </div>
            <div className="border-t border-ink-100 p-4 bg-white">
              <div className="text-xs text-ink-600 space-y-1.5">
                <p>
                  <span className="font-medium text-ink-900">Size:</span> 216 x
                  216 px
                </p>
                <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
              </div>
            </div>
          </div>
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-2 font-jakarta text-lg font-semibold text-ink-900">
              About this package
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-ink-600">
              {pkg.description || "No description provided."}
            </p>
            <div className="flex flex-wrap gap-2">
              {pkg.is_active ? (
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500">
                  Inactive
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                Package #{pkg.id}
              </span>
            </div>
            <div className="mt-4 space-y-1 border-t border-ink-100 pt-4 text-xs text-ink-500">
              <p>Created: {formatDate(pkg.created_at)}</p>
              <p>Updated: {formatDate(pkg.updated_at)}</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* ... Pricing, Success message, Content ... */}
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
              <FiTag className="h-5 w-5 text-brand-600" /> Package Pricing
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-ink-500">
                  Package Price
                </p>
                <p className="mt-1 font-jakarta text-xl font-bold text-ink-400 line-through">
                  {formatPrice(pkg.service_price)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Offer Price</p>
                <p className="mt-1 font-jakarta text-2xl font-bold text-brand-700">
                  {formatPrice(pkg.offer_price)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Discount</p>
                <p className="mt-1 font-jakarta text-xl font-bold text-ink-900">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
              <FiMessageSquare className="h-5 w-5 text-brand-600" /> Booking
              Success Message
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {pkg.success_message || "No success message provided."}
            </p>
          </div>
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
              <FiFileText className="h-5 w-5 text-brand-600" /> Package Content
            </h2>
            {safeContent ? (
              <div className="ql-snow">
                <div
                  className="ql-editor !p-0 text-sm text-ink-700"
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                />
              </div>
            ) : (
              <p className="text-sm italic text-ink-500">
                No content provided.
              </p>
            )}
          </div>
        </div>
      </div>

      {canManage && (
        <ConfirmModal
          open={deleteOpen}
          title="Delete Health Package"
          message="Are you sure you want to delete this package?"
          confirmText="Delete"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteOpen(false)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default HealthPackagesView;
