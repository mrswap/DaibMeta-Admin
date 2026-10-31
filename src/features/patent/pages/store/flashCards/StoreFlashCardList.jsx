// src/features/patent/pages/store/flashCards/StoreFlashCardList.jsx

import { useState, useMemo } from "react";
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

  // Filters State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState(null);
  const [productFilter, setProductFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Modals State
  const [deleteId, setDeleteId] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  // API Mutations
  const deleteMutation = useDeleteStoreFlashCard();
  const toggleMutation = useToggleStoreFlashCardStatus();

  // Fetch dropdown data (Categories)
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

  // Fetch Subcategories
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

  // Fetch Products
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

  // Format options
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

  // ==========================================
  // MAIN LIST QUERY
  // ==========================================
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

  // ==========================================
  // HANDLERS
  // ==========================================
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
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSettled: () => setDeleteId(null),
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
    <div className="space-y-5">
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
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Add Flash Card
        </button>
      </div>

      {/* Search + Filter Toggle */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
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

          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
              filtersOpen || hasActiveFilters
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
            }`}
          >
            <FiFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-surface">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => refetch()}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Expanded Filters */}
        {filtersOpen && (
          <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Category */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
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

              {/* Subcategory */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
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

              {/* Product */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
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

              {/* Status */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
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
              <div className="flex justify-end">
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
        <div className="rounded-xl border border-ink-100 bg-surface p-16 text-center">
          <h3 className="font-jakarta text-lg font-semibold text-ink-900">
            No flash cards found
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            {hasActiveFilters
              ? "Try adjusting your filters."
              : "Add a new flash card to display on the store."}
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((card) => (
              <div
                key={card.id}
                className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface hover:shadow-sm transition-shadow"
              >
                {/* Image Area */}
                <div className="relative h-40 w-full overflow-hidden bg-ink-50 flex items-center justify-center border-b border-ink-100">
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
                <div className="flex-1 p-5">
                  <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
                    {card.title}
                  </h3>

                  {/* Linked Product */}
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                      <span className="font-medium text-ink-800">
                        Category:
                      </span>
                      <span className="line-clamp-1">
                        {card.category?.name || "—"}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                      <span className="font-medium text-ink-800">Subcat:</span>
                      <span className="line-clamp-1">
                        {card.subcategory?.name || "—"}
                      </span>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2 py-1 text-xs font-medium text-accent-800 w-fit">
                      <FiLink className="h-3 w-3" />
                      <span className="line-clamp-1">
                        {card.product?.name || "—"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-ink-500">
                    Sort Order: {card.sort_order}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end border-t border-ink-100 bg-ink-50/40 px-5 py-3 gap-1">
                  <button
                    onClick={() =>
                      navigate(`/store/flash-cards/${card.id}/edit`)
                    }
                    className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-surface hover:text-brand-600 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(card.id)}
                    className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-surface hover:text-danger-600 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between border-t border-ink-100 pt-4">
              <p className="text-xs text-ink-500">
                Showing {(currentPage - 1) * metaPerPage + 1} to{" "}
                {Math.min(currentPage * metaPerPage, total)} of {total} entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-ink-200 px-3 py-1 text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-ink-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  className="rounded-lg border border-ink-200 px-3 py-1 text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-ink-50"
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
        open={!!deleteId}
        title="Delete Flash Card"
        message="Are you sure you want to delete this flash card? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
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
