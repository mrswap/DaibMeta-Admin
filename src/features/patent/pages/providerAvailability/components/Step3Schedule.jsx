// // // src/features/patent/pages/providerAvailability/components/Step3Schedule.jsx

// // import { useState, useEffect } from "react";
// // import { FiArrowLeft, FiEye } from "react-icons/fi";
// // import { DatePicker } from "../../../common/form";

// // const DAYS = [
// //   { value: 1, label: "Monday", short: "Mon" },
// //   { value: 2, label: "Tuesday", short: "Tue" },
// //   { value: 3, label: "Wednesday", short: "Wed" },
// //   { value: 4, label: "Thursday", short: "Thu" },
// //   { value: 5, label: "Friday", short: "Fri" },
// //   { value: 6, label: "Saturday", short: "Sat" },
// //   { value: 7, label: "Sunday", short: "Sun" },
// // ];

// // const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];

// // const Step3Schedule = ({
// //   onNext,
// //   onBack,
// //   formData,
// //   setFormData,
// //   appointmentTypeDefaults,
// // }) => {
// //   const [errors, setErrors] = useState({});

// //   const maxCapacity = appointmentTypeDefaults?.capacity || null;
// //   const maxDuration = appointmentTypeDefaults?.slot_duration || null;

// //   // Date ko YYYY-MM-DD format me return karta hai
// //   const getTodayDate = () => {
// //     const today = new Date();
// //     const y = today.getFullYear();
// //     const m = String(today.getMonth() + 1).padStart(2, "0");
// //     const d = String(today.getDate()).padStart(2, "0");
// //     return `${y}-${m}-${d}`;
// //   };

// //   // NAYA: Initial load par default dates set karo
// //   useEffect(() => {
// //     const today = getTodayDate();
// //     if (!formData.date_from && !formData.date_to) {
// //       setFormData((prev) => ({
// //         ...prev,
// //         date_from: today,
// //         date_to: today,
// //       }));
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   const updateField = (key, value) => {
// //     setFormData((prev) => ({ ...prev, [key]: value }));
// //     if (errors[key]) {
// //       setErrors((prev) => ({ ...prev, [key]: "" }));
// //     }
// //   };

// //   // NAYA: Date From change hone par Date To validate karo
// //   const handleDateFromChange = (val) => {
// //     const newFrom = val || "";
// //     let newTo = formData.date_to;

// //     // Agar To date pehle se set hai aur new From usse bada hai, toh To ko update karo
// //     if (newTo && newFrom && newTo < newFrom) {
// //       newTo = newFrom;
// //     }

// //     setFormData((prev) => ({
// //       ...prev,
// //       date_from: newFrom,
// //       date_to: newTo,
// //     }));

// //     if (errors.date_from || errors.date_to) {
// //       setErrors((prev) => ({ ...prev, date_from: "", date_to: "" }));
// //     }
// //   };

// //   // NAYA: Date To change hone par Date From validate karo
// //   const handleDateToChange = (val) => {
// //     const newTo = val || "";
// //     let newFrom = formData.date_from;

// //     // Agar user To date ko From date se pehle ka set kar raha hai, toh From ko clear kar do
// //     if (newFrom && newTo && newTo < newFrom) {
// //       newFrom = "";
// //     }

// //     setFormData((prev) => ({
// //       ...prev,
// //       date_from: newFrom,
// //       date_to: newTo,
// //     }));

// //     if (errors.date_from || errors.date_to) {
// //       setErrors((prev) => ({ ...prev, date_from: "", date_to: "" }));
// //     }
// //   };

// //   const toggleDay = (dayValue) => {
// //     const current = formData.days_of_week || [];
// //     const updated = current.includes(dayValue)
// //       ? current.filter((d) => d !== dayValue)
// //       : [...current, dayValue].sort((a, b) => a - b);
// //     updateField("days_of_week", updated);
// //   };

// //   const applyPreset = (days) => {
// //     updateField("days_of_week", days);
// //   };

// //   // Auto-clamp capacity if it exceeds max
// //   useEffect(() => {
// //     if (maxCapacity && formData.capacity > maxCapacity) {
// //       setFormData((prev) => ({ ...prev, capacity: maxCapacity }));
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [maxCapacity]);

