import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiCalendar, FiLock } from "react-icons/fi";
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
import { usePermission } from "../../hooks/usePermission";

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

const CLOSED_BOOKING_MODAL = {
  open: false,
  slot: null,
  provider: null,
  appointmentTypeId: null,
};

const CLOSED_BOOKED_MODAL = {
  open: false,
  slot: null,
  provider: null,
  date: null,
  selectedAppointmentId: null,
};

const BookingCalendar = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canViewAppointment = can("appointment", "view");
  const canManageAppointment = can("appointment", "manage");
  const canViewAvailability = can("availability", "view");

  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [bookingModal, setBookingModal] = useState(CLOSED_BOOKING_MODAL);

  const [bookedSlotModal, setBookedSlotModal] = useState(CLOSED_BOOKED_MODAL);

  // ✅ Quick booking modal se aaye the? to yahan uska state save rahega,
  //    Back dabane par isi se wapas khulega. null = direct calendar se khula.
  const [returnToBooking, setReturnToBooking] = useState(null);

  // ==================== AVAILABILITIES ====================
  const { data: availabilities = [], isLoading } = useAllAvailabilities();

  // ==================== VISITS ====================
  const { data: visitsData } = useVisits({ per_page: 500 });
  const allVisits = visitsData?.list || [];

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

  const activeProviderColor = useMemo(() => {
    if (!activeProvider) return null;
    try {
      return getProviderColor(activeProvider);
    } catch {
      return null;
    }
  }, [activeProvider]);

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
    if (!canManageAppointment) return;
    if (!activeProvider) return;
    setBookingModal({
      open: true,
      slot,
      provider: activeProvider,
      appointmentTypeId: activeAvailability?.appointment_type?.id,
    });
  };

  const handleBookedSlotClick = (slot, appointmentId = null) => {
    if (!activeProvider) return;

    const list = Array.isArray(slot?.appointments) ? slot.appointments : [];

    let slotForModal = slot;
    if (list.length > 0) {
      if (appointmentId) {
        const match = list.find((a) => a.id === appointmentId);
        if (match) {
          slotForModal = { ...slot, appointments: [match] };
        }
      } else {
        slotForModal = { ...slot, appointments: list };
      }
    }

    setBookedSlotModal({
      open: true,
      slot: slotForModal,
      provider: activeProvider,
      date: selectedDate,
      selectedAppointmentId: appointmentId,
    });
  };

  // SlotList se direct click -> Back nahi dikhana, isliye return state clear
  const handleBookedSlotClickFromList = (slot, appointmentId = null) => {
    setReturnToBooking(null);
    handleBookedSlotClick(slot, appointmentId);
  };

  // ✅ QuickBookingModal ke andar se booked appointment par click
  //    → booking modal ka state save karo, usko close karo, details modal kholo
  const handleViewBookedAppointment = (slot, appointmentId = null) => {
    setReturnToBooking({
      open: true,
      slot: bookingModal.slot || slot,
      provider: bookingModal.provider,
      appointmentTypeId: bookingModal.appointmentTypeId,
    });
    setBookingModal(CLOSED_BOOKING_MODAL);
    handleBookedSlotClick(slot, appointmentId);
  };

  // ✅ Details modal ka Back button -> details band, quick booking wapas
  const handleBackToBooking = () => {
    if (!returnToBooking) return;

    // fresh slot data (status/appointments change hue ho sakte hain)
    const savedStart = returnToBooking.slot?.start_time;
    const freshSlot =
      apiSlots.find((s) => s.start_time === savedStart) || returnToBooking.slot;

    setBookedSlotModal(CLOSED_BOOKED_MODAL);
    setBookingModal({ ...returnToBooking, slot: freshSlot, open: true });
    setReturnToBooking(null);
  };

  const handleBookedModalClose = () => {
    setBookedSlotModal(CLOSED_BOOKED_MODAL);
    setReturnToBooking(null);
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
    setBookingModal(CLOSED_BOOKING_MODAL);

    queryClient.invalidateQueries({
      queryKey: ["providerAvailabilities", "slots"],
    });
    queryClient.invalidateQueries({ queryKey: ["visits"] });
    queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
  };

  if (isLoading || permLoading) {
    return <Loader text="Loading calendar..." />;
  }

  if (!canViewAppointment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-xl border border-ink-100 bg-surface px-8 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiLock className="h-5 w-5 text-ink-500" />
          </div>

          <p className="text-sm font-semibold text-ink-700">
            Permission Required
          </p>

          <p className="mt-1 text-xs text-ink-500">
            You don't have permission to view appointments.
          </p>
        </div>
      </div>
    );
  }

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

              {canViewAvailability ? (
                <SlotList
                  availability={activeAvailability}
                  slots={apiSlots}
                  slotsLoading={slotsLoading}
                  appointmentVisitMap={appointmentVisitMap}
                  providerColor={activeProviderColor}
                  date={selectedDate}
                  onSlotClick={handleSlotClick}
                  onBookedSlotClick={handleBookedSlotClickFromList}
                  onAddAvailability={handleAddAvailability}
                  canManageAppointment={canManageAppointment}
                />
              ) : (
                <div className="rounded-xl border border-ink-100 bg-surface px-6 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink-100">
                    <FiLock className="h-5 w-5 text-ink-500" />
                  </div>

                  <p className="text-sm font-semibold text-ink-700">
                    Permission Required
                  </p>

                  <p className="mt-1 text-xs text-ink-500">
                    You don't have permission to view provider availability
                    slots.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Booking Modal */}
      <QuickBookingModal
        open={bookingModal.open}
        onClose={() => setBookingModal(CLOSED_BOOKING_MODAL)}
        slot={bookingModal.slot}
        provider={bookingModal.provider}
        appointmentTypeId={bookingModal.appointmentTypeId}
        date={selectedDate}
        appointmentVisitMap={appointmentVisitMap}
        onViewBookedAppointment={handleViewBookedAppointment}
        onSuccess={handleBookingSuccess}
      />

      {/* Booked Slot Details Modal */}
      <BookedSlotDetailsModal
        open={bookedSlotModal.open}
        onClose={handleBookedModalClose}
        slot={bookedSlotModal.slot}
        provider={bookedSlotModal.provider}
        date={bookedSlotModal.date}
        initialAppointmentId={bookedSlotModal.selectedAppointmentId}
        onBack={returnToBooking ? handleBackToBooking : undefined}
      />
    </div>
  );
};

export default BookingCalendar;
