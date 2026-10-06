// import { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiCheck,
//   FiUser,
//   FiCalendar,
//   FiClock,
//   FiPhone,
//   FiFileText,
//   FiAlertCircle,
//   FiLock,
// } from "react-icons/fi";
// import {
//   useAppointment,
//   useUpdateAppointment,
// } from "../../queries/appointments";
// import { useSlotsForDate } from "../../queries/availabilityExceptions";
// import SlotGrid from "./components/SlotGrid";
// import Loader from "../../common/Loader";

// const todayStr = () => {
//   const d = new Date();
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// };

// const AppointmentEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const { data: appointment, isLoading } = useAppointment(id);
//   const updateMutation = useUpdateAppointment();

//   const [formData, setFormData] = useState({
//     appointment_date: "",
//     selected_slot: null,
//     notes: "",
//   });

//   const [originalData, setOriginalData] = useState({
//     appointment_date: "",
//     start_time: "",
//     end_time: "",
//     notes: "",
//   });

//   const [error, setError] = useState("");
//   const [dateChanged, setDateChanged] = useState(false);

//   // Load appointment data
//   useEffect(() => {
//     if (!appointment) return;

//     const dateStr = appointment.appointment_date?.slice(0, 10) || "";

//     setFormData({
//       appointment_date: dateStr,
//       selected_slot: {
//         start_time: appointment.start_time?.slice(0, 5),
//         end_time: appointment.end_time?.slice(0, 5),
//       },
//       notes: appointment.notes || "",
//     });

//     setOriginalData({
//       appointment_date: dateStr,
//       start_time: appointment.start_time?.slice(0, 5),
//       end_time: appointment.end_time?.slice(0, 5),
//       notes: appointment.notes || "",
//     });
//   }, [appointment]);

//   // Detect date change
//   useEffect(() => {
//     if (!originalData.appointment_date) return;
//     setDateChanged(formData.appointment_date !== originalData.appointment_date);
//   }, [formData.appointment_date, originalData.appointment_date]);

//   // Fetch slots when date changes (or on initial load with same date)
//   const shouldFetchSlots = !!(
//     appointment &&
//     formData.appointment_date &&
//     appointment.provider?.id &&
//     appointment.appointment_type?.id
//   );

//   const {
//     data: slotsData,
//     isLoading: loadingSlots,
//     isFetching: fetchingSlots,
//   } = useSlotsForDate({
//     adminId: shouldFetchSlots ? appointment?.provider?.id : null,
//     appointmentTypeId: shouldFetchSlots
//       ? appointment?.appointment_type?.id
//       : null,
//     date: shouldFetchSlots ? formData.appointment_date : null,
//   });

//   const slots = slotsData || [];

//   // Filter: hide current appointment's own slot from "booked" (since it's this appointment)
//   const isCurrentSlot = (slot) => {
//     return (
//       slot.start_time === originalData.start_time &&
//       slot.end_time === originalData.end_time &&
//       formData.appointment_date === originalData.appointment_date
//     );
//   };

//   // Slot stats
//   const stats = useMemo(() => {
//     const available = slots.filter((s) => s.available === true).length;
//     return { available, total: slots.length };
//   }, [slots]);

//   // Handle slot select
//   const handleSlotSelect = (slot) => {
//     setFormData((prev) => ({
//       ...prev,
//       selected_slot: {
//         start_time: slot.start_time,
//         end_time: slot.end_time,
//       },
//     }));
//     setError("");
//   };

//   // Dirty check
//   const isDirty = useMemo(() => {
//     if (!formData.appointment_date) return false;
//     const dateChanged =
//       formData.appointment_date !== originalData.appointment_date;
//     const timeChanged =
//       formData.selected_slot?.start_time !== originalData.start_time ||
//       formData.selected_slot?.end_time !== originalData.end_time;
//     const notesChanged = (formData.notes || "") !== (originalData.notes || "");
//     return dateChanged || timeChanged || notesChanged;
//   }, [formData, originalData]);

//   // Submit
//   const handleSubmit = () => {
//     setError("");

