// import { useState, useEffect, useMemo } from "react";
// import { FiX, FiCheck, FiAlertCircle, FiLock } from "react-icons/fi";
// import {
//   useCreateException,
//   useUpdateException,
// } from "../../../queries/availabilityExceptions";
// import { DatePicker } from "../../../common/form";

// // ==================== TIME HELPERS ====================
// const timeToMinutes = (time) => {
//   if (!time) return 0;
//   const [h, m] = time.split(":").map(Number);
//   return h * 60 + m;
// };

// const minutesToTime = (min) => {
//   const h = Math.floor(min / 60);
//   const m = min % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// };

// const formatTime12 = (time) => {
//   if (!time) return "";
//   const [h, m] = time.split(":").map(Number);
//   const period = h >= 12 ? "PM" : "AM";
//   const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
//   return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
// };

// const generateSlots = (startTime, endTime, duration) => {
//   if (!startTime || !endTime || !duration) return [];
//   const startMin = timeToMinutes(startTime);
//   const endMin = timeToMinutes(endTime);
//   const slots = [];
//   for (let t = startMin; t + duration <= endMin; t += duration) {
//     slots.push({
//       start: minutesToTime(t),
//       end: minutesToTime(t + duration),
//     });
//   }
//   return slots;
// };

// const extractDate = (val) => {
//   if (!val) return "";
//   if (typeof val === "string" && val.length >= 10) return val.slice(0, 10);
//   return "";
// };

// const extractTime = (val) => {
//   if (!val) return "";
//   if (typeof val === "string" && val.length >= 5) return val.slice(0, 5);
//   return "";
// };

// const areContiguous = (slots, indices) => {
//   if (indices.length === 0) return true;
//   const sorted = [...indices].sort((a, b) => a - b);
//   for (let i = 1; i < sorted.length; i++) {
//     if (sorted[i] !== sorted[i - 1] + 1) return false;
//   }
//   return true;
// };

// // ==================== COMPONENT ====================
// const ExceptionForm = ({
//   open,
//   onClose,
//   availabilityId,
//   availability,
//   existingExceptions = [],
//   initialData,
// }) => {
//   const isEdit = !!initialData;

//   const createMutation = useCreateException();
//   const updateMutation = useUpdateException();

//   const [form, setForm] = useState({
//     exception_date: "",
//     type: "blocked",
//     full_day: true,
//     selectedSlotIndices: [],
//     reason: "",
//     status: true,
//   });
//   const [error, setError] = useState("");

//   const slots = useMemo(() => {
//     if (!availability) return [];
//     return generateSlots(
//       availability.start_time,
//       availability.end_time,
//       availability.slot_duration,
//     );
//   }, [availability]);

//   const dateMin = availability?.date_from || "";
//   const dateMax = availability?.date_to || "";

//   // Filter existing exceptions for selected date (excluding self in edit mode)
//   const blockedSlotsForDate = useMemo(() => {
//     if (!form.exception_date) return { fullDay: false, slots: [] };

//     const dateStr = form.exception_date;
//     const filtered = existingExceptions.filter((ex) => {
//       // Skip self in edit mode
//       if (isEdit && ex.id === initialData?.id) return false;
//       // Only active exceptions matter
//       if (!ex.status) return false;
//       // Match date
//       const exDate = extractDate(ex.exception_date);
//       return exDate === dateStr;
//     });

//     // If any full-day exception exists for this date
//     const fullDay = filtered.some((ex) => !ex.start_time && !ex.end_time);

//     // Collect blocked slot indices
//     const blockedIndices = new Set();
//     if (!fullDay) {
//       filtered.forEach((ex) => {
//         const exStart = extractTime(ex.start_time);
//         const exEnd = extractTime(ex.end_time);
//         if (!exStart || !exEnd) return;
//         slots.forEach((slot, idx) => {
//           // Slot is blocked if it overlaps with exception range
//           const slotStartMin = timeToMinutes(slot.start);
//           const slotEndMin = timeToMinutes(slot.end);
//           const exStartMin = timeToMinutes(exStart);
//           const exEndMin = timeToMinutes(exEnd);
//           if (slotStartMin < exEndMin && slotEndMin > exStartMin) {
//             blockedIndices.add(idx);
//           }
//         });
//       });
//     }

//     return { fullDay, slots: Array.from(blockedIndices).sort((a, b) => a - b) };
//   }, [form.exception_date, existingExceptions, slots, isEdit, initialData]);

