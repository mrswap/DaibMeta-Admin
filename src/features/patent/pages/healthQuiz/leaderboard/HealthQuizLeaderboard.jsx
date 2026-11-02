// src/features/patent/pages/healthQuiz/leaderboard/HealthQuizLeaderboard.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiRefreshCw, FiEye, FiAward, FiClock } from "react-icons/fi";

import { useHealthQuizLeaderboard } from "../../../queries/healthQuiz";
import Loader from "../../../common/Loader";
import CustomeTable from "../../../common/table/CustomeTable";

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const HealthQuizLeaderboard = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
  };

  const { data, isLoading, isFetching, refetch } =
    useHealthQuizLeaderboard(params);

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

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "Rank",
      render: (_, row) => <RankBadge rank={row.rank} />,
    },
    {
      header: "Patient",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">
            {row.patient_name || "—"}
          </p>
          <p className="truncate text-[11px] text-ink-500">
            {row.patient_email || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Best Score",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-700">
            {row.obtained_marks} / {row.total_marks}
          </span>
          <div className="mt-0.5 flex gap-1 text-[10px]">
            <span className="text-brand-600">
              {row.correct_answers} correct
            </span>
            <span className="text-ink-400">·</span>
            <span className="text-danger-500">{row.wrong_answers} wrong</span>
          </div>
        </div>
      ),
    },
    {
      header: "Time",
      render: (_, row) => (
        <span className="inline-flex items-center gap-1 text-xs text-ink-600">
          <FiClock className="h-3 w-3 text-ink-400" />
          {formatTime(row.time_taken_seconds)}
        </span>
      ),
    },
    {
      header: "Best Attempt",
      render: (_, row) => (
        <span className="inline-flex items-center justify-center rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
          #{row.attempt_number}
        </span>
      ),
    },
    {
      header: "Submitted",
      render: (_, row) => (
        <span className="text-xs text-ink-600 whitespace-nowrap">
          {row.submitted_at
            ? new Date(row.submitted_at).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() =>
              navigate(`/health-quiz/leaderboard/${row.patient_id}`)
            }
            className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
            title="View Patient Performance"
          >
            <FiEye className="h-4 w-4" />
          </button>
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
            Quiz Leaderboard
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Patient rankings based on best quiz attempts
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            placeholder="Search patient name or email..."
            value={search}
            maxLength={150}
            onChange={handleSearchChange}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>

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

      {/* Content */}
      {isLoading ? (
        <Loader text="Loading leaderboard..." />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
            <FiAward className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-lg font-semibold text-ink-900">
            No leaderboard data
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            {search
              ? "We couldn't find any patients matching your search."
              : "No completed quiz attempts yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
          <CustomeTable
            columns={columns}
            data={list}
            serverSide
            currentPage={currentPage}
            totalPages={lastPage}
            totalItems={total}
            itemsPerPage={metaPerPage}
            onPageChange={(p) => setPage(p)}
            emptyText="No leaderboard data."
          />
        </div>
      )}
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center rounded-md bg-warn-100 text-warn-900 w-8 h-8 text-sm font-bold">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center rounded-md bg-ink-200 text-ink-800 w-8 h-8 text-sm font-bold">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center rounded-md bg-warn-50 text-warn-800 w-8 h-8 text-sm font-bold">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-md bg-ink-50 text-ink-600 w-8 h-8 text-sm font-semibold">
      {rank}
    </span>
  );
};

export default HealthQuizLeaderboard;
