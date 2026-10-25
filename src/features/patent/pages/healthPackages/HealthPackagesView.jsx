// src/features/patent/pages/healthPackages/HealthPackagesView.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiCheck,
  FiActivity,
} from "react-icons/fi";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import {
  useHealthPackage,
  useDeleteHealthPackage,
} from "../../queries/healthPackages";

const HealthPackagesView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // API Calls
  const { data: pkg, isLoading } = useHealthPackage(id);
  const deleteMutation = useDeleteHealthPackage();

  const handleConfirmDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate("/health-packages"),
    });
  };

  if (isLoading) return <Loader text="Loading package details..." />;

  if (!pkg) {
    return (
      <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
        <h3 className="font-jakarta text-base font-semibold text-ink-900">
          Package not found
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          The package you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/health-packages")}
          className="mt-4 cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/health-packages/${id}/edit`)}
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
        {/* Left: Image */}
        <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
          <div className="aspect-square w-full bg-ink-50">
            {pkg.image ? (
              <img
                src={pkg.image}
                alt={pkg.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FiImage className="h-12 w-12 text-ink-300" />
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
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

            <h2 className="font-jakarta text-lg font-semibold text-ink-900 mb-2">
              About this package
            </h2>
            <p className="text-sm leading-relaxed text-ink-600">
              {pkg.description || "No description provided."}
            </p>
          </div>

          {/* Services Card */}
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="font-jakarta text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
              <FiActivity className="h-5 w-5 text-brand-600" />
              Services Included ({pkg.services?.length || 0})
            </h2>

            {!pkg.services || pkg.services.length === 0 ? (
              <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-6 text-center">
                <p className="text-sm text-ink-500">
                  No services added to this package yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pkg.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/40 px-4 py-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <FiCheck className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-ink-800">
                        {service.name}
                      </span>
                      {service.is_active === false && (
                        <span className="text-[10px] font-semibold text-danger-600 uppercase mt-0.5">
                          Currently Inactive
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Delete Health Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default HealthPackagesView;