//     if (!formData.appointment_date) {
//       setError("Please select an appointment date.");
//       return;
//     }
//     if (!formData.selected_slot) {
//       setError("Please select a time slot.");
//       return;
//     }
//     if (!isDirty) {
//       setError("No changes to save.");
//       return;
//     }

//     // Only send changed fields (per doc)
//     const payload = {};
//     if (formData.appointment_date !== originalData.appointment_date) {
//       payload.appointment_date = formData.appointment_date;
//     }
//     if (
//       formData.selected_slot.start_time !== originalData.start_time ||
//       formData.selected_slot.end_time !== originalData.end_time
//     ) {
//       payload.start_time = formData.selected_slot.start_time;
//       payload.end_time = formData.selected_slot.end_time;
//     }
//     if ((formData.notes || "") !== (originalData.notes || "")) {
//       payload.notes = formData.notes?.trim() || null;
//     }

//     updateMutation.mutate(
//       { id, payload },
//       {
//         onSuccess: () => {
//           navigate(`/appointments/${id}`);
//         },
//         onError: (err) => {
//           const data = err.response?.data;
//           const firstErr = data?.errors && Object.values(data.errors)[0]?.[0];
//           setError(firstErr || data?.message || "Failed to update appointment");
//         },
//       },
//     );
//   };

//   if (isLoading) return <Loader text="Loading appointment..." />;

//   if (!appointment) {
//     return (
//       <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
//         <p className="text-sm text-ink-500">Appointment not found.</p>
//       </div>
//     );
//   }

//   const isSaving = updateMutation.isPending;

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//         <div className="min-w-0">
//           <button
//             onClick={() => navigate(`/appointments/${id}`)}
//             disabled={isSaving}
//             className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <FiArrowLeft className="h-3.5 w-3.5" />
//             Back to Appointment
//           </button>
//           <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
//             Edit Appointment #{appointment.id}
//           </h1>
//           <p className="mt-1 text-xs text-ink-500 sm:text-sm">
//             Update date, time, or notes. Patient and provider cannot be changed.
//           </p>
//         </div>
//       </div>

//       {/* Info banner */}
//       <div className="flex items-start gap-2 rounded-lg border border-accent-200 bg-accent-50/50 px-3 py-2.5">
//         <FiLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" />
//         <p className="text-[11px] text-accent-800">
//           Patient, provider, and appointment type are locked. To change these,
//           please create a new appointment.
//         </p>
//       </div>

//       {/* Locked info card */}
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-5">
//           <div className="flex items-start gap-3">
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
//               <FiUser className="h-4 w-4" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
//                 Patient
//               </p>
//               <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
//                 {appointment.name || "—"}
//               </p>
//               <p className="text-[11px] text-ink-500">
//                 {appointment.mobile || "—"}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
//               <FiUser className="h-4 w-4" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
//                 Provider
//               </p>
//               <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
//                 {appointment.provider?.name || "—"}
//               </p>
//               <p className="text-[11px] text-ink-500">
//                 {appointment.provider?.role_label || "—"}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warn-50 text-warn-700">
//               <FiFileText className="h-4 w-4" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
//                 Type
//               </p>
//               <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
//                 {appointment.appointment_type?.name || "—"}
//               </p>
//               <p className="text-[11px] text-ink-500">
//                 {appointment.appointment_type?.duration || "—"} min
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Editable section — Date */}
//       <div className="space-y-4 rounded-xl border border-ink-100 bg-surface p-5">
//         <div>
//           <h3 className="font-jakarta text-sm font-bold text-ink-900">
//             Schedule
//           </h3>
//           <p className="mt-0.5 text-xs text-ink-500">
//             Change date or time. Selecting a new date will reload available
//             slots.
//           </p>
//         </div>

//         {/* Date input */}
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-form-label">
//               Appointment Date <span className="text-form-required">*</span>
//             </label>
//             <input
//               type="date"
//               value={formData.appointment_date}
//               min={todayStr()}
//               disabled={isSaving}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   appointment_date: e.target.value,
//                   selected_slot: null,
//                 }))
//               }
//               className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
//             />
//           </div>

