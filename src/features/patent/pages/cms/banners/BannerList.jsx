// src/features/patent/pages/cms/banners/BannerList.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiLock } from "react-icons/fi";
import Loader from "../../../common/Loader";
import ConfirmModal from "../../../common/ConfirmModal";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import {
  useBanners,
  useDeleteBanner,
  useToggleBannerStatus,
} from "../../../queries/banners";
import { usePermission } from "../../../hooks/usePermission";

const BannerList = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("cms", "view");
  const canManage = can("cms", "manage");

  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);

  // API gated by view permission
  const { data, isLoading } = useBanners({ page }, { enabled: canView });
  const deleteMutation = useDeleteBanner();
  const toggleMutation = useToggleBannerStatus();

  const banners = data?.list || [];
  const meta = data?.meta || {};

  const handleDelete = () => {
    if (!canManage || !deleteId) return;
    deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
  };

  // ==================== PAGE ACCESS GUARD ====================
  if (permLoading && !canView) {
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
          You do not have permission to view banners. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading banners..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Homepage Banners
          </h1>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/cms/banners/new")}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" /> Add Banner
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-surface hover:shadow-md transition-shadow"
          >
            {/* Image Area - Fixed Height to match app card */}
            <div className="relative flex h-[140px] w-full items-center justify-center overflow-hidden bg-ink-50 border-b border-ink-100 p-2">
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <FiImage className="h-10 w-10 text-ink-300" />
              )}

              {/* Toggle hidden if !canManage */}
              {canManage && (
                <div className="absolute right-2 top-2">
                  <ToggleSwitch
                    isFormik={false}
                    variant="pill"
                    value={banner.status}
                    onChange={() => toggleMutation.mutate(banner.id)}
                    loading={
                      toggleMutation.isPending &&
                      toggleMutation.variables === banner.id
                    }
                  />
                </div>
              )}
            </div>

            {/* Text Details Area */}
            <div className="flex-1 p-4">
              <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
                {banner.title}
              </h3>
              <p className="mt-1 text-xs text-ink-500">
                Sort Order: {banner.sort_order}
              </p>
              {banner.target_url && (
                <p className="mt-1 text-xs text-ink-400 truncate">
                  {banner.target_url}
                </p>
              )}
            </div>

            {/* Action Buttons - Only if canManage */}
            <div className="flex items-center justify-end border-t border-ink-100 bg-ink-50/40 px-4 py-2 gap-1 min-h-[52px]">
              {canManage ? (
                <>
                  <button
                    onClick={() => navigate(`/cms/banners/${banner.id}/edit`)}
                    className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-surface hover:text-brand-600 transition-colors"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(banner.id)}
                    className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-surface hover:text-danger-600 transition-colors"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-ink-400">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

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

      {/* Confirm Modal - Only if canManage */}
      {canManage && (
        <ConfirmModal
          open={!!deleteId}
          title="Delete Banner"
          message="Are you sure you want to delete this banner?"
          confirmText="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default BannerList;