//   // All slots blocked for date? (full day or all slots individually blocked)
//   const allSlotsBlocked =
//     blockedSlotsForDate.fullDay ||
//     (slots.length > 0 && blockedSlotsForDate.slots.length === slots.length);

//   useEffect(() => {
//     if (!open) return;

//     if (initialData) {
//       const dateStr = extractDate(
//         initialData.exception_date || initialData.date,
//       );
//       const initialStart = extractTime(
//         initialData.start_time || initialData.start,
//       );
//       const initialEnd = extractTime(initialData.end_time || initialData.end);

//       const isFullDay = !initialStart && !initialEnd;

//       let slotIndices = [];
//       if (!isFullDay && slots.length > 0) {
//         const startIdx = slots.findIndex((s) => s.start === initialStart);
//         const endIdx = slots.findIndex((s) => s.end === initialEnd);
//         if (startIdx >= 0 && endIdx >= startIdx) {
//           for (let i = startIdx; i <= endIdx; i++) {
//             slotIndices.push(i);
//           }
//         }
//       }

//       setForm({
//         exception_date: dateStr,
//         type: initialData.type || "blocked",
//         full_day: isFullDay,
//         selectedSlotIndices: slotIndices,
//         reason: initialData.reason || "",
//         status: initialData.status ?? true,
//       });
//     } else {
//       setForm({
//         exception_date: "",
//         type: "blocked",
//         full_day: true,
//         selectedSlotIndices: [],
//         reason: "",
//         status: true,
//       });
//     }
//     setError("");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [initialData, open, slots.length]);

//   if (!open) return null;

//   const isPending = createMutation.isPending || updateMutation.isPending;

//   const isSlotBlocked = (idx) => blockedSlotsForDate.slots.includes(idx);

//   const toggleSlot = (idx) => {
//     if (isSlotBlocked(idx)) return; // Cannot toggle blocked slot
//     setForm((prev) => {
//       const current = prev.selectedSlotIndices || [];
//       const updated = current.includes(idx)
//         ? current.filter((i) => i !== idx)
//         : [...current, idx].sort((a, b) => a - b);
//       return { ...prev, selectedSlotIndices: updated };
//     });
//   };

//   const selectAllAvailable = () => {
//     const availableIndices = slots
//       .map((_, i) => i)
//       .filter((i) => !isSlotBlocked(i));
//     setForm((prev) => ({ ...prev, selectedSlotIndices: availableIndices }));
//   };

//   const clearAll = () =>
//     setForm((prev) => ({ ...prev, selectedSlotIndices: [] }));

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError("");

//     if (!form.exception_date) {
//       setError("Date is required");
//       return;
//     }

//     if (dateMin && form.exception_date < dateMin) {
//       setError(`Date must be on or after ${dateMin}`);
//       return;
//     }
//     if (dateMax && form.exception_date > dateMax) {
//       setError(`Date must be on or before ${dateMax}`);
//       return;
//     }

//     // If not full day, check if any slots are available to block
//     if (!form.full_day) {
//       if (!form.selectedSlotIndices || form.selectedSlotIndices.length === 0) {
//         setError("Please select at least one time slot to block");
//         return;
//       }
//     }

//     if (!form.full_day && !areContiguous(slots, form.selectedSlotIndices)) {
//       setError(
//         "Selected slots must be contiguous (adjacent). Please select a continuous range.",
//       );
//       return;
//     }

//     let start_time = null;
//     let end_time = null;

//     if (
//       !form.full_day &&
//       form.selectedSlotIndices &&
//       form.selectedSlotIndices.length > 0
//     ) {
//       const sorted = [...form.selectedSlotIndices].sort((a, b) => a - b);
//       const firstSlot = slots[sorted[0]];
//       const lastSlot = slots[sorted[sorted.length - 1]];
//       start_time = firstSlot.start;
//       end_time = lastSlot.end;
//     }

//     const payload = {
//       availability_id: Number(availabilityId),
//       exception_date: form.exception_date
//         ? `${form.exception_date}T12:00:00`
//         : null,
//       type: form.type,
//       start_time,
//       end_time,
//       reason: form.reason?.trim() || null,
//       status: form.status,
//     };

//     const mutation = isEdit
//       ? updateMutation.mutateAsync({ id: initialData.id, payload })
//       : createMutation.mutateAsync(payload);

