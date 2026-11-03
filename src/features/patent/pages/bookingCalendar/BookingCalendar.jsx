// // // src/features/patent/pages/bookingCalendar/BookingCalendar.jsx

// // import { useState, useMemo, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { FiCalendar } from "react-icons/fi";
// // import {
// //   useAllAvailabilities,
// //   useBookedSlotsByDate,
// //   getProviderColor,
// // } from "../../queries/bookingCalendar";
// // import { useVisits } from "../../queries/visits";
// // import MonthCalendar from "./components/MonthCalendar";
// // import ProviderTabs from "./components/ProviderTabs";
// // import SlotList from "./components/SlotList";
// // import QuickBookingModal from "./components/QuickBookingModal";
// // import BookedSlotDetailsModal from "./components/BookedSlotDetailsModal";
// // import Loader from "../../common/Loader";

// // // ==================== HELPERS ====================
// // const todayStr = () => {
// //   const d = new Date();
// //   const y = d.getFullYear();
// //   const m = String(d.getMonth() + 1).padStart(2, "0");
// //   const day = String(d.getDate()).padStart(2, "0");
// //   return `${y}-${m}-${day}`;
// // };

// // const getISODay = (dateStr) => {
// //   if (!dateStr) return null;
// //   const [y, m, d] = dateStr.split("-").map(Number);
// //   const dt = new Date(y, m - 1, d);
// //   const jsDay = dt.getDay();
// //   return jsDay === 0 ? 7 : jsDay;
// // };

// // const formatDateStr = (date) => {
// //   const y = date.getFullYear();
// //   const m = String(date.getMonth() + 1).padStart(2, "0");
// //   const d = String(date.getDate()).padStart(2, "0");
// //   return `${y}-${m}-${d}`;
// // };

// // const pickDateForMonth = (year, month) => {
// //   const today = new Date();
// //   if (today.getFullYear() === year && today.getMonth() === month) {
// //     return formatDateStr(today);
// //   }
// //   return `${year}-${String(month + 1).padStart(2, "0")}-01`;
// // };

// // // Normalize visit schedule date (handles "2026-10-12" and "2026-10-12 15:12:15")
// // const toDateOnly = (val) => {
// //   if (!val) return "";
// //   if (typeof val === "string") return val.slice(0, 10);
// //   return "";
// // };

// // const BookingCalendar = () => {
// //   const navigate = useNavigate();

// //   const [selectedDate, setSelectedDate] = useState(todayStr());
// //   const [selectedProviderId, setSelectedProviderId] = useState(null);
// //   const [viewMonth, setViewMonth] = useState(() => {
// //     const d = new Date();
// //     return { year: d.getFullYear(), month: d.getMonth() };
// //   });

// //   const [bookingModal, setBookingModal] = useState({
// //     open: false,
// //     slot: null,
// //     provider: null,
// //   });

// //   const [bookedSlotModal, setBookedSlotModal] = useState({
// //     open: false,
// //     slot: null,
// //     provider: null,
// //     date: null,
// //   });

// //   // ==================== AVAILABILITIES ====================
// //   const { data: availabilities = [], isLoading } = useAllAvailabilities();

// //   // ==================== VISITS (for appointment → visit mapping) ====================
// //   const { data: visitsData } = useVisits({ per_page: 500 });
// //   const allVisits = visitsData?.list || [];

// //   // appointmentId → visit map
// //   const appointmentVisitMap = useMemo(() => {
// //     const map = {};
// //     allVisits.forEach((v) => {
// //       const apptId = v.appointment?.id;
// //       if (apptId) {
// //         map[apptId] = v;
// //       }
// //     });
// //     return map;
// //   }, [allVisits]);

// //   // ==================== PROVIDERS ====================
// //   const providers = useMemo(() => {
// //     const map = new Map();
// //     availabilities.forEach((av) => {
// //       if (av.provider && av.provider.id && !map.has(av.provider.id)) {
// //         map.set(av.provider.id, av.provider);
// //       }
// //     });
// //     return Array.from(map.values());
// //   }, [availabilities]);

