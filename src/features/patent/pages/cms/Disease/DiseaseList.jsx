import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import ConfirmModal from "../../../common/ConfirmModal";
import { DISEASES_LIST } from "./diseasesData";

const DiseaseList = () => {
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState(DISEASES_LIST);
  const [deleteId, setDeleteId] = useState(null);

  const handleToggleStatus = (id) => {
    setDiseases((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: !d.status } : d)),
    );
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setDiseases((prev) => prev.filter((d) => d.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/disease")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              Diseases List
            </h1>
            {/* Subheading removed */}
          </div>
        </div>
        <button
          onClick={() => navigate("/cms/disease/new")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Disease
        </button>
      </div>

      {/* Table */}
      <div className="rounded-card border border-ink-100 bg-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 bg-table-head-bg">
            <tr>
              <th className="px-5 py-3 font-semibold uppercase tracking-wide text-table-head-text text-xs">
                Disease Name
              </th>
              <th className="px-5 py-3 font-semibold uppercase tracking-wide text-table-head-text text-xs">
                Description
              </th>
              <th className="px-5 py-3 font-semibold uppercase tracking-wide text-table-head-text text-xs">
                Status
              </th>
              <th className="px-5 py-3 font-semibold uppercase tracking-wide text-table-head-text text-xs text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((disease) => (
              <tr
                key={disease.id}
                className="border-b border-table-row-border transition-colors hover:bg-table-row-hover-bg last:border-0"
              >
                <td className="px-5 py-3 font-medium text-ink-900">
                  {disease.name}
                </td>
                <td className="px-5 py-3 text-ink-600 line-clamp-1">
                  {disease.description}
                </td>
                <td className="px-5 py-3">
                  <ToggleSwitch
                    isFormik={false}
                    variant="pill"
                    value={disease.status}
                    onChange={() => handleToggleStatus(disease.id)}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/cms/disease/${disease.id}`)}
                      className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-600"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(disease.id)}
                      className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete Disease"
        message="Are you sure you want to delete this disease? This action cannot be undone."
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

export default DiseaseList;
