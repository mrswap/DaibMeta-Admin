import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────
   Dummy data — baad mein API se replace karna
   ───────────────────────────────────────────────────────── */
const doctors = [
  { name: "Dr. Mehta", dept: "General Consult" },
  { name: "Dr. Rakesh", dept: "Orthopedics" },
  { name: "Dr. Ananya Sen", dept: "Gynecology" },
  { name: "Dr. Arvind Rao", dept: "Diabetology" },
  { name: "Dr. Neha Kapoor", dept: "ENT" },
];

const appointmentTypes = ["New Consultation", "Follow-up", "Walk-in"];
const genders = ["Male", "Female", "Other"];

// Already booked slots (selected doctor + date ke hisaab se API se aayenge)
const BOOKED_SLOTS = ["10:00 AM", "10:30 AM", "11:30 AM"];

const buildSlots = (fromHour, toHour) => {
  const out = [];
  for (let h = fromHour; h <= toHour; h++) {
    [0, 30].forEach((m) => {
      const h12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      out.push(
        `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`,
      );
    });
  }
  return out;
};

const SLOT_GROUPS = [
  { label: "Morning", slots: buildSlots(9, 12) },
  { label: "Evening", slots: buildSlots(16, 18) },
];

// Local date (toISOString UTC deta hai, IST mein subah date galat aa sakti hai)
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ─────────────────────────────────────────────────────────
   Shared classes — sirf index.css ke tokens
   ───────────────────────────────────────────────────────── */
const labelCls = "mb-1.5 block text-xs font-medium text-form-label";

const fieldBase =
  "w-full rounded-lg border bg-form-bg px-3.5 text-sm text-form-text outline-none transition " +
  "placeholder:text-form-placeholder focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:border-form-border-disabled disabled:bg-form-bg-disabled disabled:text-form-text-disabled";

const fieldOk =
  "border-form-border hover:border-form-border-hover focus:border-form-border-focus focus:ring-form-ring/20";
const fieldErr =
  "border-form-border-error focus:border-form-border-error focus:ring-form-ring-error/20";

const field = (hasError) => `${fieldBase} ${hasError ? fieldErr : fieldOk}`;

const chipBase =
  "h-10 rounded-lg border text-[13px] font-medium transition disabled:cursor-not-allowed";
const chipOn = "border-transparent bg-btn-primary-bg text-btn-primary-text";
const chipOff =
  "border-form-border bg-form-bg text-form-text hover:border-form-border-hover";
const chipDisabled =
  "disabled:border-form-border-disabled disabled:bg-form-bg-disabled disabled:text-form-text-disabled disabled:line-through";

