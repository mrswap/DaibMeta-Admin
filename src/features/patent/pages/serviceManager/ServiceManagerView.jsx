// src/features/patent/pages/serviceManager/ServiceManagerView.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiImage,
  FiSearch,
  FiX,
  FiChevronDown,
  FiLock,
} from "react-icons/fi";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import {
  useService,
  useServiceTests,
  useToggleServiceTestStatus,
  useDeleteServiceTest,
} from "../../queries/serviceManager";
import { usePermission } from "../../hooks/usePermission";

// RangeSlider component same as before...
const RangeSlider = ({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  step = 10,
}) => {
  const minVal = Number(valueMin) || min;
  const maxVal = Number(valueMax) || max;
  const range = max - min || 1;
  const leftPct = ((minVal - min) / range) * 100;
  const rightPct = ((maxVal - min) / range) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-ink-700 tabular-nums">
          ₹{minVal} – ₹{maxVal}
        </span>
      </div>
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-100" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) =>
            onChangeMin(
              Number(e.target.value) <= maxVal
                ? Number(e.target.value)
                : maxVal,
            )
          }
          className="range-thumb pointer-events-none absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) =>
            onChangeMax(
              Number(e.target.value) >= minVal
                ? Number(e.target.value)
                : minVal,
            )
          }
          className="range-thumb pointer-events-none absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
    </div>
  );
};

const ServiceManagerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canView = can("services", "view");
  const canManage = can("services", "manage");

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mrpRange, setMrpRange] = useState({ min: "", max: "" });
  const [discountRange, setDiscountRange] = useState({ min: "", max: "" });
  const [deleteItemId, setDeleteItemId] = useState(null);

  const { data: service, isLoading: isServiceLoading } = useService(id, {
    enabled: canView,
  });
  const { data: testsData, isLoading: isTestsLoading } = useServiceTests(
    id,
    {
      search,
      mrp_min: mrpRange.min || undefined,
      mrp_max: mrpRange.max || undefined,
      discount_min: discountRange.min || undefined,
      discount_max: discountRange.max || undefined,
    },
    { enabled: canView },
  );

  const toggleMutation = useToggleServiceTestStatus();
  const deleteMutation = useDeleteServiceTest();

  const tests = testsData?.list || [];
  const range = testsData?.range;

  useEffect(() => {
    if (range && mrpRange.min === "" && mrpRange.max === "") {
      setMrpRange({ min: Number(range.min_mrp), max: Number(range.max_mrp) });
      setDiscountRange({
        min: Number(range.min_discount_price),
        max: Number(range.max_discount_price),
      });
    }
  }, [range, mrpRange.min, mrpRange.max]);

  const handleToggle = (testId, currentStatus) => {
    if (!canManage) return;
    toggleMutation.mutate({ serviceId: id, testId, is_active: !currentStatus });
  };

  const handleConfirmDelete = () => {
    if (!canManage || !deleteItemId) return;
    deleteMutation.mutate(
      { serviceId: id, testId: deleteItemId },
      { onSettled: () => setDeleteItemId(null) },
    );
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
          You do not have permission to view this service.
        </p>
      </div>
    );
  }

  if (isServiceLoading) return <Loader text="Loading service..." />;
  if (!service)
    return (
      <div className="p-16 text-center text-ink-500">Service not found</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/service-manager")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              {service.name}
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {service.description || "No description"}
            </p>
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => navigate(`/service-manager/${id}/items/new`)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" /> Add Test
          </button>
        )}
      </div>

      {/* Service Info Card remains the same */}

      <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
        {/* Header and Filters remain the same */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-table-head-bg">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-table-head-text">
                  Test Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-table-head-text">
                  Pricing
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-table-head-text">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-table-head-text">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isTestsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-ink-500"
                  >
                    Loading tests...
                  </td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
                      <FiPackage className="h-6 w-6 text-ink-400" />
                    </div>
                    <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
                      No tests found
                    </h3>
                    <p className="mt-1 text-sm text-ink-500">
                      {canManage
                        ? "Add your first test to this rate card."
                        : "No tests have been added yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                tests.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-table-row-border hover:bg-table-row-hover-bg"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink-900">
                      {item.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-normal text-ink-400 line-through">
                          MRP ₹{item.mrp}
                        </span>
                        <span className="text-base font-bold text-brand-700">
                          ₹{item.discount_price}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {canManage ? (
                        <ToggleSwitch
                          isFormik={false}
                          variant="pill"
                          value={item.is_active}
                          onChange={() => handleToggle(item.id, item.is_active)}
                          loading={
                            toggleMutation.isPending &&
                            toggleMutation.variables?.testId === item.id
                          }
                        />
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${item.is_active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"}`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {/* Option A: Only hide Edit/Delete icons. Since this is a table inside a View page, the "View" action is implicit (you're already viewing). */}
                        {canManage ? (
                          <>
                            <button
                              onClick={() =>
                                navigate(
                                  `/service-manager/${id}/items/${item.id}/edit`,
                                )
                              }
                              className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-ink-50 hover:text-brand-600"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteItemId(item.id)}
                              className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-danger-50 hover:text-danger-600"
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
      </div>

      {canManage && (
        <ConfirmModal
          open={!!deleteItemId}
          title="Delete Test"
          message="Are you sure you want to delete this test?"
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteItemId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default ServiceManagerView;
