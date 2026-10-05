import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import {
  useAvailabilityExceptions,
  useDeleteException,
  useToggleExceptionStatus,
} from "../../queries/availabilityExceptions";
import { useProviderAvailability } from "../../queries/providerAvailabilities";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import ExceptionForm from "./components/ExceptionForm";

const AvailabilityExceptions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    item: null,
  });

  const { data: availability, isLoading: loadingAvailability } =
    useProviderAvailability(id);

  const { data, isLoading } = useAvailabilityExceptions({
    availability_id: id,
    per_page: 100,
  });
  const deleteMutation = useDeleteException();
  const toggleStatus = useToggleExceptionStatus();

  const list = data?.list || [];

  const handleConfirm = () => {
    const { type, item } = confirm;
    if (!item) return;
    const mutation = type === "toggle" ? toggleStatus : deleteMutation;
    mutation.mutate(item.id, {
      onSettled: () => setConfirm({ open: false, type: null, item: null }),
    });
  };

  const columns = [
    {
      header: "Date",
      accessor: "exception_date",
      render: (v) => (
        <span className="font-mono text-xs">{v?.slice(0, 10)}</span>
      ),
    },
    {
      header: "Time",
      render: (_, row) =>
        row.start_time && row.end_time ? (
          <span className="text-xs">
            {row.start_time} - {row.end_time}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-warn-100 px-2 py-0.5 text-[10px] font-semibold text-warn-800">
            Full Day
          </span>
        ),
    },
    {
      header: "Type",
      accessor: "type",
      render: (v) => (
        <span className="inline-flex rounded-full bg-danger-50 px-2 py-0.5 text-[11px] font-medium text-danger-700">
          {v}
        </span>
      ),
    },
    {
      header: "Reason",
      accessor: "reason",
      render: (v) => <span className="text-xs text-ink-600">{v || "—"}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (v) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
            v ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
          }`}
        >
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setEditData(row);
              setFormOpen(true);
            }}
            className="cursor-pointer rounded-lg p-1.5 text-ink-600 hover:bg-ink-100"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setConfirm({ open: true, type: "delete", item: row })
            }
            className="cursor-pointer rounded-lg p-1.5 text-danger-500 hover:bg-danger-50"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/provider-availabilities")}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Availabilities
          </button>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Exceptions
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage date-specific blocks or overrides
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setFormOpen(true);
          }}
          disabled={!availability}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiPlus className="h-4 w-4" />
          Add Exception
        </button>
      </div>

      {availability && (
        <div className="rounded-xl border border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-600">
            <span>
              Provider:{" "}
              <strong className="text-ink-800">
                {availability.provider?.name}
              </strong>
            </span>
            <span>
              Type:{" "}
              <strong className="text-ink-800">
                {availability.appointment_type?.name}
              </strong>
            </span>
            <span>
              Schedule:{" "}
              <strong className="text-ink-800">
                {availability.start_time} - {availability.end_time}
              </strong>
            </span>
            <span>
              Slot Duration:{" "}
              <strong className="text-ink-800">
                {availability.slot_duration} min
              </strong>
            </span>
          </div>
        </div>
      )}

      {isLoading || loadingAvailability ? (
        <Loader text="Loading exceptions..." />
      ) : (
        <CustomeTable
          columns={columns}
          data={list}
          emptyText="No exceptions added yet."
        />
      )}

      <ExceptionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        availabilityId={id}
        availability={availability}
        existingExceptions={list}
        initialData={editData}
      />

      <ConfirmModal
        open={confirm.open}
        title="Delete Exception"
        message="Are you sure you want to delete this exception?"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false, type: null, item: null })}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AvailabilityExceptions;