// //   const validate = () => {
// //     const e = {};
// //     if (!formData.date_from) e.date_from = "Start date is required";
// //     if (!formData.date_to) e.date_to = "End date is required";
// //     if (
// //       formData.date_from &&
// //       formData.date_to &&
// //       formData.date_to < formData.date_from
// //     ) {
// //       e.date_to = "End date must be after start date";
// //     }
// //     if (!formData.days_of_week || formData.days_of_week.length === 0) {
// //       e.days_of_week = "Select at least one day";
// //     }
// //     if (!formData.start_time) e.start_time = "Start time is required";
// //     if (!formData.end_time) e.end_time = "End time is required";
// //     if (
// //       formData.start_time &&
// //       formData.end_time &&
// //       formData.end_time <= formData.start_time
// //     ) {
// //       e.end_time = "End time must be after start time";
// //     }
// //     if (!formData.slot_duration) e.slot_duration = "Duration is required";
// //     if (!formData.capacity || formData.capacity < 1) {
// //       e.capacity = "Capacity must be at least 1";
// //     }
// //     if (maxCapacity && formData.capacity > maxCapacity) {
// //       e.capacity = `Capacity cannot exceed ${maxCapacity}`;
// //     }

// //     if (formData.start_time && formData.end_time && formData.slot_duration) {
// //       const [sh, sm] = formData.start_time.split(":").map(Number);
// //       const [eh, em] = formData.end_time.split(":").map(Number);
// //       const totalMin = eh * 60 + em - (sh * 60 + sm);
// //       if (totalMin > 0 && totalMin < formData.slot_duration) {
// //         e.slot_duration = "Duration cannot exceed total available time";
// //       }
// //     }

// //     setErrors(e);
// //     return Object.keys(e).length === 0;
// //   };

// //   const handleNext = () => {
// //     if (validate()) onNext();
// //   };

// //   const handleCapacityChange = (val) => {
// //     let num = Number(val) || 1;
// //     if (num < 1) num = 1;
// //     if (maxCapacity && num > maxCapacity) num = maxCapacity;
// //     updateField("capacity", num);
// //   };

// //   const inputCls =
// //     "h-10 w-full rounded-lg border border-form-border bg-form-bg px-3 text-sm outline-none focus:border-form-border-focus focus:ring-1 focus:ring-form-ring";

// //   return (
// //     <div className="space-y-5">
// //       <div>
// //         <h3 className="font-jakarta text-base font-bold text-ink-900">
// //           Schedule Configuration
// //         </h3>
// //         <p className="mt-1 text-sm text-ink-500">
// //           Define when this provider is available and how slots should be
// //           generated.
// //         </p>
// //       </div>

// //       {/* Date Range */}
// //       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //         <DatePicker
// //           label="Available From"
// //           name="date_from"
// //           isFormik={false}
// //           value={formData.date_from || ""}
// //           onChange={handleDateFromChange}
// //           placeholder="Select start date"
// //           // NO max prop — we handle it programmatically
// //           required
// //         />

// //         <DatePicker
// //           label="Available Until"
// //           name="date_to"
// //           isFormik={false}
// //           value={formData.date_to || ""}
// //           onChange={handleDateToChange}
// //           placeholder="Select end date"
// //           // NO min prop — we handle it programmatically
// //           required
// //         />
// //       </div>

// //       {/* Date errors (from validate) */}
// //       {(errors.date_from || errors.date_to) && (
// //         <div className="-mt-3 space-y-0.5">
// //           {errors.date_from && (
// //             <p className="text-xs text-form-error">{errors.date_from}</p>
// //           )}
// //           {errors.date_to && (
// //             <p className="text-xs text-form-error">{errors.date_to}</p>
// //           )}
// //         </div>
// //       )}

// //       {/* Available Days */}
// //       <div>
// //         <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
// //           <label className="text-xs font-medium text-form-label">
// //             Available Days <span className="text-form-required">*</span>
// //           </label>
// //           <div className="flex flex-wrap gap-2">
// //             <button
// //               type="button"
// //               onClick={() => applyPreset([1, 2, 3, 4, 5])}
// //               className="cursor-pointer rounded-md border border-ink-200 px-2 py-0.5 text-[10px] font-medium text-ink-600 hover:bg-ink-50"
// //             >
// //               Weekdays
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => applyPreset([1, 2, 3, 4, 5, 6])}
// //               className="cursor-pointer rounded-md border border-ink-200 px-2 py-0.5 text-[10px] font-medium text-ink-600 hover:bg-ink-50"
// //             >
// //               Mon-Sat
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => applyPreset([1, 2, 3, 4, 5, 6, 7])}
// //               className="cursor-pointer rounded-md border border-ink-200 px-2 py-0.5 text-[10px] font-medium text-ink-600 hover:bg-ink-50"
// //             >
// //               All
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => applyPreset([])}
// //               className="cursor-pointer rounded-md border border-ink-200 px-2 py-0.5 text-[10px] font-medium text-ink-600 hover:bg-ink-50"
// //             >
// //               Clear
// //             </button>
// //           </div>
// //         </div>
// //         <div className="flex flex-wrap gap-2">
// //           {DAYS.map((day) => {
// //             const isSelected = formData.days_of_week?.includes(day.value);
// //             return (
// //               <button
// //                 key={day.value}
// //                 type="button"
// //                 onClick={() => toggleDay(day.value)}
// //                 className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
// //                   isSelected
// //                     ? "border-brand-600 bg-brand-50 text-brand-700"
// //                     : "border-ink-200 bg-surface text-ink-600 hover:border-ink-300"
// //                 }`}
// //               >
// //                 {day.short}
// //               </button>
// //             );
// //           })}
// //         </div>
// //         {errors.days_of_week && (
// //           <p className="mt-1 text-xs text-form-error">{errors.days_of_week}</p>
// //         )}
// //       </div>

