// src/features/patent/pages/serviceManager/ServiceManagerView.jsx

import React, { useState, useMemo, useEffect } from "react";
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

// ==================== RANGE SLIDER COMPONENT ====================
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
          onChange={(e) => {
            const val = Number(e.target.value);
            onChangeMin(val <= maxVal ? val : maxVal);
          }}
          className="range-thumb pointer-events-none absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => {
            const val = Number(e.target.value);
            onChangeMax(val >= minVal ? val : minVal);
          }}
          className="range-thumb pointer-events-none absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const ServiceManagerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Filters State
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mrpRange, setMrpRange] = useState({ min: "", max: "" });
  const [discountRange, setDiscountRange] = useState({ min: "", max: "" });
  const [deleteItemId, setDeleteItemId] = useState(null);

  // API: Service Details
  const { data: service, isLoading: isServiceLoading } = useService(id);

  // API: Tests (with dynamic filters)
  const { data: testsData, isLoading: isTestsLoading } = useServiceTests(id, {
    search,
    mrp_min: mrpRange.min || undefined,
    mrp_max: mrpRange.max || undefined,
    discount_min: discountRange.min || undefined,
    discount_max: discountRange.max || undefined,
  });

  const toggleMutation = useToggleServiceTestStatus();
  const deleteMutation = useDeleteServiceTest();

  const tests = testsData?.list || [];
  const range = testsData?.range;

  // Auto-set slider values if null (initial load)
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
    toggleMutation.mutate({ serviceId: id, testId, is_active: !currentStatus });
  };

  const handleConfirmDelete = () => {
    if (deleteItemId) {
      deleteMutation.mutate(
        { serviceId: id, testId: deleteItemId },
        { onSettled: () => setDeleteItemId(null) },
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    if (range) {
      setMrpRange({ min: Number(range.min_mrp), max: Number(range.max_mrp) });
      setDiscountRange({
        min: Number(range.min_discount_price),
        max: Number(range.max_discount_price),
      });
    }
  };

  if (isServiceLoading) return <Loader text="Loading service..." />;
  if (!service)
    return (
      <div className="p-16 text-center text-ink-500">Service not found</div>
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/service-manager")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
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
        <button
          onClick={() => navigate(`/service-manager/${id}/items/new`)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Test
        </button>
      </div>

      {/* Service Info Card */}
      <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
        <div className="flex flex-col gap-5 p-5 sm:flex-row">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
            {service.image ? (
              <img
                src={service.image}
                alt={service.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FiImage className="h-8 w-8 text-ink-300" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-jakarta text-lg font-semibold text-ink-900">
              {service.name}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                {service.tests_count} Tests
              </span>
              {service.starting_price && (
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  Starting from ₹{service.starting_price}
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${
                  service.display_mode === "direct"
                    ? "bg-accent-50 text-accent-700 ring-accent-200"
                    : "bg-warn-50 text-warn-800 ring-warn-200"
                }`}
              >
                {service.display_mode === "direct"
                  ? "Direct Listing"
                  : "Package Only"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Card */}
      <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FiPackage className="h-5 w-5 text-brand-600" />
            <h2 className="font-jakarta text-base font-semibold text-ink-900">
              Rate Card
            </h2>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-3 border-b border-ink-100 bg-ink-50/30 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
              <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests..."
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                filtersOpen
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
              }`}
            >
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
              Filters
            </button>
          </div>

          {filtersOpen && range && (
            <div className="space-y-5 rounded-lg border border-ink-100 bg-surface p-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <RangeSlider
                  label="MRP Range"
                  min={Number(range.min_mrp)}
                  max={Number(range.max_mrp)}
                  valueMin={mrpRange.min}
                  valueMax={mrpRange.max}
                  onChangeMin={(v) => setMrpRange((p) => ({ ...p, min: v }))}
                  onChangeMax={(v) => setMrpRange((p) => ({ ...p, max: v }))}
                />
                <RangeSlider
                  label="Discount Price Range"
                  min={Number(range.min_discount_price)}
                  max={Number(range.max_discount_price)}
                  valueMin={discountRange.min}
                  valueMax={discountRange.max}
                  onChangeMin={(v) =>
                    setDiscountRange((p) => ({ ...p, min: v }))
                  }
                  onChangeMax={(v) =>
                    setDiscountRange((p) => ({ ...p, max: v }))
                  }
                />
              </div>
              <div className="flex justify-end border-t border-ink-100 pt-3">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:text-ink-900"
                >
                  <FiX className="h-3 w-3" /> Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
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
                      Add your first test to this rate card.
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
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};

export default ServiceManagerView;
