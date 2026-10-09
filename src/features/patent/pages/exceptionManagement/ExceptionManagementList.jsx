// src/features/patent/pages/exceptionManagement/ExceptionManagementList.jsx

import { useState, useMemo, useEffect } from "react";
import { FiLock, FiCalendar } from "react-icons/fi";
import {
  useAllAvailabilities,
  getProviderColor,
} from "../../queries/bookingCalendar";
import { useAllExceptions, todayStr } from "../../queries/exceptionManagement";
import ExceptionMonthCalendar from "./components/ExceptionMonthCalendar";
import ExceptionProviderTabs from "./components/ExceptionProviderTabs";
import ExceptionList from "./components/ExceptionList";
import ExceptionDetailsModal from "./components/ExceptionDetailsModal";
import Loader from "../../common/Loader";

// ==================== HELPERS ====================
const addMonths = (dateStr, delta) => {
  const [y, m] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1 + delta, 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}-01`;
};

const lastDayOfMonth = (dateStr) => {
  const [y, m] = dateStr.split("-").map(Number);
  const dt = new Date(y, m, 0);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Pick first date of a month, or today if today is in that month
const pickDateForMonth = (year, month) => {
  const today = new Date();
  if (today.getFullYear() === year && today.getMonth() === month) {
    return formatDateStr(today);
  }
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
};

const ExceptionManagementList = () => {
  const today = useMemo(() => todayStr(), []);

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [detailsModal, setDetailsModal] = useState({
    open: false,
    exception: null,
  });

  // ==================== LOAD AVAILABILITIES ====================
  const { data: availabilities = [], isLoading: loadingAvailabilities } =
    useAllAvailabilities();

  // ==================== DERIVE PROVIDERS ====================
  const providers = useMemo(() => {
    const map = new Map();
    availabilities.forEach((av) => {
      if (av.provider && av.provider.id && !map.has(av.provider.id)) {
        map.set(av.provider.id, {
          ...av.provider,
          color: getProviderColor(av.provider),
        });
      }
    });
    return Array.from(map.values());
  }, [availabilities]);

  const activeProviderId = selectedProviderId || providers[0]?.id || null;
  const activeProvider = providers.find((p) => p.id === activeProviderId);

  // ==================== DATE RANGE (CURRENT VIEW MONTH ± 1) ====================
  const dateRange = useMemo(() => {
    const first = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(
      2,
      "0",
    )}-01`;
    const dateFrom = addMonths(first, -1);
    const dateTo = lastDayOfMonth(addMonths(first, 1));
    return { date_from: dateFrom, date_to: dateTo };
  }, [viewMonth]);

  // ==================== FILTER AVAILABILITIES BY ACTIVE PROVIDER ====================
  const activeAvailabilities = useMemo(() => {
    if (!activeProviderId) return availabilities;
    return availabilities.filter((av) => av.provider?.id === activeProviderId);
  }, [availabilities, activeProviderId]);

  // ==================== LOAD ALL EXCEPTIONS (FAN-OUT) ====================
  const {
    data: exceptionsData,
    isLoading: loadingExceptions,
    isFetching: fetchingExceptions,
  } = useAllExceptions({
    availabilities: activeAvailabilities,
    date_from: dateRange.date_from,
    date_to: dateRange.date_to,
  });

  const allExceptions = exceptionsData?.list || [];

  // ==================== AUTO-ADJUST selectedDate WHEN MONTH CHANGES ====================
  useEffect(() => {
    if (!selectedDate) return;
    const [sy, sm] = selectedDate.split("-").map(Number);
    if (sy !== viewMonth.year || sm - 1 !== viewMonth.month) {
      const newDate = pickDateForMonth(viewMonth.year, viewMonth.month);
      setSelectedDate(newDate);
    }
  }, [viewMonth, selectedDate]);

  // ==================== DATE → EXCEPTIONS MAP ====================
  const dateExceptionMap = useMemo(() => {
    const map = {};
    allExceptions.forEach((ex) => {
      const d = ex.exception_date;
      if (!d) return;
      if (!map[d]) map[d] = [];
      map[d].push(ex);
    });
    return map;
  }, [allExceptions]);

  // ==================== EXCEPTIONS FOR SELECTED DATE ====================
  const selectedDateExceptions = useMemo(() => {
    return allExceptions
      .filter((ex) => ex.exception_date === selectedDate)
      .sort((a, b) => {
        if (a.is_full_day && !b.is_full_day) return -1;
        if (!a.is_full_day && b.is_full_day) return 1;
        return (a.start_time || "").localeCompare(b.start_time || "");
      });
  }, [allExceptions, selectedDate]);

  // ==================== HANDLERS ====================
  const handleExceptionClick = (exception) => {
    setDetailsModal({ open: true, exception });
  };

  const handleCloseDetails = () => {
    setDetailsModal({ open: false, exception: null });
  };

  if (loadingAvailabilities) return <Loader text="Loading exceptions..." />;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Exception Calendar
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            View and manage all blocked slots across providers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1 text-[11px] font-semibold text-danger-700">
            <FiLock className="h-3 w-3" />
            {allExceptions.length} total blocked
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-700">
            <FiCalendar className="h-3 w-3" />
            {Object.keys(dateExceptionMap).length} dates
          </span>
        </div>
      </div>

      {/* ==================== MAIN SPLIT ==================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:gap-5">
        {/* LEFT: Month Calendar */}
        <div className="min-w-0">
          <ExceptionMonthCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dateExceptionMap={dateExceptionMap}
            activeProviderId={activeProviderId}
            allProviders={providers}
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
          />
        </div>

        {/* RIGHT: Provider Tabs + Exception List */}
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
              <ExceptionProviderTabs
                providers={providers}
                activeProviderId={activeProviderId}
                onSelectProvider={setSelectedProviderId}
              />

              <ExceptionList
                date={selectedDate}
                exceptions={selectedDateExceptions}
                provider={activeProvider}
                isLoading={loadingExceptions || fetchingExceptions}
                onExceptionClick={handleExceptionClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* ==================== DETAILS MODAL ==================== */}
      <ExceptionDetailsModal
        open={detailsModal.open}
        onClose={handleCloseDetails}
        exception={detailsModal.exception}
      />
    </div>
  );
};

export default ExceptionManagementList;