// //       {/* Time Range */}
// //       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //         <div>
// //           <label className="mb-1.5 block text-xs font-medium text-form-label">
// //             Start Time <span className="text-form-required">*</span>
// //           </label>
// //           <input
// //             type="time"
// //             value={formData.start_time || ""}
// //             onChange={(e) => updateField("start_time", e.target.value)}
// //             className={inputCls}
// //           />
// //           {errors.start_time && (
// //             <p className="mt-1 text-xs text-form-error">{errors.start_time}</p>
// //           )}
// //         </div>
// //         <div>
// //           <label className="mb-1.5 block text-xs font-medium text-form-label">
// //             End Time <span className="text-form-required">*</span>
// //           </label>
// //           <input
// //             type="time"
// //             value={formData.end_time || ""}
// //             onChange={(e) => updateField("end_time", e.target.value)}
// //             className={inputCls}
// //           />
// //           {errors.end_time && (
// //             <p className="mt-1 text-xs text-form-error">{errors.end_time}</p>
// //           )}
// //         </div>
// //       </div>

// //       {/* Slot Duration + Capacity */}
// //       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //         <div>
// //           <label className="mb-1.5 block text-xs font-medium text-form-label">
// //             Slot Duration <span className="text-form-required">*</span>
// //           </label>
// //           <select
// //             value={formData.slot_duration || 15}
// //             onChange={(e) =>
// //               updateField("slot_duration", Number(e.target.value))
// //             }
// //             className={`${inputCls} cursor-pointer`}
// //           >
// //             {DURATION_OPTIONS.map((d) => (
// //               <option key={d} value={d}>
// //                 {d} Minutes
// //                 {maxDuration === d ? " (default)" : ""}
// //               </option>
// //             ))}
// //           </select>
// //           {maxDuration && (
// //             <p className="mt-1 text-[11px] text-ink-500">
// //               Default from appointment type: {maxDuration} min
// //             </p>
// //           )}
// //           {errors.slot_duration && (
// //             <p className="mt-1 text-xs text-form-error">
// //               {errors.slot_duration}
// //             </p>
// //           )}
// //         </div>
// //         <div>
// //           <label className="mb-1.5 block text-xs font-medium text-form-label">
// //             Capacity (Patients per slot){" "}
// //             <span className="text-form-required">*</span>
// //           </label>
// //           <input
// //             type="number"
// //             min={1}
// //             max={maxCapacity || undefined}
// //             value={formData.capacity || 1}
// //             onChange={(e) => handleCapacityChange(e.target.value)}
// //             className={inputCls}
// //           />
// //           {maxCapacity ? (
// //             <p className="mt-1 text-[11px] text-ink-500">
// //               Max {maxCapacity} allowed (from appointment type). You can set 1
// //               to {maxCapacity}.
// //             </p>
// //           ) : (
// //             <p className="mt-1 text-[11px] text-ink-500">
// //               Number of patients allowed per slot
// //             </p>
// //           )}
// //           {errors.capacity && (
// //             <p className="mt-1 text-xs text-form-error">{errors.capacity}</p>
// //           )}
// //         </div>
// //       </div>

// //       <div className="flex justify-between gap-3 border-t border-ink-100 pt-4">
// //         <button
// //           type="button"
// //           onClick={onBack}
// //           className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
// //         >
// //           <FiArrowLeft className="h-4 w-4" />
// //           Back
// //         </button>
// //         <button
// //           type="button"
// //           onClick={handleNext}
// //           className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
// //         >
// //           <FiEye className="h-4 w-4" />
// //           Generate Preview
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Step3Schedule;

// // src/features/patent/pages/providerAvailability/components/Step3Schedule.jsx

// import { useState, useEffect, useRef } from "react";
// import { FiArrowLeft, FiEye } from "react-icons/fi";
// import { DatePicker } from "../../../common/form";

// const DAYS = [
//   { value: 1, label: "Monday", short: "Mon" },
//   { value: 2, label: "Tuesday", short: "Tue" },
//   { value: 3, label: "Wednesday", short: "Wed" },
//   { value: 4, label: "Thursday", short: "Thu" },
//   { value: 5, label: "Friday", short: "Fri" },
//   { value: 6, label: "Saturday", short: "Sat" },
//   { value: 7, label: "Sunday", short: "Sun" },
// ];

