// src/features/patent/pages/store/leads/StoreLeadView.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMapPin,
  FiBox,
  FiFileText,
  FiAlertCircle,
  FiImage,
  FiChevronDown,
} from "react-icons/fi";

import {
  useStoreLead,
  useChangeStoreLeadStatus,
} from "../../../queries/storeLeads";
import Loader from "../../../common/Loader";
import ConfirmModal from "../../../common/ConfirmModal";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "viewed", label: "Viewed" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancel", label: "Cancelled" },
];

const StoreLeadView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [statusToChange, setStatusToChange] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: lead, isLoading, isError } = useStoreLead(id);
  const statusMutation = useChangeStoreLeadStatus();

  if (isLoading) {
    return <Loader text="Loading lead details..." />;
  }

  if (isError || !lead) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/store/leads")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-900">Lead Not Found</h1>
        </div>
        <div className="rounded-xl border border-ink-100 bg-surface p-10 text-center">
          <FiAlertCircle className="mx-auto h-8 w-8 text-danger-500" />
          <p className="mt-3 text-sm text-ink-600">
            The store lead you are looking for does not exist or failed to load.
          </p>
        </div>
      </div>
    );
  }

  const handleConfirmStatusChange = () => {
    if (!statusToChange) return;
    statusMutation.mutate(
      { id: lead.id, status: statusToChange.value },
      {
        onSettled: () => {
          setStatusToChange(null);
          setIsDropdownOpen(false);
        },
      },
    );
  };

  const delivery = lead.delivery_address || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/store/leads")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
            title="Go back"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
                Booking #{lead.booking_number}
              </h1>
              <StatusBadge status={lead.status} label={lead.status_label} />
            </div>
            <p className="mt-1 text-xs text-ink-500 sm:text-sm">
              Placed on{" "}
              {lead.created_at
                ? new Date(lead.created_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-ink-50 sm:w-auto"
          >
            <span>Change Status</span>
            <FiChevronDown
              className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-ink-100 bg-surface py-1 shadow-lg animate-in fade-in slide-in-from-top-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (opt.value !== lead.status) {
                        setStatusToChange(opt);
                      } else {
                        setIsDropdownOpen(false);
                      }
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-ink-50 ${
                      opt.value === lead.status
                        ? "font-semibold text-brand-600 bg-brand-50/50"
                        : "text-ink-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Patient & Delivery) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Patient Info */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiUser className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Patient Information
              </h2>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Name
                </p>
                <p className="mt-0.5 font-medium text-ink-900">
                  {lead.patient?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Mobile
                </p>
                <a
                  href={`tel:${lead.patient?.mobile}`}
                  className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
                >
                  <FiPhone className="h-3.5 w-3.5" />
                  {lead.patient?.mobile || "—"}
                </a>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Patient ID
                </p>
                <p className="mt-0.5 text-ink-700">
                  #{lead.patient?.id || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiMapPin className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Delivery Address
              </h2>
            </div>
            <div className="p-5 space-y-1.5 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">{delivery.name}</p>
              <p className="flex items-center gap-1.5 text-xs">
                <FiPhone className="h-3 w-3 text-ink-400" />
                {delivery.mobile}
              </p>
              <div className="mt-3 border-t border-ink-50 pt-3">
                <p>{delivery.address_line}</p>
                {delivery.landmark && (
                  <p className="mt-1 text-xs text-ink-500">
                    Landmark: {delivery.landmark}
                  </p>
                )}
                <p className="mt-1">
                  {delivery.city}, {delivery.state} -{" "}
                  <span className="font-semibold text-ink-900">
                    {delivery.pincode}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Booking Notes */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiFileText className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">Notes</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-ink-700 italic">
                {lead.booking_notes
                  ? `"${lead.booking_notes}"`
                  : "No special notes provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Items & Pricing) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ordered Items */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiBox className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Ordered Products
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-surface text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-3 py-3 text-center font-medium">Qty</th>
                    <th className="px-3 py-3 text-right font-medium">
                      Unit Price
                    </th>
                    <th className="px-3 py-3 text-right font-medium">MRP</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {lead.items?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors hover:bg-ink-50/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-100 bg-ink-50">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <FiImage className="h-5 w-5 text-ink-300" />
                            )}
                          </div>
                          <span className="font-medium text-ink-900 line-clamp-2">
                            {item.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center font-medium text-ink-700">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-4 text-right text-ink-600">
                        ₹{item.unit_price}
                      </td>
                      <td className="px-3 py-4 text-right text-xs text-ink-400 line-through">
                        ₹{item.mrp}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-ink-900">
                        ₹{item.total_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Details */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiFileText className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Price Breakdown
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3 text-sm max-w-sm ml-auto">
                <div className="flex justify-between text-ink-600">
                  <span>Item Total</span>
                  <span className="font-medium text-ink-800">
                    ₹{lead.price_details?.subtotal || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Processing Fee</span>
                  <span className="font-medium text-ink-800">
                    ₹{lead.price_details?.processing_charge || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-ink-800">
                    ₹{lead.price_details?.delivery_charge || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Other Fees</span>
                  <span className="font-medium text-ink-800">
                    ₹{lead.price_details?.other_charge || "0.00"}
                  </span>
                </div>

                <div className="mt-4 flex justify-between border-t border-ink-200 border-dashed pt-4 text-base font-bold text-ink-900">
                  <span>Grand Total</span>
                  <span className="text-brand-700 text-lg">
                    ₹{lead.price_details?.total_amount || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Status Change Modal */}
      <ConfirmModal
        open={!!statusToChange}
        title="Change Booking Status"
        message={`Are you sure you want to change booking ${lead.booking_number} status to ${statusToChange?.label}?`}
        confirmText="Confirm"
        variant="warn"
        loading={statusMutation.isPending}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusToChange(null)}
      />
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

const StatusBadge = ({ status, label }) => {
  let colorClasses = "bg-ink-100 text-ink-600";

  switch (status) {
    case "new":
      colorClasses = "bg-accent-50 text-accent-700 ring-1 ring-accent-200";
      break;
    case "viewed":
      colorClasses = "bg-ink-100 text-ink-600 ring-1 ring-ink-200";
      break;
    case "processing":
      colorClasses = "bg-warn-50 text-warn-700 ring-1 ring-warn-200";
      break;
    case "delivered":
      colorClasses = "bg-brand-50 text-brand-700 ring-1 ring-brand-200";
      break;
    case "cancel":
      colorClasses = "bg-danger-50 text-danger-700 ring-1 ring-danger-200";
      break;
    default:
      colorClasses = "bg-ink-100 text-ink-600 ring-1 ring-ink-200";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${colorClasses}`}
    >
      {label || status}
    </span>
  );
};

export default StoreLeadView;
