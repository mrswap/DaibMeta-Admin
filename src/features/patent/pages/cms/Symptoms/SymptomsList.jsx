// src/features/patent/pages/cms/Symptoms/SymptomsList.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiImage,
  FiLock,
} from "react-icons/fi";
import Loader from "../../../common/Loader";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import ConfirmModal from "../../../common/ConfirmModal";
import {
  useKnowYourHealthList,
  useDeleteKnowYourHealth,
} from "../../../queries/knowYourHealth";
import { usePermission } from "../../../hooks/usePermission";

const SymptomsList = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("cms", "view");
  const canManage = can("cms", "manage");

  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // API gated by view permission
  const { data, isLoading } = useKnowYourHealthList(
    "symptom",
    {
      page,
      search,
    },
    { enabled: canView },
  );

  const deleteMutation = useDeleteKnowYourHealth();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleConfirmDelete = () => {
    if (!canManage || !deleteId) return;
    deleteMutation.mutate(
      { category: "symptom", id: deleteId },
      { onSettled: () => setDeleteId(null) },
    );
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
          You do not have permission to view symptoms. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/symptoms")}
            className="cursor-pointer rounded-lg border p-2 hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Symptoms List
          </h1>
        </div>

        {/* Add Symptom - Only if canManage */}
        {canManage && (
          <button
            onClick={() => navigate("/cms/symptoms/new")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" /> Add Symptom
          </button>
        )}
      </div>

      <div className="rounded-card border border-ink-100 bg-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 bg-table-head-bg">
            <tr>
              <th className="px-5 py-3 font-semibold uppercase text-xs">
                Image
              </th>
              <th className="px-5 py-3 font-semibold uppercase text-xs">
                Symptom Name
              </th>
              <th className="px-5 py-3 font-semibold uppercase text-xs">
                Status
              </th>
              <th className="px-5 py-3 font-semibold uppercase text-xs text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <Loader text="Loading..." />
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-ink-500">
                  No symptoms found.
                </td>
              </tr>
            ) : (
              list.map((symptom) => (
                <tr
                  key={symptom.id}
                  className="border-b border-table-row-border hover:bg-table-row-hover-bg last:border-0"
                >
                  <td className="px-5 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg border bg-ink-50 flex items-center justify-center">
                      {symptom.image_url ? (
                        <img
                          src={symptom.image_url}
                          className="h-full w-full object-cover"
                          alt={symptom.name}
                        />
                      ) : (
                        <FiImage className="h-4 w-4 text-ink-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-ink-900">
                    {symptom.name}
                  </td>
                  <td className="px-5 py-3">
                    {/* Toggle Switch only if canManage, else static badge */}
                    {canManage ? (
                      <ToggleSwitch
                        isFormik={false}
                        variant="pill"
                        value={symptom.is_active}
                        onChange={() => {}}
                      />
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          symptom.is_active
                            ? "bg-brand-50 text-brand-700"
                            : "bg-ink-100 text-ink-600"
                        }`}
                      >
                        {symptom.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Option A: Hide edit/delete if !canManage */}
                      {canManage ? (
                        <>
                          <button
                            onClick={() =>
                              navigate(`/cms/symptoms/${symptom.id}`)
                            }
                            className="cursor-pointer rounded-lg p-2 hover:bg-ink-50"
                            title="Edit"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(symptom.id)}
                            className="cursor-pointer rounded-lg p-2 hover:bg-danger-50 hover:text-danger-600"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-4">
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
          title="Delete Symptom"
          message="Are you sure you want to delete this symptom? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default SymptomsList;
