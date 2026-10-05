import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import { useAuthStore } from "../../../stores/authStore";

const NotFound = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  // Decide where "Home" should point
  const isAuthed = isAuthenticated && !!token;
  const homePath = isAuthed ? "/dashboard" : "/login";
  const homeLabel = isAuthed ? "Go to Dashboard" : "Go to Login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-10">
      <div className="w-full max-w-md text-center">
        {/* Big 404 */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <span className="select-none font-jakarta text-[120px] font-bold leading-none tracking-tighter text-ink-100 sm:text-[150px]">
              404
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-brand-600/10 px-4 py-2 font-jakarta text-sm font-semibold uppercase tracking-wider text-brand-700">
                Page Not Found
              </span>
            </span>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
          Oops! Page not found
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-200 bg-surface px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-50 sm:w-auto"
          >
            <FiArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          <button
            type="button"
            onClick={() => navigate(homePath, { replace: true })}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700 sm:w-auto"
          >
            <FiHome className="h-4 w-4" />
            {homeLabel}
          </button>
        </div>

        {/* Small footer */}
        <p className="mt-8 text-[11px] text-ink-400">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
