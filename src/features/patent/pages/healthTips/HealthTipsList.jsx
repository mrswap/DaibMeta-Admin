// src/features/patent/pages/healthTips/HealthTipsList.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiBookOpen,
  FiEye,
} from "react-icons/fi";
import ConfirmModal from "../../common/ConfirmModal";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import { HEALTH_TIPS } from "./healthTipsData";

const HealthTipsList = () => {
  const navigate = useNavigate();
  const [tips, setTips] = useState(HEALTH_TIPS);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return tips;
    const q = search.toLowerCase();
    return tips.filter(
      (t) =>
        t.heading.toLowerCase().includes(q) ||
        (t.tag || "").toLowerCase().includes(q),
    );
  }, [tips, search]);

  const handleToggle = (id) => {
    setLoadingId(id);
    setTimeout(() => {
      setTips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t)),
      );
      setLoadingId(null);
    }, 300);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setTips((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Health Tips
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage health tips shown to patients on the app
          </p>
        </div>
        <button
          onClick={() => navigate("/health-tips/new")}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Tip
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-card border border-ink-100 bg-surface p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={150}
            placeholder="Search..."
            className="w-full rounded-lg border border-form-border bg-form-bg py-2.5 pl-10 pr-3 text-sm text-form-text placeholder:text-form-placeholder focus:border-form-border-focus focus:outline-none focus:ring-2 focus:ring-form-ring/20"
          />
        </div>
      </div>

      {/* Tips Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
            <FiBookOpen className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
            No health tips found
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            {search
              ? "Try adjusting your search."
              : "Add your first health tip to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tip) => (
            <div
              key={tip.id}
              className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
            >
              {/* Image */}
              <div className="relative h-40 w-full overflow-hidden bg-ink-50">
                {tip.image ? (
                  <img
                    src={tip.image}
                    alt={tip.heading}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FiImage className="h-10 w-10 text-ink-300" />
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <ToggleSwitch
                    isFormik={false}
                    variant="pill"
                    value={tip.is_active}
                    onChange={() => handleToggle(tip.id)}
                    loading={loadingId === tip.id}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-5">
                {tip.tag && (
                  <span className="mb-2 inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200">
                    {tip.tag}
                  </span>
                )}
                <h3 className="font-jakarta text-base font-semibold text-ink-900">
                  {tip.heading}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">
                  {tip.content}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                <button
                  onClick={() => navigate(`/health-tips/${tip.id}`)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                >
                  <FiEye className="h-4 w-4" />
                  View
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/health-tips/${tip.id}/edit`)}
                    className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600"
                    title="Edit tip"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(tip.id)}
                    className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-danger-600"
                    title="Delete tip"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Health Tip"
        message="Are you sure you want to delete this health tip? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={false}
      />
    </div>
  );
};

export default HealthTipsList;
