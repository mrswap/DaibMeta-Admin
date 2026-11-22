// import { useState, useEffect, useMemo, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQueryClient } from "@tanstack/react-query";
// import {
//   FiX,
//   FiUser,
//   FiPhone,
//   FiCalendar,
//   FiClock,
//   FiCheckCircle,
//   FiCheck,
//   FiAlertCircle,
//   FiExternalLink,
//   FiAlertTriangle,
//   FiLink,
//   FiUserPlus,
//   FiEdit2,
//   FiTrash2,
//   FiUsers,
//   FiArrowLeft,
//   FiRefreshCw,
//   FiChevronDown,
// } from "react-icons/fi";
// import { useCreateVisit } from "../../../queries/visits";
// import { useCreatePatient, usePatients } from "../../../queries/patients";
// import {
//   useDeleteAppointment,
//   useUpdateAppointmentStatus,
//   getAllowedTransitions,
// } from "../../../queries/appointments";
// import ConfirmModal from "../../../common/ConfirmModal";
// import {
//   FilterSelect,
//   PhoneInputField,
//   validatePhone,
// } from "../../../common/form";
// import { api } from "../../../../../lib/axios";
// import { usePermission } from "../../../hooks/usePermission";

// // ==================== HELPERS ====================
// const formatTime12 = (t) => {
//   if (!t) return "";
//   const [h, m] = t.slice(0, 5).split(":").map(Number);
//   const period = h >= 12 ? "PM" : "AM";
//   const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
//   return `${hr}:${String(m).padStart(2, "0")} ${period}`;
// };

// const formatDateFull = (d) => {
//   if (!d) return "";
//   try {
//     return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
//       weekday: "long",
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });
//   } catch {
//     return d;
//   }
// };

// const getInitials = (name = "") => {
//   const parts = name.trim().split(/\s+/).filter(Boolean);
//   if (parts.length === 0) return "?";
//   if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//   return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
// };

// const SEX_OPTIONS = [
//   { value: "male", label: "Male" },
//   { value: "female", label: "Female" },
//   { value: "other", label: "Other" },
// ];

// const PAYMENT_OPTIONS = [
//   { value: "unpaid", label: "Unpaid" },
//   { value: "free", label: "Free" },
//   { value: "partial", label: "Partial" },
//   { value: "paid", label: "Paid" },
// ];

// // ==================== STATUS DROPDOWN ====================
// const humanize = (s = "") =>
//   String(s)
//     .replace(/[_-]+/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());

// // getAllowedTransitions string ya object dono return kare, dono handle hoga
// const normalizeTransition = (t) => {
//   if (typeof t === "string") return { value: t, label: humanize(t) };
//   const value = t.value ?? t.status ?? t.key;
//   return { value, label: t.label ?? humanize(value) };
// };

// const isDangerStatus = (v = "") =>
//   /(cancel|no_show|noshow|reject|declin)/i.test(String(v));

// const InlineStatusChange = ({
//   appointmentId,
//   allowedTransitions = [],
//   disabled = false,
// }) => {
//   const queryClient = useQueryClient();
//   const updateStatus = useUpdateAppointmentStatus();
//   const wrapRef = useRef(null);

//   const [open, setOpen] = useState(false);
//   const [error, setError] = useState(null);

//   const options = allowedTransitions
//     .map(normalizeTransition)
//     .filter((o) => o.value);
//   const loading = updateStatus.isPending;

//   // bahar click ya Esc pe band
//   useEffect(() => {
//     if (!open) return;
//     const onDown = (e) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     const onKey = (e) => e.key === "Escape" && setOpen(false);
//     document.addEventListener("mousedown", onDown);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onDown);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, [open]);

//   const handleSelect = async (value) => {
//     setError(null);
//     try {
//       // ⚠️ Payload apne mutation ke hisaab se adjust karo
//       await updateStatus.mutateAsync({ id: appointmentId, status: value });
//       queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
//       queryClient.invalidateQueries({ queryKey: ["appointments"] });
//       setOpen(false);
//     } catch (err) {
//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to update status.",
//       );
//     }
//   };

//   return (
//     <div ref={wrapRef} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         disabled={disabled || loading}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-200 bg-surface px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
//       >
//         {loading ? (
//           <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" />
//         ) : (
//           <FiRefreshCw className="h-3 w-3" />
//         )}
//         {loading ? "Updating..." : "Change Status"}
//         <FiChevronDown
//           className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {open && (
//         <ul
//           role="listbox"
//           className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-ink-200 bg-surface py-1 shadow-lg"
//         >
//           {options.map((o) => (
//             <li key={o.value}>
//               <button
//                 type="button"
//                 role="option"
//                 onClick={() => handleSelect(o.value)}
//                 className={`flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-xs font-medium transition hover:bg-ink-50 ${
//                   isDangerStatus(o.value) ? "text-danger-600" : "text-ink-700"
//                 }`}
//               >
//                 {o.label}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {error && <p className="mt-1 text-[11px] text-danger-600">{error}</p>}
//     </div>
//   );
// };

// // ==================== COMPONENT ====================
// const BookedSlotDetailsModal = ({
//   open,
//   onClose,
//   slot,
//   provider,
//   date,
//   onBack, // optional: Back button tabhi dikhega jab ye pass ho
//   initialAppointmentId, // optional: kaunsa appointment pehle select ho
// }) => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const createVisit = useCreateVisit();
//   const createPatient = useCreatePatient();
//   const deleteAppointment = useDeleteAppointment();
//   const { can, isLoading: permLoading } = usePermission();

//   const canManageAppointment = can("appointment", "manage");
//   const canDeleteAppointment = can("appointment", "delete");
//   const canManagePatient = can("patients", "manage");
//   const canViewPatient = can("patients", "view");
//   const canManageVisit = can("visits", "manage");
//   const canViewVisit = can("visits", "view");

//   const changeTabs = useMemo(() => {
//     const arr = [];
//     if (canManagePatient) {
//       arr.push({
//         value: "new",
//         label: "New Patient",
//         icon: FiUserPlus,
//       });
//     }
//     if (canViewPatient) {
//       arr.push({
//         value: "existing",
//         label: "Existing Patient",
//         icon: FiLink,
//       });
//     }
//     return arr;
//   }, [canManagePatient, canViewPatient]);

//   const [changeMode, setChangeMode] = useState(false);
//   const [activeChangeTab, setActiveChangeTab] = useState("new");

//   const [newName, setNewName] = useState("");
//   const [newMobile, setNewMobile] = useState("");
//   const [newAge, setNewAge] = useState("");
//   const [newSex, setNewSex] = useState(null);

//   const [selectedPatient, setSelectedPatient] = useState(null);

//   const [changeErrors, setChangeErrors] = useState({});

//   const [paymentStatus, setPaymentStatus] = useState(PAYMENT_OPTIONS[0]);

//   const [submitError, setSubmitError] = useState(null);

//   const [pendingPatient, setPendingPatient] = useState(null);

//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

//   // ==================== MULTIPLE APPOINTMENTS ====================
//   const appointments = useMemo(() => {
//     if (!slot) return [];

//     const list = Array.isArray(slot.appointments) ? slot.appointments : [];

//     if (list.length > 0) return list;

//     if (slot.appointment) return [slot.appointment];
//     return [];
//   }, [slot]);

//   const [activeAppointmentId, setActiveAppointmentId] = useState(null);

//   useEffect(() => {
//     if (!open) return;
//     if (permLoading) return;
//     if (appointments.length > 0) {
//       const preferred = initialAppointmentId
//         ? appointments.find(
//             (a) => String(a.id) === String(initialAppointmentId),
//           )
//         : null;
//       setActiveAppointmentId((preferred || appointments[0]).id);
//     } else {
//       setActiveAppointmentId(null);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     open,
//     slot?.start_time,
//     permLoading,
//     appointments.length,
//     initialAppointmentId,
//   ]);

//   const currentAppointment = useMemo(() => {
//     if (!appointments.length) return {};
//     if (activeAppointmentId) {
//       const found = appointments.find((a) => a.id === activeAppointmentId);
//       if (found) return found;
//     }
//     return appointments[0];
//   }, [appointments, activeAppointmentId]);

