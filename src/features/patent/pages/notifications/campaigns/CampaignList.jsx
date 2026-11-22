// src/features/patent/pages/notifications/campaigns/CampaignList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiLock,
} from "react-icons/fi";
import { useCampaigns, useDeleteCampaign } from "../../../queries/campaigns";
import Loader from "../../../common/Loader";
import ConfirmModal from "../../../common/ConfirmModal";
import CustomeTable from "../../../common/table/CustomeTable";
import { usePermission } from "../../../hooks/usePermission";

const STATUS_STYLES = {
  scheduled: "bg-accent-50 text-accent-800",
  processing: "bg-brand-50 text-brand-700",
  sent: "bg-brand-50 text-brand-700",
  partial: "bg-warn-50 text-warn-700",
  failed: "bg-danger-50 text-danger-600",
  pending: "bg-ink-100 text-ink-600",
};
const STATUS_LABELS = {
  scheduled: "Scheduled",
  processing: "Processing",
  sent: "Sent",
  partial: "Partial",
  failed: "Failed",
  pending: "Pending",
};
const StatusBadge = ({ status }) => {
  const key = (status || "pending").toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[key] || "bg-ink-100 text-ink-600"
      }`}
    >
      {STATUS_LABELS[key] || status || "—"}
    </span>
  );
};

const CampaignList = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canView = can("notifications", "view");
  const canManage = can("notifications", "manage");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [confirm, setConfirm] = useState({
    open: false,
    uuid: null,
    title: "",
  });

  const params = { page, per_page: perPage, ...(search && { search }) };

  const { data, isLoading, isFetching, refetch } = useCampaigns(params, {
    enabled: canView,
  });
  const deleteMutation = useDeleteCampaign();

  const list = data?.list || [];
  const meta = data?.meta || {};

  // ======= UPDATED LOGIC =======
  // Agar campaign_status "scheduled" hai, toh delete button enable hoga.
  const isModifiable = (row) => {
    const status = (
      row.campaign_status ||
      row.status ||
      row.push_status ||
      ""
    ).toLowerCase();
    return status === "scheduled";
  };

  const formatSchedule = (row) => {
    if (!row.scheduled_at) return "Immediate";
    return new Date(row.scheduled_at).toLocaleString();
  };

  const handleDeleteClick = (row) => {
    if (!canManage) return;
    if (!isModifiable(row)) return;
    setConfirm({
      open: true,
      uuid: row.campaign_uuid || row.uuid,
      title: row.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirm.uuid) return;
    deleteMutation.mutate(confirm.uuid, {
      onSettled: () => setConfirm({ open: false, uuid: null, title: "" }),
    });
  };

  if (permLoading) return <Loader text="Checking permissions..." />;

  if (!canView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to view campaigns.
        </p>
      </div>
    );
  }

  const columns = [
    {
      header: "Campaign",
      render: (_, row) => (
        <p className="min-w-[160px] font-medium text-ink-900">{row.title}</p>
      ),
    },
    {
      header: "Message",
      render: (_, row) => (
        <p className="max-w-xs truncate text-sm text-ink-600">
          {row.message || "—"}
        </p>
      ),
    },
    {
      header: "Audience",
      render: () => <span className="text-sm text-ink-700">All Patients</span>,
    },
    {
      header: "Recipients",
      render: (_, row) => (
        <span className="text-sm text-ink-700">
          {row.recipients ?? row.total_recipients ?? 0}
        </span>
      ),
    },
    {
      header: "Schedule",
      render: (_, row) => (
        <span className="text-sm text-ink-700">{formatSchedule(row)}</span>
      ),
    },
    {
      header: "Status",
      render: (_, row) => (
        <StatusBadge
          status={row.campaign_status || row.status || row.push_status}
        />
      ),
    },
    {
      header: "Created At",
      render: (_, row) => (
        <span className="text-sm text-ink-600">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (_, row) => {
        const uuid = row.campaign_uuid || row.uuid;
        const modifiable = isModifiable(row);

        return (
          <div className="flex items-center justify-end gap-1">
            <IconBtn
              title="View Details"
              onClick={() => navigate(`/notifications/campaigns/${uuid}`)}
            >
              <FiEye className="h-4 w-4" />
            </IconBtn>

            {canManage && (
              <IconBtn
                title={
                  modifiable
                    ? "Delete"
                    : "Only scheduled campaigns can be deleted"
                }
                onClick={() => handleDeleteClick(row)}
                disabled={!modifiable}
                danger
              >
                <FiTrash2 className="h-4 w-4" />
              </IconBtn>
            )}
          </div>
        );
      },
    },
  ];

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Notification Campaigns
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Broadcast notifications to all patients
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/notifications/campaigns/create")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" /> Create Campaign
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <Loader text="Loading campaigns..." />
      ) : (
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
            search
              ? "No campaigns found for your search."
              : "No campaigns yet. Create your first campaign."
          }
        />
      )}

      {canManage && (
        <ConfirmModal
          open={confirm.open}
          title="Delete Campaign"
          message={`Are you sure you want to delete "${confirm.title}"? This will remove it from all scheduled deliveries.`}
          confirmText="Delete"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirm({ open: false, uuid: null, title: "" })}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

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

export default CampaignList;
