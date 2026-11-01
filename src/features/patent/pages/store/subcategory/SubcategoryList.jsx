// src/features/patent/pages/store/subcategory/SubcategoryList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiFolder,
} from "react-icons/fi";

import { api } from "../../../../../lib/axios";
import {
  useStoreSubcategories,
  useDeleteStoreSubcategory,
  useToggleStoreSubcategoryStatus,
} from "../../../queries/storeSubcategories";
import Loader from "../../../common/Loader";
import ConfirmModal from "../../../common/ConfirmModal";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import { FilterSelect } from "../../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const SubcategoryList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const deleteMutation = useDeleteStoreSubcategory();
  const toggleMutation = useToggleStoreSubcategoryStatus();

  // Fetch Categories for Filter
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-dropdown"],
    queryFn: () =>
      api
        .get("/admin/store/categories", {
          params: { per_page: 100, status: 1 },
        })
        .then((r) => {
          const list = r.data.data?.data || r.data.data || [];
          return Array.isArray(list) ? list : [];
        }),
  });

  const categoryOptions = (categoriesData || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(categoryFilter?.value && { category_id: categoryFilter.value }),
    ...(statusFilter?.value && { status: statusFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } =
    useStoreSubcategories(params);

  const list = data?.list || [];
  const meta = data?.meta || {};

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  const handleToggleConfirm = () => {
    if (!toggleTarget) return;
    toggleMutation.mutate(toggleTarget.id, {
      onSettled: () => setToggleTarget(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Subcategories
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Manage subcategories under parent categories
          </p>
        </div>
        <button
          onClick={() => navigate("/store/subcategories/new")}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface shadow-sm transition hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Add Subcategory
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            maxLength={150}
            onChange={handleSearchChange}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <FilterSelect
            value={categoryFilter}
            onChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
            options={categoryOptions}
            placeholder="All Categories"
            isClearable
            width="w-full sm:w-48"
          />

          <FilterSelect
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            placeholder="All Status"
            isClearable
            width="w-full sm:w-40"
          />

          <button
            onClick={() => refetch()}
            title="Refresh"
            className="col-span-2 inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg border border-ink-200 bg-surface px-3 text-ink-700 transition hover:bg-ink-50 hover:text-brand-600 sm:w-auto"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Loader text="Loading subcategories..." />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
            <FiFolder className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-lg font-semibold text-ink-900">
            No subcategories found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            {search || categoryFilter || statusFilter
              ? "We couldn't find any subcategories matching your filters."
              : "Get started by adding a new subcategory."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface transition-all hover:shadow-md"
              >
                {/* Image Area (Scale removed) */}
                <div className="relative flex h-44 w-full items-center justify-center overflow-hidden border-b border-ink-100 bg-ink-50/30">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <FiImage className="h-12 w-12 text-ink-300" />
                  )}
                  <div className="absolute right-3 top-3">
                    <ToggleSwitch
                      isFormik={false}
                      variant="pill"
                      value={item.status}
                      onChange={() => setToggleTarget(item)}
                    />
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="inline-flex rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-600">
                      {item.category?.name || "Uncategorized"}
                    </span>
                  </div>
                  <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1 group-hover:text-brand-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">
                    {item.description || "No description provided."}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-4 py-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-500">
                    ID: #{item.id}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        navigate(`/store/subcategories/${item.id}/edit`)
                      }
                      className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600 hover:shadow-sm"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-surface hover:text-danger-600 hover:shadow-sm"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-100 pt-4 sm:flex-row">
              <p className="text-xs font-medium text-ink-500">
                Showing{" "}
                <span className="text-ink-900">
                  {(currentPage - 1) * metaPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="text-ink-900">
                  {Math.min(currentPage * metaPerPage, total)}
                </span>{" "}
                of <span className="text-ink-900">{total}</span> entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Subcategory"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />

      {/* Toggle Status Modal */}
      <ConfirmModal
        open={!!toggleTarget}
        title={
          toggleTarget?.status
            ? "Deactivate Subcategory"
            : "Activate Subcategory"
        }
        message={`Are you sure you want to ${
          toggleTarget?.status ? "deactivate" : "activate"
        } "${toggleTarget?.name}"?`}
        confirmText={toggleTarget?.status ? "Deactivate" : "Activate"}
        variant="warn"
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleTarget(null)}
        loading={toggleMutation.isPending}
      />
    </div>
  );
};

export default SubcategoryList;