// //   const activeProviderId = selectedProviderId || providers[0]?.id || null;
// //   const activeProvider = providers.find((p) => p.id === activeProviderId);

// //   // ==================== ACTIVE AVAILABILITY ====================
// //   const activeAvailability = useMemo(() => {
// //     if (!activeProviderId || !selectedDate) return null;
// //     const isoDay = getISODay(selectedDate);

// //     return (
// //       availabilities.find((av) => {
// //         if (av.provider?.id !== activeProviderId) return false;
// //         if (!av.status) return false;
// //         if (selectedDate < av.date_from || selectedDate > av.date_to)
// //           return false;
// //         const days = av.days_of_week || [];
// //         return days.includes(isoDay);
// //       }) || null
// //     );
// //   }, [availabilities, activeProviderId, selectedDate]);

// //   // ==================== AUTO-ADJUST selectedDate ====================
// //   useEffect(() => {
// //     if (!selectedDate) return;
// //     const [sy, sm] = selectedDate.split("-").map(Number);
// //     if (sy !== viewMonth.year || sm - 1 !== viewMonth.month) {
// //       const newDate = pickDateForMonth(viewMonth.year, viewMonth.month);
// //       setSelectedDate(newDate);
// //     }
// //   }, [viewMonth, selectedDate]);

// //   // ==================== DATE → PROVIDERS MAP ====================
// //   const dateProviderMap = useMemo(() => {
// //     const map = {};
// //     if (!availabilities.length) return map;

// //     const { year, month } = viewMonth;
// //     const start = new Date(year, month - 1, 1);
// //     const end = new Date(year, month + 2, 0);

// //     const current = new Date(start);
// //     while (current <= end) {
// //       const y = current.getFullYear();
// //       const m = String(current.getMonth() + 1).padStart(2, "0");
// //       const d = String(current.getDate()).padStart(2, "0");
// //       const dateStr = `${y}-${m}-${d}`;
// //       const isoDay = getISODay(dateStr);

// //       const availableProviders = [];
// //       const seen = new Set();

// //       availabilities.forEach((av) => {
// //         if (!av.status) return;
// //         if (!av.provider?.id) return;
// //         if (seen.has(av.provider.id)) return;
// //         if (dateStr < av.date_from || dateStr > av.date_to) return;
// //         const days = av.days_of_week || [];
// //         if (!days.includes(isoDay)) return;

// //         seen.add(av.provider.id);
// //         availableProviders.push({
// //           id: av.provider.id,
// //           name: av.provider.name,
// //           color: getProviderColor(av.provider),
// //         });
// //       });

// //       if (availableProviders.length > 0) {
// //         map[dateStr] = availableProviders;
// //       }

// //       current.setDate(current.getDate() + 1);
// //     }

// //     return map;
// //   }, [availabilities, viewMonth]);

// //   // ==================== BOOKED APPOINTMENTS ====================
// //   const { data: bookedAppointments = [] } = useBookedSlotsByDate(selectedDate);

// //   const activeBookedAppointments = useMemo(
// //     () =>
// //       bookedAppointments.filter(
// //         (a) => (a.provider_id || a.provider?.id) === activeProviderId,
// //       ),
// //     [bookedAppointments, activeProviderId],
// //   );

// //   // ==================== HANDLERS ====================
// //   const handleSlotClick = (slot) => {
// //     if (!activeProvider) return;
// //     setBookingModal({
// //       open: true,
// //       slot,
// //       provider: activeProvider,
// //       appointmentTypeId: activeAvailability?.appointment_type?.id,
// //     });
// //   };

// //   const handleBookedSlotClick = (slot) => {
// //     if (!activeProvider) return;
// //     // Attach visit if exists
// //     const visit = slot.appointment?.id
// //       ? appointmentVisitMap[slot.appointment.id] || null
// //       : null;

