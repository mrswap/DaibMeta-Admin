// src/features/patent/pages/contactMessages/ContactMessageDetails.jsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiAlertCircle,
  FiMessageSquare,
  FiCalendar,
  FiClock,
  FiInfo,
  FiChevronDown,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";

import {
  useContactMessage,
  useUpdateContactMessageStatus,
} from "../../queries/contactMessages";
import Loader from "../../common/Loader";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    colorClass: "bg-warn-50 text-warn-700 ring-warn-200",
  },
  {
    value: "view",
    label: "Viewed",
    colorClass: "bg-accent-50 text-accent-700 ring-accent-200",
  },
  {
    value: "resolved",
    label: "Resolved",
    colorClass: "bg-brand-50 text-brand-700 ring-brand-200",
  },
];

// Proper AM/PM date formatting helper
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

const ContactMessageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: message, isLoading, isError } = useContactMessage(id);
  const updateMutation = useUpdateContactMessageStatus();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (message?.status) {
      setSelectedStatus(message.status);
    }
  }, [message?.status]);

  if (isLoading) return <Loader text="Loading message details..." />;

  if (isError || !message) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/contact-messages")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-900">Message Not Found</h1>
        </div>
        <div className="rounded-xl border border-ink-100 bg-surface p-10 text-center">
          <FiAlertCircle className="mx-auto h-8 w-8 text-danger-500" />
          <p className="mt-3 text-sm text-ink-600">
            The contact message you are looking for does not exist or failed to
            load.
          </p>
          <button
            onClick={() => navigate("/contact-messages")}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    if (!selectedStatus || selectedStatus === message.status) return;
    updateMutation.mutate({ id, status: selectedStatus });
  };

  const isStatusChanged = selectedStatus && selectedStatus !== message.status;
  const selectedOption = STATUS_OPTIONS.find((o) => o.value === selectedStatus);

  return (
    <div className="space-y-6">
      {/* Header with Top-Right Status Update */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/contact-messages")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
            title="Go back"
          >
            <FiArrowLeft className="h-5 w-5 text-ink-700" />
          </button>
          <div>
            <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
              Message #{message.id}
            </h1>
            <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
              Submitted on {formatDateTime(message.created_at)}
            </p>
          </div>
        </div>

        {/* Right side: Status Update Control */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-surface px-3 py-2 text-sm transition-colors min-w-[140px] ${
                isDropdownOpen
                  ? "border-brand-400 ring-1 ring-brand-100"
                  : "border-ink-200 hover:border-ink-300"
              }`}
            >
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
                  selectedOption?.colorClass ||
                  "bg-ink-100 text-ink-600 ring-ink-200"
                }`}
              >
                {selectedOption?.label || "Select Status"}
              </span>
              <FiChevronDown
                className={`h-4 w-4 text-ink-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-lg">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-ink-50 ${
                      selectedStatus === opt.value
                        ? "bg-brand-50/50 font-medium text-brand-700"
                        : "text-ink-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedStatus === opt.value && (
                      <FiCheck className="h-4 w-4 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleStatusUpdate}
            disabled={!isStatusChanged || updateMutation.isPending}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              isStatusChanged
                ? "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover shadow-sm"
                : "bg-ink-100 text-ink-400 cursor-not-allowed"
            }`}
          >
            {updateMutation.isPending ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <FiRefreshCw className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Sender Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Sender Info */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-50 text-ink-600">
                <FiUser className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-ink-900">
                Sender Information
              </h2>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Message Sender
                </p>
                <p className="mt-1 font-medium text-ink-900">
                  {message.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Email
                </p>
                {message.email ? (
                  <a
                    href={`mailto:${message.email}`}
                    className="mt-1 inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
                  >
                    <FiMail className="h-3.5 w-3.5" />
                    {message.email}
                  </a>
                ) : (
                  <p className="mt-1 text-ink-400 italic">Not provided</p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  User Type
                </p>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      message.patient
                        ? "bg-accent-50 text-accent-700"
                        : "bg-ink-100 text-ink-600"
                    }`}
                  >
                    {message.patient ? "Patient" : "Guest"}
                  </span>
                </p>
              </div>

              {/* Registered Account Details */}
              {message.patient && (
                <div className="mt-4 rounded-lg border border-ink-100 bg-ink-50/50 p-3.5 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500 flex items-center gap-1">
                    <FiInfo className="h-3 w-3" /> Account Details
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-ink-800">
                      {message.patient.name || "—"}
                    </p>
                    {message.patient.email && (
                      <p className="text-[11px] text-ink-500 truncate">
                        {message.patient.email}
                      </p>
                    )}
                    <p className="text-[11px] text-ink-500">
                      Patient ID:{" "}
                      <strong className="text-ink-700">
                        #{message.patient.id}
                      </strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Message Content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-ink-100 px-5 py-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-50 text-ink-600">
                <FiMessageSquare className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-ink-900">
                Message Content
              </h2>
            </div>

            <div className="p-6 flex-1">
              <div className="rounded-lg bg-ink-50/30 p-4 border border-ink-100">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
                  {message.message || "No message content."}
                </p>
              </div>
            </div>

            <div className="border-t border-ink-100 bg-ink-50/30 px-6 py-4 mt-auto">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-ink-500">
                <span className="inline-flex items-center gap-2">
                  <FiCalendar className="h-3.5 w-3.5 text-ink-400" />
                  <span>Submitted</span>
                  <strong className="text-ink-700">
                    {formatDateTime(message.created_at)}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-2">
                  <FiClock className="h-3.5 w-3.5 text-ink-400" />
                  <span>Last Updated</span>
                  <strong className="text-ink-700">
                    {formatDateTime(message.updated_at)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMessageDetails;
