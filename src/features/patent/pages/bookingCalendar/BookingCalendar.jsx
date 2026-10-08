// src/features/patent/pages/bookingCalendar/BookingCalendar.jsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import {
  useAllAvailabilities,
  useBookedSlotsByDate,
  getProviderColor,
} from "../../queries/bookingCalendar";
import MonthCalendar from "./components/MonthCalendar";
import ProviderTabs from "./components/ProviderTabs";
import SlotList from "./components/SlotList";
import QuickBookingModal from "./components/QuickBookingModal";
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

const BookingCalendar = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    open: false,
    slot: null,
    provider: null,
  });

  // Load all availabilities (includes provider + appointment_type)
  const { data: availabilities = [], isLoading } = useAllAvailabilities();

  // Derive unique providers from availabilities
  const providers = useMemo(() => {
    const map = new Map();
    availabilities.forEach((av) => {
      if (av.provider && av.provider.id && !map.has(av.provider.id)) {
        map.set(av.provider.id, av.provider);
      }
    });
    return Array.from(map.values());
  }, [availabilities]);

  // Auto-select first provider
  const activeProviderId = selectedProviderId || providers[0]?.id || null;
  const activeProvider = providers.find((p) => p.id === activeProviderId);

  // Active availability for selected provider + date
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

  // ==================== DATE → PROVIDERS MAP ====================
  const dateProviderMap = useMemo(() => {
    const map = {};
    if (!availabilities.length) return map;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(today);
    end.setMonth(end.getMonth() + 4);

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
  }, [availabilities]);

  // ==================== BOOKED SLOTS (single date call) ====================
  const { data: bookedAppointments = [] } = useBookedSlotsByDate(selectedDate);

  // Filter to active provider
  const activeBookedAppointments = useMemo(
    () =>
      bookedAppointments.filter(
        (a) => (a.provider_id || a.provider?.id) === activeProviderId,
      ),
    [bookedAppointments, activeProviderId],
  );

  const handleSlotClick = (slot) => {
    if (!activeProvider) return;
    setBookingModal({
      open: true,
      slot,
      provider: activeProvider,
      appointmentTypeId: activeAvailability?.appointment_type?.id,
    });
  };

  const handleAddAvailability = () => {
    if (activeProviderId) {
      navigate(`/provider-availabilities/new?provider_id=${activeProviderId}`);
    } else {
      navigate("/provider-availabilities/new");
    }
  };

  const handleBookingSuccess = () => {
    setBookingModal({ open: false, slot: null, provider: null });
  };

  if (isLoading) return <Loader text="Loading calendar..." />;

  return (
    <div className="space-y-4 sm:space-y-5">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:gap-5">
        <div className="min-w-0">
          <MonthCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dateProviderMap={dateProviderMap}
            activeProviderId={activeProviderId}
            allProviders={providers} // ← ADD
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
                bookedAppointments={activeBookedAppointments}
                providerColor={getProviderColor(activeProvider)}
                date={selectedDate}
                onSlotClick={handleSlotClick}
                onAddAvailability={handleAddAvailability}
              />
            </div>
          )}
        </div>
      </div>

      <QuickBookingModal
        open={bookingModal.open}
        onClose={() =>
          setBookingModal({ open: false, slot: null, provider: null })
        }
        slot={bookingModal.slot}
        provider={bookingModal.provider}
        appointmentTypeId={bookingModal.appointmentTypeId}
        date={selectedDate}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default BookingCalendar;