//     mutation
//       .then(() => onClose())
//       .catch((err) => {
//         const data = err.response?.data;
//         const msg =
//           data?.errors?.start_time?.[0] ||
//           data?.errors?.exception_date?.[0] ||
//           data?.message ||
//           "Something went wrong";
//         setError(msg);
//       });
//   };

//   const inputCls =
//     "h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

//   const selectedCount = form.selectedSlotIndices?.length || 0;
//   const isContiguous =
//     form.full_day || areContiguous(slots, form.selectedSlotIndices || []);

//   const formatDateRange = () => {
//     if (!dateMin || !dateMax) return "";
//     const fmt = (d) =>
//       new Date(d).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       });
//     return `${fmt(dateMin)} — ${fmt(dateMax)}`;
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50" onClick={onClose} />

//       <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface shadow-xl">
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-surface px-5 py-4">
//           <h2 className="font-jakarta text-lg font-bold text-ink-900">
//             {isEdit ? "Edit Exception" : "Add Exception"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
//           >
//             <FiX className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
//           {/* Date */}
//           <DatePicker
//             label="Date"
//             name="exception_date"
//             isFormik={false}
//             value={form.exception_date}
//             onChange={(v) =>
//               setForm({
//                 ...form,
//                 exception_date: v || "",
//                 selectedSlotIndices: [], // reset on date change
//               })
//             }
//             placeholder="Select date"
//             min={dateMin}
//             max={dateMax}
//             required
//           />
//           {dateMin && dateMax && (
//             <div className="-mt-2 flex items-center gap-1.5">
//               <FiAlertCircle className="h-3 w-3 text-ink-400" />
//               <p className="text-[11px] text-ink-500">
//                 Only dates between{" "}
//                 <strong className="text-ink-700">{formatDateRange()}</strong>{" "}
//                 can be selected
//               </p>
//             </div>
//           )}

//           {/* Full day blocked warning */}
//           {form.exception_date && blockedSlotsForDate.fullDay && (
//             <div className="rounded-lg border border-warn-200 bg-warn-50/50 px-3 py-2.5">
//               <div className="flex items-start gap-2">
//                 <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn-700" />
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs font-semibold text-warn-900">
//                     This date is already blocked (full day)
//                   </p>
//                   <p className="mt-0.5 text-[11px] text-warn-800">
//                     All slots for this date are already blocked by another
//                     exception.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-form-label">
//               Type
//             </label>
//             <select
//               value={form.type}
//               onChange={(e) => setForm({ ...form, type: e.target.value })}
//               className={`${inputCls} cursor-pointer`}
//             >
//               <option value="blocked">Blocked</option>
//               <option value="available">Available</option>
//             </select>
//           </div>

