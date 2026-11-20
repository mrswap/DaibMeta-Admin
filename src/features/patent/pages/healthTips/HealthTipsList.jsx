// src/features/patent/pages/healthTips/HealthTipsList.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiBookOpen,
  FiEye,
  FiLock,
} from "react-icons/fi";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import {
  useHealthTips,
  useDeleteHealthTip,
  useToggleHealthTipStatus,
} from "../../queries/healthTips";
import { usePermission } from "../../hooks/usePermission";

const HealthTipsList = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  // ==================== PERMISSIONS ====================
  const canView = can("health_tips", "view");
  const canManage = can("health_tips", "manage");

  // API Calls — don't fire list API without view permission
  const { data, isLoading } = useHealthTips(
    { page, search },
    { enabled: canView },
  );
  const deleteMutation = useDeleteHealthTip();
  const toggleMutation = useToggleHealthTipStatus();

  const tips = data?.list || [];
  const meta = data?.meta || {};

  const handleToggle = (id, currentStatus) => {
    if (!canManage) return;
    toggleMutation.mutate({ id, is_active: !currentStatus });
  };

  const handleConfirmDelete = () => {
    if (!canManage) return;
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSettled: () => setDeleteId(null),
      });
    }
  };

  const handleView = (id) => {
    if (!canView) return;
    navigate(`/health-tips/${id}`);
  };

  const handleEdit = (id) => {
    if (!canManage) return;
    navigate(`/health-tips/${id}/edit`);
  };

  const handleAdd = () => {
    if (!canManage) return;
    navigate("/health-tips/new");
  };

  // ==================== PAGE ACCESS GUARD ====================

  if (permLoading) {
    return <Loader text="Checking permissions..." />;
  }

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
          You do not have permission to view health tips. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading health tips..." />;

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
        {canManage && (
          <button
            onClick={handleAdd}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" />
            Add Tip
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="rounded-card border border-ink-100 bg-surface p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on search
            }}
            maxLength={150}
            placeholder="Search..."
            className="w-full rounded-lg border border-form-border bg-form-bg py-2.5 pl-10 pr-3 text-sm text-form-text placeholder:text-form-placeholder focus:border-form-border-focus focus:outline-none focus:ring-2 focus:ring-form-ring/20"
          />
        </div>
      </div>

      {/* Tips Grid */}
      {tips.length === 0 ? (
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
              : canManage
                ? "Add your first health tip to get started."
                : "No health tips have been added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
            >
              {/* Image Area - FIXED HEIGHT for compact card */}
              <div className="relative flex h-[180px] w-full items-center justify-center overflow-hidden border-b border-ink-100 bg-ink-50/50 p-3">
                {tip.image ? (
                  <img
                    src={tip.image}
                    alt={tip.heading}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FiImage className="h-10 w-10 text-ink-300" />
                )}
                {canManage && (
                  <div className="absolute right-3 top-3">
                    <ToggleSwitch
                      isFormik={false}
                      variant="pill"
                      value={tip.is_active}
                      onChange={() => handleToggle(tip.id, tip.is_active)}
                      loading={
                        toggleMutation.isPending &&
                        toggleMutation.variables?.id === tip.id
                      }
                    />
                  </div>
                )}
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
                {/* HTML tags hata ke preview dikhane ke liye */}
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">
                  {tip.content?.replace(/<[^>]*>?/gm, "")}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                {canView ? (
                  <button
                    onClick={() => handleView(tip.id)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                  >
                    <FiEye className="h-4 w-4" />
                    View
                  </button>
                ) : (
                  <span className="text-xs text-ink-400">—</span>
                )}

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(tip.id)}
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
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (Simple) */}
      {meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-ink-200 rounded-lg text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-ink-600">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <button
            disabled={page === meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-ink-200 rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {canManage && (
        <ConfirmModal
          open={!!deleteId}
          title="Delete Health Tip"
          message="Are you sure you want to delete this health tip? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default HealthTipsList;
