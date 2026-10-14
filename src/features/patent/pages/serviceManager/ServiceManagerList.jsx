// src/features/patent/pages/serviceManager/ServiceManagerList.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowRight,
  FiSearch,
  FiGrid,
  FiImage,
} from "react-icons/fi";
import ConfirmModal from "../../common/ConfirmModal";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import { SERVICE_CATEGORIES } from "./serviceData";

const ServiceManagerList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState(SERVICE_CATEGORIES);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    return services.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [services, search]);

  const handleToggle = (id) => {
    setLoadingId(id);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s)),
      );
      setLoadingId(null);
    }, 300);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setServices((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    }
  };

  const getStartingPrice = (items) => {
    if (!items || items.length === 0) return null;
    return Math.min(...items.map((i) => Number(i.discount_price) || 0));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Service Manager
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage diagnostic & clinic services and their rate cards
          </p>
        </div>
        <button
          onClick={() => navigate("/service-manager/new")}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-card border border-ink-100 bg-surface p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={150}
            placeholder="Search services by name..."
            className="w-full rounded-lg border border-form-border bg-form-bg py-2.5 pl-10 pr-3 text-sm text-form-text placeholder:text-form-placeholder focus:border-form-border-focus focus:outline-none focus:ring-2 focus:ring-form-ring/20"
          />
        </div>
      </div>

      {/* Service Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
            <FiGrid className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
            No services found
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Try adjusting your search or add a new service.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => {
            const testCount = service.items.length;
            const startingPrice = getStartingPrice(service.items);

            return (
              <div
                key={service.id}
                className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
              >
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-ink-50">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FiImage className="h-10 w-10 text-ink-300" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <ToggleSwitch
                      isFormik={false}
                      variant="pill"
                      value={service.is_active}
                      onChange={() => handleToggle(service.id)}
                      loading={loadingId === service.id}
                    />
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-5">
                  <h3 className="font-jakarta text-base font-semibold text-ink-900">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">
                    {service.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                      {testCount} {testCount === 1 ? "Test" : "Tests"}
                    </span>
                    {startingPrice !== null && (
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                        From ₹{startingPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                  <button
                    onClick={() => navigate(`/service-manager/${service.id}`)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                  >
                    View Rate Card
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        navigate(`/service-manager/${service.id}/edit`)
                      }
                      className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600"
                      title="Edit service"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(service.id)}
                      className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-danger-600"
                      title="Delete service"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
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

export default ServiceManagerList;
