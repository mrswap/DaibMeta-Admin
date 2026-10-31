// src/features/patent/pages/store/product/ProductList.jsx

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
} from "react-icons/fi";

import { api } from "../../../../../lib/axios";
import {
  useStoreProducts,
  useDeleteStoreProduct,
  useToggleStoreProductStatus,
} from "../../../queries/storeProducts";
import Loader from "../../../common/Loader";
import ConfirmModal from "../../../common/ConfirmModal";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import { FilterSelect } from "../../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const ProductList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const deleteMutation = useDeleteStoreProduct();
  const toggleMutation = useToggleStoreProductStatus();

  // Fetch Categories
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

  // Fetch Subcategories (dependent on category filter)
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

  const categoryOptions = (categoriesData || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const subcategoryOptions = (subcategoriesData || []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  // Params
  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(categoryFilter?.value && { category_id: categoryFilter.value }),
    ...(subcategoryFilter?.value && {
      subcategory_id: subcategoryFilter.value,
    }),
    ...(statusFilter?.value && { status: statusFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } = useStoreProducts(params);

  const list = data?.list || [];
  const meta = data?.meta || {};

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  // Handlers
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
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Products
          </h1>
          <p className="text-sm text-ink-500">
            Manage all products in the store
          </p>
        </div>
        <button
          onClick={() => navigate("/store/products/new")}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            maxLength={150}
            onChange={handleSearchChange}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>

        <FilterSelect
          value={categoryFilter}
          onChange={(v) => {
            setCategoryFilter(v);
            setSubcategoryFilter(null);
            setPage(1);
          }}
          options={categoryOptions}
          placeholder="All Categories"
          isClearable
          width="w-40"
        />

        <FilterSelect
          value={subcategoryFilter}
          onChange={(v) => {
            setSubcategoryFilter(v);
            setPage(1);
          }}
          options={subcategoryOptions}
          placeholder={
            categoryFilter ? "All Subcategories" : "Select Category first"
          }
          isDisabled={!categoryFilter}
          isClearable
          width="w-48"
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
          width="w-32"
        />

        <button
          onClick={() => refetch()}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <Loader text="Loading products..." />
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-ink-100 bg-surface p-16 text-center">
          <h3 className="font-jakarta text-lg font-semibold text-ink-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            {search || categoryFilter || statusFilter
              ? "Try adjusting your filters."
              : "Add a new product to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item) => {
              const firstImage = item.images?.[0]?.image;
              return (
                <div
                  key={item.id}
                  className="flex flex-col rounded-card border border-ink-100 bg-surface transition-shadow hover:shadow-sm"
                >
                  {/* Image Area */}
                  <div className="relative flex h-40 w-full items-center justify-center overflow-hidden border-b border-ink-100 bg-ink-50/30">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={item.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <FiImage className="h-10 w-10 text-ink-300" />
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
                  <div className="flex-1 p-5">
                    <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
                      {item.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                      <span className="line-clamp-1">
                        {item.category?.name || "—"}
                      </span>
                      <span>•</span>
                      <span className="line-clamp-1">
                        {item.subcategory?.name || "—"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      {item.mrp && (
                        <span className="text-sm text-ink-400 line-through">
                          ₹{item.mrp}
                        </span>
                      )}
                      <span className="font-bold text-brand-700">
                        ₹{item.final_price}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                    <span className="text-[11px] text-ink-500">
                      ID: #{item.id}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          navigate(`/store/products/${item.id}/edit`)
                        }
                        className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600"
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-danger-600"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  className="cursor-pointer rounded-lg border border-ink-200 px-3 py-1 text-sm hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  className="cursor-pointer rounded-lg border border-ink-200 px-3 py-1 text-sm hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        title="Delete Product"
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
        title={toggleTarget?.status ? "Deactivate Product" : "Activate Product"}
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

export default ProductList;
