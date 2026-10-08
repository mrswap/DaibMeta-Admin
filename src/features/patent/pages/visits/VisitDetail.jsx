// src/features/patent/pages/visits/VisitDetail.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiFileText,
  FiClock,
  FiCalendar,
  FiPaperclip,
  FiDollarSign,
  FiEdit2,
  FiPlayCircle,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useVisit, getLifecycleActions } from "../../queries/visits";
import Loader from "../../common/Loader";
import OverviewTab from "./components/tabs/OverviewTab";
import ConsultationTab from "./components/tabs/ConsultationTab";
import HistoryTab from "./components/tabs/HistoryTab";
import FollowUpTab from "./components/tabs/FollowUpTab";
import DocumentsTab from "./components/tabs/DocumentsTab";
import PaymentTab from "./components/tabs/PaymentTab";
import VisitLifecycleModal from "./components/VisitLifecycleModal";

// ==================== TABS ====================
const TABS = [
  { key: "overview", label: "Overview", icon: FiUser },
  { key: "consultation", label: "Consultation", icon: FiFileText },
  { key: "history", label: "History", icon: FiClock },
  { key: "followup", label: "Follow-up", icon: FiCalendar },
  { key: "documents", label: "Documents", icon: FiPaperclip },
  { key: "payment", label: "Payment", icon: FiDollarSign },
];

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDateFull = (d) => {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ==================== STATUS STYLES ====================
const STATUS_STYLES = {
  waiting: {
    bg: "bg-warn-100",
    text: "text-warn-900",
    dot: "bg-warn-500",
  },
  in_consultation: {
    bg: "bg-accent-100",
    text: "text-accent-800",
    dot: "bg-accent-500",
  },
  completed: {
    bg: "bg-brand-100",
    text: "text-brand-800",
    dot: "bg-brand-500",
  },
  cancelled: {
    bg: "bg-danger-50",
    text: "text-danger-700",
    dot: "bg-danger-500",
  },
  no_show: {
    bg: "bg-danger-100",
    text: "text-danger-900",
    dot: "bg-danger-600",
  },
};

// ==================== NEXT ACTION LOGIC ====================
const getNextAction = (status) => {
  if (status === "waiting") {
    return {
      title: "Patient is waiting",
      description:
        "Start consultation to record clinical information and begin the visit.",
      buttonLabel: "Start Consultation",
      buttonIcon: FiPlayCircle,
      variant: "brand",
    };
  }
  if (status === "in_consultation") {
    return {
      title: "Consultation in progress",
      description:
        "Record clinical information in the Consultation tab, then complete the visit.",
      buttonLabel: "Complete Visit",
      buttonIcon: FiCheckCircle,
      variant: "brand",
    };
  }
  if (status === "completed") {
    return {
      title: "Visit completed",
      description: "Create a follow-up or book the next appointment if needed.",
      buttonLabel: null,
      variant: "brand",
    };
  }
  return null;
};

// ==================== MAIN ====================
const VisitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: visit, isLoading } = useVisit(id);
  const [activeTab, setActiveTab] = useState("overview");
  const [lifecycleOpen, setLifecycleOpen] = useState(false);

  if (isLoading) return <Loader text="Loading visit..." />;

  if (!visit) {
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm text-ink-500">Visit not found.</p>
      </div>
    );
  }

  const status = visit.status;
  const canEdit = !["completed", "cancelled", "no_show"].includes(status);
  const showConsultation =
    status === "in_consultation" || status === "completed";
  const showFollowUp = status === "completed";

  const schedule = visit.visit_schedule || {};
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.waiting;
  const nextAction = getNextAction(status);
  const allowedActions = getLifecycleActions(status);

  // Filter tabs based on visit status
  const visibleTabs = TABS.filter((t) => {
    if (t.key === "consultation" && !showConsultation) return false;
    if (t.key === "followup" && !showFollowUp) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/visits")}
        className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700"
      >
        <FiArrowLeft className="h-3.5 w-3.5" />
        Back to Visits
      </button>

      {/* Hero Card — Patient + Visit Info */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        {/* Top section — Patient + Status */}
        <div className="bg-gradient-to-br from-brand-50/60 via-surface to-accent-50/30 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Patient info */}
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-surface shadow-sm">
                {getInitials(visit.patient?.name)}
              </div>
              <div className="min-w-0">
                <h1 className="font-jakarta text-lg font-bold text-ink-900 sm:text-xl">
                  {visit.patient?.name || "—"}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600">
                  {visit.patient?.patient_id && (
                    <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-700">
                      {visit.patient.patient_id}
                    </code>
                  )}
                  {visit.patient?.mobile && <span>{visit.patient.mobile}</span>}
                </div>
              </div>
            </div>

            {/* Status + Edit */}
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                />
                {visit.status_label || status}
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => navigate(`/visits/${id}/edit`)}
                  title="Edit visit"
                  className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-1.5 text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
                >
                  <FiEdit2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom section — Visit schedule strip */}
        <div className="grid grid-cols-1 gap-4 border-t border-ink-100 bg-surface px-5 py-4 sm:grid-cols-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiFileText className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Visit
              </p>
              <p className="text-sm font-semibold text-ink-900">
                #{visit.id} · {visit.visit_type_label || visit.visit_type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <FiUser className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Provider
              </p>
              <p className="truncate text-sm font-semibold text-ink-900">
                {visit.provider?.name || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warn-50 text-warn-700">
              <FiCalendar className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Schedule
              </p>
              <p className="truncate text-sm font-semibold text-ink-900">
                {formatDateFull(schedule.date || visit.visit_date)}
              </p>
              <p className="truncate text-[11px] text-ink-500">
                {formatTime12(schedule.start_time || visit.slot_start_time)} –{" "}
                {formatTime12(schedule.end_time || visit.slot_end_time)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Action Banner */}
      {nextAction && (
        <div
          className={`flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
            nextAction.variant === "brand"
              ? "border-brand-200 bg-brand-50/50"
              : "border-accent-200 bg-accent-50/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                nextAction.variant === "brand"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-accent-100 text-accent-700"
              }`}
            >
              <FiAlertCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  nextAction.variant === "brand"
                    ? "text-brand-900"
                    : "text-accent-900"
                }`}
              >
                {nextAction.title}
              </p>
              <p
                className={`mt-0.5 text-[11px] ${
                  nextAction.variant === "brand"
                    ? "text-brand-800"
                    : "text-accent-800"
                }`}
              >
                {nextAction.description}
              </p>
            </div>
          </div>

          {nextAction.buttonLabel && allowedActions.length > 0 && (
            <button
              type="button"
              onClick={() => setLifecycleOpen(true)}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
            >
              <nextAction.buttonIcon className="h-4 w-4" />
              {nextAction.buttonLabel}
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="flex overflow-x-auto border-b border-ink-100">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-700"
                    : "text-ink-500 hover:text-ink-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-brand-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-5">
          {activeTab === "overview" && <OverviewTab visit={visit} />}

          {activeTab === "consultation" && (
            <ConsultationTab visitId={id} visitStatus={status} />
          )}

          {activeTab === "history" && <HistoryTab visitId={id} />}

          {activeTab === "followup" && <FollowUpTab visitId={id} />}

          {activeTab === "documents" && <DocumentsTab visitId={id} />}

          {activeTab === "payment" && <PaymentTab visitId={id} />}
        </div>
      </div>

      {/* Lifecycle modal */}
      <VisitLifecycleModal
        open={lifecycleOpen}
        onClose={() => setLifecycleOpen(false)}
        visitId={visit.id}
        currentStatus={status}
        allowedActions={allowedActions}
      />
    </div>
  );
};

export default VisitDetail;
