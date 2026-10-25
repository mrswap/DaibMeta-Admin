import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import ConfirmModal from "../../../common/ConfirmModal";
import { SYMPTOMS_LIST } from "./symptomsData";

const SymptomsList = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState(SYMPTOMS_LIST);
  const [deleteId, setDeleteId] = useState(null);

  const handleToggleStatus = (id) => {
    setSymptoms((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: !s.status } : s)),
    );
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setSymptoms((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/symptoms")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              Symptoms List
            </h1>
          </div>
        </div>
        <button
          onClick={() => navigate("/cms/symptoms/new")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Symptom
        </button>
      </div>

      {/* Table */}
      <div className="rounded-card border border-ink-100 bg-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 bg-table-head-bg">
            <tr>
              <th className="px-5 py-3 font-semibold uppercase tracking-wide text-table-head-text text-xs">
                Symptom Name
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
            {symptoms.map((symptom) => (
              <tr
                key={symptom.id}
                className="border-b border-table-row-border transition-colors hover:bg-table-row-hover-bg last:border-0"
              >
                <td className="px-5 py-3 font-medium text-ink-900">
                  {symptom.name}
                </td>
                <td className="px-5 py-3 text-ink-600 line-clamp-1">
                  {symptom.description}
                </td>
                <td className="px-5 py-3">
                  <ToggleSwitch
                    isFormik={false}
                    variant="pill"
                    value={symptom.status}
                    onChange={() => handleToggleStatus(symptom.id)}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/cms/symptoms/${symptom.id}`)}
                      className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-600"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(symptom.id)}
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
        title="Delete Symptom"
        message="Are you sure you want to delete this symptom? This action cannot be undone."
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

export default SymptomsList;
