// Full updated Loader.jsx

/**
 * Loader — reusable spinner component
 *
 * Usage:
 *   <Loader />                          // inline (default, small)
 *   <Loader size="lg" />                // large
 *   <Loader fullPage />                 // full-page overlay (screens ke load time)
 *   <Loader fullPage text="Loading..." /> // custom text
 */
const Loader = ({ size = "md", fullPage = false, text = "" }) => {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-brand-600 border-t-transparent ${sizeMap[size]}`}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
        {spinner}
        {text && <p className="text-sm font-medium text-ink-700">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      {spinner}
      {text && <p className="text-sm text-ink-600">{text}</p>}
    </div>
  );
};

export default Loader;
