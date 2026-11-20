// src/features/patent/pages/serviceManager/ServiceManagerList.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowRight,
  FiSearch,
  FiGrid,
  FiImage,
  FiLock,
} from "react-icons/fi";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import { FilterSelect } from "../../common/form";
import {
  useServices,
  useDeleteService,
  useToggleServiceStatus,
} from "../../queries/serviceManager";
import { usePermission } from "../../hooks/usePermission";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const ServiceManagerList = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canView = can("services", "view");
  const canManage = can("services", "manage");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useServices(
    { page, search, status: statusFilter?.value },
    { enabled: canView },
  );
  const deleteMutation = useDeleteService();
  const toggleMutation = useToggleServiceStatus();

  const services = data?.list || [];
  const meta = data?.meta || {};
  const normalServices = services.filter((s) => s.is_health_package === false);

  const handleToggle = (id, currentStatus) => {
    if (!canManage) return;
    toggleMutation.mutate({ id, is_active: !currentStatus });
  };

  const handleConfirmDelete = () => {
    if (!canManage || !deleteId) return;
    deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
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
          You do not have permission to view services.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading services..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Service Manager
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage diagnostic & clinic services and their rate cards
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/service-manager/new")}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" /> Add Service
          </button>
        )}
      </div>

      <div className="rounded-card border border-ink-100 bg-surface p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              maxLength={150}
              placeholder="Search services..."
              className="w-full rounded-lg border border-form-border bg-form-bg py-2.5 pl-10 pr-3 text-sm text-form-text placeholder:text-form-placeholder focus:border-form-border-focus focus:outline-none focus:ring-2 focus:ring-form-ring/20"
            />
          </div>
          <div className="w-full sm:w-48">
            <FilterSelect
              name="status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              placeholder="All Status"
              isClearable
            />
          </div>
        </div>
      </div>

      {normalServices.length === 0 ? (
        <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
            <FiGrid className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
            No services found
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            {search || statusFilter
              ? "Try adjusting your filters."
              : canManage
                ? "Add your first service to get started."
                : "No services have been added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {normalServices.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
            >
              <div className="relative flex h-[120px] w-full items-center justify-center overflow-hidden border-b border-ink-100 bg-ink-50/30 p-2">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
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
                      value={service.is_active}
                      onChange={() =>
                        handleToggle(service.id, service.is_active)
                      }
                      loading={
                        toggleMutation.isPending &&
                        toggleMutation.variables?.id === service.id
                      }
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 p-4">
                <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500 line-clamp-2">
                  {service.description || "No description"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                    {service.tests_count || 0}{" "}
                    {service.tests_count === 1 ? "Test" : "Tests"}
                  </span>
                  {service.starting_price && (
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      From ₹{service.starting_price}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-4 py-2.5">
                {/* Option A: Always show View */}
                <button
                  onClick={() => navigate(`/service-manager/${service.id}`)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                >
                  View Rate Card{" "}
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Option A: Hide Edit/Delete if !canManage */}
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        navigate(`/service-manager/${service.id}/edit`)
                      }
                      className="cursor-pointer rounded-lg p-1.5 text-ink-500 hover:bg-surface hover:text-brand-600"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(service.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-ink-500 hover:bg-surface hover:text-danger-600"
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
          title="Delete Service"
          message="Are you sure you want to delete this service?"
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

export default ServiceManagerList;