//           {/* Current slot indicator */}
//           {formData.selected_slot && (
//             <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3">
//               <p className="text-[10px] font-medium uppercase tracking-wide text-brand-700">
//                 Selected Time
//               </p>
//               <p className="mt-0.5 text-sm font-bold text-ink-900">
//                 {formData.selected_slot.start_time} -{" "}
//                 {formData.selected_slot.end_time}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Slot stats */}
//         {slots.length > 0 && (
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-600">
//               <span className="font-bold">{stats.total}</span>
//               <span className="opacity-80">Total</span>
//             </span>
//             <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
//               <span className="font-bold">{stats.available}</span>
//               <span className="opacity-80">Available</span>
//             </span>
//           </div>
//         )}

//         {/* Slots grid */}
//         <div>
//           <div className="mb-3 flex items-center justify-between">
//             <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
//               Available Slots
//             </p>
//             {dateChanged && (
//               <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-2 py-0.5 text-[10px] font-medium text-warn-800">
//                 Date changed — pick a new slot
//               </span>
//             )}
//           </div>

//           <SlotGrid
//             slots={slots}
//             selectedSlot={formData.selected_slot}
//             onSelect={handleSlotSelect}
//             loading={loadingSlots || fetchingSlots}
//             emptyText="No slots available for this date."
//           />
//         </div>
//       </div>

//       {/* Notes */}
//       <div className="rounded-xl border border-ink-100 bg-surface p-5">
//         <label className="mb-1.5 block text-xs font-medium text-form-label">
//           Notes
//         </label>
//         <textarea
//           rows={3}
//           value={formData.notes || ""}
//           disabled={isSaving}
//           onChange={(e) =>
//             setFormData((prev) => ({ ...prev, notes: e.target.value }))
//           }
//           placeholder="Optional notes about this appointment..."
//           className="w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
//         />
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2.5">
//           <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
//           <p className="text-xs text-danger-700">{error}</p>
//         </div>
//       )}

//       {/* Actions */}
//       <div className="flex justify-end gap-3">
//         <button
//           type="button"
//           onClick={() => navigate(`/appointments/${id}`)}
//           disabled={isSaving}
//           className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           Cancel
//         </button>
//         <button
//           type="button"
//           onClick={handleSubmit}
//           disabled={isSaving || !isDirty}
//           className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
//             isSaving || !isDirty
//               ? "cursor-not-allowed bg-ink-100 text-ink-400"
//               : "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
//           }`}
//         >
//           <FiCheck className="h-4 w-4" />
//           {isSaving ? "Updating..." : "Save Changes"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AppointmentEdit;

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiCalendar,
  FiClock,
  FiFileText,
  FiAlertCircle,
  FiLock,
  FiInfo,
} from "react-icons/fi";
import {
  useAppointment,
  useUpdateAppointment,
} from "../../queries/appointments";
import { useSlotsForDate } from "../../queries/availabilityExceptions";
import { useProviderAvailabilities } from "../../queries/providerAvailabilities";
import SlotGrid from "./components/SlotGrid";
import AvailableDatesCalendar from "./components/AvailableDatesCalendar";
import Loader from "../../common/Loader";

const AppointmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: appointment, isLoading } = useAppointment(id);
  const updateMutation = useUpdateAppointment();

  const [formData, setFormData] = useState({
    appointment_date: "",
    selected_slot: null,
    notes: "",
  });

  const [originalData, setOriginalData] = useState({
    appointment_date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [dateChanged, setDateChanged] = useState(false);

  useEffect(() => {
    if (!appointment) return;

    const dateStr = appointment.appointment_date?.slice(0, 10) || "";

    setFormData({
      appointment_date: dateStr,
      selected_slot: {
        start_time: appointment.start_time?.slice(0, 5),
        end_time: appointment.end_time?.slice(0, 5),
      },
      notes: appointment.notes || "",
    });

    setOriginalData({
      appointment_date: dateStr,
      start_time: appointment.start_time?.slice(0, 5),
      end_time: appointment.end_time?.slice(0, 5),
      notes: appointment.notes || "",
    });
  }, [appointment]);

  useEffect(() => {
    if (!originalData.appointment_date) return;
    setDateChanged(formData.appointment_date !== originalData.appointment_date);
  }, [formData.appointment_date, originalData.appointment_date]);

  const providerId = appointment?.provider?.id;
  const appointmentTypeId = appointment?.appointment_type?.id;

  // Fetch availability rules
  const {
    data: availabilitiesData,
    isLoading: loadingAvailabilities,
    isFetching: fetchingAvailabilities,
  } = useProviderAvailabilities(
    providerId && appointmentTypeId
      ? {
          admin_id: providerId,
          appointment_type_id: appointmentTypeId,
          status: 1,
          per_page: 100,
        }
      : { per_page: 0 },
  );

  const availabilities = availabilitiesData?.list || [];

  const availableConfig = useMemo(() => {
    if (!availabilities.length) {
      return { dateFrom: null, dateTo: null, daysOfWeek: [] };
    }

    let earliestFrom = null;
    let latestTo = null;
    const allDays = new Set();

    availabilities.forEach((av) => {
      if (!earliestFrom || av.date_from < earliestFrom) {
        earliestFrom = av.date_from;
      }
      if (!latestTo || av.date_to > latestTo) {
        latestTo = av.date_to;
      }
      (av.days_of_week || []).forEach((d) => allDays.add(d));
    });

    return {
      dateFrom: earliestFrom,
      dateTo: latestTo,
      daysOfWeek: Array.from(allDays).sort((a, b) => a - b),
    };
  }, [availabilities]);

  const hasAvailability = !!availableConfig.dateFrom;

  // Fetch slots
  const shouldFetchSlots = !!(
    appointment &&
    formData.appointment_date &&
    providerId &&
    appointmentTypeId
  );

  const {
    data: slotsData,
    isLoading: loadingSlots,
    isFetching: fetchingSlots,
  } = useSlotsForDate({
    adminId: shouldFetchSlots ? providerId : null,
    appointmentTypeId: shouldFetchSlots ? appointmentTypeId : null,
    date: shouldFetchSlots ? formData.appointment_date : null,
  });

  const slots = slotsData || [];

  const stats = useMemo(() => {
    const available = slots.filter((s) => s.available === true).length;
    return { available, total: slots.length };
  }, [slots]);

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({
      ...prev,
      selected_slot: {
        start_time: slot.start_time,
        end_time: slot.end_time,
      },
    }));
    setError("");
  };

  const handleDateSelect = (dateStr) => {
    setFormData((prev) => ({
      ...prev,
      appointment_date: dateStr,
      selected_slot: null,
    }));
    setError("");
  };

  const isDirty = useMemo(() => {
    if (!formData.appointment_date) return false;
    const dChanged =
      formData.appointment_date !== originalData.appointment_date;
    const tChanged =
      formData.selected_slot?.start_time !== originalData.start_time ||
      formData.selected_slot?.end_time !== originalData.end_time;
    const nChanged = (formData.notes || "") !== (originalData.notes || "");
    return dChanged || tChanged || nChanged;
  }, [formData, originalData]);

  const handleSubmit = () => {
    setError("");

    if (!formData.appointment_date) {
      setError("Please select an appointment date.");
      return;
    }
    if (!formData.selected_slot) {
      setError("Please select a time slot.");
      return;
    }
    if (!isDirty) {
      setError("No changes to save.");
      return;
    }

    const payload = {};
    if (formData.appointment_date !== originalData.appointment_date) {
      payload.appointment_date = formData.appointment_date;
    }
    if (
      formData.selected_slot.start_time !== originalData.start_time ||
      formData.selected_slot.end_time !== originalData.end_time
    ) {
      payload.start_time = formData.selected_slot.start_time;
      payload.end_time = formData.selected_slot.end_time;
    }
    if ((formData.notes || "") !== (originalData.notes || "")) {
      payload.notes = formData.notes?.trim() || null;
    }

    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: () => navigate(`/appointments/${id}`),
        onError: (err) => {
          const data = err.response?.data;
          const firstErr = data?.errors && Object.values(data.errors)[0]?.[0];
          setError(firstErr || data?.message || "Failed to update appointment");
        },
      },
    );
  };

  if (isLoading) return <Loader text="Loading appointment..." />;

  if (!appointment) {
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm text-ink-500">Appointment not found.</p>
      </div>
    );
  }

  const isSaving = updateMutation.isPending;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <button
            onClick={() => navigate(`/appointments/${id}`)}
            disabled={isSaving}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Appointment
          </button>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Edit Appointment #{appointment.id}
          </h1>
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            Update date, time, or notes. Patient and provider cannot be changed.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-accent-200 bg-accent-50/50 px-3 py-2.5">
        <FiLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" />
        <p className="text-[11px] text-accent-800">
          Patient, provider, and appointment type are locked. To change these,
          please create a new appointment.
        </p>
      </div>

      {/* Locked info card */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiUser className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Patient
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                {appointment.name || "—"}
              </p>
              <p className="text-[11px] text-ink-500">
                {appointment.mobile || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <FiUser className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Provider
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                {appointment.provider?.name || "—"}
              </p>
              <p className="text-[11px] text-ink-500">
                {appointment.provider?.role_label || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warn-50 text-warn-700">
              <FiFileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Type
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                {appointment.appointment_type?.name || "—"}
              </p>
              <p className="text-[11px] text-ink-500">
                {appointment.appointment_type?.duration || "—"} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading availability */}
      {(loadingAvailabilities || fetchingAvailabilities) && (
        <div className="flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50/50 px-3 py-2.5">
          <FiInfo className="h-4 w-4 text-accent-600" />
          <p className="text-xs text-accent-800">
            Loading provider availability...
          </p>
        </div>
      )}

      {/* No availability */}
      {!loadingAvailabilities &&
        !fetchingAvailabilities &&
        !hasAvailability &&
        providerId &&
        appointmentTypeId && (
          <div className="flex items-start gap-2.5 rounded-lg border border-warn-200 bg-warn-50/50 p-4">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
            <div>
              <p className="text-sm font-semibold text-warn-900">
                No availability found
              </p>
              <p className="mt-0.5 text-xs text-warn-800">
                This provider has no availability configured for this
                appointment type. Contact the provider to set availability.
              </p>
            </div>
          </div>
        )}

      {/* Editable section with calendar + slots */}
      {hasAvailability && (
        <div className="rounded-xl border border-ink-100 bg-surface p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="font-jakarta text-sm font-bold text-ink-900">
              Schedule
            </h3>
            <p className="mt-0.5 text-xs text-ink-500">
              Change date or time. Selecting a new date will reload available
              slots.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Available Dates
              </p>
              <AvailableDatesCalendar
                dateFrom={availableConfig.dateFrom}
                dateTo={availableConfig.dateTo}
                daysOfWeek={availableConfig.daysOfWeek}
                selectedDate={formData.appointment_date}
                onSelect={handleDateSelect}
                disabled={loadingSlots || fetchingSlots || isSaving}
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Slots for {formData.appointment_date || "—"}
                </p>
                {dateChanged && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                    Date changed — pick a new slot
                  </span>
                )}
              </div>

              {formData.selected_slot && (
                <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-surface">
                      <FiClock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
                        Selected Slot
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-ink-900">
                        {formData.selected_slot.start_time} -{" "}
                        {formData.selected_slot.end_time}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {slots.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-600">
                    <span className="font-bold">{stats.total}</span>
                    <span className="opacity-80">Total</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                    <span className="font-bold">{stats.available}</span>
                    <span className="opacity-80">Available</span>
                  </span>
                </div>
              )}

              <SlotGrid
                slots={slots}
                selectedSlot={formData.selected_slot}
                onSelect={handleSlotSelect}
                loading={loadingSlots || fetchingSlots}
                emptyText="No slots available for this date."
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-xl border border-ink-100 bg-surface p-4 sm:p-5">
        <label className="mb-1.5 block text-xs font-medium text-form-label">
          Notes
        </label>
        <textarea
          rows={3}
          value={formData.notes || ""}
          disabled={isSaving}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Optional notes about this appointment..."
          className="w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2.5">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
          <p className="text-xs text-danger-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate(`/appointments/${id}`)}
          disabled={isSaving}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !isDirty}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
            isSaving || !isDirty
              ? "cursor-not-allowed bg-ink-100 text-ink-400"
              : "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
          }`}
        >
          <FiCheck className="h-4 w-4" />
          {isSaving ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentEdit;
