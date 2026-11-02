// src/features/patent/pages/healthQuiz/history/HealthQuizAttemptView.jsx

import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiAward,
} from "react-icons/fi";

import { useHealthQuizAttempt } from "../../../queries/healthQuiz";
import Loader from "../../../common/Loader";

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const HealthQuizAttemptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useHealthQuizAttempt(id);

  if (isLoading) {
    return <Loader text="Loading attempt details..." />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/health-quiz/history")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-900">Attempt Not Found</h1>
        </div>
        <div className="rounded-xl border border-ink-100 bg-surface p-10 text-center">
          <FiAlertCircle className="mx-auto h-8 w-8 text-danger-500" />
          <p className="mt-3 text-sm text-ink-600">
            The quiz attempt you are looking for does not exist or failed to
            load.
          </p>
        </div>
      </div>
    );
  }

  const attempt = data.attempt || {};
  const patient = data.patient || {};
  const answers = data.answers || [];

  // Score percentage
  const scorePercent = attempt.total_marks
    ? Math.round(
        (Number(attempt.obtained_marks) / Number(attempt.total_marks)) * 100,
      )
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/health-quiz/history")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
            title="Go back"
          >
            <FiArrowLeft className="h-5 w-5 text-ink-700" />
          </button>
          <div>
            <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
              Quiz Attempt #{attempt.id}
            </h1>
            <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
              Attempt {attempt.attempt_number} · {patient.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left Column (Patient + Summary) */}
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

          {/* Score Card */}
          <div className="rounded-xl border border-brand-200 bg-brand-50/50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-100 flex items-center gap-2">
              <FiAward className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-brand-900">
                Score Summary
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-700">
                  {attempt.obtained_marks}{" "}
                  <span className="text-lg text-brand-500">
                    / {attempt.total_marks}
                  </span>
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {scorePercent}% Score
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-brand-200 bg-surface p-3 text-center">
                  <p className="text-[10px] font-medium uppercase text-brand-600">
                    Correct
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-brand-700">
                    {attempt.correct_answers}
                  </p>
                </div>
                <div className="rounded-lg border border-danger-200 bg-surface p-3 text-center">
                  <p className="text-[10px] font-medium uppercase text-danger-600">
                    Wrong
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-danger-700">
                    {attempt.wrong_answers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Attempt Details + Answers) */}
        <div className="space-y-5 lg:col-span-2">
          {/* Attempt Meta */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiClock className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Attempt Details
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <InfoRow
                  label="Attempt #"
                  value={`#${attempt.attempt_number}`}
                />
                <InfoRow
                  label="Total Questions"
                  value={attempt.total_questions}
                />
                <InfoRow
                  label="Attempted"
                  value={attempt.attempted_questions}
                />
                <InfoRow
                  label="Time Taken"
                  value={formatTime(attempt.time_taken_seconds)}
                />
                <InfoRow
                  label="Started"
                  value={
                    attempt.started_at
                      ? new Date(attempt.started_at).toLocaleString()
                      : "—"
                  }
                />
                <InfoRow
                  label="Submitted"
                  value={
                    attempt.submitted_at
                      ? new Date(attempt.submitted_at).toLocaleString()
                      : "—"
                  }
                />
              </div>
            </div>
          </div>

          {/* Answers Review */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
              <FiCheckCircle className="text-brand-600 h-4 w-4" />
              <h2 className="text-sm font-semibold text-ink-900">
                Question-wise Review
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {answers.length === 0 ? (
                <p className="text-center text-sm text-ink-500 py-4">
                  No answers recorded for this attempt.
                </p>
              ) : (
                answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-4 ${
                      ans.is_correct
                        ? "border-brand-200 bg-brand-50/30"
                        : "border-danger-200 bg-danger-50/30"
                    }`}
                  >
                    {/* Q Header */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          ans.is_correct
                            ? "bg-brand-600 text-white"
                            : "bg-danger-500 text-white"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink-900">
                          {ans.question}
                        </p>

                        {/* Options */}
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {["A", "B", "C", "D"].map((letter) => {
                            const optionText = ans.options?.[letter];
                            const isSelected = ans.selected_answer === letter;
                            const isCorrect = ans.correct_answer === letter;

                            let optCls =
                              "border-ink-200 bg-surface text-ink-700";
                            if (isCorrect)
                              optCls =
                                "border-brand-400 bg-brand-50 text-brand-800";
                            if (isSelected && !isCorrect)
                              optCls =
                                "border-danger-400 bg-danger-50 text-danger-800";
                            if (isSelected && isCorrect)
                              optCls =
                                "border-brand-500 bg-brand-100 text-brand-900";

                            return (
                              <div
                                key={letter}
                                className={`flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs ${optCls}`}
                              >
                                <span className="font-bold">{letter}.</span>
                                <span className="flex-1">{optionText}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold uppercase opacity-70">
                                    (Your ans)
                                  </span>
                                )}
                                {isCorrect && !isSelected && (
                                  <span className="text-[10px] font-bold uppercase opacity-70">
                                    (Correct)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Result Indicator */}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                          {ans.selected_answer ? (
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                ans.is_correct
                                  ? "text-brand-700"
                                  : "text-danger-700"
                              }`}
                            >
                              {ans.is_correct ? (
                                <FiCheckCircle className="h-3.5 w-3.5" />
                              ) : (
                                <FiXCircle className="h-3.5 w-3.5" />
                              )}
                              {ans.is_correct ? "Correct" : "Incorrect"}
                              {" — Selected: "}
                              {ans.selected_answer}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-warn-700">
                              <FiAlertCircle className="h-3.5 w-3.5" />
                              Not Answered
                            </span>
                          )}
                          <span className="text-ink-500">
                            · Correct Answer:{" "}
                            <strong className="text-ink-800">
                              {ans.correct_answer}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
      {label}
    </p>
    <p className="mt-0.5 text-sm font-medium text-ink-800">{value || "—"}</p>
  </div>
);

export default HealthQuizAttemptView;