//   // ==================== LOAD PATIENTS ====================
//   const { data: patientsData } = usePatients({ per_page: 200 });

//   const patientOptions = useMemo(() => {
//     const list = patientsData?.list || [];
//     return list.map((p) => ({
//       value: p.id,
//       label: `${p.name} — ${p.patient_id || `#${p.id}`}${
//         p.mobile ? ` · ${p.mobile}` : ""
//       }`,
//       raw: p,
//     }));
//   }, [patientsData]);

//   // ==================== APPOINTMENT / SLOT DATA ====================
//   const appointment = currentAppointment || {};
//   const existingVisit = appointment?.visit || slot?.visit || null;
//   const hasExistingVisit = !!existingVisit;

//   const currentPatientId =
//     appointment.patient_id || appointment.patient?.id || null;
//   const hasCurrentPatient = !!currentPatientId;
//   const hasAppointmentPatientData = !!appointment.name && !!appointment.mobile;

//   const canCreateVisit =
//     !hasExistingVisit && (hasCurrentPatient || hasAppointmentPatientData);

//   const isPending = createVisit.isPending || createPatient.isPending;

//   const currentPatientOption = useMemo(() => {
//     if (!hasCurrentPatient || !patientOptions.length) return null;
//     return patientOptions.find((o) => o.value === currentPatientId) || null;
//   }, [hasCurrentPatient, currentPatientId, patientOptions]);

//   // ==================== STATUS TRANSITIONS ====================
//   const allowedTransitions = useMemo(() => {
//     if (!appointment?.status) return [];
//     try {
//       return getAllowedTransitions(appointment.status) || [];
//     } catch {
//       return [];
//     }
//   }, [appointment?.status]);

//   const canChangeStatus =
//     !!appointment?.id && canManageAppointment && allowedTransitions.length > 0;

//   // ==================== DISPLAY PATIENT ====================
//   const displayPatient = useMemo(() => {
//     if (pendingPatient) {
//       if (pendingPatient.type === "link" && pendingPatient.patient) {
//         return {
//           id: pendingPatient.patient.id,
//           name: pendingPatient.patient.name,
//           mobile: pendingPatient.patient.mobile,
//           patient_id: pendingPatient.patient.patient_id,
//           isOverride: true,
//           isLinked: true,
//         };
//       }
//       if (pendingPatient.type === "create") {
//         return {
//           id: null,
//           name: pendingPatient.name,
//           mobile: pendingPatient.mobile,
//           patient_id: null,
//           isNew: true,
//         };
//       }
//     }
//     if (hasCurrentPatient) {
//       return {
//         id: currentPatientId,
//         name: appointment.patient?.name || appointment.name || "—",
//         mobile: appointment.patient?.mobile || appointment.mobile,
//         patient_id: appointment.patient?.patient_id || null,
//         isLinked: true,
//       };
//     }
//     return {
//       id: null,
//       name: appointment.name || "—",
//       mobile: appointment.mobile || "",
//       patient_id: null,
//       isWalkIn: true,
//     };
//   }, [pendingPatient, hasCurrentPatient, currentPatientId, appointment]);

//   // ==================== RESET ====================
//   useEffect(() => {
//     if (!open) return;
//     if (permLoading) return;

//     setChangeMode(false);
//     setActiveChangeTab(changeTabs[0]?.value || "new");

//     setNewName(appointment.name || "");
//     setNewMobile(appointment.mobile || "");
//     setNewAge("");
//     setNewSex(null);
//     setSelectedPatient(null);
//     setChangeErrors({});
//     setPaymentStatus(PAYMENT_OPTIONS[0]);
//     setSubmitError(null);
//     setPendingPatient(null);
//     setDeleteConfirmOpen(false);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open, slot?.start_time, permLoading, activeAppointmentId]);

//   useEffect(() => {
//     if (!open || permLoading) return;
//     const validTabs = changeTabs.map((t) => t.value);
//     if (!validTabs.includes(activeChangeTab)) {
//       setActiveChangeTab(validTabs[0] || "new");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open, permLoading, changeTabs.length, activeChangeTab]);

//   if (!open || !slot || !provider) return null;

//   // ==================== HANDLERS ====================
//   const handleViewVisit = () => {
//     if (!existingVisit?.id) return;
//     onClose();
//     navigate(`/visits/${existingVisit.id}`);
//   };

//   const handleStartChange = () => {
//     if (isPending) return;
//     setChangeMode(true);

//     const validTabs = changeTabs.map((t) => t.value);
//     if (hasCurrentPatient && validTabs.includes("existing")) {
//       setActiveChangeTab("existing");
//       setSelectedPatient(currentPatientOption);
//     } else if (validTabs.includes("new")) {
//       setActiveChangeTab("new");
//     } else {
//       setActiveChangeTab(validTabs[0] || "new");
//     }

//     setNewName(appointment.name || "");
//     setNewMobile(appointment.mobile || "");
//     setNewAge("");
//     setNewSex(null);
//     setChangeErrors({});
//   };

//   const handleCancelChange = () => {
//     if (isPending) return;
//     setChangeMode(false);
//     setChangeErrors({});
//   };

//   const handleTabSwitch = (tab) => {
//     if (isPending) return;
//     setActiveChangeTab(tab);
//     setChangeErrors({});

//     if (tab === "existing" && hasCurrentPatient && !selectedPatient) {
//       setSelectedPatient(currentPatientOption);
//     }
//   };

//   const validateChange = () => {
//     const e = {};

//     if (activeChangeTab === "existing") {
//       if (!selectedPatient) e.selectedPatient = "Please select a patient";
//     } else {
//       if (!newName.trim()) e.newName = "Name is required";
//       else if (newName.trim().length > 150) e.newName = "Max 150 characters";

//       if (!newMobile) e.newMobile = "Mobile is required";
//       else if (!validatePhone(newMobile)) e.newMobile = "Invalid mobile";

//       if (newAge === "" || newAge === null || newAge === undefined) {
//         e.newAge = "Age is required";
//       } else if (isNaN(Number(newAge))) {
//         e.newAge = "Age must be a number";
//       } else if (Number(newAge) < 0 || Number(newAge) > 150) {
//         e.newAge = "Invalid age";
//       }

//       if (!newSex) e.newSex = "Sex is required";
//     }

//     setChangeErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleApplyChange = () => {
//     if (!validateChange()) return;

//     if (activeChangeTab === "existing") {
//       if (selectedPatient.value === currentPatientId && !pendingPatient) {
//         setChangeMode(false);
//         return;
//       }
//       setPendingPatient({
//         type: "link",
//         patient: selectedPatient.raw,
//       });
//     } else {
//       setPendingPatient({
//         type: "create",
//         name: newName.trim(),
//         mobile: newMobile.trim(),
//         age: Number(newAge),
//         sex: newSex?.value || newSex || "other",
//       });
//     }

//     setChangeMode(false);
//   };

//   const handleClearPending = () => {
//     if (isPending) return;
//     setPendingPatient(null);
//   };

//   const handleCreateVisit = async () => {
//     if (!canManageVisit) {
//       setSubmitError("You don't have permission to create visit.");
//       return;
//     }
//     setSubmitError(null);

//     if (!canCreateVisit) {
//       setSubmitError("Patient information is missing. Cannot create visit.");
//       return;
//     }

//     try {
//       let finalPatientId = currentPatientId;
//       let patientChanged = false;

//       if (pendingPatient?.type === "link") {
//         finalPatientId = pendingPatient.patient.id;
//         if (finalPatientId !== currentPatientId) patientChanged = true;
//       } else if (pendingPatient?.type === "create") {
//         const patientRes = await createPatient.mutateAsync({
//           name: pendingPatient.name,
//           mobile: pendingPatient.mobile,
//           age: pendingPatient.age,
//           sex: pendingPatient.sex,
//           pin: "0000",
//           status: true,
//         });

//         const patientData =
//           patientRes?.data?.data || patientRes?.data || patientRes;
//         finalPatientId = patientData?.id;

//         if (!finalPatientId) {
//           throw new Error("Patient creation failed — no ID returned.");
//         }

//         patientChanged = true;
//       }

