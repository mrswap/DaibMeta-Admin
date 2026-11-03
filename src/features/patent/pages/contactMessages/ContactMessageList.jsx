// src/features/patent/pages/contactMessages/ContactMessageList.jsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiMail,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

import { useContactMessages } from "../../queries/contactMessages";
import Loader from "../../common/Loader";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect } from "../../common/form";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "view", label: "Viewed" },
  { value: "resolved", label: "Resolved" },
];

// Time format with AM/PM
const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ContactMessageList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } = useContactMessages(params);

  const list = data?.list || [];
  const meta = data?.meta || {};

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  // Calculate status counts from current page (approx)
  const counts = useMemo(() => {
    return {
      pending: list.filter((m) => m.status === "pending").length,
      view: list.filter((m) => m.status === "view").length,
      resolved: list.filter((m) => m.status === "resolved").length,
    };
  }, [list]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "ID",
      render: (_, row) => (
        <span className="text-xs font-semibold text-ink-600">#{row.id}</span>
      ),
    },
    {
      header: "Sender",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{row.name || "—"}</p>
          <p className="truncate text-[11px] text-ink-500">
            {row.email || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "User Type",
      render: (_, row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            row.patient
              ? "bg-accent-50 text-accent-700"
              : "bg-ink-100 text-ink-600"
          }`}
        >
          {row.patient ? "Patient" : "Guest"}
        </span>
      ),
    },
    {
      header: "Message",
      // FIX: Bada message truncate karega aur max-width restrict karega
      render: (_, row) => (
        <div className="max-w-[200px] sm:max-w-xs md:max-w-sm">
          <p className="truncate text-xs text-ink-700" title={row.message}>
            {row.message || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Date",
      // FIX: Proper AM/PM format use kiya
      render: (_, row) => (
        <span className="text-xs text-ink-600 whitespace-nowrap">
          {formatDateTime(row.created_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/contact-messages/${row.id}`)}
            className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
            title="View Details"
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
            Contact Messages
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Manage enquiries from the patient app
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Pending"
          count={counts.pending}
          icon={FiClock}
          bgClass="bg-warn-50"
          textClass="text-warn-700"
          iconClass="text-warn-500"
        />
        <SummaryCard
          label="Viewed"
          count={counts.view}
          icon={FiMail}
          bgClass="bg-accent-50"
          textClass="text-accent-700"
          iconClass="text-accent-500"
        />
        <SummaryCard
          label="Resolved"
          count={counts.resolved}
          icon={FiCheckCircle}
          bgClass="bg-brand-50"
          textClass="text-brand-700"
          iconClass="text-brand-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
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
          width="w-44"
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
        <Loader text="Loading messages..." />
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
            emptyText={
              search || statusFilter
                ? "No messages found for your filters."
                : "No contact messages yet."
            }
          />
        </div>
      )}
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

const SummaryCard = ({
  label,
  count,
  icon: Icon,
  bgClass,
  textClass,
  iconClass,
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-ink-100 bg-surface p-4 shadow-sm">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${bgClass} ${iconClass}`}
    >
      <Icon className="h-6 w-6" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <p className={`mt-0.5 text-2xl font-bold ${textClass}`}>{count}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let cls = "bg-ink-100 text-ink-600";
  let label = status;

  if (status === "pending") {
    cls = "bg-warn-50 text-warn-700 ring-1 ring-warn-200";
    label = "Pending";
  } else if (status === "view") {
    cls = "bg-accent-50 text-accent-700 ring-1 ring-accent-200";
    label = "Viewed";
  } else if (status === "resolved") {
    cls = "bg-brand-50 text-brand-700 ring-1 ring-brand-200";
    label = "Resolved";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
};

export default ContactMessageList;