const Field = ({ label, required, error, help, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className={labelCls}>
      {label}
      {required && <span className="ml-0.5 text-form-required">*</span>}
    </label>
    {children}
    {error ? (
      <p role="alert" className="mt-1 text-xs text-form-error">
        {error}
      </p>
    ) : (
      help && <p className="mt-1 text-xs text-form-help">{help}</p>
    )}
  </div>
);

const Section = ({ title, children }) => (
  <section className="border-b border-ink-100 p-5 last:border-b-0 sm:p-6">
    <h2 className="mb-4 text-sm font-semibold text-ink-900">{title}</h2>
    {children}
  </section>
);

const initialForm = {
  patientName: "",
  phone: "",
  age: "",
  gender: "Male",
  doctor: "",
  date: todayISO(),
  slot: "",
  type: "New Consultation",
  notes: "",
  notify: true,
};

const AddAppointment = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const selectedDoctor = doctors.find((d) => d.name === form.doctor);

  const validate = () => {
    const e = {};
    if (!form.patientName.trim()) e.patientName = "Patient name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (form.age && (form.age < 0 || form.age > 120))
      e.age = "Enter a valid age";
    if (!form.doctor) e.doctor = "Select a doctor";
    if (!form.date) e.date = "Select a date";
    if (!form.slot) e.slot = "Select a time slot";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (saving) return;

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      // TODO: appointment create API call
      // await api.post("/appointments", { ...form, department: selectedDoctor?.dept });
      // TODO: navigate("/admin/appointments");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4">
      {/* Header */}
      <div>
        <Link
          to="/admin/appointments"
          className="text-xs font-medium text-ink-500 hover:text-ink-900"
        >
          ← Back to Appointments
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
          Add Appointment
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Book a new appointment for a patient
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="overflow-hidden rounded-card border border-ink-100 bg-surface"
      >
        {/* Patient */}
        <Section title="Patient Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Patient Name"
              required
              htmlFor="patientName"
              error={errors.patientName}
            >
              <input
                id="patientName"
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={form.patientName}
                onChange={(e) => update("patientName", e.target.value)}
                className={`${field(errors.patientName)} h-11`}
              />
            </Field>

            <Field
              label="Phone Number"
              required
              htmlFor="phone"
              error={errors.phone}
            >
              <div className="flex">
                <span className="flex h-11 items-center rounded-l-lg border border-r-0 border-form-border bg-form-bg-disabled px-3 text-sm text-form-text-disabled">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9820144521"
                  value={form.phone}
                  onChange={(e) =>
                    update("phone", e.target.value.replace(/\D/g, ""))
                  }
                  className={`${field(errors.phone)} h-11 rounded-l-none tabular-nums`}
                />
              </div>
            </Field>

            <Field label="Age" htmlFor="age" error={errors.age}>
              <input
                id="age"
                type="number"
                min="0"
                max="120"
                placeholder="e.g. 45"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                className={`${field(errors.age)} h-11 tabular-nums`}
              />
            </Field>

            <Field label="Gender">
              <div className="grid grid-cols-3 gap-2">
                {genders.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={form.gender === g}
                    onClick={() => update("gender", g)}
                    className={`${chipBase} ${
                      form.gender === g ? chipOn : chipOff
                    } h-11`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Section>

        {/* Appointment */}
        <Section title="Appointment Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Doctor"
              required
              htmlFor="doctor"
              error={errors.doctor}
            >
              <select
                id="doctor"
                value={form.doctor}
                onChange={(e) => {
                  update("doctor", e.target.value);
                  update("slot", "");
                }}
                className={`${field(errors.doctor)} h-11 cursor-pointer`}
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Department"
              htmlFor="dept"
              help="Auto-filled from doctor"
            >
              <input
                id="dept"
                type="text"
                disabled
                value={selectedDoctor?.dept || ""}
                placeholder="—"
                className={`${field(false)} h-11`}
              />
            </Field>

            <Field label="Date" required htmlFor="date" error={errors.date}>
              <input
                id="date"
                type="date"
                min={todayISO()}
                value={form.date}
                onChange={(e) => {
                  update("date", e.target.value);
                  update("slot", "");
                }}
                className={`${field(errors.date)} h-11`}
              />
            </Field>

            <Field label="Appointment Type" htmlFor="type">
              <select
                id="type"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className={`${field(false)} h-11 cursor-pointer`}
              >
                {appointmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Time slots */}
          <div className="mt-5">
            <span className={labelCls}>
              Time Slot<span className="ml-0.5 text-form-required">*</span>
            </span>

            {!form.doctor ? (
              <p className="rounded-lg border border-dashed border-form-border bg-form-bg-disabled px-4 py-3 text-sm text-form-help">
                Select a doctor to see available slots
              </p>
            ) : (
              <div className="space-y-3">
                {SLOT_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-form-help">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {group.slots.map((slot) => {
                        const booked = BOOKED_SLOTS.includes(slot);
                        const active = form.slot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={booked}
                            aria-pressed={active}
                            onClick={() => update("slot", slot)}
                            className={`${chipBase} ${chipDisabled} tabular-nums ${
                              active ? chipOn : chipOff
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.slot && (
              <p role="alert" className="mt-1.5 text-xs text-form-error">
                {errors.slot}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mt-5">
            <Field label="Reason / Notes" htmlFor="notes">
              <textarea
                id="notes"
                rows={3}
                placeholder="Symptoms, previous history, special instructions..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className={`${field(false)} resize-none py-2.5`}
              />
            </Field>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-[13px] text-form-label">
            <input
              type="checkbox"
              checked={form.notify}
              onChange={(e) => update("notify", e.target.checked)}
              className="h-4 w-4 rounded accent-form-check-accent"
            />
            Send confirmation SMS to patient
          </label>
        </Section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 bg-ink-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleReset}
            className="h-11 rounded-lg bg-btn-secondary-bg px-5 text-sm font-semibold text-btn-secondary-text transition hover:bg-btn-secondary-bg-hover"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-lg bg-btn-primary-bg px-6 text-sm font-semibold text-btn-primary-text transition hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAppointment;
