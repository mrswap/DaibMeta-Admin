import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiTruck, FiCpu, FiMoreHorizontal } from "react-icons/fi";

// Static Data for UI
const INITIAL_DATA = {
  delivery: [
    { min: "0", max: "500", value: "40" },
    { min: "501", max: "1000", value: "60" },
    { min: "1001", max: "2000", value: "80" },
    { min: "2000", max: "99999", value: "Free" },
  ],
  processing: [
    { min: "0", max: "1000", value: "20" },
    { min: "1001", max: "5000", value: "30" },
    { min: "5001", max: "10000", value: "50" },
    { min: "10000", max: "99999", value: "100" },
  ],
  // Other mein sirf 1 row
  other: [{ min: "0", max: "5000", value: "150" }],
};

const ChargesForm = () => {
  const navigate = useNavigate();
  const [charges, setCharges] = useState(INITIAL_DATA);

  const handleChange = (section, index, field, value) => {
    setCharges((prev) => {
      const newSection = [...prev[section]];
      newSection[index][field] = value;
      return { ...prev, [section]: newSection };
    });
  };

  const handleSave = () => {
    console.log("Saved Charges:", charges);
    // Add toast here later
  };

  // Reusable Row Renderer
  const renderRow = (section, row, index) => (
    <div key={index} className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Min (₹)"
        value={row.min}
        onChange={(e) => handleChange(section, index, "min", e.target.value)}
        className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none focus:border-brand-500"
      />
      <input
        type="text"
        placeholder="Max (₹)"
        value={row.max}
        onChange={(e) => handleChange(section, index, "max", e.target.value)}
        className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none focus:border-brand-500"
      />
      <input
        type="text"
        placeholder="Value"
        value={row.value}
        onChange={(e) => handleChange(section, index, "value", e.target.value)}
        className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none focus:border-brand-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/charges")}
          className="p-2 border rounded-lg bg-surface text-ink-600 hover:bg-ink-50 cursor-pointer transition-colors"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-jakarta text-ink-900">
            Store Charges
          </h1>
          <p className="text-sm text-ink-500">
            Configure delivery, processing and other fees
          </p>
        </div>
      </div>

      <div className="rounded-card border border-ink-100 bg-surface p-6 space-y-8">
        {/* Delivery Fees Section (4 Rows) */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-ink-100 pb-2">
            <FiTruck className="text-brand-600 h-5 w-5" />
            <h3 className="font-semibold text-ink-900">Delivery Fees</h3>
          </div>
          <div className="space-y-3">
            {charges.delivery.map((row, index) =>
              renderRow("delivery", row, index),
            )}
          </div>
        </div>

        {/* Processing Fees Section (4 Rows) */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-ink-100 pb-2">
            <FiCpu className="text-brand-600 h-5 w-5" />
            <h3 className="font-semibold text-ink-900">Processing Fees</h3>
          </div>
          <div className="space-y-3">
            {charges.processing.map((row, index) =>
              renderRow("processing", row, index),
            )}
          </div>
        </div>

        {/* Other Fees Section (1 Row only) */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-ink-100 pb-2">
            <FiMoreHorizontal className="text-brand-600 h-5 w-5" />
            <h3 className="font-semibold text-ink-900">Other Fees</h3>
          </div>
          <div className="space-y-3">
            {charges.other.map((row, index) => renderRow("other", row, index))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-brand-700 transition-colors"
        >
          Save Charges
        </button>
      </div>
    </div>
  );
};

export default ChargesForm;