// const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];

// const PRESETS = {
//   WEEKDAYS: [1, 2, 3, 4, 5],
//   MON_SAT: [1, 2, 3, 4, 5, 6],
//   ALL: [1, 2, 3, 4, 5, 6, 7],
//   CLEAR: [],
// };

// // Helper function to compare arrays
// const arraysEqual = (a, b) => {
//   if (!a || !b) return false;
//   if (a.length !== b.length) return false;
//   const sortedA = [...a].sort((x, y) => x - y);
//   const sortedB = [...b].sort((x, y) => x - y);
//   return sortedA.every((val, index) => val === sortedB[index]);
// };

// const Step3Schedule = ({
//   onNext,
//   onBack,
//   formData,
//   setFormData,
//   appointmentTypeDefaults,
// }) => {
//   const [errors, setErrors] = useState({});
//   const prevDatesRef = useRef({ from: null, to: null });

//   const maxCapacity = appointmentTypeDefaults?.capacity || null;
//   const maxDuration = appointmentTypeDefaults?.slot_duration || null;

//   const getTodayDate = () => {
//     const today = new Date();
//     const y = today.getFullYear();
//     const m = String(today.getMonth() + 1).padStart(2, "0");
//     const d = String(today.getDate()).padStart(2, "0");
//     return `${y}-${m}-${d}`;
//   };

//   useEffect(() => {
//     const today = getTodayDate();
//     if (!formData.date_from && !formData.date_to) {
//       setFormData((prev) => ({
//         ...prev,
//         date_from: today,
//         date_to: today,
//       }));
//     }
//   }, []);

//   // Date range change hone par sahi din select karo
//   useEffect(() => {
//     const { date_from, date_to } = formData;
//     if (!date_from || !date_to) return;

//     const datesChanged =
//       prevDatesRef.current.from !== date_from ||
//       prevDatesRef.current.to !== date_to;

//     if (!datesChanged) return;

//     prevDatesRef.current = { from: date_from, to: date_to };

//     const validDays = new Set();
//     let current = new Date(date_from + "T00:00:00");
//     const end = new Date(date_to + "T00:00:00");

//     while (current <= end) {
//       const jsDay = current.getDay();
//       validDays.add(jsDay === 0 ? 7 : jsDay);
//       if (validDays.size === 7) break;
//       current.setDate(current.getDate() + 1);
//     }

//     const autoSelectedDays = Array.from(validDays).sort((a, b) => a - b);

//     setFormData((prev) => ({
//       ...prev,
//       days_of_week: autoSelectedDays,
//     }));
//   }, [formData.date_from, formData.date_to, setFormData]);

//   const updateField = (key, value) => {
//     setFormData((prev) => ({ ...prev, [key]: value }));
//     if (errors[key]) {
//       setErrors((prev) => ({ ...prev, [key]: "" }));
//     }
//   };

//   const handleDateFromChange = (val) => {
//     const newFrom = val || "";
//     let newTo = formData.date_to;
//     if (newTo && newFrom && newTo < newFrom) {
//       newTo = newFrom;
//     }
//     setFormData((prev) => ({ ...prev, date_from: newFrom, date_to: newTo }));
//     if (errors.date_from || errors.date_to) {
//       setErrors((prev) => ({ ...prev, date_from: "", date_to: "" }));
//     }
//   };

//   const handleDateToChange = (val) => {
//     const newTo = val || "";
//     let newFrom = formData.date_from;
//     if (newFrom && newTo && newTo < newFrom) {
//       newFrom = "";
//     }
//     setFormData((prev) => ({ ...prev, date_from: newFrom, date_to: newTo }));
//     if (errors.date_from || errors.date_to) {
//       setErrors((prev) => ({ ...prev, date_from: "", date_to: "" }));
//     }
//   };

//   const toggleDay = (dayValue) => {
//     const current = formData.days_of_week || [];
//     const updated = current.includes(dayValue)
//       ? current.filter((d) => d !== dayValue)
//       : [...current, dayValue].sort((a, b) => a - b);
//     updateField("days_of_week", updated);
//   };

//   const applyPreset = (days) => {
//     updateField("days_of_week", days);
//   };

//   useEffect(() => {
//     if (maxCapacity && formData.capacity > maxCapacity) {
//       setFormData((prev) => ({ ...prev, capacity: maxCapacity }));
//     }
//   }, [maxCapacity]);

