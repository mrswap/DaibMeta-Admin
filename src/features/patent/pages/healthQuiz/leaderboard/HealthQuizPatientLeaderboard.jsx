// src/features/patent/pages/healthQuiz/leaderboard/HealthQuizPatientLeaderboard.jsx

import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";

import { useHealthQuizPatientLeaderboard } from "../../../queries/healthQuiz";
import Loader from "../../../common/Loader";
import CustomeTable from "../../../common/table/CustomeTable";

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const HealthQuizPatientLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useHealthQuizPatientLeaderboard(id);

  if (isLoading) return <Loader text="Loading patient details..." />;

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/health-quiz/leaderboard")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-900">Patient Not Found</h1>
        </div>
        <div className="rounded-xl border border-ink-100 bg-surface p-10 text-center">
          <FiAlertCircle className="mx-auto h-8 w-8 text-danger-500" />
          <p className="mt-3 text-sm text-ink-600">
            No completed quiz attempt found for this patient.
          </p>
        </div>
      </div>
    );
  }

  const patient = data.patient || {};
  const bestAttempt = data.best_attempt || {};
  const attempts = data.attempts || [];

  // ==================== ATTEMPT HISTORY COLUMNS ====================
  const columns = [
    {
      header: "Attempt",
      render: (_, row) => (
        <span className="inline-flex items-center justify-center rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
          #{row.attempt_number}
        </span>
      ),
    },
    {
      header: "Questions",
      render: (_, row) => (
        <span className="text-xs text-ink-600">{row.total_questions || 0}</span>
      ),
    },
    {
      header: "Score",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-ink-900">
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
            onClick={() => navigate(`/health-quiz/history/${row.id}`)}
            className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
            title="View Attempt Details"
          >
            <FiEye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/health-quiz/leaderboard")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            {patient.name}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Patient Performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left Column: Patient Info + Best Performance */}
        <div className="space-y-5 lg:col-span-1">
          {/* Patient Info */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiUser className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Patient Information
              </h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Name
                </p>
                <p className="mt-0.5 font-medium text-ink-900">
                  {patient.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Email
                </p>
                <a
                  href={`mailto:${patient.email}`}
                  className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
                >
                  <FiMail className="h-3.5 w-3.5" />
                  {patient.email || "—"}
                </a>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Patient ID
                </p>
                <p className="mt-0.5 text-ink-700">#{patient.id || "—"}</p>
              </div>
            </div>
          </div>

          {/* Best Performance Card */}
          <div className="rounded-xl border border-brand-200 bg-brand-50/50 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-brand-100 flex items-center gap-2">
              <FiAward className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-brand-900">
                Best Performance
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-700">
                  {bestAttempt.obtained_marks}{" "}
                  <span className="text-lg text-brand-500">
                    / {bestAttempt.total_marks}
                  </span>
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Attempt #{bestAttempt.attempt_number}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-brand-200 bg-surface p-3 text-center">
                  <p className="text-[10px] font-medium uppercase text-brand-600">
                    Correct
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-brand-700">
                    {bestAttempt.correct_answers}
                  </p>
                </div>
                <div className="rounded-lg border border-danger-200 bg-surface p-3 text-center">
                  <p className="text-[10px] font-medium uppercase text-danger-600">
                    Wrong
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-danger-700">
                    {bestAttempt.wrong_answers}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-ink-100 bg-surface px-3 py-2 text-xs">
                <div className="flex items-center justify-between text-ink-600">
                  <span>Time Taken</span>
                  <span className="font-semibold text-ink-800">
                    {formatTime(bestAttempt.time_taken_seconds)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-ink-600">
                  <span>Submitted</span>
                  <span className="font-semibold text-ink-800">
                    {bestAttempt.submitted_at
                      ? new Date(bestAttempt.submitted_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attempt History Table */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiCheckCircle className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Attempt History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <CustomeTable
                columns={columns}
                data={attempts}
                emptyText="No attempts found."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthQuizPatientLeaderboard;
