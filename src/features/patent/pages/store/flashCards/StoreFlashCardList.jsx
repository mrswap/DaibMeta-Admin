// src/features/patent/pages/store/flashCards/StoreFlashCardList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiLink,
  FiSearch,
  FiRefreshCw,
  FiFilter,
  FiX,
  FiLayout,
} from "react-icons/fi";

import { api } from "../../../../../lib/axios";
import {
  useStoreFlashCards,
  useDeleteStoreFlashCard,
  useToggleStoreFlashCardStatus,
} from "../../../queries/storeFlashCards";
import ConfirmModal from "../../../common/ConfirmModal";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import { FilterSelect } from "../../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const StoreFlashCardList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState(null);
  const [productFilter, setProductFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const deleteMutation = useDeleteStoreFlashCard();
  const toggleMutation = useToggleStoreFlashCardStatus();

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

  const { data: subcategoriesData } = useQuery({
    queryKey: ["subcategories-dropdown", categoryFilter?.value],
    queryFn: () =>
      api
        .get("/admin/store/subcategories", {
          params: {
            category_id: categoryFilter?.value,
            per_page: 100,
            status: 1,
          },
        })
        .then((r) => {
          const list = r.data.data?.data || r.data.data || [];
          return Array.isArray(list) ? list : [];
        }),
    enabled: !!categoryFilter?.value,
  });

  const { data: productsData } = useQuery({
    queryKey: [
      "products-dropdown",
      categoryFilter?.value,
      subcategoryFilter?.value,
    ],
    queryFn: () =>
      api
        .get("/admin/store/products", {
          params: {
            category_id: categoryFilter?.value,
            subcategory_id: subcategoryFilter?.value,
            per_page: 100,
            status: 1,
          },
        })
        .then((r) => {
          const list = r.data.data?.data || r.data.data || [];
          return Array.isArray(list) ? list : [];
        }),
    enabled: !!categoryFilter?.value && !!subcategoryFilter?.value,
  });

  const categoryOptions = (categoriesData || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const subcategoryOptions = (subcategoriesData || []).map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const productOptions = (productsData || []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(categoryFilter?.value && { category_id: categoryFilter.value }),
    ...(subcategoryFilter?.value && {
      subcategory_id: subcategoryFilter.value,
    }),
    ...(productFilter?.value && { product_id: productFilter.value }),
    ...(statusFilter?.value && { status: statusFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } = useStoreFlashCards(params);

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

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter(null);
    setSubcategoryFilter(null);
    setProductFilter(null);
    setStatusFilter(null);
    setPage(1);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  const handleConfirmToggle = () => {
    if (!toggleTarget) return;
    toggleMutation.mutate(toggleTarget.id, {
      onSettled: () => setToggleTarget(null),
    });
  };

  const hasActiveFilters =
    search ||
    categoryFilter ||
    subcategoryFilter ||
    productFilter ||
    statusFilter;

  const activeFilterCount =
    (search ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (subcategoryFilter ? 1 : 0) +
    (productFilter ? 1 : 0) +
    (statusFilter ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Store Flash Cards
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Manage banners shown on top of store categories
          </p>
        </div>
        <button
          onClick={() => navigate("/store/flash-cards/new")}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface shadow-sm transition hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Add Flash Card
        </button>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex w-full flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              maxLength={150}
              onChange={handleSearchChange}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex h-10 flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition sm:flex-none ${
                filtersOpen || hasActiveFilters
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
              }`}
            >
              <FiFilter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-surface">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => refetch()}
              title="Refresh"
              className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-ink-200 bg-surface px-3 text-ink-700 transition hover:bg-ink-50 hover:text-brand-600"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="space-y-3 rounded-xl border border-ink-100 bg-ink-50/40 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Category
                </label>
                <FilterSelect
                  value={categoryFilter}
                  onChange={(v) => {
                    setCategoryFilter(v);
                    setSubcategoryFilter(null);
                    setProductFilter(null);
                    setPage(1);
                  }}
                  options={categoryOptions}
                  placeholder="All Categories"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Subcategory
                </label>
                <FilterSelect
                  value={subcategoryFilter}
                  onChange={(v) => {
                    setSubcategoryFilter(v);
                    setProductFilter(null);
                    setPage(1);
                  }}
                  options={subcategoryOptions}
                  placeholder={
                    categoryFilter
                      ? "All Subcategories"
                      : "Select Category first"
                  }
                  isDisabled={!categoryFilter}
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Product
                </label>
                <FilterSelect
                  value={productFilter}
                  onChange={(v) => {
                    setProductFilter(v);
                    setPage(1);
                  }}
                  options={productOptions}
                  placeholder={
                    subcategoryFilter
                      ? "All Products"
                      : "Select Subcategory first"
                  }
                  isDisabled={!subcategoryFilter}
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Status
                </label>
                <FilterSelect
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                  options={STATUS_OPTIONS}
                  placeholder="All Status"
                  isClearable
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-2">
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

      {/* Content */}
      {isLoading ? (
        <Loader text="Loading flash cards..." />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
            <FiLayout className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-lg font-semibold text-ink-900">
            No flash cards found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            {hasActiveFilters
              ? "We couldn't find any flash cards matching your filters."
              : "Get started by adding a new flash card for the store."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((card) => (
              <div
                key={card.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface transition-all hover:shadow-md"
              >
                {/* Image Area (Scale removed) */}
                <div className="relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden border-b border-ink-100 bg-ink-50/30">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <FiImage className="h-10 w-10 text-ink-300" />
                  )}
                  <div className="absolute right-3 top-3">
                    <ToggleSwitch
                      isFormik={false}
                      variant="pill"
                      value={card.status}
                      onChange={() => setToggleTarget(card)}
                    />
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1 group-hover:text-brand-700 transition-colors">
                    {card.title}
                  </h3>

                  <div className="mt-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-ink-500">
                      <span className="inline-flex rounded bg-ink-100 px-1.5 py-0.5 font-medium uppercase tracking-wider">
                        {card.category?.name || "No Category"}
                      </span>
                      <span className="truncate">
                        {card.subcategory?.name || "—"}
                      </span>
                    </div>

                    <div className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md border border-accent-100 bg-accent-50 px-2 py-1 text-xs font-medium text-accent-800">
                      <FiLink className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">
                        {card.product?.name || "No Product Linked"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-4 py-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-500">
                    Order: {card.sort_order}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        navigate(`/store/flash-cards/${card.id}/edit`)
                      }
                      className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600 hover:shadow-sm"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(card)}
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
        title="Delete Flash Card"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />

      {/* Toggle Status Modal */}
      <ConfirmModal
        open={!!toggleTarget}
        title={
          toggleTarget?.status ? "Deactivate Flash Card" : "Activate Flash Card"
        }
        message={`Are you sure you want to ${
          toggleTarget?.status ? "deactivate" : "activate"
        } "${toggleTarget?.title}"?`}
        confirmText={toggleTarget?.status ? "Deactivate" : "Activate"}
        variant="warn"
        onConfirm={handleConfirmToggle}
        onCancel={() => setToggleTarget(null)}
        loading={toggleMutation.isPending}
      />
    </div>
  );
};

export default StoreFlashCardList;