//           {/* Full day toggle */}
//           <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-ink-50/40 px-4 py-3">
//             <div>
//               <p className="text-sm font-medium text-ink-800">
//                 Block Entire Day
//               </p>
//               <p className="text-[11px] text-ink-500">
//                 {form.full_day
//                   ? "All slots blocked for this date"
//                   : "Specific time slots blocked"}
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={() =>
//                 setForm({
//                   ...form,
//                   full_day: !form.full_day,
//                   selectedSlotIndices: [],
//                 })
//               }
//               className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
//                 form.full_day ? "bg-brand-600" : "bg-ink-300"
//               }`}
//             >
//               <span
//                 className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
//                   form.full_day ? "translate-x-5" : "translate-x-0.5"
//                 }`}
//               />
//             </button>
//           </div>

//           {/* Slot multi-select */}
//           {!form.full_day && (
//             <div>
//               <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
//                 <label className="text-xs font-medium text-form-label">
//                   Select Slots <span className="text-form-required">*</span>
//                   {selectedCount > 0 && (
//                     <span className="ml-1 text-ink-500">
//                       ({selectedCount} selected)
//                     </span>
//                   )}
//                 </label>
//                 {slots.length > 0 && !blockedSlotsForDate.fullDay && (
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={selectAllAvailable}
//                       className="cursor-pointer rounded-md border border-ink-200 px-2 py-0.5 text-[10px] font-medium text-ink-600 hover:bg-ink-50"
//                     >
//                       Select All Available
//                     </button>
//                     <button
//                       type="button"
//                       onClick={clearAll}
//                       className="cursor-pointer rounded-md border border-ink-200 px-2 py-0.5 text-[10px] font-medium text-ink-600 hover:bg-ink-50"
//                     >
//                       Clear
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {slots.length === 0 ? (
//                 <div className="rounded-lg border border-warn-200 bg-warn-50/50 px-3 py-2">
//                   <p className="text-xs text-warn-800">
//                     No slots available. Check availability configuration.
//                   </p>
//                 </div>
//               ) : allSlotsBlocked ? (
//                 <div className="rounded-lg border border-danger-200 bg-danger-50/50 px-3 py-3 text-center">
//                   <FiLock className="mx-auto h-5 w-5 text-danger-600" />
//                   <p className="mt-1.5 text-xs font-semibold text-danger-800">
//                     All slots blocked
//                   </p>
//                   <p className="mt-0.5 text-[11px] text-danger-700">
//                     Every slot on this date is already blocked.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="max-h-[240px] space-y-1.5 overflow-y-auto rounded-lg border border-ink-200 bg-surface p-2">
//                   {slots.map((slot, idx) => {
//                     const isSelected = form.selectedSlotIndices?.includes(idx);
//                     const isBlocked = isSlotBlocked(idx);

//                     return (
//                       <button
//                         key={idx}
//                         type="button"
//                         onClick={() => toggleSlot(idx)}
//                         disabled={isBlocked}
//                         className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs font-medium transition ${
//                           isBlocked
//                             ? "cursor-not-allowed border-danger-100 bg-danger-50/40 text-ink-400"
//                             : isSelected
//                               ? "cursor-pointer border-brand-600 bg-brand-50 text-brand-700"
//                               : "cursor-pointer border-transparent text-ink-700 hover:bg-ink-50"
//                         }`}
//                       >
//                         <div className="flex items-center gap-2">
//                           <div
//                             className={`flex h-4 w-4 items-center justify-center rounded border ${
//                               isBlocked
//                                 ? "border-danger-300 bg-danger-100"
//                                 : isSelected
//                                   ? "border-brand-600 bg-brand-600"
//                                   : "border-ink-300 bg-surface"
//                             }`}
//                           >
//                             {isSelected && !isBlocked && (
//                               <FiCheck className="h-3 w-3 text-surface" />
//                             )}
//                             {isBlocked && (
//                               <FiLock className="h-2.5 w-2.5 text-danger-600" />
//                             )}
//                           </div>
//                           <span
//                             className={
//                               isBlocked ? "line-through opacity-60" : ""
//                             }
//                           >
//                             {formatTime12(slot.start)} -{" "}
//                             {formatTime12(slot.end)}
//                           </span>
//                         </div>
//                         {isBlocked ? (
//                           <span className="rounded-full bg-danger-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-danger-700">
//                             Blocked
//                           </span>
//                         ) : isSelected ? (
//                           <span className="text-[10px] font-semibold uppercase">
//                             Selected
//                           </span>
//                         ) : null}
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}

//               {!isContiguous && selectedCount > 1 && (
//                 <div className="mt-2 rounded-lg border border-warn-200 bg-warn-50/50 px-3 py-2">
//                   <p className="text-[11px] text-warn-800">
//                     Selected slots must be adjacent. Please select a continuous
//                     range (no gaps).
//                   </p>
//                 </div>
//               )}

//               {isContiguous && selectedCount > 0 && (
//                 <div className="mt-2 rounded-lg border border-accent-200 bg-accent-50/50 px-3 py-2">
//                   <p className="text-[11px] text-accent-800">
//                     Will block:{" "}
//                     <strong>
//                       {formatTime12(
//                         slots[Math.min(...form.selectedSlotIndices)].start,
//                       )}{" "}
//                       -{" "}
//                       {formatTime12(
//                         slots[Math.max(...form.selectedSlotIndices)].end,
//                       )}
//                     </strong>
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-form-label">
//               Reason
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. Doctor on leave"
//               value={form.reason}
//               maxLength={500}
//               onChange={(e) => setForm({ ...form, reason: e.target.value })}
//               className={inputCls}
//             />
//           </div>

//           {error && (
//             <div className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2">
//               <p className="text-xs text-danger-700">{error}</p>
//             </div>
//           )}

//           <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isPending}
//               className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={
//                 isPending ||
//                 (!form.full_day && !isContiguous) ||
//                 (form.full_day && blockedSlotsForDate.fullDay)
//               }
//               className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {isPending
//                 ? isEdit
//                   ? "Updating..."
//                   : "Creating..."
//                 : isEdit
//                   ? "Update"
//                   : "Create"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ExceptionForm;