// //     setBookedSlotModal({
// //       open: true,
// //       slot: { ...slot, visit },
// //       provider: activeProvider,
// //       date: selectedDate,
// //     });
// //   };

// //   const handleAddAvailability = () => {
// //     if (activeProviderId) {
// //       navigate(`/provider-availabilities/new?provider_id=${activeProviderId}`);
// //     } else {
// //       navigate("/provider-availabilities/new");
// //     }
// //   };

// //   const handleBookingSuccess = () => {
// //     setBookingModal({ open: false, slot: null, provider: null });
// //   };

// //   if (isLoading) return <Loader text="Loading calendar..." />;

// //   return (
// //     <div className="space-y-4 sm:space-y-5">
// //       {/* Header */}
// //       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// //         <div className="min-w-0">
// //           <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
// //             Booking Calendar
// //           </h1>
// //           <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
// //             View all providers' slots and book appointments directly
// //           </p>
// //         </div>
// //       </div>

// //       {/* Split layout */}
// //       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:gap-5">
// //         <div className="min-w-0">
// //           <MonthCalendar
// //             selectedDate={selectedDate}
// //             onSelectDate={setSelectedDate}
// //             dateProviderMap={dateProviderMap}
// //             activeProviderId={activeProviderId}
// //             allProviders={providers}
// //             viewMonth={viewMonth}
// //             setViewMonth={setViewMonth}
// //           />
// //         </div>

// //         <div className="min-w-0">
// //           {providers.length === 0 ? (
// //             <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
// //               <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
// //                 <FiCalendar className="h-5 w-5 text-ink-500" />
// //               </div>
// //               <p className="text-sm font-medium text-ink-700">
// //                 No providers available
// //               </p>
// //               <p className="mt-1 text-xs text-ink-500">
// //                 Set up availability for providers first.
// //               </p>
// //             </div>
// //           ) : (
// //             <div className="space-y-3">
// //               <ProviderTabs
// //                 providers={providers}
// //                 activeProviderId={activeProviderId}
// //                 onSelectProvider={setSelectedProviderId}
// //               />

// //               <SlotList
// //                 availability={activeAvailability}
// //                 bookedAppointments={activeBookedAppointments}
// //                 appointmentVisitMap={appointmentVisitMap}
// //                 providerColor={getProviderColor(activeProvider)}
// //                 date={selectedDate}
// //                 onSlotClick={handleSlotClick}
// //                 onBookedSlotClick={handleBookedSlotClick}
// //                 onAddAvailability={handleAddAvailability}
// //               />
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Quick Booking Modal */}
// //       <QuickBookingModal
// //         open={bookingModal.open}
// //         onClose={() =>
// //           setBookingModal({
// //             open: false,
// //             slot: null,
// //             provider: null,
// //           })
// //         }
// //         slot={bookingModal.slot}
// //         provider={bookingModal.provider}
// //         appointmentTypeId={bookingModal.appointmentTypeId}
// //         date={selectedDate}
// //         onSuccess={handleBookingSuccess}
// //       />

// //       {/* Booked Slot Details Modal */}
// //       <BookedSlotDetailsModal
// //         open={bookedSlotModal.open}
// //         onClose={() =>
// //           setBookedSlotModal({
// //             open: false,
// //             slot: null,
// //             provider: null,
// //             date: null,
// //           })
// //         }
// //         slot={bookedSlotModal.slot}
// //         provider={bookedSlotModal.provider}
// //         date={bookedSlotModal.date}
// //       />
// //     </div>
// //   );
// // };

// // export default BookingCalendar;

// // src/features/patent/pages/bookingCalendar/BookingCalendar.jsx

