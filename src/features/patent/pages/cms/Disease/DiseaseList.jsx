import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiImage,
} from "react-icons/fi";
import Loader from "../../../common/Loader";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import ConfirmModal from "../../../common/ConfirmModal";
import {
  useKnowYourHealthList,
  useDeleteKnowYourHealth,
} from "../../../queries/knowYourHealth";

const DiseaseList = () => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useKnowYourHealthList("disease", {
    page,
    search,
  });
  const deleteMutation = useDeleteKnowYourHealth();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(
        { category: "disease", id: deleteId },
        { onSettled: () => setDeleteId(null) },
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/disease")}
            className="cursor-pointer rounded-lg border p-2 hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Diseases List
          </h1>
        </div>
        <button
          // FIX: Yahan 'new' route hai
          onClick={() => navigate("/cms/disease/new")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" /> Add Disease
        </button>
      </div>

      <div className="rounded-card border border-ink-100 bg-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 bg-table-head-bg">
            <tr>
              <th className="px-5 py-3 font-semibold uppercase text-xs">
                Image
              </th>
              <th className="px-5 py-3 font-semibold uppercase text-xs">
                Disease Name
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
                  No diseases found.
                </td>
              </tr>
            ) : (
              list.map((disease) => (
                <tr
                  key={disease.id}
                  className="border-b border-table-row-border hover:bg-table-row-hover-bg last:border-0"
                >
                  <td className="px-5 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg border bg-ink-50 flex items-center justify-center">
                      {disease.image_url ? (
                        <img
                          src={disease.image_url}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiImage className="h-4 w-4 text-ink-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-ink-900">
                    {disease.name}
                  </td>
                  <td className="px-5 py-3">
                    <ToggleSwitch
                      isFormik={false}
                      variant="pill"
                      value={disease.is_active}
                      onChange={() => {}}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        // FIX: Yahan seedha id wala route hai
                        onClick={() => navigate(`/cms/disease/${disease.id}`)}
                        className="cursor-pointer rounded-lg p-2 hover:bg-ink-50"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(disease.id)}
                        className="cursor-pointer rounded-lg p-2 hover:bg-danger-50"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete Disease"
        message="Are you sure you want to delete this disease? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default DiseaseList;
