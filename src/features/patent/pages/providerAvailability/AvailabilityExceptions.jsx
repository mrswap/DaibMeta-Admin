import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiLock,
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useProviderAvailability } from "../../queries/providerAvailabilities";
import {
  useSlotsForDate,
  useBulkSaveExceptions,
  useAvailabilityExceptions,
  useDeleteException,
  generateDates,
  formatTime12,
  formatDateFull,
  toLocalDateString,
  toShortTime,
} from "../../queries/availabilityExceptions";
import Loader from "../../common/Loader";
import { useToast } from "../../common/toast/ToastContext";

const INITIAL_VISIBLE_DATES = 30;
const LOAD_MORE_INCREMENT = 30;
const DEFAULT_REASON = "Doctor unavailable";

const AvailabilityExceptions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: availability, isLoading: loadingAvailability } =
    useProviderAvailability(id);

  const [selectedDate, setSelectedDate] = useState(null);
  const [localSlots, setLocalSlots] = useState(null);
  const [visibleDatesCount, setVisibleDatesCount] = useState(
    INITIAL_VISIBLE_DATES,
  );
  const [searchDate, setSearchDate] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveReason, setSaveReason] = useState(DEFAULT_REASON);
  const [isSaving, setIsSaving] = useState(false);

  const dateListRef = useRef(null);

  const bulkMutation = useBulkSaveExceptions();
  const deleteMutation = useDeleteException();

  const isDirty = useMemo(() => {
    if (!localSlots) return false;
    return localSlots.some((s) => s.blocked !== s.wasBlockedInitially);
  }, [localSlots]);

  const hasNewBlocks = useMemo(() => {
    if (!localSlots) return false;
    return localSlots.some(
      (s) => s.blocked === true && s.wasBlockedInitially === false,
    );
  }, [localSlots]);

  const allDates = useMemo(() => {
    if (!availability) return [];
    return generateDates(
      availability.date_from,
      availability.date_to,
      availability.days_of_week,
    );
  }, [availability]);

  const filteredDates = useMemo(() => {
    if (!searchDate) return allDates;
    return allDates.filter((d) => d.dateStr.includes(searchDate));
  }, [allDates, searchDate]);

  const visibleDates = useMemo(
    () => filteredDates.slice(0, visibleDatesCount),
    [filteredDates, visibleDatesCount],
  );

  const hasMoreDates = visibleDatesCount < filteredDates.length;

  useEffect(() => {
    if (!selectedDate && allDates.length > 0) {
      setSelectedDate(allDates[0].dateStr);
    }
  }, [allDates, selectedDate]);

  useEffect(() => {
    setVisibleDatesCount(INITIAL_VISIBLE_DATES);
  }, [searchDate]);

  const {
    data: slotsData,
    isLoading: loadingSlots,
    isFetching: fetchingSlots,
    refetch: refetchSlots,
  } = useSlotsForDate({
    adminId: availability?.provider?.id,
    appointmentTypeId: availability?.appointment_type?.id,
    date: selectedDate,
  });

  const { data: exceptionsData, refetch: refetchExceptions } =
    useAvailabilityExceptions({
      availability_id: id,
      per_page: 100,
    });

  useEffect(() => {
    if (!slotsData || !Array.isArray(slotsData)) return;

    const dateExceptions = (exceptionsData?.list || []).filter(
      (ex) => toLocalDateString(ex.exception_date) === selectedDate,
    );

    const hasFullDay = dateExceptions.some(
      (ex) => !ex.start_time && !ex.end_time,
    );

    const mergedSlots = slotsData.map((slot) => {
      const matchingEx = dateExceptions.find(
        (ex) =>
          toShortTime(ex.start_time) === slot.start_time &&
          toShortTime(ex.end_time) === slot.end_time,
      );

      const isBlocked =
        slot.available === false ||
        slot.status === "blocked" ||
        hasFullDay ||
        !!matchingEx;

      return {
        ...slot,
        blocked: isBlocked,
        exceptionId: matchingEx?.id || null,
        wasBlockedInitially: isBlocked,
      };
    });

    setLocalSlots(mergedSlots);
  }, [slotsData, exceptionsData, selectedDate]);

  const exceptionsByDate = useMemo(() => {
    const map = {};
    (exceptionsData?.list || []).forEach((ex) => {
      const d = toLocalDateString(ex.exception_date);
      if (!d) return;
      if (!map[d]) map[d] = { items: [], hasFullDay: false };
      map[d].items.push(ex);
      if (!ex.start_time && !ex.end_time) {
        map[d].hasFullDay = true;
      }
    });
    return map;
  }, [exceptionsData]);

  const toggleSlot = (idx) => {
    if (isSaving) return;
    setLocalSlots((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], blocked: !updated[idx].blocked };
      return updated;
    });
  };

  const selectAll = () => {
    if (isSaving) return;
    setLocalSlots((prev) => prev.map((s) => ({ ...s, blocked: true })));
  };

  const clearAll = () => {
    if (isSaving) return;
    setLocalSlots((prev) => prev.map((s) => ({ ...s, blocked: false })));
  };

  const handleSelectDate = (dateStr) => {
    if (isSaving) return;
    if (isDirty) {
      const ok = window.confirm("Unsaved changes will be lost. Continue?");
      if (!ok) return;
    }
    setSelectedDate(dateStr);
    setLocalSlots(null);
    setMobileListOpen(false);
  };

  const handleSaveClick = () => {
    if (!localSlots || !availability || !isDirty || isSaving) return;

    if (hasNewBlocks) {
      setSaveReason(DEFAULT_REASON);
      setSaveModalOpen(true);
    } else {
      performSave(null);
    }
  };

  const performSave = async (reason) => {
    if (!localSlots || !availability) return;

    setSaveModalOpen(false);
    setIsSaving(true);

    const trimmedReason = reason?.trim() || null;

    try {
      const dateExceptions = exceptionsByDate[selectedDate]?.items || [];
      const blockedIndices = localSlots
        .map((s, i) => (s.blocked ? i : -1))
        .filter((i) => i >= 0);

      if (blockedIndices.length === 0) {
        for (const ex of dateExceptions) {
          await deleteMutation.mutateAsync(ex.id);
        }
        toast.success("Date fully unblocked");
        await refetchExceptions();
        await refetchSlots();
        setIsSaving(false);
        return;
      }

      const allBlocked = blockedIndices.length === localSlots.length;

      for (const ex of dateExceptions) {
        await deleteMutation.mutateAsync(ex.id);
      }

      if (allBlocked) {
        await bulkMutation.mutateAsync({
          availability_id: Number(id),
          exceptions: [
            {
              exception_date: selectedDate,
              type: "blocked",
              start_time: null,
              end_time: null,
              reason: trimmedReason,
            },
          ],
        });
      } else {
        const groups = [];
        let currentGroup = [blockedIndices[0]];
        for (let i = 1; i < blockedIndices.length; i++) {
          if (blockedIndices[i] === blockedIndices[i - 1] + 1) {
            currentGroup.push(blockedIndices[i]);
          } else {
            groups.push(currentGroup);
            currentGroup = [blockedIndices[i]];
          }
        }
        groups.push(currentGroup);

        const exceptions = groups.map((group) => {
          const firstSlot = localSlots[group[0]];
          const lastSlot = localSlots[group[group.length - 1]];
          return {
            exception_date: selectedDate,
            type: "blocked",
            start_time: firstSlot.start_time,
            end_time: lastSlot.end_time,
            reason: trimmedReason,
          };
        });

        await bulkMutation.mutateAsync({
          availability_id: Number(id),
          exceptions,
        });
      }

      toast.success("Changes saved");
      await refetchExceptions();
      await refetchSlots();
    } catch (err) {
      // errors toasted
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfirm = () => {
    performSave(saveReason);
  };

  const handleSaveCancel = () => {
    setSaveModalOpen(false);
  };

  if (loadingAvailability) return <Loader text="Loading..." />;

  if (!availability) {
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm text-ink-500">Availability not found.</p>
      </div>
    );
  }

  const isAllBlocked =
    localSlots && localSlots.length > 0 && localSlots.every((s) => s.blocked);
  const isNoneBlocked =
    localSlots && localSlots.length > 0 && localSlots.every((s) => !s.blocked);

  const selectedDateInfo = exceptionsByDate[selectedDate] || {
    items: [],
    hasFullDay: false,
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <button
            onClick={() => navigate("/provider-availabilities")}
            disabled={isSaving}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Availabilities
          </button>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Manage Exceptions
          </h1>
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            Manage date-specific blocks and overrides
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiUser className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Provider
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                {availability.provider?.name}
              </p>
              <p className="text-[11px] text-ink-500">
                {availability.provider?.role_label}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <FiFileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Appointment Type
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                {availability.appointment_type?.name}
              </p>
              <p className="text-[11px] text-ink-500">
                {availability.appointment_type?.duration} min default
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warn-50 text-warn-700">
              <FiClock className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Daily Schedule
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink-900">
                {formatTime12(availability.start_time)} –{" "}
                {formatTime12(availability.end_time)}
              </p>
              <p className="text-[11px] text-ink-500">
                {availability.slot_duration} min slots · {availability.capacity}{" "}
                per slot
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiCalendar className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Availability Period
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                {availability.date_from} → {availability.date_to}
              </p>
              <p className="text-[11px] text-ink-500">
                {availability.days?.length || 0} days/week · {allDates.length}{" "}
                total
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Available Days:
            </span>
            {(availability.days || []).map((day) => (
              <span
                key={day}
                className="inline-flex rounded-md border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 sm:px-2 sm:text-[11px]"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <button
          onClick={() => !isSaving && setMobileListOpen((v) => !v)}
          disabled={isSaving}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-ink-200 bg-surface px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-ink-500" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Selected Date
              </p>
              <p className="text-sm font-semibold text-ink-900">
                {selectedDate ? formatDateFull(selectedDate) : "Pick a date"}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-brand-600">
            {mobileListOpen ? "Close" : "Change"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[280px_1fr]">
        <div
          className={`overflow-hidden rounded-xl border border-ink-100 bg-surface ${
            mobileListOpen ? "block" : "hidden"
          } lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-120px)]`}
        >
          <div className="border-b border-ink-100 bg-ink-50/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FiCalendar className="h-3.5 w-3.5 text-ink-500" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Dates ({filteredDates.length})
                </p>
              </div>
              {mobileListOpen && (
                <button
                  onClick={() => setMobileListOpen(false)}
                  disabled={isSaving}
                  className="cursor-pointer rounded-md p-1 text-ink-500 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>

            {allDates.length > 20 && (
              <div className="relative mt-2">
                <FiSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search date (YYYY-MM)"
                  value={searchDate}
                  maxLength={7}
                  onChange={(e) => setSearchDate(e.target.value)}
                  disabled={isSaving}
                  className="h-8 w-full rounded-md border border-ink-200 bg-surface pl-8 pr-2 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            )}
          </div>

          <div
            ref={dateListRef}
            className="max-h-[60vh] overflow-y-auto p-1.5 lg:max-h-[calc(100vh-260px)]"
          >
            {filteredDates.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-ink-500">No dates found</p>
              </div>
            ) : (
              <>
                {visibleDates.map((d) => {
                  const isActive = selectedDate === d.dateStr;
                  const info = exceptionsByDate[d.dateStr];
                  const isFullDay = info?.hasFullDay;
                  const hasExceptions = info?.items?.length > 0;
                  const isDisabled = isSaving;

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => handleSelectDate(d.dateStr)}
                      disabled={isDisabled}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isDisabled
                          ? ""
                          : isActive
                            ? "cursor-pointer bg-brand-50"
                            : "cursor-pointer hover:bg-ink-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md ${
                          isActive
                            ? "bg-brand-600 text-surface"
                            : "bg-ink-100 text-ink-700"
                        }`}
                      >
                        <span className="text-[7px] font-bold uppercase leading-none">
                          {d.dayName.slice(0, 3)}
                        </span>
                        <span className="mt-0.5 text-[11px] font-bold leading-none">
                          {d.dateStr.slice(8, 10)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-semibold ${
                            isActive ? "text-brand-700" : "text-ink-800"
                          }`}
                        >
                          {d.dateStr}
                        </p>
                        {isFullDay ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-danger-600">
                            <FiLock className="h-2 w-2" />
                            Blocked
                          </span>
                        ) : hasExceptions ? (
                          <span className="text-[10px] font-medium text-warn-700">
                            {info.items.length} exception
                            {info.items.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-brand-600">
                            Available
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {hasMoreDates && (
                  <button
                    type="button"
                    onClick={() =>
                      !isSaving &&
                      setVisibleDatesCount((c) => c + LOAD_MORE_INCREMENT)
                    }
                    disabled={isSaving}
                    className="mt-2 w-full cursor-pointer rounded-md border border-dashed border-ink-200 bg-surface py-2 text-xs font-medium text-ink-600 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Load more dates ({filteredDates.length - visibleDatesCount}{" "}
                    remaining)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
          {selectedDate && (
            <>
              <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 sm:text-[11px]">
                      Selected Date
                    </p>
                    <p className="mt-0.5 font-jakarta text-sm font-bold text-ink-900 sm:text-base">
                      {formatDateFull(selectedDate)}
                    </p>
                    {selectedDateInfo.items.length > 0 && (
                      <p className="mt-0.5 text-[11px] text-ink-500">
                        {selectedDateInfo.items.length} exception
                        {selectedDateInfo.items.length > 1 ? "s" : ""} applied
                      </p>
                    )}
                  </div>

                  {localSlots && localSlots.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAll}
                        disabled={isAllBlocked || isSaving}
                        className={`flex-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition sm:flex-none sm:px-3 sm:text-xs ${
                          isAllBlocked || isSaving
                            ? "cursor-not-allowed border-ink-100 bg-ink-50 text-ink-400"
                            : "cursor-pointer border-ink-200 bg-surface text-ink-600 hover:bg-ink-50"
                        }`}
                      >
                        Block All
                      </button>
                      <button
                        type="button"
                        onClick={clearAll}
                        disabled={isNoneBlocked || isSaving}
                        className={`flex-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition sm:flex-none sm:px-3 sm:text-xs ${
                          isNoneBlocked || isSaving
                            ? "cursor-not-allowed border-ink-100 bg-ink-50 text-ink-400"
                            : "cursor-pointer border-ink-200 bg-surface text-ink-600 hover:bg-ink-50"
                        }`}
                      >
                        Unblock All
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={!isDirty || isSaving}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                          !isDirty || isSaving
                            ? "cursor-not-allowed bg-ink-100 text-ink-400"
                            : "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
                        }`}
                      >
                        <FiSave className="h-3.5 w-3.5" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {localSlots && localSlots.some((s) => s.wasBlockedInitially) && (
                <div className="border-b border-ink-100 bg-warn-50/40 px-4 py-2.5 sm:px-5 sm:py-3">
                  <p className="text-[11px] text-warn-800 sm:text-xs">
                    <strong>Note:</strong> This date has existing exceptions.
                    Toggle individual slots to unblock them.
                  </p>
                </div>
              )}

              <div className="p-4 sm:p-5">
                {loadingSlots || fetchingSlots ? (
                  <Loader text="Loading slots..." />
                ) : !localSlots || localSlots.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 py-10 text-center">
                    <p className="text-sm font-medium text-ink-700">
                      No slots available
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      This date doesn't have any generated slots.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {localSlots.map((slot, idx) => {
                        const isBlocked = slot.blocked;
                        const isExisting = slot.wasBlockedInitially;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleSlot(idx)}
                            disabled={isSaving}
                            className={`flex flex-col gap-1 rounded-lg border p-2.5 text-left transition sm:p-3 ${
                              isSaving
                                ? "cursor-not-allowed opacity-60"
                                : isBlocked
                                  ? "cursor-pointer border-danger-200 bg-danger-50 hover:bg-danger-100"
                                  : "cursor-pointer border-ink-200 bg-surface hover:border-brand-200 hover:bg-brand-50/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[11px] font-semibold ${
                                  isBlocked
                                    ? "text-danger-700 line-through"
                                    : "text-ink-800"
                                }`}
                              >
                                {formatTime12(slot.start_time)}
                              </span>
                              <div
                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full sm:h-4 sm:w-4 ${
                                  isBlocked ? "bg-danger-500" : "bg-brand-500"
                                }`}
                              >
                                {isBlocked ? (
                                  <FiLock className="h-2 w-2 text-surface sm:h-2.5 sm:w-2.5" />
                                ) : (
                                  <FiCheck className="h-2 w-2 text-surface sm:h-2.5 sm:w-2.5" />
                                )}
                              </div>
                            </div>
                            <p
                              className={`truncate text-[10px] ${
                                isBlocked ? "text-danger-600" : "text-ink-500"
                              }`}
                            >
                              to {formatTime12(slot.end_time)}
                            </p>
                            {isExisting && (
                              <span className="text-[9px] font-semibold uppercase text-ink-400">
                                existing
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                        <span className="text-[11px] text-ink-600">
                          Available
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-danger-500" />
                        <span className="text-[11px] text-ink-600">
                          Blocked
                        </span>
                      </div>
                      <p className="ml-auto text-[11px] text-ink-500">
                        {isSaving ? "Saving…" : "Click a slot to toggle"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={isSaving ? undefined : handleSaveCancel}
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <FiSave className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-jakarta text-base font-bold text-ink-900">
                    Save Changes
                  </h2>
                  <p className="text-[11px] text-ink-500">
                    Confirm and add a reason
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveCancel}
                disabled={isSaving}
                className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-xs font-medium text-ink-500">Date</p>
                <p className="mt-0.5 text-sm font-semibold text-ink-900">
                  {formatDateFull(selectedDate)}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-form-label">
                  Reason
                </label>
                <input
                  type="text"
                  value={saveReason}
                  maxLength={500}
                  onChange={(e) => setSaveReason(e.target.value)}
                  placeholder="e.g. Doctor unavailable"
                  autoFocus
                  disabled={isSaving}
                  className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="mt-1 text-[11px] text-ink-500">
                  This reason will be shown against all blocked slots for this
                  date.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4">
              <button
                type="button"
                onClick={handleSaveCancel}
                disabled={isSaving}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfirm}
                disabled={isSaving}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave className="h-3.5 w-3.5" />
                {isSaving ? "Saving..." : "Confirm & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityExceptions;
