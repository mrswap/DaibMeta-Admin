// src/features/patent/pages/healthTips/HealthTipsView.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import ConfirmModal from "../../common/ConfirmModal";
import { HEALTH_TIPS } from "./healthTipsData";

const HealthTipsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tips, setTips] = useState(HEALTH_TIPS);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const tip = tips.find((t) => t.id === Number(id));

  const handleConfirmDelete = () => {
    setTips((prev) => prev.filter((t) => t.id !== Number(id)));
    setDeleteOpen(false);
    navigate("/health-tips");
  };

  if (!tip) {
    return (
      <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
        <h3 className="font-jakarta text-base font-semibold text-ink-900">
          Health tip not found
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          The tip you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/health-tips")}
          className="mt-4 cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Back to Health Tips
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/health-tips")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              {tip.heading}
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">Health Tip Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/health-tips/${id}/edit`)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
          >
            <FiEdit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-danger-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger-600"
          >
            <FiTrash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
        {/* Image */}
        <div className="h-64 w-full overflow-hidden bg-ink-50">
          {tip.image ? (
            <img
              src={tip.image}
              alt={tip.heading}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FiImage className="h-12 w-12 text-ink-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {tip.tag && (
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200">
                {tip.tag}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
              Tip #{tip.id}
            </span>
            {tip.is_active ? (
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500">
                Inactive
              </span>
            )}
          </div>

          <div>
            <h2 className="font-jakarta text-lg font-semibold text-ink-900">
              {tip.heading}
            </h2>
            <div
              className="prose prose-sm mt-3 max-w-none text-sm leading-relaxed text-ink-700"
              dangerouslySetInnerHTML={{ __html: tip.content }}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Delete Health Tip"
        message="Are you sure you want to delete this health tip? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={false}
      />
    </div>
  );
};

export default HealthTipsView;