// import { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FiCalendar } from "react-icons/fi";
// import {
//   useAllAvailabilities,
//   useBookedSlotsByDate,
//   getProviderColor,
// } from "../../queries/bookingCalendar";
// import { usePreviewAvailability } from "../../queries/providerAvailabilities";
// import { useVisits } from "../../queries/visits";
// import MonthCalendar from "./components/MonthCalendar";
// import ProviderTabs from "./components/ProviderTabs";
// import SlotList from "./components/SlotList";
// import QuickBookingModal from "./components/QuickBookingModal";
// import BookedSlotDetailsModal from "./components/BookedSlotDetailsModal";
// import Loader from "../../common/Loader";

// // ==================== HELPERS ====================
// const todayStr = () => {
//   const d = new Date();
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// };

// const getISODay = (dateStr) => {
//   if (!dateStr) return null;
//   const [y, m, d] = dateStr.split("-").map(Number);
//   const dt = new Date(y, m - 1, d);
//   const jsDay = dt.getDay();
//   return jsDay === 0 ? 7 : jsDay;
// };

// const formatDateStr = (date) => {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

// const pickDateForMonth = (year, month) => {
//   const today = new Date();
//   if (today.getFullYear() === year && today.getMonth() === month) {
//     return formatDateStr(today);
//   }
//   return `${year}-${String(month + 1).padStart(2, "0")}-01`;
// };

// // Normalize visit schedule date (handles "2026-10-12" and "2026-10-12 15:12:15")
// const toDateOnly = (val) => {
//   if (!val) return "";
//   if (typeof val === "string") return val.slice(0, 10);
//   return "";
// };

// const BookingCalendar = () => {
//   const navigate = useNavigate();

//   const [selectedDate, setSelectedDate] = useState(todayStr());
//   const [selectedProviderId, setSelectedProviderId] = useState(null);
//   const [viewMonth, setViewMonth] = useState(() => {
//     const d = new Date();
//     return { year: d.getFullYear(), month: d.getMonth() };
//   });

//   const [bookingModal, setBookingModal] = useState({
//     open: false,
//     slot: null,
//     provider: null,
//   });

//   const [bookedSlotModal, setBookedSlotModal] = useState({
//     open: false,
//     slot: null,
//     provider: null,
//     date: null,
//   });

//   // ==================== AVAILABILITIES ====================
//   const { data: availabilities = [], isLoading } = useAllAvailabilities();

//   // ==================== VISITS (for appointment → visit mapping) ====================
//   const { data: visitsData } = useVisits({ per_page: 500 });
//   const allVisits = visitsData?.list || [];

//   // appointmentId → visit map
//   const appointmentVisitMap = useMemo(() => {
//     const map = {};
//     allVisits.forEach((v) => {
//       const apptId = v.appointment?.id;
//       if (apptId) {
//         map[apptId] = v;
//       }
//     });
//     return map;
//   }, [allVisits]);

//   // ==================== PROVIDERS ====================
//   const providers = useMemo(() => {
//     const map = new Map();
//     availabilities.forEach((av) => {
//       if (av.provider && av.provider.id && !map.has(av.provider.id)) {
//         map.set(av.provider.id, av.provider);
//       }
//     });
//     return Array.from(map.values());
//   }, [availabilities]);

//   const activeProviderId = selectedProviderId || providers[0]?.id || null;
//   const activeProvider = providers.find((p) => p.id === activeProviderId);

//   // ==================== ACTIVE AVAILABILITY ====================
//   const activeAvailability = useMemo(() => {
//     if (!activeProviderId || !selectedDate) return null;
//     const isoDay = getISODay(selectedDate);

//     return (
//       availabilities.find((av) => {
//         if (av.provider?.id !== activeProviderId) return false;
//         if (!av.status) return false;
//         if (selectedDate < av.date_from || selectedDate > av.date_to)
//           return false;
//         const days = av.days_of_week || [];
//         return days.includes(isoDay);
//       }) || null
//     );
//   }, [availabilities, activeProviderId, selectedDate]);

//   // ==================== FREE SLOTS (PREVIEW API) ====================
//   // availabilityId -> preview dates array (cache, taaki baar-baar API call na ho)
//   const previewMutation = usePreviewAvailability();
//   const [previewCache, setPreviewCache] = useState({});

