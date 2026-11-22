// src/features/patent/pages/notifications/campaigns/CampaignDetail.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiInfo, FiUsers, FiActivity } from "react-icons/fi";
import { useCampaign } from "../../queries/campaigns";
import Loader from "../../common/Loader";
import CustomeTable from "../../common/table/CustomeTable";

const STATUS_STYLES = {
  scheduled: "bg-indigo-50 text-indigo-700 border-indigo-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  skipped: "bg-slate-100 text-slate-700 border-slate-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS = {
  scheduled: "Scheduled",
  processing: "Processing",
  sent: "Sent",
  partial: "Partial",
  failed: "Failed",
  skipped: "Skipped",
  pending: "Pending",
};

const StatusBadge = ({ status, isPill = false }) => {
  const key = (status || "pending").toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
        isPill ? "rounded-full" : ""
      } ${STATUS_STYLES[key] || STATUS_STYLES.pending}`}
    >
      {STATUS_LABELS[key] || status || "—"}
    </span>
  );
};

const deriveStats = (records = []) => {
  const counts = {
    total: records.length,
    sent: 0,
    partial: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
  };
  records.forEach((r) => {
    const s = (r.push_status || "pending").toLowerCase();
    if (s === "sent") counts.sent += 1;
    else if (s === "partial") counts.partial += 1;
    else if (s === "failed") counts.failed += 1;
    else if (s === "skipped") counts.skipped += 1;
    else counts.pending += 1;
  });
  return counts;
};

const PER_PAGE = 3;

const CampaignDetail = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useCampaign(uuid);

  const [page, setPage] = useState(1);

  const paginated = data || null;
  const records = Array.isArray(paginated?.data) ? paginated.data : [];

  const first = records[0] || null;

  const campaignTitle = first?.title || "Campaign";
  const campaignMessage = first?.message || "—";
  const campaignImage = first?.image || null;
  const scheduledAt = first?.scheduled_at || null;
  const createdAt = first?.created_at || null;

  const overallStatus = (() => {
    if (!records.length) return "pending";
    const has = (s) =>
      records.some((r) => (r.push_status || "").toLowerCase() === s);
    const allPending = records.every(
      (r) => (r.push_status || "pending").toLowerCase() === "pending",
    );
    if (scheduledAt && new Date(scheduledAt) > new Date() && allPending)
      return "scheduled";
    if (has("partial")) return "partial";
    if (has("failed") && !has("sent")) return "failed";
    if (has("sent")) return "sent";
    if (allPending) return "pending";
    return "processing";
  })();

  const stats = deriveStats(records);
  const totalRecords = paginated?.total || stats.total;

  // Client-side pagination for recipients
  const totalPages = Math.max(1, Math.ceil(records.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PER_PAGE;
  const paginatedRecords = records.slice(startIndex, startIndex + PER_PAGE);

  // Recipient delivery table columns
  const recipientColumns = [
    {
      header: "Recipient Name",
      render: (_, row) => (
        <span className="whitespace-nowrap font-medium text-ink-900">
          {row.recipient_name || `User #${row.recipient_id}`}
        </span>
      ),
    },
    {
      header: "Recipient ID",
      render: (_, row) => (
        <span className="whitespace-nowrap text-ink-600">
          #{row.recipient_id}
        </span>
      ),
    },
    {
      header: "Status",
      render: (_, row) => <StatusBadge status={row.push_status} />,
    },
    {
      header: "Error Details",
      render: (_, row) =>
        row.push_error ? (
          <span
            title={row.push_error}
            className="block max-w-[400px] truncate text-ink-500"
          >
            {row.push_error}
          </span>
        ) : (
          <span className="text-ink-300">—</span>
        ),
    },
    {
      header: "Processed At",
      headerClassName: "text-right",
      render: (_, row) => (
        <span className="whitespace-nowrap text-ink-500">
          {row.push_sent_at ? new Date(row.push_sent_at).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <button
          onClick={() => navigate("/notifications/campaigns")}
          className="group mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
        >
          <FiArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          Back to Campaigns
        </button>

        {isLoading ? (
          <Loader text="Loading campaign details..." />
        ) : !records.length ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Campaign not found or has no records.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-jakarta text-2xl font-bold text-ink-900 md:text-3xl">
                  {campaignTitle}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-ink-500">
                  <span>Campaign UUID:</span>
                  <code className="rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                    {first?.campaign_uuid || uuid}
                  </code>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <StatusBadge status={overallStatus} isPill />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard
                label="Total Recipients"
                value={totalRecords}
                tone="neutral"
              />
              <StatCard label="Sent" value={stats.sent} tone="success" />
              <StatCard label="Partial" value={stats.partial} tone="warn" />
              <StatCard label="Failed" value={stats.failed} tone="danger" />
              <StatCard label="Skipped" value={stats.skipped} tone="neutral" />
              <StatCard label="Pending" value={stats.pending} tone="neutral" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="rounded-xl border border-ink-200 bg-surface p-5 shadow-sm lg:col-span-2">
                <div className="mb-3 flex items-center gap-2 border-b border-ink-100 pb-3">
                  <FiActivity className="h-4 w-4 text-ink-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Message Content
                  </p>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">
                  {campaignMessage}
                </p>

                {campaignImage && (
                  <div className="mt-5 overflow-hidden rounded-lg border border-ink-100">
                    <img
                      src={campaignImage}
                      alt="Campaign Attached"
                      className="max-h-[400px] w-full object-cover transition duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-ink-200 bg-surface p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-ink-100 pb-3">
                  <FiInfo className="h-4 w-4 text-ink-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Campaign Details
                  </p>
                </div>
                <div className="space-y-4">
                  <MetaRow label="Audience" value="All Patients" />
                  <MetaRow
                    label="Schedule"
                    value={
                      scheduledAt
                        ? new Date(scheduledAt).toLocaleString()
                        : "Immediate"
                    }
                  />
                  <MetaRow
                    label="Created On"
                    value={
                      createdAt ? new Date(createdAt).toLocaleString() : "—"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-sm">
              <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/50 px-5 py-4">
                <FiUsers className="h-5 w-5 text-ink-400" />
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">
                    Recipient Delivery Details
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-500">
                    Showing {paginatedRecords.length} of {records.length}{" "}
                    recipients
                  </p>
                </div>
              </div>

              <CustomeTable
                columns={recipientColumns}
                data={paginatedRecords}
                emptyText="No recipient records found."
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={records.length}
                itemsPerPage={PER_PAGE}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, tone = "neutral" }) => {
  const tones = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-100",
    warn: "bg-amber-50 text-amber-800 border-amber-100",
    danger: "bg-rose-50 text-rose-800 border-rose-100",
    neutral: "bg-ink-50 text-ink-800 border-ink-100",
  };
  return (
    <div
      className={`flex flex-col justify-center rounded-xl border px-4 py-4 ${
        tones[tone] || tones.neutral
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
};

const MetaRow = ({ label, value }) => (
  <div className="flex flex-col">
    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-ink-800">{value}</p>
  </div>
);

export default CampaignDetail;
