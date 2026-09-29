const FormButton = ({ text, type = "submit", className = "" }) => {
  return (
    <button
      type={type}
      className={`
        w-full
        bg-btn-primary-bg
        hover:bg-btn-primary-bg-hover
        text-btn-primary-text
        py-1.5 sm:py-2
        rounded-lg
        text-sm sm:text-base
        font-medium
        transition-colors duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-form-ring
        focus:ring-offset-1
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {text}
    </button>
  );
};

export default FormButton;