//   useEffect(() => {
//     const av = activeAvailability;
//     if (!av?.id) return;
//     // already cached -> skip
//     if (previewCache[av.id]) return;

//     const payload = {
//       admin_id: av.provider?.id,
//       appointment_type_id: av.appointment_type?.id,
//       date_from: av.date_from,
//       date_to: av.date_to,
//       days_of_week: av.days_of_week,
//       start_time: av.start_time,
//       end_time: av.end_time,
//       slot_duration: av.slot_duration,
//       capacity: av.capacity,
//     };

//     previewMutation.mutate(payload, {
//       onSuccess: (res) => {
//         setPreviewCache((prev) => ({
//           ...prev,
//           [av.id]: res?.data?.dates || [],
//         }));
//       },
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeAvailability?.id]);

//   // Selected date ke free slots ke start_time list (HH:mm)
//   const freeSlotTimes = useMemo(() => {
//     const av = activeAvailability;
//     if (!av?.id) return [];
//     const dates = previewCache[av.id];
//     if (!dates) return [];
//     const dateObj = dates.find((d) => d.date === selectedDate);
//     if (!dateObj?.slots) return [];
//     return dateObj.slots
//       .filter((s) => s.is_free)
//       .map((s) => (s.start_time || "").slice(0, 5));
//   }, [activeAvailability, previewCache, selectedDate]);

//   // ==================== AUTO-ADJUST selectedDate ====================
//   useEffect(() => {
//     if (!selectedDate) return;
//     const [sy, sm] = selectedDate.split("-").map(Number);
//     if (sy !== viewMonth.year || sm - 1 !== viewMonth.month) {
//       const newDate = pickDateForMonth(viewMonth.year, viewMonth.month);
//       setSelectedDate(newDate);
//     }
//   }, [viewMonth, selectedDate]);

//   // ==================== DATE → PROVIDERS MAP ====================
//   const dateProviderMap = useMemo(() => {
//     const map = {};
//     if (!availabilities.length) return map;

//     const { year, month } = viewMonth;
//     const start = new Date(year, month - 1, 1);
//     const end = new Date(year, month + 2, 0);

//     const current = new Date(start);
//     while (current <= end) {
//       const y = current.getFullYear();
//       const m = String(current.getMonth() + 1).padStart(2, "0");
//       const d = String(current.getDate()).padStart(2, "0");
//       const dateStr = `${y}-${m}-${d}`;
//       const isoDay = getISODay(dateStr);

//       const availableProviders = [];
//       const seen = new Set();

//       availabilities.forEach((av) => {
//         if (!av.status) return;
//         if (!av.provider?.id) return;
//         if (seen.has(av.provider.id)) return;
//         if (dateStr < av.date_from || dateStr > av.date_to) return;
//         const days = av.days_of_week || [];
//         if (!days.includes(isoDay)) return;

//         seen.add(av.provider.id);
//         availableProviders.push({
//           id: av.provider.id,
//           name: av.provider.name,
//           color: getProviderColor(av.provider),
//         });
//       });

//       if (availableProviders.length > 0) {
//         map[dateStr] = availableProviders;
//       }

//       current.setDate(current.getDate() + 1);
//     }

//     return map;
//   }, [availabilities, viewMonth]);

//   // ==================== BOOKED APPOINTMENTS ====================
//   const { data: bookedAppointments = [] } = useBookedSlotsByDate(selectedDate);

//   const activeBookedAppointments = useMemo(
//     () =>
//       bookedAppointments.filter(
//         (a) => (a.provider_id || a.provider?.id) === activeProviderId,
//       ),
//     [bookedAppointments, activeProviderId],
//   );

//   // ==================== HANDLERS ====================
//   const handleSlotClick = (slot) => {
//     if (!activeProvider) return;
//     setBookingModal({
//       open: true,
//       slot,
//       provider: activeProvider,
//       appointmentTypeId: activeAvailability?.appointment_type?.id,
//     });
//   };