//   const validate = () => {
//     const e = {};
//     if (!formData.date_from) e.date_from = "Start date is required";
//     if (!formData.date_to) e.date_to = "End date is required";
//     if (
//       formData.date_from &&
//       formData.date_to &&
//       formData.date_to < formData.date_from
//     ) {
//       e.date_to = "End date must be after start date";
//     }
//     if (!formData.days_of_week || formData.days_of_week.length === 0) {
//       e.days_of_week = "Select at least one day";
//     }
//     if (!formData.start_time) e.start_time = "Start time is required";
//     if (!formData.end_time) e.end_time = "End time is required";
//     if (
//       formData.start_time &&
//       formData.end_time &&
//       formData.end_time <= formData.start_time
//     ) {
//       e.end_time = "End time must be after start time";
//     }
//     if (!formData.slot_duration) e.slot_duration = "Duration is required";
//     if (!formData.capacity || formData.capacity < 1) {
//       e.capacity = "Capacity must be at least 1";
//     }
//     if (maxCapacity && formData.capacity > maxCapacity) {
//       e.capacity = `Capacity cannot exceed ${maxCapacity}`;
//     }

//     if (formData.start_time && formData.end_time && formData.slot_duration) {
//       const [sh, sm] = formData.start_time.split(":").map(Number);
//       const [eh, em] = formData.end_time.split(":").map(Number);
//       const totalMin = eh * 60 + em - (sh * 60 + sm);
//       if (totalMin > 0 && totalMin < formData.slot_duration) {
//         e.slot_duration = "Duration cannot exceed total available time";
//       }
//     }

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleNext = () => {
//     if (validate()) onNext();
//   };

//   const handleCapacityChange = (val) => {
//     let num = Number(val) || 1;
//     if (num < 1) num = 1;
//     if (maxCapacity && num > maxCapacity) num = maxCapacity;
//     updateField("capacity", num);
//   };

//   // Check kaun sa preset currently selected hai
//   const currentDays = formData.days_of_week || [];
//   const isWeekdays = arraysEqual(currentDays, PRESETS.WEEKDAYS);
//   const isMonSat = arraysEqual(currentDays, PRESETS.MON_SAT);
//   const isAll = arraysEqual(currentDays, PRESETS.ALL);
//   const isClear = currentDays.length === 0;

//   // Agar koi bhi standard preset match nahi karta, toh custom hai (jab tak clear na ho)
//   const isCustom = !isWeekdays && !isMonSat && !isAll && !isClear;

//   const presetBtnCls = (isActive) =>
//     `cursor-pointer rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
//       isActive
//         ? "border-brand-600 bg-brand-50 text-brand-700"
//         : "border-ink-200 text-ink-600 hover:bg-ink-50"
//     }`;

//   const inputCls =
//     "h-10 w-full rounded-lg border border-form-border bg-form-bg px-3 text-sm outline-none focus:border-form-border-focus focus:ring-1 focus:ring-form-ring";

//   return (
//     <div className="space-y-5">
//       <div>
//         <h3 className="font-jakarta text-base font-bold text-ink-900">
//           Schedule Configuration
//         </h3>
//         <p className="mt-1 text-sm text-ink-500">
//           Define when this provider is available and how slots should be
//           generated.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//         <DatePicker
//           label="Available From"
//           name="date_from"
//           isFormik={false}
//           value={formData.date_from || ""}
//           onChange={handleDateFromChange}
//           placeholder="Select start date"
//           required
//         />
//         <DatePicker
//           label="Available Until"
//           name="date_to"
//           isFormik={false}
//           value={formData.date_to || ""}
//           onChange={handleDateToChange}
//           placeholder="Select end date"
//           required
//         />
//       </div>

//       {(errors.date_from || errors.date_to) && (
//         <div className="-mt-3 space-y-0.5">
//           {errors.date_from && (
//             <p className="text-xs text-form-error">{errors.date_from}</p>
//           )}
//           {errors.date_to && (
//             <p className="text-xs text-form-error">{errors.date_to}</p>
//           )}
//         </div>
//       )}

//       <div>
//         <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
//           <label className="text-xs font-medium text-form-label">
//             Available Days <span className="text-form-required">*</span>
//           </label>
//           <div className="flex flex-wrap gap-2">
//             <button
//               type="button"
//               onClick={() => applyPreset(PRESETS.WEEKDAYS)}
//               className={presetBtnCls(isWeekdays)}
//             >
//               Weekdays
//             </button>
//             <button
//               type="button"
//               onClick={() => applyPreset(PRESETS.MON_SAT)}
//               className={presetBtnCls(isMonSat)}
//             >
//               Mon-Sat
//             </button>
//             <button
//               type="button"
//               onClick={() => applyPreset(PRESETS.ALL)}
//               className={presetBtnCls(isAll)}
//             >
//               All
//             </button>
//             <button
//               type="button"
//               onClick={() => applyPreset(PRESETS.CLEAR)}
//               className={presetBtnCls(isClear)}
//             >
//               Clear
//             </button>

//             {/* Custom Badge Sirf tab dikhega jab koi standard preset match na kare aur empty na ho */}
//             {isCustom && (
//               <span className="cursor-default rounded-md border border-brand-600 bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
//                 Custom
//               </span>
//             )}
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {DAYS.map((day) => {
//             const isSelected = formData.days_of_week?.includes(day.value);
//             return (
//               <button
//                 key={day.value}
//                 type="button"
//                 onClick={() => toggleDay(day.value)}
//                 className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
//                   isSelected
//                     ? "border-brand-600 bg-brand-50 text-brand-700"
//                     : "border-ink-200 bg-surface text-ink-600 hover:border-ink-300"
//                 }`}
//               >
//                 {day.short}
//               </button>
//             );
//           })}
//         </div>
//         {errors.days_of_week && (
//           <p className="mt-1 text-xs text-form-error">{errors.days_of_week}</p>
//         )}
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//         <div>
//           <label className="mb-1.5 block text-xs font-medium text-form-label">
//             Start Time <span className="text-form-required">*</span>
//           </label>
//           <input
//             type="time"
//             value={formData.start_time || ""}
//             onChange={(e) => updateField("start_time", e.target.value)}
//             className={inputCls}
//           />
//           {errors.start_time && (
//             <p className="mt-1 text-xs text-form-error">{errors.start_time}</p>
//           )}
//         </div>
//         <div>
//           <label className="mb-1.5 block text-xs font-medium text-form-label">
//             End Time <span className="text-form-required">*</span>
//           </label>
//           <input
//             type="time"
//             value={formData.end_time || ""}
//             onChange={(e) => updateField("end_time", e.target.value)}
//             className={inputCls}
//           />
//           {errors.end_time && (
//             <p className="mt-1 text-xs text-form-error">{errors.end_time}</p>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//         <div>
//           <label className="mb-1.5 block text-xs font-medium text-form-label">
//             Slot Duration <span className="text-form-required">*</span>
//           </label>
//           <select
//             value={formData.slot_duration || 15}
//             onChange={(e) =>
//               updateField("slot_duration", Number(e.target.value))
//             }
//             className={`${inputCls} cursor-pointer`}
//           >
//             {DURATION_OPTIONS.map((d) => (
//               <option key={d} value={d}>
//                 {d} Minutes {maxDuration === d ? " (default)" : ""}
//               </option>
//             ))}
//           </select>
//           {maxDuration && (
//             <p className="mt-1 text-[11px] text-ink-500">
//               Default from appointment type: {maxDuration} min
//             </p>
//           )}
//           {errors.slot_duration && (
//             <p className="mt-1 text-xs text-form-error">
//               {errors.slot_duration}
//             </p>
//           )}
//         </div>
//         <div>
//           <label className="mb-1.5 block text-xs font-medium text-form-label">
//             Capacity (Patients per slot){" "}
//             <span className="text-form-required">*</span>
//           </label>
//           <input
//             type="number"
//             min={1}
//             max={maxCapacity || undefined}
//             value={formData.capacity || 1}
//             onChange={(e) => handleCapacityChange(e.target.value)}
//             className={inputCls}
//           />
//           {maxCapacity ? (
//             <p className="mt-1 text-[11px] text-ink-500">
//               Max {maxCapacity} allowed (from appointment type). You can set 1
//               to {maxCapacity}.
//             </p>
//           ) : (
//             <p className="mt-1 text-[11px] text-ink-500">
//               Number of patients allowed per slot
//             </p>
//           )}
//           {errors.capacity && (
//             <p className="mt-1 text-xs text-form-error">{errors.capacity}</p>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-between gap-3 border-t border-ink-100 pt-4">
//         <button
//           type="button"
//           onClick={onBack}
//           className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
//         >
//           <FiArrowLeft className="h-4 w-4" />
//           Back
//         </button>
//         <button
//           type="button"
//           onClick={handleNext}
//           className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
//         >
//           <FiEye className="h-4 w-4" />
//           Generate Preview
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Step3Schedule;

// src/features/patent/pages/providerAvailability/components/Step3Schedule.jsx

import { useState, useEffect, useRef } from "react";
import { FiArrowLeft, FiEye } from "react-icons/fi";
import { DatePicker } from "../../../common/form";

const DAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" },
];

const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];

const PRESETS = {
  WEEKDAYS: [1, 2, 3, 4, 5],
  MON_SAT: [1, 2, 3, 4, 5, 6],
  ALL: [1, 2, 3, 4, 5, 6, 7],
  CLEAR: [],
};

const arraysEqual = (a, b) => {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, index) => val === sortedB[index]);
};

