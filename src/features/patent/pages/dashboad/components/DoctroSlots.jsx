import React, { useMemo, useState } from "react";
import { FiCalendar, FiCheckCircle, FiTrash2 } from "react-icons/fi";

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */
const DAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 0, label: "Sun" },
];
const DURATIONS = [10, 15, 20, 30, 45, 60];
const MAX_RANGE_DAYS = 62;

const DAY_PRESETS = [
  { label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { label: "Mon – Sat", days: [1, 2, 3, 4, 5, 6] },
  { label: "All days", days: [0, 1, 2, 3, 4, 5, 6] },
];

const TIME_PRESETS = [
  { label: "Morning", start: "09:00", end: "13:00" },
  { label: "Evening", start: "16:00", end: "20:00" },
  { label: "Full day", start: "09:00", end: "18:00" },
];

const pad = (n) => String(n).padStart(2, "0");

// Local date <-> "YYYY-MM-DD" (timezone shift se bachne ke liye)
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDaysISO = (iso, n) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const format12 = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};

const dateShort = (iso) =>
  fromISO(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// Start minutes ki list: har slot poora duration fit hona chahiye
const buildSlots = (start, end, duration) => {
  const out = [];
  if (!start || !end) return out;
  for (
    let t = toMinutes(start);
    t + duration <= toMinutes(end);
    t += duration
  ) {
    out.push(t);
  }
  return out;
};

const periodOf = (t) =>
  t < 720 ? "Morning" : t < 1020 ? "Afternoon" : "Evening";

const sameSet = (a, b) =>
  a.length === b.length && a.every((x) => b.includes(x));

/* ─────────────────────────────────────────────────────────
   Shared classes — sirf index.css ke tokens
   ───────────────────────────────────────────────────────── */
const labelCls = "mb-1.5 block text-xs font-medium text-form-label";

const fieldBase =
  "h-11 w-full rounded-lg border bg-form-bg px-3.5 text-sm text-form-text outline-none transition focus:ring-2";
const fieldOk =
  "border-form-border hover:border-form-border-hover focus:border-form-border-focus focus:ring-form-ring/20";
const fieldErr =
  "border-form-border-error focus:border-form-border-error focus:ring-form-ring-error/20";
const field = (hasError) => `${fieldBase} ${hasError ? fieldErr : fieldOk}`;

const chipBase = "h-10 rounded-lg border text-[13px] font-medium transition";
const chipOn = "border-transparent bg-btn-primary-bg text-btn-primary-text";
const chipOff =
  "border-form-border bg-form-bg text-form-text hover:border-form-border-hover";

const Pill = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
      active
        ? "border-btn-primary-bg bg-brand-50 text-brand-800"
        : "border-form-border bg-form-bg text-form-text hover:border-form-border-hover"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, required, error, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className={labelCls}>
      {label}
      {required && <span className="ml-0.5 text-form-required">*</span>}
    </label>
    {children}
    {error && (
      <p role="alert" className="mt-1 text-xs text-form-error">
        {error}
      </p>
    )}
  </div>
);

