// src/features/patent/pages/serviceManager/ServiceManagerView.jsx

import React, { useState, useMemo } from "react";
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
import ConfirmModal from "../../common/ConfirmModal";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import { SERVICE_CATEGORIES } from "./serviceData";

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
        {/* Track background */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-100" />

        {/* Active range */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{
            left: `${leftPct}%`,
            right: `${100 - rightPct}%`,
          }}
        />

        {/* Min slider */}
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

        {/* Max slider */}
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

  const serviceId = Number(id);
  const [services, setServices] = useState(SERVICE_CATEGORIES);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [loadingItemId, setLoadingItemId] = useState(null);

  // ==================== FILTER STATE ====================
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const service = services.find((s) => s.id === serviceId);
  const rawItems = service?.items || [];

  // ==================== COMPUTE MRP / DISCOUNT RANGES ====================
  const { mrpBounds, discountBounds } = useMemo(() => {
    if (rawItems.length === 0) {
      return {
        mrpBounds: { min: 0, max: 1000 },
        discountBounds: { min: 0, max: 1000 },
      };
    }

    const mrps = rawItems.map((i) => Number(i.mrp) || 0);
    const discounts = rawItems.map((i) => Number(i.discount_price) || 0);

    return {
      mrpBounds: {
        min: Math.floor(Math.min(...mrps) / 10) * 10,
        max: Math.ceil(Math.max(...mrps) / 10) * 10,
      },
      discountBounds: {
        min: Math.floor(Math.min(...discounts) / 10) * 10,
        max: Math.ceil(Math.max(...discounts) / 10) * 10,
      },
    };
  }, [rawItems]);

  const [mrpRange, setMrpRange] = useState({
    min: null,
    max: null,
  });
  const [discountRange, setDiscountRange] = useState({
    min: null,
    max: null,
  });

  // Effective bounds (null = full range)
  const effectiveMrpMin = mrpRange.min ?? mrpBounds.min;
  const effectiveMrpMax = mrpRange.max ?? mrpBounds.max;
  const effectiveDiscountMin = discountRange.min ?? discountBounds.min;
  const effectiveDiscountMax = discountRange.max ?? discountBounds.max;

  // ==================== FILTER + SORT LOGIC ====================
  const items = useMemo(() => {
    let list = [...rawItems];

    // Search by name
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }

    // MRP range
    list = list.filter((i) => {
      const m = Number(i.mrp) || 0;
      return m >= effectiveMrpMin && m <= effectiveMrpMax;
    });

    // Discount price range
    list = list.filter((i) => {
      const d = Number(i.discount_price) || 0;
      return d >= effectiveDiscountMin && d <= effectiveDiscountMax;
    });

    return list;
  }, [
    rawItems,
    search,
    effectiveMrpMin,
    effectiveMrpMax,
    effectiveDiscountMin,
    effectiveDiscountMax,
  ]);

  const hasActiveFilters =
    search ||
    mrpRange.min !== null ||
    mrpRange.max !== null ||
    discountRange.min !== null ||
    discountRange.max !== null;

  const activeFilterCount =
    (search ? 1 : 0) +
    (mrpRange.min !== null ? 1 : 0) +
    (mrpRange.max !== null ? 1 : 0) +
    (discountRange.min !== null ? 1 : 0) +
    (discountRange.max !== null ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setMrpRange({ min: null, max: null });
    setDiscountRange({ min: null, max: null });
  };

  // ==================== HANDLERS ====================
  const handleToggleItem = (itemId) => {
    setLoadingItemId(itemId);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                items: s.items.map((i) =>
                  i.id === itemId ? { ...i, is_active: !i.is_active } : i,
                ),
              }
            : s,
        ),
      );
      setLoadingItemId(null);
    }, 300);
  };

  const handleConfirmDeleteItem = () => {
    if (deleteItemId && service) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? { ...s, items: s.items.filter((i) => i.id !== deleteItemId) }
            : s,
        ),
      );
      setDeleteItemId(null);
    }
  };

  if (!service) {
    return (
      <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
        <h3 className="font-jakarta text-base font-semibold text-ink-900">
          Service not found
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          The service you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/service-manager")}
          className="mt-4 cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Back to Services
        </button>
      </div>
    );
  }

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
            <p className="mt-0.5 text-sm text-ink-500">{service.description}</p>
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
            <p className="mt-1 text-sm text-ink-600">
              {service.description || "No description"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                {rawItems.length} {rawItems.length === 1 ? "Test" : "Tests"}
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
          <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600">
            {items.length} {items.length === 1 ? "Test" : "Tests"}
          </span>
        </div>

        {/* Filter Bar */}
        <div className="space-y-3 border-b border-ink-100 bg-ink-50/30 px-5 py-4">
          {/* Search + Filter toggle */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
              <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={150}
                placeholder="Search tests by name..."
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
              />
            </div>

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                filtersOpen || hasActiveFilters
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
              }`}
            >
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div className="space-y-5 rounded-lg border border-ink-100 bg-surface p-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* MRP Range Slider */}
                <RangeSlider
                  label="MRP Range"
                  min={mrpBounds.min}
                  max={mrpBounds.max}
                  valueMin={mrpRange.min}
                  valueMax={mrpRange.max}
                  onChangeMin={(v) =>
                    setMrpRange((prev) => ({ ...prev, min: v }))
                  }
                  onChangeMax={(v) =>
                    setMrpRange((prev) => ({ ...prev, max: v }))
                  }
                  step={10}
                />

                {/* Discount Range Slider */}
                <RangeSlider
                  label="Discount Price Range"
                  min={discountBounds.min}
                  max={discountBounds.max}
                  valueMin={discountRange.min}
                  valueMax={discountRange.max}
                  onChangeMin={(v) =>
                    setDiscountRange((prev) => ({ ...prev, min: v }))
                  }
                  onChangeMax={(v) =>
                    setDiscountRange((prev) => ({ ...prev, max: v }))
                  }
                  step={10}
                />
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end border-t border-ink-100 pt-3">
                  <button
                    onClick={clearFilters}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100"
                  >
                    <FiX className="h-3 w-3" />
                    Clear Filters
                  </button>
                </div>
              )}
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
                      <FiPackage className="h-6 w-6 text-ink-400" />
                    </div>
                    <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
                      {hasActiveFilters ? "No matching tests" : "No tests yet"}
                    </h3>
                    <p className="mt-1 text-sm text-ink-500">
                      {hasActiveFilters
                        ? "Try adjusting your filters or clear them."
                        : "Add your first test to this rate card."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                      >
                        <FiX className="h-3 w-3" />
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-table-row-border transition-colors last:border-b-0 hover:bg-table-row-hover-bg"
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
                        onChange={() => handleToggleItem(item.id)}
                        loading={loadingItemId === item.id}
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
                          className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-600"
                          title="Edit test"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItemId(item.id)}
                          className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
                          title="Delete test"
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
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setDeleteItemId(null)}
        loading={false}
      />
    </div>
  );
};

export default ServiceManagerView;