const Step3Schedule = ({
  onNext,
  onBack,
  formData,
  setFormData,
  appointmentTypeDefaults,
}) => {
  const [errors, setErrors] = useState({});
  const lastProcessedDates = useRef({ from: null, to: null });

  const maxCapacity = appointmentTypeDefaults?.capacity || null;
  const maxDuration = appointmentTypeDefaults?.slot_duration || null;

  const getTodayDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    const today = getTodayDate();
    if (!formData.date_from && !formData.date_to) {
      setFormData((prev) => ({
        ...prev,
        date_from: today,
        date_to: today,
      }));
    }
  }, []);

  useEffect(() => {
    const { date_from, date_to } = formData;
    if (!date_from || !date_to) return;

    if (
      lastProcessedDates.current.from === date_from &&
      lastProcessedDates.current.to === date_to
    ) {
      return;
    }

    lastProcessedDates.current = { from: date_from, to: date_to };

    const validDays = new Set();
    let current = new Date(date_from + "T00:00:00");
    const end = new Date(date_to + "T00:00:00");

    while (current <= end) {
      const jsDay = current.getDay();
      validDays.add(jsDay === 0 ? 7 : jsDay);
      if (validDays.size === 7) break;
      current.setDate(current.getDate() + 1);
    }

    const autoSelectedDays = Array.from(validDays).sort((a, b) => a - b);

    setFormData((prev) => ({
      ...prev,
      days_of_week: autoSelectedDays,
    }));
  }, [formData.date_from, formData.date_to, setFormData]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleDateFromChange = (val) => {
    const newFrom = val || "";
    let newTo = formData.date_to;
    // Auto-adjust 'To' date if user picks a 'From' date that is after 'To'
    if (newTo && newFrom && newTo < newFrom) {
      newTo = newFrom;
    }
    setFormData((prev) => ({ ...prev, date_from: newFrom, date_to: newTo }));
    if (errors.date_from || errors.date_to) {
      setErrors((prev) => ({ ...prev, date_from: "", date_to: "" }));
    }
  };

  const handleDateToChange = (val) => {
    const newTo = val || "";
    let newFrom = formData.date_from;
    if (newFrom && newTo && newTo < newFrom) {
      newFrom = "";
    }
    setFormData((prev) => ({ ...prev, date_from: newFrom, date_to: newTo }));
    if (errors.date_from || errors.date_to) {
      setErrors((prev) => ({ ...prev, date_from: "", date_to: "" }));
    }
  };

  const toggleDay = (dayValue) => {
    const current = formData.days_of_week || [];
    const updated = current.includes(dayValue)
      ? current.filter((d) => d !== dayValue)
      : [...current, dayValue].sort((a, b) => a - b);
    updateField("days_of_week", updated);
  };

  const applyPreset = (days) => {
    updateField("days_of_week", days);
  };

  useEffect(() => {
    if (maxCapacity && formData.capacity > maxCapacity) {
      setFormData((prev) => ({ ...prev, capacity: maxCapacity }));
    }
  }, [maxCapacity]);

  const validate = () => {
    const e = {};
    if (!formData.date_from) e.date_from = "Start date is required";
    if (!formData.date_to) e.date_to = "End date is required";
    if (
      formData.date_from &&
      formData.date_to &&
      formData.date_to < formData.date_from
    ) {
      e.date_to = "End date must be after start date";
    }
    if (!formData.days_of_week || formData.days_of_week.length === 0) {
      e.days_of_week = "Select at least one day";
    }
    if (!formData.start_time) e.start_time = "Start time is required";
    if (!formData.end_time) e.end_time = "End time is required";
    if (
      formData.start_time &&
      formData.end_time &&
      formData.end_time <= formData.start_time
    ) {
      e.end_time = "End time must be after start time";
    }
    if (!formData.slot_duration) e.slot_duration = "Duration is required";
    if (!formData.capacity || formData.capacity < 1) {
      e.capacity = "Capacity must be at least 1";
    }
    if (maxCapacity && formData.capacity > maxCapacity) {
      e.capacity = `Capacity cannot exceed ${maxCapacity}`;
    }

    if (formData.start_time && formData.end_time && formData.slot_duration) {
      const [sh, sm] = formData.start_time.split(":").map(Number);
      const [eh, em] = formData.end_time.split(":").map(Number);
      const totalMin = eh * 60 + em - (sh * 60 + sm);
      if (totalMin > 0 && totalMin < formData.slot_duration) {
        e.slot_duration = "Duration cannot exceed total available time";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const handleCapacityChange = (val) => {
    let num = Number(val) || 1;
    if (num < 1) num = 1;
    if (maxCapacity && num > maxCapacity) num = maxCapacity;
    updateField("capacity", num);
  };

  const currentDays = formData.days_of_week || [];
  const isWeekdays = arraysEqual(currentDays, PRESETS.WEEKDAYS);
  const isMonSat = arraysEqual(currentDays, PRESETS.MON_SAT);
  const isAll = arraysEqual(currentDays, PRESETS.ALL);
  const isClear = currentDays.length === 0;
  const isCustom = !isWeekdays && !isMonSat && !isAll && !isClear;

  const presetBtnCls = (isActive) =>
    `cursor-pointer rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
      isActive
        ? "border-brand-600 bg-brand-50 text-brand-700"
        : "border-ink-200 text-ink-600 hover:bg-ink-50"
    }`;

  const inputCls =
    "h-10 w-full rounded-lg border border-form-border bg-form-bg px-3 text-sm outline-none focus:border-form-border-focus focus:ring-1 focus:ring-form-ring";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-jakarta text-base font-bold text-ink-900">
          Schedule Configuration
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Define when this provider is available and how slots should be
          generated.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 🔥 YAHAN MIN PROP ADD KIYA HAI TAkI PAST DATES DISABLE HO JAYEIN */}
        <DatePicker
          label="Available From"
          name="date_from"
          isFormik={false}
          value={formData.date_from || ""}
          onChange={handleDateFromChange}
          placeholder="Select start date"
          min={getTodayDate()}
          required
        />
        <DatePicker
          label="Available Until"
          name="date_to"
          isFormik={false}
          value={formData.date_to || ""}
          onChange={handleDateToChange}
          placeholder="Select end date"
          min={formData.date_from || getTodayDate()} // 'To' date 'From' date se pehle na ho
          required
        />
      </div>

      {(errors.date_from || errors.date_to) && (
        <div className="-mt-3 space-y-0.5">
          {errors.date_from && (
            <p className="text-xs text-form-error">{errors.date_from}</p>
          )}
          {errors.date_to && (
            <p className="text-xs text-form-error">{errors.date_to}</p>
          )}
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-form-label">
            Available Days <span className="text-form-required">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset(PRESETS.WEEKDAYS)}
              className={presetBtnCls(isWeekdays)}
            >
              Weekdays
            </button>
            <button
              type="button"
              onClick={() => applyPreset(PRESETS.MON_SAT)}
              className={presetBtnCls(isMonSat)}
            >
              Mon-Sat
            </button>
            <button
              type="button"
              onClick={() => applyPreset(PRESETS.ALL)}
              className={presetBtnCls(isAll)}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => applyPreset(PRESETS.CLEAR)}
              className={presetBtnCls(isClear)}
            >
              Clear
            </button>

            {isCustom && (
              <span className="cursor-default rounded-md border border-brand-600 bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                Custom
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const isSelected = formData.days_of_week?.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-ink-200 bg-surface text-ink-600 hover:border-ink-300"
                }`}
              >
                {day.short}
              </button>
            );
          })}
        </div>
        {errors.days_of_week && (
          <p className="mt-1 text-xs text-form-error">{errors.days_of_week}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            Start Time <span className="text-form-required">*</span>
          </label>
          <input
            type="time"
            value={formData.start_time || ""}
            onChange={(e) => updateField("start_time", e.target.value)}
            className={inputCls}
          />
          {errors.start_time && (
            <p className="mt-1 text-xs text-form-error">{errors.start_time}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            End Time <span className="text-form-required">*</span>
          </label>
          <input
            type="time"
            value={formData.end_time || ""}
            onChange={(e) => updateField("end_time", e.target.value)}
            className={inputCls}
          />
          {errors.end_time && (
            <p className="mt-1 text-xs text-form-error">{errors.end_time}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            Slot Duration <span className="text-form-required">*</span>
          </label>
          <select
            value={formData.slot_duration || 15}
            onChange={(e) =>
              updateField("slot_duration", Number(e.target.value))
            }
            className={`${inputCls} cursor-pointer`}
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} Minutes {maxDuration === d ? " (default)" : ""}
              </option>
            ))}
          </select>
          {maxDuration && (
            <p className="mt-1 text-[11px] text-ink-500">
              Default from appointment type: {maxDuration} min
            </p>
          )}
          {errors.slot_duration && (
            <p className="mt-1 text-xs text-form-error">
              {errors.slot_duration}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            Capacity (Patients per slot){" "}
            <span className="text-form-required">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={maxCapacity || undefined}
            value={formData.capacity || 1}
            onChange={(e) => handleCapacityChange(e.target.value)}
            className={inputCls}
          />
          {maxCapacity ? (
            <p className="mt-1 text-[11px] text-ink-500">
              Max {maxCapacity} allowed (from appointment type). You can set 1
              to {maxCapacity}.
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-ink-500">
              Number of patients allowed per slot
            </p>
          )}
          {errors.capacity && (
            <p className="mt-1 text-xs text-form-error">{errors.capacity}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          <FiEye className="h-4 w-4" />
          Generate Preview
        </button>
      </div>
    </div>
  );
};

export default Step3Schedule;