//       if (patientChanged && appointment.id && canManageAppointment) {
//         await api
//           .put(`/admin/appointments/${appointment.id}`, {
//             patient_id: finalPatientId,
//           })
//           .catch(() => {});
//       }

//       const payload = {
//         appointment_id: appointment.id || null,
//         patient_id: finalPatientId,
//         provider_id: provider.id,
//         visit_date: date,
//         slot_start_time: slot.start_time,
//         slot_end_time: slot.end_time,
//         visit_type: "consultation",
//         payment_status: paymentStatus?.value || "unpaid",
//       };

//       const visitRes = await createVisit.mutateAsync(payload);

//       queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
//       queryClient.invalidateQueries({ queryKey: ["visits"] });
//       queryClient.invalidateQueries({ queryKey: ["patients"] });
//       queryClient.invalidateQueries({ queryKey: ["appointments"] });

//       const visitData = visitRes?.data?.data || visitRes?.data || visitRes;
//       const visitId = visitData?.id;

//       onClose();

//       if (visitId) {
//         navigate(`/visits/${visitId}`);
//       } else {
//         navigate("/visits");
//       }
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to create visit. Please try again.";
//       setSubmitError(msg);
//     }
//   };

//   const handleConfirmDelete = () => {
//     if (!appointment.id) {
//       setDeleteConfirmOpen(false);
//       return;
//     }
//     deleteAppointment.mutate(appointment.id, {
//       onSettled: () => {
//         setDeleteConfirmOpen(false);
//         queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
//         queryClient.invalidateQueries({ queryKey: ["appointments"] });
//         onClose();
//       },
//     });
//   };

//   const handleFinalClose = () => {
//     if (isPending) return;
//     setChangeMode(false);
//     setSubmitError(null);
//     onClose();
//   };

//   // ==================== RENDER ====================
//   return (
//     <>
//       <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//         <div
//           className="absolute inset-0 bg-black/50"
//           onClick={isPending ? undefined : handleFinalClose}
//         />

//         <div className="relative z-10 flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
//           {/* HEADER */}
//           <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
//             <div className="flex items-center gap-2">
//               {onBack && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     if (isPending) return;
//                     onBack();
//                   }}
//                   disabled={isPending}
//                   className="mr-1 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-ink-200 bg-surface px-2 py-1 text-[11px] font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   <FiArrowLeft className="h-3 w-3" />
//                   Back
//                 </button>
//               )}
//               <div
//                 className={`flex h-8 w-8 items-center justify-center rounded-full ${
//                   hasExistingVisit
//                     ? "bg-brand-50 text-brand-600"
//                     : "bg-accent-50 text-accent-600"
//                 }`}
//               >
//                 <FiCheckCircle className="h-4 w-4" />
//               </div>
//               <div>
//                 <h2 className="font-jakarta text-base font-bold text-ink-900">
//                   Booked Slot
//                 </h2>
//                 <p className="text-[11px] text-ink-500">
//                   {appointments.length > 1
//                     ? `${appointments.length} appointments in this slot`
//                     : "This slot is already booked"}
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={handleFinalClose}
//               disabled={isPending}
//               className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               <FiX className="h-4 w-4" />
//             </button>
//           </div>

//           {/* STATUS BANNER */}
//           <div
//             className={`border-b border-ink-100 px-5 py-3 ${
//               hasExistingVisit ? "bg-brand-50/40" : "bg-accent-50/40"
//             }`}
//           >
//             <div className="flex items-center justify-between gap-2">
//               <span
//                 className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
//                   hasExistingVisit
//                     ? "bg-brand-100 text-brand-800"
//                     : "bg-accent-100 text-accent-800"
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-1.5 w-1.5 rounded-full ${
//                     hasExistingVisit ? "bg-brand-600" : "bg-accent-500"
//                   }`}
//                 />
//                 Booked
//               </span>
//               {/* CURRENT STATUS + CHANGE STATUS */}
//               <div className="flex items-center gap-2">
//                 <span className="text-[11px] text-ink-500">
//                   Status:{" "}
//                   <span className="font-semibold text-ink-800">
//                     {appointment.status_label ||
//                       humanize(appointment.status) ||
//                       "—"}
//                   </span>
//                 </span>
//                 {canChangeStatus && (
//                   <InlineStatusChange
//                     key={appointment.id}
//                     appointmentId={appointment.id}
//                     allowedTransitions={allowedTransitions}
//                     disabled={isPending}
//                   />
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* SCROLLABLE BODY */}
//           <div className="flex-1 overflow-y-auto">
//             <div className="space-y-3 px-5 py-4">
//               {/* PROVIDER + DATE + TIME */}
//               <div className="rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2.5 space-y-1.5">
//                 <div className="flex items-center gap-2 text-[11px]">
//                   <FiUser className="h-3 w-3 shrink-0 text-ink-400" />
//                   <span className="font-semibold text-ink-800">
//                     {provider.name}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2 text-[11px]">
//                   <FiCalendar className="h-3 w-3 shrink-0 text-ink-400" />
//                   <span className="font-semibold text-ink-800">
//                     {formatDateFull(date)}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2 text-[11px]">
//                   <FiClock className="h-3 w-3 shrink-0 text-ink-400" />
//                   <span className="font-semibold text-ink-800">
//                     {formatTime12(slot.start_time)} –{" "}
//                     {formatTime12(slot.end_time)}
//                   </span>
//                 </div>
//               </div>