const Section = ({ step, title, hint, children }) => (
  <section className="border-b border-ink-100 p-5 last:border-b-0 sm:p-6">
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
        {step}
      </span>
      <div>
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        {hint && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
    {children}
  </section>
);

const FormError = ({ children }) =>
  children ? (
    <p role="alert" className="mt-1.5 text-xs text-form-error">
      {children}
    </p>
  ) : null;

/* ─────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────── */
const todayStr = toISO(new Date());

const initialForm = {
  from: todayStr,
  to: todayStr,
  days: [1, 2, 3, 4, 5, 6],
  start: "09:00",
  end: "13:00",
  duration: 15,
};

const DoctorSlots = () => {
  const [form, setForm] = useState(initialForm);
  const [skipped, setSkipped] = useState([]); // preview mein hataye hue slots
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState([]); // bane hue slots (dummy, API se aayenge)
  const [saving, setSaving] = useState(false);

  // Form ke kisi bhi change par: errors + success message saaf
  const patch = (changes) => {
    setForm((f) => {
      const next = { ...f, ...changes };
      if (next.to < next.from) next.to = next.from;
      return next;
    });
    if ("start" in changes || "end" in changes || "duration" in changes)
      setSkipped([]);
    setErrors({});
    setMessage("");
  };

  const toggleDay = (id) =>
    patch({
      days: form.days.includes(id)
        ? form.days.filter((d) => d !== id)
        : [...form.days, id],
    });

  const toggleSlot = (t) =>
    setSkipped((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const slots = useMemo(
    () => buildSlots(form.start, form.end, Number(form.duration)),
    [form.start, form.end, form.duration],
  );
  const activeSlots = slots.filter((t) => !skipped.includes(t));

  const slotGroups = useMemo(
    () =>
      ["Morning", "Afternoon", "Evening"]
        .map((label) => ({
          label,
          items: slots.filter((t) => periodOf(t) === label),
        }))
        .filter((g) => g.items.length),
    [slots],
  );

  // Range mein jo dates selected days par girti hain
  const matchingDates = useMemo(() => {
    if (!form.from || !form.to || form.to < form.from) return [];
    const out = [];
    const cur = fromISO(form.from);
    const last = fromISO(form.to);
    while (cur <= last && out.length < MAX_RANGE_DAYS) {
      if (form.days.includes(cur.getDay())) out.push(toISO(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [form.from, form.to, form.days]);

  const totalSlots = activeSlots.length * matchingDates.length;

  const validate = () => {
    const e = {};
    if (!form.from) e.from = "Select a start date";
    if (!form.to) e.to = "Select an end date";
    else if (form.to < form.from)
      e.to = "End date must be on or after start date";
    else if (
      (fromISO(form.to) - fromISO(form.from)) / 86400000 >=
      MAX_RANGE_DAYS
    )
      e.to = `Maximum ${MAX_RANGE_DAYS} days at a time`;

    if (form.days.length === 0) e.days = "Select at least one day";
    else if (!e.to && matchingDates.length === 0)
      e.days = "No selected day falls in this date range";

    if (!form.start) e.start = "Required";
    if (!form.end) e.end = "Required";
    else if (form.start && toMinutes(form.end) <= toMinutes(form.start))
      e.end = "End time must be after start time";

    if (!e.start && !e.end && activeSlots.length === 0)
      e.slots = "Select at least one slot";
    return e;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (saving) return;

    const e = validate();
    setErrors(e);
    setMessage("");
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      // TODO: create slots API call
      // await api.post("/doctor/slots", { dates: matchingDates, ...form, slots: activeSlots });
      const entries = matchingDates.map((date) => ({
        id: date,
        date,
        start: form.start,
        end: form.end,
        duration: Number(form.duration),
        slots: activeSlots,
      }));
      // Same date pehle se hai to replace ho jaati hai
      setSchedule((prev) =>
        [
          ...prev.filter((s) => !matchingDates.includes(s.date)),
          ...entries,
        ].sort((a, b) => a.date.localeCompare(b.date)),
      );
      setMessage(
        `${totalSlots} slots created for ${matchingDates.length} day${matchingDates.length > 1 ? "s" : ""}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    // TODO: delete slots API call
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  const rangePresets = [
    { label: "Today", to: todayStr },
    { label: "Next 7 days", to: addDaysISO(todayStr, 6) },
    { label: "Next 30 days", to: addDaysISO(todayStr, 29) },
  ];

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          My Slots
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Create the time slots patients can book with you
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5">
        {/* LEFT: Form */}
        <form
          id="slots-form"
          onSubmit={handleSave}
          noValidate
          className="overflow-hidden rounded-card border border-ink-100 bg-surface lg:col-span-3"
        >
          {/* 1. Dates */}
          <Section
            step="1"
            title="Dates"
            hint="Pick the date range and working days"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {rangePresets.map((p) => (
                <Pill
                  key={p.label}
                  active={form.from === todayStr && form.to === p.to}
                  onClick={() => patch({ from: todayStr, to: p.to })}
                >
                  {p.label}
                </Pill>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="From" required htmlFor="from" error={errors.from}>
                <input
                  id="from"
                  type="date"
                  min={todayStr}
                  value={form.from}
                  onChange={(e) => patch({ from: e.target.value })}
                  className={field(errors.from)}
                />
              </Field>
              <Field label="To" required htmlFor="to" error={errors.to}>
                <input
                  id="to"
                  type="date"
                  min={form.from || todayStr}
                  value={form.to}
                  onChange={(e) => patch({ to: e.target.value })}
                  className={field(errors.to)}
                />
              </Field>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-form-label">
                  Working Days
                </span>
                <div className="flex gap-3">
                  {DAY_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => patch({ days: p.days })}
                      className={`text-xs font-medium hover:underline ${
                        sameSet(form.days, p.days)
                          ? "text-ink-900"
                          : "text-brand-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DAYS.map(({ id, label }) => {
                  const on = form.days.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleDay(id)}
                      className={`${chipBase} ${on ? chipOn : chipOff}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <FormError>{errors.days}</FormError>
            </div>
          </Section>

          {/* 2. Time */}
          <Section
            step="2"
            title="Time & Duration"
            hint="When you are available and how long each slot is"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {TIME_PRESETS.map((p) => (
                <Pill
                  key={p.label}
                  active={form.start === p.start && form.end === p.end}
                  onClick={() => patch({ start: p.start, end: p.end })}
                >
                  {p.label}
                </Pill>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Start Time"
                required
                htmlFor="start"
                error={errors.start}
              >
                <input
                  id="start"
                  type="time"
                  value={form.start}
                  onChange={(e) => patch({ start: e.target.value })}
                  className={field(errors.start)}
                />
              </Field>
              <Field label="End Time" required htmlFor="end" error={errors.end}>
                <input
                  id="end"
                  type="time"
                  value={form.end}
                  onChange={(e) => patch({ end: e.target.value })}
                  className={field(errors.end)}
                />
              </Field>
            </div>

            <div className="mt-4">
              <span className={labelCls}>Slot Duration</span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={Number(form.duration) === d}
                    onClick={() => patch({ duration: d })}
                    className={`${chipBase} tabular-nums ${
                      Number(form.duration) === d ? chipOn : chipOff
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* 3. Review */}
          <Section
            step="3"
            title="Review Slots"
            hint="Tap a slot to remove it, for example your lunch break"
          >
            {slots.length === 0 ? (
              <p className="rounded-lg border border-dashed border-form-border bg-form-bg-disabled px-4 py-3 text-sm text-form-help">
                Set a valid start time, end time and duration to see slots
              </p>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-ink-600">
                    <span className="font-semibold tabular-nums text-ink-900">
                      {activeSlots.length}
                    </span>{" "}
                    of {slots.length} selected
                  </span>
                  <div className="flex gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setSkipped([])}
                      className="text-brand-700 hover:underline"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkipped(slots)}
                      className="text-ink-500 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                  {slotGroups.map((g) => (
                    <div key={g.label}>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-form-help">
                        {g.label}
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {g.items.map((t) => {
                          const off = skipped.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              aria-pressed={!off}
                              onClick={() => toggleSlot(t)}
                              className={`${chipBase} tabular-nums ${
                                off
                                  ? "border-form-border-disabled bg-form-bg-disabled text-form-text-disabled line-through"
                                  : "border-btn-primary-bg bg-brand-50 text-brand-800"
                              }`}
                            >
                              {format12(t)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <FormError>{errors.slots}</FormError>
          </Section>
        </form>

        {/* RIGHT: Summary + schedule */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Summary */}
          <div className="rounded-card border border-brand-100 bg-brand-50 p-5">
            <h2 className="text-sm font-semibold text-brand-800">Summary</h2>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: "Days", value: matchingDates.length },
                { label: "Slots / day", value: activeSlots.length },
                { label: "Total slots", value: totalSlots },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-surface px-3 py-2.5"
                >
                  <p className="text-xl font-bold tabular-nums text-ink-900">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-ink-500">{s.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-brand-800">
              {matchingDates.length > 0
                ? `${dateShort(matchingDates[0])}${
                    matchingDates.length > 1
                      ? ` – ${dateShort(matchingDates[matchingDates.length - 1])}`
                      : ""
                  } · ${form.start && form.end ? `${format12(toMinutes(form.start))} – ${format12(toMinutes(form.end))}` : "—"} · ${form.duration} min`
                : "Select dates and days to see the summary"}
            </p>

            {message && (
              <p
                role="status"
                className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs font-medium text-brand-800"
              >
                <FiCheckCircle className="h-4 w-4 shrink-0" />
                {message}
              </p>
            )}

            <button
              type="submit"
              form="slots-form"
              disabled={saving}
              className="mt-4 h-11 w-full rounded-lg bg-btn-primary-bg text-sm font-semibold text-btn-primary-text transition hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Creating..." : "Create Slots"}
            </button>
          </div>

          {/* Schedule */}
          <div className="rounded-card border border-ink-100 bg-surface">
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-sm font-semibold text-ink-900">
                Your Schedule
              </h2>
              {schedule.length > 0 && (
                <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-ink-600">
                  {schedule.length} day{schedule.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {schedule.length === 0 ? (
              <div className="flex flex-col items-center gap-2 border-t border-ink-100 px-5 py-10 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                  <FiCalendar className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-ink-700">
                  No slots created yet
                </p>
                <p className="text-xs text-table-empty-text">
                  Slots you create will show up here
                </p>
              </div>
            ) : (
              <ul className="max-h-[420px] divide-y divide-ink-100 overflow-y-auto border-t border-ink-100">
                {schedule.map((s) => {
                  const d = fromISO(s.date);
                  return (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <span className="text-[10px] font-semibold uppercase leading-none">
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <span className="mt-0.5 text-lg font-bold leading-none tabular-nums">
                          {d.getDate()}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {d.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs tabular-nums text-ink-500">
                          {format12(toMinutes(s.start))} –{" "}
                          {format12(toMinutes(s.end))}
                        </p>
                        <div className="mt-1 flex gap-1.5">
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
                            {s.slots.length} slots
                          </span>
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
                            {s.duration} min
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(s.id)}
                        aria-label={`Delete slots for ${dateShort(s.date)}`}
                        className="rounded-md p-2 text-ink-500 transition hover:bg-danger-50 hover:text-danger-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSlots;
