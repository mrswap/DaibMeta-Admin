import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/slice/authSlice";
import { useToast } from "./toast/ToastContext";
import { useTranslation } from "react-i18next";

const Error = ({
  type = "error",
  title,
  message,
  onRetry,
  onDismiss,
  fullScreen = false,
  showIcon = true,
  showRetry = true,
  showDismiss = true,
  showHomeButton = true,
  showLogoutButton = true,
  showReloadButton = true,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(true);
  const toast = useToast();
  const { t } = useTranslation();

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleRetry = () => {
    if (onRetry) onRetry();
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
    window.location.reload();
  };

  // Auto handle Unauthenticated error
  useEffect(() => {
    if (message === "Unauthenticated") {
      handleLogout();
    }
  }, [message, dispatch, navigate, toast, t]);

  const handleReload = () => {
    window.location.reload();
  };

  if (!isVisible) return null;

  const alertConfig = {
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-500",
      title: "Error",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-500",
      title: "Warning",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-500",
      title: "Information",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-500",
      title: "Success",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const config = alertConfig[type] || alertConfig.error;
  const displayTitle = title || config.title;

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    : "w-full";

  const alertClasses = `
    ${config.bgColor}
    ${config.borderColor}
    border-l-4
    rounded-lg
    shadow-lg
    ${fullScreen ? "max-w-md w-full" : "w-full"}
  `;

  return (
    <div className={containerClasses}>
      <div className={alertClasses} role="alert">
        <div className="p-4">
          <div className="flex items-start">
            {/* Icon Section */}
            {showIcon && (
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                {config.icon}
              </div>
            )}

            {/* Content Section */}
            <div className={`flex-1 ${showIcon ? "ml-3" : ""}`}>
              <h3 className={`text-sm font-semibold ${config.textColor} mb-1`}>
                {displayTitle}
              </h3>

              <div className={`text-sm ${config.textColor} opacity-90`}>
                {message}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-3 flex-wrap">
                {showReloadButton && (
                  <button
                    onClick={handleReload}
                    className={`
                      inline-flex items-center px-3 py-1.5 text-sm font-medium
                      cursor-pointer
                      rounded-md transition-all duration-200
                      text-purple-600 bg-purple-50
                      hover:bg-purple-100
                      focus:outline-none focus:ring-2 focus:ring-purple-500
                    `}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Reload Page
                  </button>
                )}

                {showHomeButton && (
                  <button
                    onClick={handleHome}
                    className={`
                      inline-flex items-center px-3 py-1.5 text-sm font-medium cursor-pointer
                      rounded-md transition-all duration-200
                      text-blue-600 bg-blue-50
                      hover:bg-blue-100
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    `}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Home
                  </button>
                )}

                {showLogoutButton && (
                  <button
                    onClick={handleLogout}
                    className={`
                      inline-flex items-center px-3 py-1.5 text-sm font-medium cursor-pointer
                      rounded-md transition-all duration-200
                      text-red-600 bg-red-50
                      hover:bg-red-100
                      focus:outline-none focus:ring-2 focus:ring-red-500
                    `}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                )}

                {showRetry && onRetry && (
                  <button
                    onClick={handleRetry}
                    className={`
                      inline-flex items-center px-3 py-1.5 text-sm font-medium cursor-pointer
                      rounded-md transition-all duration-200
                      ${config.textColor}
                      ${config.bgColor}
                      hover:bg-opacity-80
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      focus:ring-${type === "error" ? "red" : type === "warning" ? "yellow" : "blue"}-500
                    `}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Try Again
                  </button>
                )}

                {showDismiss && (
                  <button
                    onClick={handleDismiss}
                    className={`
                      inline-flex items-center px-3 py-1.5 text-sm font-medium
                      rounded-md transition-all duration-200
                      text-gray-600 hover:text-gray-800
                      hover:bg-gray-100
                      focus:outline-none focus:ring-2 focus:ring-gray-500
                    `}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Dismiss
                  </button>
                )}
              </div>
            </div>

            {/* Close Button for FullScreen */}
            {fullScreen && showDismiss && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Medical Pulse Animation for Error */}
        {type === "error" && (
          <div className="h-1 w-full bg-red-100 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-red-500 animate-pulse"
              style={{ width: "100%" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Error;