//   const handleBookedSlotClick = (slot) => {
//     if (!activeProvider) return;
//     // Attach visit if exists
//     const visit = slot.appointment?.id
//       ? appointmentVisitMap[slot.appointment.id] || null
//       : null;

//     setBookedSlotModal({
//       open: true,
//       slot: { ...slot, visit },
//       provider: activeProvider,
//       date: selectedDate,
//     });
//   };

//   const handleAddAvailability = () => {
//     if (activeProviderId) {
//       navigate(`/provider-availabilities/new?provider_id=${activeProviderId}`);
//     } else {
//       navigate("/provider-availabilities/new");
//     }
//   };

//   const handleBookingSuccess = () => {
//     setBookingModal({ open: false, slot: null, provider: null });
//   };

//   if (isLoading) return <Loader text="Loading calendar..." />;

//   return (
//     <div className="space-y-4 sm:space-y-5">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div className="min-w-0">
//           <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
//             Booking Calendar
//           </h1>
//           <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
//             View all providers' slots and book appointments directly
//           </p>
//         </div>
//       </div>

//       {/* Split layout */}
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:gap-5">
//         <div className="min-w-0">
//           <MonthCalendar
//             selectedDate={selectedDate}
//             onSelectDate={setSelectedDate}
//             dateProviderMap={dateProviderMap}
//             activeProviderId={activeProviderId}
//             allProviders={providers}
//             viewMonth={viewMonth}
//             setViewMonth={setViewMonth}
//           />
//         </div>

//         <div className="min-w-0">
//           {providers.length === 0 ? (
//             <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
//               <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
//                 <FiCalendar className="h-5 w-5 text-ink-500" />
//               </div>
//               <p className="text-sm font-medium text-ink-700">
//                 No providers available
//               </p>
//               <p className="mt-1 text-xs text-ink-500">
//                 Set up availability for providers first.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               <ProviderTabs
//                 providers={providers}
//                 activeProviderId={activeProviderId}
//                 onSelectProvider={setSelectedProviderId}
//               />

//               <SlotList
//                 availability={activeAvailability}
//                 bookedAppointments={activeBookedAppointments}
//                 appointmentVisitMap={appointmentVisitMap}
//                 freeSlotTimes={freeSlotTimes}
//                 providerColor={getProviderColor(activeProvider)}
//                 date={selectedDate}
//                 onSlotClick={handleSlotClick}
//                 onBookedSlotClick={handleBookedSlotClick}
//                 onAddAvailability={handleAddAvailability}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Quick Booking Modal */}
//       <QuickBookingModal
//         open={bookingModal.open}
//         onClose={() =>
//           setBookingModal({
//             open: false,
//             slot: null,
//             provider: null,
//           })
//         }
//         slot={bookingModal.slot}
//         provider={bookingModal.provider}
//         appointmentTypeId={bookingModal.appointmentTypeId}
//         date={selectedDate}
//         onSuccess={handleBookingSuccess}
//       />

//       {/* Booked Slot Details Modal */}
//       <BookedSlotDetailsModal
//         open={bookedSlotModal.open}
//         onClose={() =>
//           setBookedSlotModal({
//             open: false,
//             slot: null,
//             provider: null,
//             date: null,
//           })
//         }
//         slot={bookedSlotModal.slot}
//         provider={bookedSlotModal.provider}
//         date={bookedSlotModal.date}
//       />
//     </div>
//   );
// };

// export default BookingCalendar;

// src/features/patent/pages/bookingCalendar/BookingCalendar.jsx

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiCalendar } from "react-icons/fi";
import {
  useAllAvailabilities,
  getProviderColor,
} from "../../queries/bookingCalendar";
import { useSlotsForDate } from "../../queries/providerAvailabilities";
import { useVisits } from "../../queries/visits";
import MonthCalendar from "./components/MonthCalendar";
import ProviderTabs from "./components/ProviderTabs";
import SlotList from "./components/SlotList";
import QuickBookingModal from "./components/QuickBookingModal";
import BookedSlotDetailsModal from "./components/BookedSlotDetailsModal";
import Loader from "../../common/Loader";