//               {/* MULTIPLE APPOINTMENTS SELECTOR */}
//               {appointments.length > 1 && (
//                 <div>
//                   <p className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-ink-500">
//                     <FiUsers className="h-2.5 w-2.5" />
//                     Select Appointment ({appointments.length})
//                   </p>
//                   <div className="flex gap-1.5 overflow-x-auto pb-1.5 [scrollbar-width:thin]">
//                     {appointments.map((a, idx) => {
//                       const isActive = a.id === activeAppointmentId;
//                       const hasVisitForA = !!a.visit;
//                       return (
//                         <button
//                           key={a.id || idx}
//                           type="button"
//                           onClick={() => {
//                             if (isPending) return;
//                             setActiveAppointmentId(a.id);
//                             setChangeMode(false);
//                             setPendingPatient(null);
//                             setChangeErrors({});
//                             setSubmitError(null);
//                           }}
//                           disabled={isPending}
//                           className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
//                             isActive
//                               ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500"
//                               : "border-ink-200 bg-surface text-ink-700 hover:border-ink-300 hover:bg-ink-50"
//                           }`}
//                         >
//                           <span
//                             className={`inline-block h-1.5 w-1.5 rounded-full ${
//                               hasVisitForA ? "bg-brand-600" : "bg-accent-500"
//                             }`}
//                           />
//                           {a.name || `#${a.id}`}
//                           {hasVisitForA && (
//                             <FiExternalLink className="h-2.5 w-2.5 text-brand-600" />
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {hasExistingVisit && (
//                 <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50/60 px-3 py-2.5">
//                   <FiCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
//                   <p className="text-[11px] leading-relaxed text-brand-800">
//                     Visit already created for{" "}
//                     <strong>{appointment.name || "this patient"}</strong>. Click{" "}
//                     <strong>View Visit</strong> to open.
//                   </p>
//                 </div>
//               )}

//               {/* PATIENT SECTION */}
//               <div>
//                 <div className="mb-1.5 flex items-center justify-between">
//                   <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
//                     Patient
//                   </p>
//                   {!hasExistingVisit && !changeMode && canManagePatient && (
//                     <button
//                       type="button"
//                       onClick={handleStartChange}
//                       disabled={isPending}
//                       className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       <FiEdit2 className="h-2.5 w-2.5" />
//                       Change
//                     </button>
//                   )}
//                 </div>

//                 {!changeMode && (
//                   <div className="flex items-start gap-2.5 rounded-lg border border-ink-100 bg-ink-50/40 p-3">
//                     <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
//                       {getInitials(displayPatient.name)}
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="truncate text-sm font-semibold text-ink-900">
//                         {displayPatient.name}
//                       </p>
//                       {displayPatient.mobile && (
//                         <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500">
//                           <FiPhone className="h-3 w-3" />
//                           <span className="tabular-nums">
//                             {displayPatient.mobile}
//                           </span>
//                         </div>
//                       )}
//                       <div className="mt-1 flex flex-wrap gap-1">
//                         {displayPatient.isLinked &&
//                           !displayPatient.isOverride && (
//                             <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200">
//                               Linked ·{" "}
//                               {displayPatient.patient_id ||
//                                 `#${displayPatient.id}`}
//                             </span>
//                           )}
//                         {displayPatient.isWalkIn && (
//                           <span className="inline-flex items-center gap-1 rounded-md bg-warn-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warn-800 ring-1 ring-warn-200">
//                             <FiAlertTriangle className="h-2.5 w-2.5" />
//                             Walk-in · No Patient ID
//                           </span>
//                         )}
//                         {displayPatient.isOverride && (
//                           <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-800 ring-1 ring-accent-200">
//                             <FiLink className="h-2.5 w-2.5" />
//                             Change Pending
//                           </span>
//                         )}
//                         {displayPatient.isNew && (
//                           <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-800 ring-1 ring-accent-200">
//                             <FiUserPlus className="h-2.5 w-2.5" />
//                             New · Will be created
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     {pendingPatient && !isPending && (
//                       <button
//                         type="button"
//                         onClick={handleClearPending}
//                         title="Clear change"
//                         className="cursor-pointer rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
//                       >
//                         <FiX className="h-3.5 w-3.5" />
//                       </button>
//                     )}
//                   </div>
//                 )}

//                 {/* CHANGE MODE */}
//                 {changeMode && !hasExistingVisit && (
//                   <div className="overflow-hidden rounded-lg border border-accent-200 bg-accent-50/40">
//                     {changeTabs.length > 0 && (
//                       <div className="flex border-b border-accent-200 bg-surface/60">
//                         {changeTabs.map((tab) => {
//                           const Icon = tab.icon;
//                           const isActive = activeChangeTab === tab.value;
//                           return (
//                             <button
//                               key={tab.value}
//                               type="button"
//                               onClick={() => handleTabSwitch(tab.value)}
//                               disabled={isPending}
//                               className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
//                                 isActive
//                                   ? "text-brand-700"
//                                   : "text-ink-500 hover:text-ink-700"
//                               }`}
//                             >
//                               <Icon className="h-3.5 w-3.5" />
//                               {tab.label}
//                               {isActive && (
//                                 <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
//                               )}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     )}

//                     <div className="space-y-3 p-3">
//                       {activeChangeTab === "new" && (
//                         <>
//                           <div>
//                             <label className="mb-1 block text-xs font-medium text-form-label">
//                               Name <span className="text-form-required">*</span>
//                             </label>
//                             <input
//                               type="text"
//                               value={newName}
//                               onChange={(e) => {
//                                 setNewName(e.target.value);
//                                 if (changeErrors.newName)
//                                   setChangeErrors((p) => ({
//                                     ...p,
//                                     newName: "",
//                                   }));
//                               }}
//                               placeholder="Enter name"
//                               maxLength={150}
//                               disabled={isPending}
//                               className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
//                             />
//                             {changeErrors.newName && (
//                               <p className="mt-1 text-xs text-form-error">
//                                 {changeErrors.newName}
//                               </p>
//                             )}
//                           </div>

//                           <PhoneInputField
//                             name="newMobile"
//                             label="Mobile"
//                             placeholder="Enter phone"
//                             defaultCountry="IN"
//                             required
//                             isFormik={false}
//                             value={newMobile}
//                             onChange={(val) => {
//                               setNewMobile(val || "");
//                               if (changeErrors.newMobile)
//                                 setChangeErrors((p) => ({
//                                   ...p,
//                                   newMobile: "",
//                                 }));
//                             }}
//                           />
//                           {changeErrors.newMobile && (
//                             <p className="-mt-3 text-xs text-form-error">
//                               {changeErrors.newMobile}
//                             </p>
//                           )}

//                           <div className="grid grid-cols-2 gap-3">
//                             <div>
//                               <label className="mb-1 block text-xs font-medium text-form-label">
//                                 Age{" "}
//                                 <span className="text-form-required">*</span>
//                               </label>
//                               <input
//                                 type="number"
//                                 value={newAge}
//                                 onChange={(e) => {
//                                   setNewAge(e.target.value);
//                                   if (changeErrors.newAge)
//                                     setChangeErrors((p) => ({
//                                       ...p,
//                                       newAge: "",
//                                     }));
//                                 }}
//                                 placeholder="Age"
//                                 maxLength={3}
//                                 disabled={isPending}
//                                 className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
//                               />
//                               {changeErrors.newAge && (
//                                 <p className="mt-1 text-xs text-form-error">
//                                   {changeErrors.newAge}
//                                 </p>
//                               )}
//                             </div>

//                             <div>
//                               <label className="mb-1 block text-xs font-medium text-form-label">
//                                 Sex{" "}
//                                 <span className="text-form-required">*</span>
//                               </label>
//                               <select
//                                 value={newSex?.value || ""}
//                                 onChange={(e) => {
//                                   const val = e.target.value;
//                                   const opt = SEX_OPTIONS.find(
//                                     (o) => o.value === val,
//                                   );
//                                   setNewSex(opt || null);
//                                   if (changeErrors.newSex)
//                                     setChangeErrors((p) => ({
//                                       ...p,
//                                       newSex: "",
//                                     }));
//                                 }}
//                                 disabled={isPending}
//                                 className="h-10 w-full cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
//                               >
//                                 <option value="">Select</option>
//                                 {SEX_OPTIONS.map((o) => (
//                                   <option key={o.value} value={o.value}>
//                                     {o.label}
//                                   </option>
//                                 ))}
//                               </select>
//                               {changeErrors.newSex && (
//                                 <p className="mt-1 text-xs text-form-error">
//                                   {changeErrors.newSex}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         </>
//                       )}

//                       {activeChangeTab === "existing" && (
//                         <div>
//                           <label className="mb-1 block text-xs font-medium text-form-label">
//                             Search Patient{" "}
//                             <span className="text-form-required">*</span>
//                           </label>
//                           <FilterSelect
//                             name="link_patient"
//                             options={patientOptions}
//                             value={selectedPatient}
//                             onChange={(opt) => {
//                               setSelectedPatient(opt);
//                               setChangeErrors((p) => ({
//                                 ...p,
//                                 selectedPatient: "",
//                               }));
//                             }}
//                             placeholder="Search patient by name or mobile..."
//                             isDisabled={isPending}
//                           />
//                           {changeErrors.selectedPatient && (
//                             <p className="mt-1 text-xs text-form-error">
//                               {changeErrors.selectedPatient}
//                             </p>
//                           )}
//                         </div>
//                       )}

//                       <div className="flex justify-end gap-2 pt-1">
//                         <button
//                           type="button"
//                           onClick={handleCancelChange}
//                           disabled={isPending}
//                           className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="button"
//                           onClick={handleApplyChange}
//                           disabled={isPending}
//                           className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           <FiCheck className="h-3 w-3" />
//                           Apply
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* PAYMENT STATUS */}
//               {!hasExistingVisit && (
//                 <div>
//                   <label className="mb-1.5 block text-xs font-medium text-form-label">
//                     Payment Status <span className="text-form-required">*</span>
//                   </label>
//                   <FilterSelect
//                     name="payment_status"
//                     options={PAYMENT_OPTIONS}
//                     value={paymentStatus}
//                     onChange={(opt) =>
//                       setPaymentStatus(opt || PAYMENT_OPTIONS[0])
//                     }
//                     placeholder="Select payment status..."
//                     isDisabled={isPending}
//                   />
//                 </div>
//               )}

//               {/* ERROR */}
//               {submitError && (
//                 <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50/60 px-3 py-2.5">
//                   <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-600" />
//                   <p className="text-[11px] text-danger-800">{submitError}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* FOOTER */}
//           <div className="flex items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/30 px-5 py-4">
//             <div className="flex items-center">
//               {!hasExistingVisit &&
//                 appointment.id &&
//                 !changeMode &&
//                 canDeleteAppointment && (
//                   <button
//                     type="button"
//                     onClick={() => setDeleteConfirmOpen(true)}
//                     disabled={isPending}
//                     title="Delete appointment"
//                     className="cursor-pointer rounded-lg p-1.5 text-danger-500 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-40"
//                   >
//                     <FiTrash2 className="h-4 w-4" />
//                   </button>
//                 )}
//             </div>

//             <div className="flex flex-wrap items-center justify-end gap-2">
//               <button
//                 type="button"
//                 onClick={handleFinalClose}
//                 disabled={isPending}
//                 className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 Close
//               </button>

//               {hasExistingVisit && canViewVisit && (
//                 <button
//                   type="button"
//                   onClick={handleViewVisit}
//                   className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
//                 >
//                   <FiExternalLink className="h-3.5 w-3.5" />
//                   View Visit #{existingVisit.id}
//                 </button>
//               )}

//               {!hasExistingVisit && canCreateVisit && canManageVisit && (
//                 <button
//                   type="button"
//                   onClick={handleCreateVisit}
//                   disabled={isPending || changeMode}
//                   className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {isPending ? (
//                     <>
//                       <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface/40 border-t-surface" />
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       <FiCheck className="h-3.5 w-3.5" />
//                       Create Visit
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <ConfirmModal
//         open={deleteConfirmOpen}
//         title="Delete Appointment"
//         message="Are you sure you want to delete this appointment? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="danger"
//         onConfirm={handleConfirmDelete}
//         onCancel={() => setDeleteConfirmOpen(false)}
//         loading={deleteAppointment.isPending}
//       />
//     </>
//   );
// };

// export default BookedSlotDetailsModal;

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiX,
  FiUser,
  FiPhone,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiCheck,
  FiAlertCircle,
  FiExternalLink,
  FiAlertTriangle,
  FiLink,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiArrowLeft,
  FiRefreshCw,
  FiChevronDown,
} from "react-icons/fi";
import { useCreateVisit } from "../../../queries/visits";
import { useCreatePatient, usePatients } from "../../../queries/patients";
import {
  useDeleteAppointment,
  useUpdateAppointmentStatus,
  getAllowedTransitions,
} from "../../../queries/appointments";
import ConfirmModal from "../../../common/ConfirmModal";
import {
  FilterSelect,
  PhoneInputField,
  validatePhone,
} from "../../../common/form";
import { api } from "../../../../../lib/axios";
import { usePermission } from "../../../hooks/usePermission";

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDateFull = (d) => {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "free", label: "Free" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

// Walk-in appointment me payment status by default Paid, baaki me Unpaid
const getDefaultPayment = (source) =>
  PAYMENT_OPTIONS.find(
    (o) => o.value === (source === "walk_in" ? "paid" : "unpaid"),
  ) || PAYMENT_OPTIONS[0];

// Backend constants: patient_app / reception / walk_in
const BOOKING_SOURCE_LABELS = {
  patient_app: "Patient App",
  reception: "Reception",
  walk_in: "Walk-in",
};

const SOURCE_BADGE_STYLES = {
  patient_app: "bg-brand-50 text-brand-700 ring-brand-200",
  reception: "bg-ink-100 text-ink-700 ring-ink-200",
  walk_in: "bg-warn-50 text-warn-800 ring-warn-200",
};

// Slots list ka query key (BookingCalendar me bhi yahi invalidate hota hai)
const SLOTS_KEY = ["providerAvailabilities", "slots"];

// ==================== PATIENT MATCH ====================
// Slots API appointment me patient_id null aa sakta hai (even jab patient linked ho),
// isliye: pehle id se match, nahi mile to mobile (last 10 digits) + name se match.
const normalizeMobile = (m) =>
  String(m || "")
    .replace(/\D/g, "")
    .slice(-10);

const findPatientForAppointment = (patients = [], appt) => {
  if (!appt) return null;

  const id = appt.patient_id || appt.patient?.id;
  if (id) {
    const byId = patients.find((p) => String(p.id) === String(id));
    if (byId) return byId;
  }

  const mob = normalizeMobile(appt.mobile);
  if (mob.length < 10) return null;

  const candidates = patients.filter((p) => normalizeMobile(p.mobile) === mob);
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const n = (appt.name || "").trim().toLowerCase();
    return (
      candidates.find((p) => (p.name || "").trim().toLowerCase() === n) || null
    );
  }
  return null;
};

const isValidAge = (age) => {
  if (age === "" || age === null || age === undefined) return false;
  const n = Number(age);
  return !isNaN(n) && n >= 0 && n <= 150;
};

// ==================== STATUS DROPDOWN ====================
const humanize = (s = "") =>
  String(s)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// getAllowedTransitions string ya object dono return kare, dono handle hoga
const normalizeTransition = (t) => {
  if (typeof t === "string") return { value: t, label: humanize(t) };
  const value = t.value ?? t.status ?? t.key;
  return { value, label: t.label ?? humanize(value) };
};

const isDangerStatus = (v = "") =>
  /(cancel|no_show|noshow|reject|declin)/i.test(String(v));

const InlineStatusChange = ({
  appointmentId,
  allowedTransitions = [],
  disabled = false,
}) => {
  const queryClient = useQueryClient();
  const updateStatus = useUpdateAppointmentStatus();
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const options = allowedTransitions
    .map(normalizeTransition)
    .filter((o) => o.value);
  const loading = updateStatus.isPending;

  // bahar click ya Esc pe band
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = async (value) => {
    setError(null);
    try {
      // ⚠️ Payload apne mutation ke hisaab se adjust karo
      await updateStatus.mutateAsync({ id: appointmentId, status: value });
      queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setOpen(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update status.",
      );
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-200 bg-surface px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" />
        ) : (
          <FiRefreshCw className="h-3 w-3" />
        )}
        {loading ? "Updating..." : "Change Status"}
        <FiChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-ink-200 bg-surface py-1 shadow-lg"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                onClick={() => handleSelect(o.value)}
                className={`flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-xs font-medium transition hover:bg-ink-50 ${
                  isDangerStatus(o.value) ? "text-danger-600" : "text-ink-700"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-[11px] text-danger-600">{error}</p>}
    </div>
  );
};

// ==================== COMPONENT ====================
const BookedSlotDetailsModal = ({
  open,
  onClose,
  slot,
  provider,
  date,
  onBack, // optional: Back button tabhi dikhega jab ye pass ho
  initialAppointmentId, // optional: kaunsa appointment pehle select ho
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createVisit = useCreateVisit();
  const createPatient = useCreatePatient();
  const deleteAppointment = useDeleteAppointment();
  const { can, isLoading: permLoading } = usePermission();

  const canManageAppointment = can("appointment", "manage");
  const canDeleteAppointment = can("appointment", "delete");
  const canManagePatient = can("patients", "manage");
  const canViewPatient = can("patients", "view");
  const canManageVisit = can("visits", "manage");
  const canViewVisit = can("visits", "view");

  const changeTabs = useMemo(() => {
    const arr = [];
    if (canManagePatient) {
      arr.push({
        value: "new",
        label: "New Patient",
        icon: FiUserPlus,
      });
    }
    if (canViewPatient) {
      arr.push({
        value: "existing",
        label: "Existing Patient",
        icon: FiLink,
      });
    }
    return arr;
  }, [canManagePatient, canViewPatient]);

  const [changeMode, setChangeMode] = useState(false);
  const [activeChangeTab, setActiveChangeTab] = useState("new");

  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newSex, setNewSex] = useState(null);

  // ✅ Unlinked (patient_id null) appointment par Create Visit ke liye age/sex
  const [visitAge, setVisitAge] = useState("");
  const [visitSex, setVisitSex] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [changeErrors, setChangeErrors] = useState({});

  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_OPTIONS[0]);

  const [submitError, setSubmitError] = useState(null);

  const [pendingPatient, setPendingPatient] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // ==================== MULTIPLE APPOINTMENTS ====================
  const appointments = useMemo(() => {
    if (!slot) return [];

    const list = Array.isArray(slot.appointments) ? slot.appointments : [];

    if (list.length > 0) return list;

    if (slot.appointment) return [slot.appointment];
    return [];
  }, [slot]);

  const [activeAppointmentId, setActiveAppointmentId] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (permLoading) return;
    if (appointments.length > 0) {
      const preferred = initialAppointmentId
        ? appointments.find(
            (a) => String(a.id) === String(initialAppointmentId),
          )
        : null;
      setActiveAppointmentId((preferred || appointments[0]).id);
    } else {
      setActiveAppointmentId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    slot?.start_time,
    permLoading,
    appointments.length,
    initialAppointmentId,
  ]);

  const currentAppointment = useMemo(() => {
    if (!appointments.length) return {};
    if (activeAppointmentId) {
      const found = appointments.find((a) => a.id === activeAppointmentId);
      if (found) return found;
    }
    return appointments[0];
  }, [appointments, activeAppointmentId]);

  // ==================== LOAD PATIENTS ====================
  const { data: patientsData } = usePatients({ per_page: 200 });
  const patientsList = useMemo(() => patientsData?.list || [], [patientsData]);

  const patientOptions = useMemo(() => {
    return patientsList.map((p) => ({
      value: p.id,
      label: `${p.name} — ${p.patient_id || `#${p.id}`}${
        p.mobile ? ` · ${p.mobile}` : ""
      }`,
      raw: p,
    }));
  }, [patientsList]);

  // ==================== APPOINTMENT / SLOT DATA ====================
  const appointment = currentAppointment || {};
  const existingVisit = appointment?.visit || slot?.visit || null;
  const hasExistingVisit = !!existingVisit;

  // ✅ patient_id se match, nahi to mobile + name se match
  const matchedPatient = useMemo(
    () => findPatientForAppointment(patientsList, appointment),
    [patientsList, appointment],
  );

  const appointmentHasPatientId = !!(
    appointment.patient_id || appointment.patient?.id
  );
  const currentPatientId =
    appointment.patient_id ||
    appointment.patient?.id ||
    matchedPatient?.id ||
    null;
  const hasCurrentPatient = !!currentPatientId;
  const hasAppointmentPatientData = !!appointment.name && !!appointment.mobile;

  const canCreateVisit =
    !hasExistingVisit && (hasCurrentPatient || hasAppointmentPatientData);

  // ✅ Patient abhi bana nahi (sirf name+mobile se booking hui thi) → age/sex chahiye
  const needsPatientDetails =
    !hasExistingVisit && !hasCurrentPatient && !pendingPatient;
  const isPatientDetailsComplete = !needsPatientDetails
    ? true
    : isValidAge(visitAge) && !!visitSex;

  const isPending = createVisit.isPending || createPatient.isPending;

  const currentPatientOption = useMemo(() => {
    if (!hasCurrentPatient || !patientOptions.length) return null;
    return (
      patientOptions.find(
        (o) => String(o.value) === String(currentPatientId),
      ) || null
    );
  }, [hasCurrentPatient, currentPatientId, patientOptions]);

  const bookingSource = appointment.booking_source || null;

  // ==================== STATUS TRANSITIONS ====================
  const allowedTransitions = useMemo(() => {
    if (!appointment?.status) return [];
    try {
      return getAllowedTransitions(appointment.status) || [];
    } catch {
      return [];
    }
  }, [appointment?.status]);

  const canChangeStatus =
    !!appointment?.id && canManageAppointment && allowedTransitions.length > 0;

  // ==================== DISPLAY PATIENT ====================
  const displayPatient = useMemo(() => {
    if (pendingPatient) {
      if (pendingPatient.type === "link" && pendingPatient.patient) {
        return {
          id: pendingPatient.patient.id,
          name: pendingPatient.patient.name,
          mobile: pendingPatient.patient.mobile,
          patient_id: pendingPatient.patient.patient_id,
          age: pendingPatient.patient.age,
          sex: pendingPatient.patient.sex,
          isOverride: true,
          isLinked: true,
        };
      }
      if (pendingPatient.type === "create") {
        return {
          id: null,
          name: pendingPatient.name,
          mobile: pendingPatient.mobile,
          patient_id: null,
          age: pendingPatient.age,
          sex: pendingPatient.sex,
          isNew: true,
        };
      }
    }
    if (hasCurrentPatient) {
      return {
        id: currentPatientId,
        name:
          appointment.patient?.name ||
          matchedPatient?.name ||
          appointment.name ||
          "—",
        mobile:
          appointment.patient?.mobile ||
          matchedPatient?.mobile ||
          appointment.mobile,
        patient_id:
          appointment.patient?.patient_id || matchedPatient?.patient_id || null,
        age: appointment.patient?.age ?? matchedPatient?.age ?? null,
        sex: appointment.patient?.sex ?? matchedPatient?.sex ?? null,
        isLinked: true,
      };
    }
    return {
      id: null,
      name: appointment.name || "—",
      mobile: appointment.mobile || "",
      patient_id: null,
      age: null,
      sex: null,
      isWalkIn: true, // yahan matlab: patient record abhi linked nahi hai
    };
  }, [
    pendingPatient,
    hasCurrentPatient,
    currentPatientId,
    appointment,
    matchedPatient,
  ]);

  // ==================== RESET ====================
  useEffect(() => {
    if (!open) return;
    if (permLoading) return;

    setChangeMode(false);
    setActiveChangeTab(changeTabs[0]?.value || "new");

    setNewName(appointment.name || "");
    setNewMobile(appointment.mobile || "");
    setNewAge("");
    setNewSex(null);
    setVisitAge("");
    setVisitSex(null);
    setSelectedPatient(null);
    setChangeErrors({});
    setPaymentStatus(getDefaultPayment(appointment.booking_source));
    setSubmitError(null);
    setPendingPatient(null);
    setDeleteConfirmOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slot?.start_time, permLoading, activeAppointmentId]);

  useEffect(() => {
    if (!open || permLoading) return;
    const validTabs = changeTabs.map((t) => t.value);
    if (!validTabs.includes(activeChangeTab)) {
      setActiveChangeTab(validTabs[0] || "new");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, permLoading, changeTabs.length, activeChangeTab]);

  if (!open || !slot || !provider) return null;

  // ==================== HANDLERS ====================
  const handleViewVisit = () => {
    if (!existingVisit?.id) return;
    onClose();
    navigate(`/visits/${existingVisit.id}`);
  };

  const handleStartChange = () => {
    if (isPending) return;
    setChangeMode(true);

    const validTabs = changeTabs.map((t) => t.value);
    if (hasCurrentPatient && validTabs.includes("existing")) {
      setActiveChangeTab("existing");
      setSelectedPatient(currentPatientOption);
    } else if (validTabs.includes("new")) {
      setActiveChangeTab("new");
    } else {
      setActiveChangeTab(validTabs[0] || "new");
    }

    setNewName(appointment.name || "");
    setNewMobile(appointment.mobile || "");
    setNewAge("");
    setNewSex(null);
    setChangeErrors({});
  };

  const handleCancelChange = () => {
    if (isPending) return;
    setChangeMode(false);
    setChangeErrors({});
  };

  const handleTabSwitch = (tab) => {
    if (isPending) return;
    setActiveChangeTab(tab);
    setChangeErrors({});

    if (tab === "existing" && hasCurrentPatient && !selectedPatient) {
      setSelectedPatient(currentPatientOption);
    }
  };

  const validateChange = () => {
    const e = {};

    if (activeChangeTab === "existing") {
      if (!selectedPatient) e.selectedPatient = "Please select a patient";
    } else {
      if (!newName.trim()) e.newName = "Name is required";
      else if (newName.trim().length > 150) e.newName = "Max 150 characters";

      if (!newMobile) e.newMobile = "Mobile is required";
      else if (!validatePhone(newMobile)) e.newMobile = "Invalid mobile";

      if (newAge === "" || newAge === null || newAge === undefined) {
        e.newAge = "Age is required";
      } else if (isNaN(Number(newAge))) {
        e.newAge = "Age must be a number";
      } else if (Number(newAge) < 0 || Number(newAge) > 150) {
        e.newAge = "Invalid age";
      }

      if (!newSex) e.newSex = "Sex is required";
    }

    setChangeErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyChange = () => {
    if (!validateChange()) return;

    if (activeChangeTab === "existing") {
      if (
        String(selectedPatient.value) === String(currentPatientId) &&
        !pendingPatient
      ) {
        setChangeMode(false);
        return;
      }
      setPendingPatient({
        type: "link",
        patient: selectedPatient.raw,
      });
    } else {
      setPendingPatient({
        type: "create",
        name: newName.trim(),
        mobile: newMobile.trim(),
        age: Number(newAge),
        sex: newSex?.value || newSex || "other",
      });
    }

    setChangeMode(false);
  };

  const handleClearPending = () => {
    if (isPending) return;
    setPendingPatient(null);
  };

  const handleCreateVisit = async () => {
    if (!canManageVisit) {
      setSubmitError("You don't have permission to create visit.");
      return;
    }
    setSubmitError(null);

    if (!canCreateVisit) {
      setSubmitError("Patient information is missing. Cannot create visit.");
      return;
    }

    if (needsPatientDetails && !isPatientDetailsComplete) {
      setSubmitError("Please enter age and sex to create the patient.");
      return;
    }

    try {
      let finalPatientId = currentPatientId;
      // mobile se match hua patient appointment me linked nahi tha → link kar do
      let patientChanged =
        !pendingPatient && hasCurrentPatient && !appointmentHasPatientId;

      if (pendingPatient?.type === "link") {
        finalPatientId = pendingPatient.patient.id;
        if (String(finalPatientId) !== String(currentPatientId))
          patientChanged = true;
      } else if (pendingPatient?.type === "create") {
        const patientRes = await createPatient.mutateAsync({
          name: pendingPatient.name,
          mobile: pendingPatient.mobile,
          age: pendingPatient.age,
          sex: pendingPatient.sex,
          pin: "0000",
          status: true,
        });

        const patientData =
          patientRes?.data?.data || patientRes?.data || patientRes;
        finalPatientId = patientData?.id;

        if (!finalPatientId) {
          throw new Error("Patient creation failed — no ID returned.");
        }

        patientChanged = true;
      } else if (!hasCurrentPatient) {
        // ✅ Appointment me sirf name+mobile tha → age/sex ke saath patient banao
        const patientRes = await createPatient.mutateAsync({
          name: (appointment.name || "").trim(),
          mobile: (appointment.mobile || "").trim(),
          age: Number(visitAge),
          sex: visitSex?.value || visitSex || "other",
          pin: "0000",
          status: true,
        });

        const patientData =
          patientRes?.data?.data || patientRes?.data || patientRes;
        finalPatientId = patientData?.id;

        if (!finalPatientId) {
          throw new Error("Patient creation failed — no ID returned.");
        }

        patientChanged = true;
      }

      // appointment ko patient se link karo
      if (patientChanged && appointment.id && canManageAppointment) {
        await api
          .put(`/admin/appointments/${appointment.id}`, {
            patient_id: finalPatientId,
          })
          .catch(() => {});
      }

      const payload = {
        appointment_id: appointment.id || null,
        patient_id: finalPatientId,
        provider_id: provider.id,
        visit_date: date,
        slot_start_time: slot.start_time,
        slot_end_time: slot.end_time,
        visit_type: "consultation",
        payment_status: paymentStatus?.value || "unpaid",
      };

      const visitRes = await createVisit.mutateAsync(payload);

      queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });

      const visitData = visitRes?.data?.data || visitRes?.data || visitRes;
      const visitId = visitData?.id;

      onClose();

      if (visitId) {
        navigate(`/visits/${visitId}`);
      } else {
        navigate("/visits");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create visit. Please try again.";
      setSubmitError(msg);
    }
  };

  const handleConfirmDelete = () => {
    if (!appointment.id) {
      setDeleteConfirmOpen(false);
      return;
    }
    deleteAppointment.mutate(appointment.id, {
      onSettled: () => {
        setDeleteConfirmOpen(false);
        queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
        queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["visits"] });
        onClose();
      },
    });
  };

  const handleFinalClose = () => {
    if (isPending) return;
    setChangeMode(false);
    setSubmitError(null);
    onClose();
  };

  // ==================== RENDER ====================
  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={isPending ? undefined : handleFinalClose}
        />

        <div className="relative z-10 flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={() => {
                    if (isPending) return;
                    onBack();
                  }}
                  disabled={isPending}
                  className="mr-1 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-ink-200 bg-surface px-2 py-1 text-[11px] font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiArrowLeft className="h-3 w-3" />
                  Back
                </button>
              )}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  hasExistingVisit
                    ? "bg-brand-50 text-brand-600"
                    : "bg-accent-50 text-accent-600"
                }`}
              >
                <FiCheckCircle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-jakarta text-base font-bold text-ink-900">
                  Booked Slot
                </h2>
                <p className="text-[11px] text-ink-500">
                  {appointments.length > 1
                    ? `${appointments.length} appointments in this slot`
                    : "This slot is already booked"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFinalClose}
              disabled={isPending}
              className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          {/* STATUS BANNER */}
          <div
            className={`border-b border-ink-100 px-5 py-3 ${
              hasExistingVisit ? "bg-brand-50/40" : "bg-accent-50/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    hasExistingVisit
                      ? "bg-brand-100 text-brand-800"
                      : "bg-accent-100 text-accent-800"
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      hasExistingVisit ? "bg-brand-600" : "bg-accent-500"
                    }`}
                  />
                  Booked
                </span>
                {bookingSource && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
                      SOURCE_BADGE_STYLES[bookingSource] ||
                      "bg-ink-100 text-ink-700 ring-ink-200"
                    }`}
                  >
                    {BOOKING_SOURCE_LABELS[bookingSource] ||
                      humanize(bookingSource)}
                  </span>
                )}
              </div>
              {/* CURRENT STATUS + CHANGE STATUS */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-500">
                  Status:{" "}
                  <span className="font-semibold text-ink-800">
                    {appointment.status_label ||
                      humanize(appointment.status) ||
                      "—"}
                  </span>
                </span>
                {canChangeStatus && (
                  <InlineStatusChange
                    key={appointment.id}
                    appointmentId={appointment.id}
                    allowedTransitions={allowedTransitions}
                    disabled={isPending}
                  />
                )}
              </div>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 px-5 py-4">
              {/* PROVIDER + DATE + TIME */}
              <div className="space-y-1.5 rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2.5">
                <div className="flex items-center gap-2 text-[11px]">
                  <FiUser className="h-3 w-3 shrink-0 text-ink-400" />
                  <span className="font-semibold text-ink-800">
                    {provider.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <FiCalendar className="h-3 w-3 shrink-0 text-ink-400" />
                  <span className="font-semibold text-ink-800">
                    {formatDateFull(date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <FiClock className="h-3 w-3 shrink-0 text-ink-400" />
                  <span className="font-semibold text-ink-800">
                    {formatTime12(slot.start_time)} –{" "}
                    {formatTime12(slot.end_time)}
                  </span>
                </div>
              </div>

              {/* MULTIPLE APPOINTMENTS SELECTOR */}
              {appointments.length > 1 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-ink-500">
                    <FiUsers className="h-2.5 w-2.5" />
                    Select Appointment ({appointments.length})
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 [scrollbar-width:thin]">
                    {appointments.map((a, idx) => {
                      const isActive = a.id === activeAppointmentId;
                      const hasVisitForA = !!a.visit;
                      return (
                        <button
                          key={a.id || idx}
                          type="button"
                          onClick={() => {
                            if (isPending) return;
                            setActiveAppointmentId(a.id);
                            setChangeMode(false);
                            setPendingPatient(null);
                            setChangeErrors({});
                            setSubmitError(null);
                          }}
                          disabled={isPending}
                          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isActive
                              ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500"
                              : "border-ink-200 bg-surface text-ink-700 hover:border-ink-300 hover:bg-ink-50"
                          }`}
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${
                              hasVisitForA ? "bg-brand-600" : "bg-accent-500"
                            }`}
                          />
                          {a.name || `#${a.id}`}
                          {hasVisitForA && (
                            <FiExternalLink className="h-2.5 w-2.5 text-brand-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {hasExistingVisit && (
                <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50/60 px-3 py-2.5">
                  <FiCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                  <p className="text-[11px] leading-relaxed text-brand-800">
                    Visit already created for{" "}
                    <strong>{displayPatient.name || "this patient"}</strong>.
                    Click <strong>View Visit</strong> to open.
                  </p>
                </div>
              )}

              {/* PATIENT SECTION */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                    Patient
                  </p>
                  {!hasExistingVisit && !changeMode && canManagePatient && (
                    <button
                      type="button"
                      onClick={handleStartChange}
                      disabled={isPending}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiEdit2 className="h-2.5 w-2.5" />
                      Change
                    </button>
                  )}
                </div>

                {!changeMode && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-ink-100 bg-ink-50/40 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
                      {getInitials(displayPatient.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {displayPatient.name}
                      </p>
                      {displayPatient.mobile && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500">
                          <FiPhone className="h-3 w-3" />
                          <span className="tabular-nums">
                            {displayPatient.mobile}
                          </span>
                        </div>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {displayPatient.isWalkIn && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-warn-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warn-800 ring-1 ring-warn-200">
                            <FiAlertTriangle className="h-2.5 w-2.5" />
                            Patient not available
                          </span>
                        )}
                        {displayPatient.isOverride && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-800 ring-1 ring-accent-200">
                            <FiLink className="h-2.5 w-2.5" />
                            Change Pending
                          </span>
                        )}
                        {displayPatient.isNew && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-800 ring-1 ring-accent-200">
                            <FiUserPlus className="h-2.5 w-2.5" />
                            New · Will be created
                          </span>
                        )}
                      </div>
                    </div>
                    {pendingPatient && !isPending && (
                      <button
                        type="button"
                        onClick={handleClearPending}
                        title="Clear change"
                        className="cursor-pointer rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* ✅ AGE + SEX — patient record abhi nahi bana (create visit se pehle zaruri) */}
                {needsPatientDetails && !changeMode && (
                  <div className="mt-2 space-y-2 rounded-lg border border-warn-200 bg-warn-50/40 p-3">
                    <p className="text-[11px] font-semibold text-warn-800">
                      Patient not available
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-form-label">
                          Age <span className="text-form-required">*</span>
                        </label>
                        <input
                          type="number"
                          value={visitAge}
                          onChange={(e) => setVisitAge(e.target.value)}
                          placeholder="Age"
                          disabled={isPending}
                          className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-form-label">
                          Sex <span className="text-form-required">*</span>
                        </label>
                        <select
                          value={visitSex?.value || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVisitSex(
                              SEX_OPTIONS.find((o) => o.value === val) || null,
                            );
                          }}
                          disabled={isPending}
                          className="h-10 w-full cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">Select</option>
                          {SEX_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* CHANGE MODE */}
                {changeMode && !hasExistingVisit && (
                  <div className="overflow-hidden rounded-lg border border-accent-200 bg-accent-50/40">
                    {changeTabs.length > 0 && (
                      <div className="flex border-b border-accent-200 bg-surface/60">
                        {changeTabs.map((tab) => {
                          const Icon = tab.icon;
                          const isActive = activeChangeTab === tab.value;
                          return (
                            <button
                              key={tab.value}
                              type="button"
                              onClick={() => handleTabSwitch(tab.value)}
                              disabled={isPending}
                              className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isActive
                                  ? "text-brand-700"
                                  : "text-ink-500 hover:text-ink-700"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {tab.label}
                              {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-3 p-3">
                      {activeChangeTab === "new" && (
                        <>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-form-label">
                              Name <span className="text-form-required">*</span>
                            </label>
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => {
                                setNewName(e.target.value);
                                if (changeErrors.newName)
                                  setChangeErrors((p) => ({
                                    ...p,
                                    newName: "",
                                  }));
                              }}
                              placeholder="Enter name"
                              maxLength={150}
                              disabled={isPending}
                              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {changeErrors.newName && (
                              <p className="mt-1 text-xs text-form-error">
                                {changeErrors.newName}
                              </p>
                            )}
                          </div>

                          <PhoneInputField
                            name="newMobile"
                            label="Mobile"
                            placeholder="Enter phone"
                            defaultCountry="IN"
                            required
                            isFormik={false}
                            value={newMobile}
                            onChange={(val) => {
                              setNewMobile(val || "");
                              if (changeErrors.newMobile)
                                setChangeErrors((p) => ({
                                  ...p,
                                  newMobile: "",
                                }));
                            }}
                          />
                          {changeErrors.newMobile && (
                            <p className="-mt-3 text-xs text-form-error">
                              {changeErrors.newMobile}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-form-label">
                                Age{" "}
                                <span className="text-form-required">*</span>
                              </label>
                              <input
                                type="number"
                                value={newAge}
                                onChange={(e) => {
                                  setNewAge(e.target.value);
                                  if (changeErrors.newAge)
                                    setChangeErrors((p) => ({
                                      ...p,
                                      newAge: "",
                                    }));
                                }}
                                placeholder="Age"
                                disabled={isPending}
                                className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                              />
                              {changeErrors.newAge && (
                                <p className="mt-1 text-xs text-form-error">
                                  {changeErrors.newAge}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-form-label">
                                Sex{" "}
                                <span className="text-form-required">*</span>
                              </label>
                              <select
                                value={newSex?.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const opt = SEX_OPTIONS.find(
                                    (o) => o.value === val,
                                  );
                                  setNewSex(opt || null);
                                  if (changeErrors.newSex)
                                    setChangeErrors((p) => ({
                                      ...p,
                                      newSex: "",
                                    }));
                                }}
                                disabled={isPending}
                                className="h-10 w-full cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <option value="">Select</option>
                                {SEX_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                              {changeErrors.newSex && (
                                <p className="mt-1 text-xs text-form-error">
                                  {changeErrors.newSex}
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {activeChangeTab === "existing" && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-form-label">
                            Search Patient{" "}
                            <span className="text-form-required">*</span>
                          </label>
                          <FilterSelect
                            name="link_patient"
                            options={patientOptions}
                            value={selectedPatient}
                            onChange={(opt) => {
                              setSelectedPatient(opt);
                              setChangeErrors((p) => ({
                                ...p,
                                selectedPatient: "",
                              }));
                            }}
                            placeholder="Search patient by name or mobile..."
                            isDisabled={isPending}
                          />
                          {changeErrors.selectedPatient && (
                            <p className="mt-1 text-xs text-form-error">
                              {changeErrors.selectedPatient}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelChange}
                          disabled={isPending}
                          className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyChange}
                          disabled={isPending}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiCheck className="h-3 w-3" />
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYMENT STATUS */}
              {!hasExistingVisit && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-form-label">
                    Payment Status <span className="text-form-required">*</span>
                  </label>
                  <FilterSelect
                    name="payment_status"
                    options={PAYMENT_OPTIONS}
                    value={paymentStatus}
                    onChange={(opt) =>
                      setPaymentStatus(opt || PAYMENT_OPTIONS[0])
                    }
                    placeholder="Select payment status..."
                    isDisabled={isPending}
                  />
                </div>
              )}

              {/* ERROR */}
              {submitError && (
                <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50/60 px-3 py-2.5">
                  <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-600" />
                  <p className="text-[11px] text-danger-800">{submitError}</p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/30 px-5 py-4">
            <div className="flex items-center">
              {!hasExistingVisit &&
                appointment.id &&
                !changeMode &&
                canDeleteAppointment && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={isPending}
                    title="Delete appointment"
                    className="cursor-pointer rounded-lg p-1.5 text-danger-500 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleFinalClose}
                disabled={isPending}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Close
              </button>

              {hasExistingVisit && canViewVisit && (
                <button
                  type="button"
                  onClick={handleViewVisit}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
                >
                  <FiExternalLink className="h-3.5 w-3.5" />
                  View Visit #{existingVisit.id}
                </button>
              )}

              {!hasExistingVisit && canCreateVisit && canManageVisit && (
                <button
                  type="button"
                  onClick={handleCreateVisit}
                  disabled={
                    isPending || changeMode || !isPatientDetailsComplete
                  }
                  title={
                    !isPatientDetailsComplete
                      ? "Age aur Sex bharna zaruri hai"
                      : undefined
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface/40 border-t-surface" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-3.5 w-3.5" />
                      Create Visit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteConfirmOpen}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        loading={deleteAppointment.isPending}
      />
    </>
  );
};

export default BookedSlotDetailsModal;
