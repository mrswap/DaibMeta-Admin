import Select from "react-select";

/**
 * FilterSelect — dropdown for filters (NOT inside Formik)
 *
 * Usage:
 *   <FilterSelect
 *     value={statusFilter}
 *     onChange={(val) => setStatusFilter(val)}
 *     options={[
 *       { value: "", label: "All Status" },
 *       { value: "true", label: "Active" },
 *       { value: "false", label: "Inactive" },
 *     ]}
 *     placeholder="All Status"
 *     isClearable
 *     width="w-40"   // optional
 *   />
 */
const FilterSelect = ({
  value = null,
  onChange,
  options = [],
  placeholder = "Select...",
  isClearable = false,
  isDisabled = false,
  width = "",
  className = "",
  ...props
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      height: "38px",
      backgroundColor: "var(--color-form-bg)",
      borderColor: state.isFocused
        ? "var(--color-form-border-focus)"
        : "var(--color-form-border)",
      boxShadow: state.isFocused ? "0 0 0 1px var(--color-form-ring)" : "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: "var(--color-form-border-focus)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0px 10px",
      height: "38px",
      display: "flex",
      alignItems: "center",
    }),
    input: (base) => ({
      ...base,
      margin: "0px",
      fontSize: "14px",
      color: "var(--color-form-text)",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
      color: "var(--color-form-placeholder)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "14px",
      color: "var(--color-form-text)",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "6px",
      color: "var(--color-form-placeholder)",
      cursor: "pointer",
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "4px",
      color: "var(--color-form-placeholder)",
      cursor: "pointer",
      "&:hover": {
        color: "var(--color-danger-500)",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: "var(--color-form-bg)",
      border: "1px solid var(--color-form-border)",
      borderRadius: "8px",
      overflow: "hidden",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "13px",
      cursor: "pointer",
      backgroundColor: state.isFocused
        ? "var(--color-form-ring)"
        : state.isSelected
          ? "var(--color-form-border-focus)"
          : "var(--color-form-bg)",
      color:
        state.isFocused || state.isSelected
          ? "var(--color-btn-primary-text)"
          : "var(--color-form-text)",
    }),
    ...props.styles,
  };

  return (
    <div className={`${width} ${className}`}>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        styles={customStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        {...props}
      />
    </div>
  );
};

export default FilterSelect;