// ==================== HELPERS ====================
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getISODay = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const jsDay = dt.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const pickDateForMonth = (year, month) => {
  const today = new Date();
  if (today.getFullYear() === year && today.getMonth() === month) {
    return formatDateStr(today);
  }
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
};

const BookingCalendar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [bookingModal, setBookingModal] = useState({
    open: false,
    slot: null,
    provider: null,
    appointmentTypeId: null,
  });

  const [bookedSlotModal, setBookedSlotModal] = useState({
    open: false,
    slot: null,
    provider: null,
    date: null,
  });

  // ==================== AVAILABILITIES ====================
  const { data: availabilities = [], isLoading } = useAllAvailabilities();

  // ==================== VISITS (for appointment → visit mapping) ====================
  const { data: visitsData } = useVisits({ per_page: 500 });
  const allVisits = visitsData?.list || [];

  // appointmentId → visit map
  const appointmentVisitMap = useMemo(() => {
    const map = {};
    allVisits.forEach((v) => {
      const apptId = v.appointment?.id;
      if (apptId) {
        map[apptId] = v;
      }
    });
    return map;
  }, [allVisits]);

  // ==================== PROVIDERS ====================
  const providers = useMemo(() => {
    const map = new Map();
    availabilities.forEach((av) => {
      if (av.provider && av.provider.id && !map.has(av.provider.id)) {
        map.set(av.provider.id, av.provider);
      }
    });
    return Array.from(map.values());
  }, [availabilities]);

  const activeProviderId = selectedProviderId || providers[0]?.id || null;
  const activeProvider = providers.find((p) => p.id === activeProviderId);

  // ==================== ACTIVE AVAILABILITY ====================
  const activeAvailability = useMemo(() => {
    if (!activeProviderId || !selectedDate) return null;
    const isoDay = getISODay(selectedDate);

    return (
      availabilities.find((av) => {
        if (av.provider?.id !== activeProviderId) return false;
        if (!av.status) return false;
        if (selectedDate < av.date_from || selectedDate > av.date_to)
          return false;
        const days = av.days_of_week || [];
        return days.includes(isoDay);
      }) || null
    );
  }, [availabilities, activeProviderId, selectedDate]);

  // ==================== REAL SLOTS API ====================
  const appointmentTypeId = activeAvailability?.appointment_type?.id || null;

  const { data: slotsData, isLoading: slotsLoading } = useSlotsForDate({
    admin_id: activeProviderId,
    appointment_type_id: appointmentTypeId,
    date: selectedDate,
    enabled: !!activeProviderId && !!appointmentTypeId && !!selectedDate,
  });

  const apiSlots = slotsData?.slots || [];

  // ==================== AUTO-ADJUST selectedDate ====================
  useEffect(() => {
    if (!selectedDate) return;
    const [sy, sm] = selectedDate.split("-").map(Number);
    if (sy !== viewMonth.year || sm - 1 !== viewMonth.month) {
      const newDate = pickDateForMonth(viewMonth.year, viewMonth.month);
      setSelectedDate(newDate);
    }
  }, [viewMonth, selectedDate]);

  // ==================== DATE → PROVIDERS MAP ====================
  const dateProviderMap = useMemo(() => {
    const map = {};
    if (!availabilities.length) return map;

    const { year, month } = viewMonth;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month + 2, 0);

    const current = new Date(start);
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      const isoDay = getISODay(dateStr);

      const availableProviders = [];
      const seen = new Set();

      availabilities.forEach((av) => {
        if (!av.status) return;
        if (!av.provider?.id) return;
        if (seen.has(av.provider.id)) return;
        if (dateStr < av.date_from || dateStr > av.date_to) return;
        const days = av.days_of_week || [];
        if (!days.includes(isoDay)) return;

        seen.add(av.provider.id);
        availableProviders.push({
          id: av.provider.id,
          name: av.provider.name,
          color: getProviderColor(av.provider),
        });
      });

      if (availableProviders.length > 0) {
        map[dateStr] = availableProviders;
      }

      current.setDate(current.getDate() + 1);
    }

    return map;
  }, [availabilities, viewMonth]);

  // ==================== HANDLERS ====================
  const handleSlotClick = (slot) => {
    if (!activeProvider) return;
    setBookingModal({
      open: true,
      slot,
      provider: activeProvider,
      appointmentTypeId: activeAvailability?.appointment_type?.id,
    });
  };

  const handleBookedSlotClick = (slot) => {
    if (!activeProvider) return;
    const apptId = slot.appointment?.id || slot.appointment_id || null;
    const visit = apptId ? appointmentVisitMap[apptId] || null : null;

    setBookedSlotModal({
      open: true,
      slot: { ...slot, visit },
      provider: activeProvider,
      date: selectedDate,
    });
  };

  const handleAddAvailability = () => {
    if (activeProviderId) {
      navigate(`/provider-availabilities/new?provider_id=${activeProviderId}`);
    } else {
      navigate("/provider-availabilities/new");
    }
  };

  // ==================== BOOKING SUCCESS → REFRESH SLOTS ====================
  const handleBookingSuccess = () => {
    // 1. Modal band karo
    setBookingModal({
      open: false,
      slot: null,
      provider: null,
      appointmentTypeId: null,
    });

    // 2. Slots ko refetch karo taaki naya booked slot turant dikhe
    queryClient.invalidateQueries({
      queryKey: ["providerAvailabilities", "slots"],
    });

    // 3. Visits ko bhi invalidate karo (visit map ke liye)
    queryClient.invalidateQueries({ queryKey: ["visits"] });

    // 4. Booked slots (agar koi doosri jagah use ho rahi hai)
    queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
  };

  if (isLoading) return <Loader text="Loading calendar..." />;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Booking Calendar
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            View all providers' slots and book appointments directly
          </p>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:gap-5">
        <div className="min-w-0">
          <MonthCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dateProviderMap={dateProviderMap}
            activeProviderId={activeProviderId}
            allProviders={providers}
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
          />
        </div>

        <div className="min-w-0">
          {providers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
                <FiCalendar className="h-5 w-5 text-ink-500" />
              </div>
              <p className="text-sm font-medium text-ink-700">
                No providers available
              </p>
              <p className="mt-1 text-xs text-ink-500">
                Set up availability for providers first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <ProviderTabs
                providers={providers}
                activeProviderId={activeProviderId}
                onSelectProvider={setSelectedProviderId}
              />

              <SlotList
                availability={activeAvailability}
                slots={apiSlots}
                slotsLoading={slotsLoading}
                appointmentVisitMap={appointmentVisitMap}
                providerColor={getProviderColor(activeProvider)}
                date={selectedDate}
                onSlotClick={handleSlotClick}
                onBookedSlotClick={handleBookedSlotClick}
                onAddAvailability={handleAddAvailability}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Booking Modal */}
      <QuickBookingModal
        open={bookingModal.open}
        onClose={() =>
          setBookingModal({
            open: false,
            slot: null,
            provider: null,
            appointmentTypeId: null,
          })
        }
        slot={bookingModal.slot}
        provider={bookingModal.provider}
        appointmentTypeId={bookingModal.appointmentTypeId}
        date={selectedDate}
        onSuccess={handleBookingSuccess}
      />

      {/* Booked Slot Details Modal */}
      <BookedSlotDetailsModal
        open={bookedSlotModal.open}
        onClose={() =>
          setBookedSlotModal({
            open: false,
            slot: null,
            provider: null,
            date: null,
          })
        }
        slot={bookedSlotModal.slot}
        provider={bookedSlotModal.provider}
        date={bookedSlotModal.date}
      />
    </div>
  );
};

export default BookingCalendar;
