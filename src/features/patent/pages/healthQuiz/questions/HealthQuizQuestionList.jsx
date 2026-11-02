// src/features/patent/pages/healthQuiz/questions/HealthQuizQuestionList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiHelpCircle,
} from "react-icons/fi";

import {
  useHealthQuizQuestions,
  useDeleteHealthQuizQuestion,
  useToggleHealthQuizQuestionStatus,
} from "../../../queries/healthQuiz";
import Loader from "../../../common/Loader";
import ConfirmModal from "../../../common/ConfirmModal";
import CustomeTable from "../../../common/table/CustomeTable";
import { FilterSelect, ActionToggle } from "../../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const HealthQuizQuestionList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const deleteMutation = useDeleteHealthQuizQuestion();
  const toggleMutation = useToggleHealthQuizQuestionStatus();

  // Params
  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } =
    useHealthQuizQuestions(params);

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

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "Question",
      render: (_, row) => (
        <div className="min-w-0 max-w-md">
          <p className="truncate font-medium text-ink-900">
            {row.question || "—"}
          </p>
          <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-ink-500">
            <span className="inline-flex rounded bg-ink-100 px-1.5 py-0.5 truncate max-w-[80px]">
              A: {row.option_a}
            </span>
            <span className="inline-flex rounded bg-ink-100 px-1.5 py-0.5 truncate max-w-[80px]">
              B: {row.option_b}
            </span>
            <span className="inline-flex rounded bg-ink-100 px-1.5 py-0.5 truncate max-w-[80px]">
              C: {row.option_c}
            </span>
            <span className="inline-flex rounded bg-ink-100 px-1.5 py-0.5 truncate max-w-[80px]">
              D: {row.option_d}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Correct",
      render: (_, row) => (
        <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          {row.correct_answer || "—"}
        </span>
      ),
    },
    {
      header: "Sort",
      render: (_, row) => (
        <span className="text-xs text-ink-600">{row.sort_order ?? "—"}</span>
      ),
    },
    {
      header: "Status",
      render: (_, row) => <StatusBadge active={row.status} />,
    },
    {
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn
            title="Edit"
            onClick={() => navigate(`/health-quiz/questions/${row.id}/edit`)}
          >
            <FiEdit2 className="h-4 w-4" />
          </IconBtn>
          <ActionToggle
            active={row.status}
            onClick={() => setToggleTarget(row)}
            loading={
              toggleMutation.isPending && toggleMutation.variables === row.id
            }
          />
          <IconBtn title="Delete" onClick={() => setDeleteTarget(row)} danger>
            <FiTrash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Health Quiz Questions
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Manage multiple-choice questions for the health quiz
          </p>
        </div>
        <button
          onClick={() => navigate("/health-quiz/questions/new")}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface shadow-sm transition hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            placeholder="Search question or options..."
            value={search}
            maxLength={150}
            onChange={handleSearchChange}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="All Status"
          isClearable
          width="w-40"
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
        <Loader text="Loading questions..." />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
            <FiHelpCircle className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-lg font-semibold text-ink-900">
            No questions found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            {search || statusFilter
              ? "We couldn't find any questions matching your filters."
              : "Get started by adding a new quiz question."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl">
          <CustomeTable
            columns={columns}
            data={list}
            serverSide
            currentPage={currentPage}
            totalPages={lastPage}
            totalItems={total}
            itemsPerPage={metaPerPage}
            onPageChange={(p) => setPage(p)}
            emptyText="No questions found."
          />
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Question"
        message={`Are you sure you want to delete this question? This action cannot be undone.`}
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
          toggleTarget?.status ? "Deactivate Question" : "Activate Question"
        }
        message={`Are you sure you want to ${
          toggleTarget?.status ? "deactivate" : "activate"
        } this question?`}
        confirmText={toggleTarget?.status ? "Deactivate" : "Activate"}
        variant="warn"
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleTarget(null)}
        loading={toggleMutation.isPending}
      />
    </div>
  );
};

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
      active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const IconBtn = ({ children, title, onClick, disabled, danger }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
      danger
        ? "text-danger-500 hover:bg-danger-50"
        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
    }`}
  >
    {children}
  </button>
);

export default HealthQuizQuestionList;
