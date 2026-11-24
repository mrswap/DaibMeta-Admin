// src/features/patent/pages/visits/components/tabs/FollowUpTab.jsx

import { useState, useEffect } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { FiPlus, FiLock, FiX, FiCheckCircle } from "react-icons/fi";
import {
  useVisitFollowUps,
  useCreateFollowUp,
} from "../../../../queries/visits";
import Loader from "../../../../common/Loader";
import CustomeTable from "../../../../common/table/CustomeTable";
import { DatePicker, TextareaField } from "../../../../common/form";
import { usePermission } from "../../../../hooks/usePermission";

// ==================== HELPERS ====================
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const shiftDate = (dateStr, days) => {
  if (!dateStr) return todayStr();
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + Number(days));
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

// Minimum selectable date = tomorrow
const tomorrowStr = () => shiftDate(todayStr(), 1);

const diffDays = (fromStr, toStr) => {
  if (!fromStr || !toStr) return null;
  const [y1, m1, d1] = fromStr.split("-").map(Number);
  const [y2, m2, d2] = toStr.split("-").map(Number);
  // Use UTC to avoid DST and timezone issues
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

// ==================== FORM INNER ====================
const FollowUpFormInner = ({ isPending, onCancel }) => {
  const { values, setFieldValue } = useFormikContext();

  // 1. Date ➔ Days Auto-fill
  useEffect(() => {
    if (!values.follow_up_date) {
      // Agar date clear ho jaye to days bhi clear kardo
      if (values.follow_up_days !== "") {
        setFieldValue("follow_up_days", "");
      }
      return;
    }

    const computed = diffDays(todayStr(), values.follow_up_date);

    // Minimum 1 day (tomorrow se start). Aaj ya past date ke liye days set nahi honge.
    if (computed != null && computed >= 1) {
      setFieldValue("follow_up_days", computed);
    } else if (values.follow_up_days !== "") {
      setFieldValue("follow_up_days", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.follow_up_date]);

  // 2. Days ➔ Date Auto-fill
  const handleDaysChange = (e) => {
    const rawValue = e.target.value;

    // Allow empty string to delete input
    if (rawValue === "") {
      setFieldValue("follow_up_days", "");
      return;
    }

    // Strict number check
    if (!/^\d+$/.test(rawValue)) return;

    const days = Number(rawValue);

    // 0 allowed nahi hai, minimum 1
    if (days < 1) return;

    // Leading zeros hata do (e.g. "05" -> "5")
    setFieldValue("follow_up_days", String(days));

    const newDate = shiftDate(todayStr(), days);
    setFieldValue("follow_up_date", newDate);
  };

  return (
    <Form className="space-y-4">
      <div className="rounded-xl border border-ink-100 bg-surface p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Follow-up Date <span className="text-form-required">*</span>
            </label>
            <DatePicker
              name="follow_up_date"
              isFormik
              placeholder="Select date"
              min={tomorrowStr()}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Follow-up Days
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                name="follow_up_days"
                value={values.follow_up_days ?? ""}
                onChange={handleDaysChange}
                placeholder="e.g. 1"
                className="w-full rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-xs text-ink-400">days</span>
              </div>
            </div>
          </div>
        </div>

        <TextareaField
          label="Clinical Notes / Instructions"
          name="notes"
          placeholder="E.g., Review after 15 days, continue current medication..."
          rows={3}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-surface shadow-sm transition-all hover:bg-brand-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiCheckCircle className="h-4 w-4" />
          {isPending ? "Submitting..." : "Submit Follow-up"}
        </button>
      </div>
    </Form>
  );
};

// ==================== MAIN ====================
const FollowUpTab = ({ visitId, canManage = false, onFollowUpCreated }) => {
  const { can } = usePermission();
  const canView = can("visits", "view");

  const [showForm, setShowForm] = useState(false);
  const createMutation = useCreateFollowUp();

  const { data: list = [], isLoading } = useVisitFollowUps(visitId, {
    enabled: !!visitId && canView,
  });

  const initialValues = {
    follow_up_date: "",
    follow_up_days: "",
    notes: "",
  };

  const validationSchema = Yup.object({
    follow_up_date: Yup.string()
      .required("Follow-up date is required")
      .test(
        "min-tomorrow",
        "Follow-up date must be from tomorrow onwards",
        (value) => !value || value >= tomorrowStr(),
      ),
    follow_up_days: Yup.mixed().test(
      "min-one-day",
      "Follow-up days must be at least 1",
      (value) =>
        value === "" ||
        value === null ||
        value === undefined ||
        Number(value) >= 1,
    ),
    notes: Yup.string().nullable(),
  });

  const handleSubmit = (values, { resetForm }) => {
    if (!canManage) return;

    const payload = {
      follow_up_date: values.follow_up_date,
      // days optional hai, lekin agar hai to minimum 1
      ...(values.follow_up_days !== "" &&
        Number(values.follow_up_days) >= 1 && {
          follow_up_days: Number(values.follow_up_days),
        }),
      notes: values.notes?.trim() || null,
    };

    createMutation.mutate(
      { visitId, payload },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
          onFollowUpCreated?.();
        },
      },
    );
  };

  const columns = [
    {
      header: "Follow-up Date",
      accessor: "follow_up_date",
      render: (v, row) => (
        <div>
          <p className="text-xs font-semibold text-ink-900">{formatDate(v)}</p>
          {row.follow_up_days != null && (
            <p className="text-[10px] text-ink-500">
              {row.follow_up_days} days from today
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Notes",
      accessor: "notes",
      render: (v) => (
        <span className="max-w-[240px] truncate text-xs text-ink-500">
          {v || "—"}
        </span>
      ),
    },
  ];

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-900">Access Denied</p>
        <p className="mt-1 max-w-sm text-xs text-ink-500">
          You do not have permission to view follow-ups.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading follow-ups..." />;

  return (
    <div className="space-y-4">
      {/* Top Bar: Sirf Add Button */}
      <div className="flex items-center justify-end gap-2">
        {canManage && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface shadow-sm hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" />
            Add Follow-up
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && canManage && (
        <div className="rounded-xl border border-ink-200 bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">New Follow-up Plan</p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="cursor-pointer rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <FollowUpFormInner
              isPending={createMutation.isPending}
              onCancel={() => setShowForm(false)}
            />
          </Formik>
        </div>
      )}

      {/* Table Section */}
      {list.length > 0 && (
        <CustomeTable
          columns={columns}
          data={list}
          emptyText="No follow-ups yet."
        />
      )}
    </div>
  );
};

export default FollowUpTab;
