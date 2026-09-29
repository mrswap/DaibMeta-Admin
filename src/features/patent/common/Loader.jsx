import React from "react";
import { useTranslation } from "react-i18next";

const Loader = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  variant = "primary",
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const variantClasses = {
    primary: "border-blue-500 border-t-transparent",
    secondary: "border-teal-500 border-t-transparent",
    white: "border-white border-t-transparent",
    medical: "border-emerald-500 border-t-transparent",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex flex-col items-center justify-center p-6";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {/* Medical Pulse Ring Animation */}
        <div className="relative">
          <div
            className={`
            ${sizeClasses[size]} rounded-full border-4 
            ${variantClasses[variant]} animate-spin
          `}
          />

          {/* Medical Cross Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className={`${size === "sm" ? "w-3 h-3" : size === "md" ? "w-5 h-5" : "w-7 h-7"} text-blue-500`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>

        {/* Pulsing Dots Animation */}
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Loading Text with Medical Font */}
        {text && (
          <div className="space-y-2 text-center">
            <p
              className={`
              font-medium text-gray-700 tracking-wide
              ${textSizeClasses[size]}
            `}
            >
              {text}
            </p>
            <p className="text-xs text-gray-400 animate-pulse">
              {t("loaderText")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
