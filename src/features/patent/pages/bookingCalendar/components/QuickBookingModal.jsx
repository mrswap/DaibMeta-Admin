// src/features/patent/pages/bookingCalendar/components/QuickBookingModal.jsx

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiX, FiUser, FiCalendar, FiClock } from "react-icons/fi";
import { useCreateAppointment } from "../../../queries/appointments";
import { PhoneInputField, validatePhone } from "../../../common/form";

const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const QuickBookingModal = ({
  open,
  onClose,
  slot,
  provider,
  appointmentTypeId,
  date,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const createMutation = useCreateAppointment();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setName("");
      setMobile("");
      setErrors({});
    }
  }, [open, slot?.start_time]);

  if (!open || !slot || !provider) return null;

  const isPending = createMutation.isPending;

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Patient name is required";
    else if (name.trim().length > 150) e.name = "Max 150 characters";
    if (!mobile) e.mobile = "Mobile number is required";
    else if (!validatePhone(mobile)) e.mobile = "Invalid mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      patient_id: null,
      provider_id: provider.id,
      appointment_type_id: appointmentTypeId,
      name: name.trim(),
      mobile: mobile.trim(),
      appointment_date: date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      booking_source: "reception",
      status: "booked",
      notes: null,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        // Refetch booking calendar's booked slots + availabilities
        queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
        onSuccess();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FiCalendar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-jakarta text-base font-bold text-ink-900">
                Quick Booking
              </h2>
              <p className="text-[11px] text-ink-500">
                Book this slot for a patient
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Slot summary */}
        <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-3">
          <div className="grid grid-cols-1 gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <FiUser className="h-3 w-3 shrink-0 text-ink-400" />
              <span className="font-semibold text-ink-800">
                {provider.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="h-3 w-3 shrink-0 text-ink-400" />
              <span className="font-semibold text-ink-800">
                {formatDate(date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="h-3 w-3 shrink-0 text-ink-400" />
              <span className="font-semibold text-ink-800">
                {formatTime12(slot.start_time)} – {formatTime12(slot.end_time)}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Patient Name <span className="text-form-required">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="Enter patient name"
              maxLength={150}
              disabled={isPending}
              autoFocus
              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-form-error">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <PhoneInputField
            name="mobile"
            label="Mobile Number"
            placeholder="Enter phone number"
            defaultCountry="IN"
            required
            isFormik={false}
            value={mobile}
            onChange={(val) => {
              setMobile(val || "");
              if (errors.mobile) setErrors((p) => ({ ...p, mobile: "" }));
            }}
          />
          {errors.mobile && (
            <p className="-mt-3 text-xs text-form-error">{errors.mobile}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickBookingModal;
