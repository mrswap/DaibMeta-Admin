// src/features/patent/pages/visits/components/tabs/PaymentTab.jsx

import { useState, useMemo } from "react";
import {
  FiPlus,
  FiTrash2,
  FiDollarSign,
  FiX,
  FiCheck,
  FiInfo,
} from "react-icons/fi";
import {
  useVisitPayments,
  useCreatePayment,
  PAYMENT_STATUSES,
} from "../../../../queries/visits";
import { DatePicker } from "../../../../common/form";
import Loader from "../../../../common/Loader";

// ==================== HELPERS ====================
const humanizeKey = (key) =>
  key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

// ==================== MAIN ====================
const PaymentTab = ({ visitId }) => {
  const { data: payments, isLoading } = useVisitPayments(visitId);
  const [formOpen, setFormOpen] = useState(false);

  if (isLoading) return <Loader text="Loading payments..." />;

  const list = Array.isArray(payments) ? payments : [];

  const totalReceived = list.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );
  const totalBalance = list.reduce(
    (sum, p) => sum + (Number(p.balance_amount) || 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 bg-ink-50/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FiDollarSign className="h-4 w-4 text-ink-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
            Payment &amp; Fees
          </p>
          <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
            {list.length} {list.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Add Payment
        </button>
      </div>

      {/* Totals */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-brand-200 bg-brand-50/40 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-brand-700">
              Total Received
            </p>
            <p className="mt-0.5 text-lg font-bold text-brand-800">
              ₹{totalReceived.toFixed(2)}
            </p>
          </div>
          <div
            className={`rounded-lg border px-4 py-3 ${
              totalBalance > 0
                ? "border-warn-200 bg-warn-50/40"
                : "border-ink-200 bg-ink-50/40"
            }`}
          >
            <p
              className={`text-[10px] font-medium uppercase tracking-wide ${
                totalBalance > 0 ? "text-warn-800" : "text-ink-600"
              }`}
            >
              Total Balance
            </p>
            <p
              className={`mt-0.5 text-lg font-bold ${
                totalBalance > 0 ? "text-warn-900" : "text-ink-800"
              }`}
            >
              ₹{totalBalance.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Add payment form */}
      {formOpen && (
        <PaymentForm visitId={visitId} onClose={() => setFormOpen(false)} />
      )}

      {/* Empty */}
      {list.length === 0 && !formOpen && (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiDollarSign className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm font-medium text-ink-700">No payment records</p>
          <p className="mt-1 text-xs text-ink-500">
            Add a payment entry to record fees received.
          </p>
        </div>
      )}

      {/* History */}
      {list.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Payment History
          </p>
          {list.map((payment, idx) => (
            <PaymentCard key={payment.id} payment={payment} index={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== PAYMENT FORM ====================
const PaymentForm = ({ visitId, onClose }) => {
  const createMutation = useCreatePayment();

  const [status, setStatus] = useState("paid");
  const [feeRows, setFeeRows] = useState([{ key: "", amount: "" }]);
  const [taxAmount, setTaxAmount] = useState("");
  const [amount, setAmount] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const isFree = status === "free";
  const isPending = createMutation.isPending;

  // ==================== LIVE TOTALS ====================
  const breakupTotal = useMemo(
    () =>
      feeRows.reduce((sum, r) => {
        const n = Number(r.amount) || 0;
        return sum + n;
      }, 0),
    [feeRows],
  );

  const tax = Number(taxAmount) || 0;
  const totalAmount = breakupTotal + tax;

  // ==================== HANDLERS ====================
  const handleAddRow = () => {
    setFeeRows((rows) => [...rows, { key: "", amount: "" }]);
  };

  const handleRemoveRow = (idx) => {
    setFeeRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const handleRowChange = (idx, field, value) => {
    setFeeRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  };

  const handleSubmit = () => {
    // Build breakup — only rows with both key & amount
    const breakup = {};
    feeRows.forEach((r) => {
      const k = r.key?.trim();
      const v = Number(r.amount);
      if (k && !Number.isNaN(v)) breakup[k] = v;
    });

    const payload = {
      payment_status: status,
      breakup: isFree ? {} : breakup,
      tax_amount: isFree ? 0 : tax,
      amount: isFree ? 0 : Number(amount) || 0,
      balance_amount: isFree ? 0 : Number(balanceAmount) || 0,
      remark: remark?.trim() || null,
      payment_date: paymentDate || null,
    };

    createMutation.mutate(
      { visitId, payload },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-brand-200 bg-brand-50/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-200 bg-brand-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FiDollarSign className="h-4 w-4 text-brand-700" />
          <p className="text-xs font-semibold text-brand-900">Add Payment</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="cursor-pointer rounded-md p-1 text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Payment status */}
        <div>
          <label className="mb-2 block text-xs font-medium text-form-label">
            Payment Status <span className="text-form-required">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_STATUSES.filter((p) =>
              ["paid", "unpaid", "free"].includes(p.value),
            ).map((p) => {
              const isActive = status === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setStatus(p.value)}
                  disabled={isPending}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500"
                      : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free notice */}
        {isFree && (
          <div className="flex items-start gap-2.5 rounded-lg border border-ink-200 bg-ink-50/50 px-3 py-2.5">
            <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-ink-600" />
            <p className="text-[11px] text-ink-700">
              Free visit — no fees required. Amounts will be saved as 0.
            </p>
          </div>
        )}

        {/* Fee breakup */}
        {!isFree && (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-form-label">
                  Fee Breakdown
                </label>
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-brand-200 bg-surface px-2 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiPlus className="h-3 w-3" />
                  Add Fee
                </button>
              </div>

              <div className="space-y-2">
                {feeRows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.key}
                      onChange={(e) =>
                        handleRowChange(idx, "key", e.target.value)
                      }
                      placeholder="Fee name (e.g. consultation_fee)"
                      maxLength={100}
                      disabled={isPending}
                      className="h-9 flex-1 rounded-lg border border-ink-200 bg-surface px-2.5 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) =>
                        handleRowChange(idx, "amount", e.target.value)
                      }
                      placeholder="Amount"
                      min={0}
                      disabled={isPending}
                      className="h-9 w-28 rounded-lg border border-ink-200 bg-surface px-2.5 text-xs tabular-nums outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      disabled={feeRows.length === 1 || isPending}
                      title="Remove"
                      className="cursor-pointer rounded-md p-1.5 text-danger-500 hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-1.5 text-[10px] text-ink-500">
                Use snake_case keys (e.g. consultation_fee, registration_fee,
                medicine)
              </p>
            </div>

            {/* Totals */}
            <div className="rounded-lg border border-ink-200 bg-ink-50/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-600">Breakup Total</span>
                <span className="font-semibold tabular-nums text-ink-800">
                  ₹{breakupTotal.toFixed(2)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <label className="text-xs text-ink-600">Tax Amount</label>
                <input
                  type="number"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  placeholder="0"
                  min={0}
                  disabled={isPending}
                  className="h-8 w-28 rounded-md border border-ink-200 bg-surface px-2 text-xs text-right tabular-nums outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-ink-200 pt-2 text-sm">
                <span className="font-semibold text-ink-800">Total</span>
                <span className="font-bold tabular-nums text-ink-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Amount & Balance */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-form-label">
                  Amount Received <span className="text-form-required">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min={0}
                  disabled={isPending}
                  className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm tabular-nums outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-form-label">
                  Balance Amount
                </label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="0"
                  min={0}
                  disabled={isPending}
                  className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm tabular-nums outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </>
        )}

        {/* Remark */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            Remark
          </label>
          <textarea
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Reception remark..."
            maxLength={500}
            disabled={isPending}
            className="w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-800 outline-none placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Payment date */}
        <DatePicker
          label="Payment Date (optional)"
          name="payment_date"
          isFormik={false}
          value={paymentDate}
          onChange={(v) => setPaymentDate(v || "")}
          placeholder="Select date"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-brand-200 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || (!isFree && !amount)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheck className="h-3.5 w-3.5" />
            {isPending ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== PAYMENT CARD ====================
const PaymentCard = ({ payment, index }) => {
  const statusStyles = {
    paid: "bg-brand-50 text-brand-700",
    unpaid: "bg-warn-100 text-warn-900",
    partial: "bg-accent-50 text-accent-800",
    free: "bg-ink-100 text-ink-600",
  };

  const breakup = payment.breakup || {};
  const breakupEntries = Object.entries(breakup);

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-ink-200 px-2 py-0.5 text-[10px] font-bold text-ink-700">
            #{index}
          </span>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              statusStyles[payment.payment_status] || "bg-ink-100 text-ink-600"
            }`}
          >
            {payment.payment_status || "—"}
          </span>
          {payment.payment_date && (
            <span className="text-[11px] text-ink-500">
              {formatDateTime(payment.payment_date)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Breakup */}
        {breakupEntries.length > 0 && (
          <div className="rounded-lg border border-ink-100 bg-ink-50/30 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              Fee Breakdown
            </p>
            <div className="space-y-1">
              {breakupEntries.map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-ink-600">{humanizeKey(key)}</span>
                  <span className="font-semibold tabular-nums text-ink-800">
                    ₹{Number(val).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-1.5 rounded-lg border border-ink-100 bg-ink-50/30 p-3">
          <TotalRow label="Breakup Total" value={payment.breakup_total} />
          <TotalRow label="Tax" value={payment.tax_amount} />
          <div className="border-t border-ink-200 pt-1.5">
            <TotalRow label="Total" value={payment.total_amount} bold />
          </div>
          <TotalRow label="Amount Received" value={payment.amount} />
          <TotalRow
            label="Balance"
            value={payment.balance_amount}
            highlight={Number(payment.balance_amount) > 0}
          />
        </div>

        {/* Remark */}
        {payment.remark && (
          <div className="rounded-lg border border-ink-100 bg-ink-50/30 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              Remark
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-xs text-ink-700">
              {payment.remark}
            </p>
          </div>
        )}

        {/* Audit */}
        {payment.created_by?.name && (
          <p className="text-[10px] text-ink-500">
            Created by{" "}
            <strong className="text-ink-700">{payment.created_by.name}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

// ==================== TOTAL ROW ====================
const TotalRow = ({ label, value, bold, highlight }) => (
  <div className="flex items-center justify-between text-xs">
    <span className={`text-ink-600 ${bold ? "font-semibold" : ""}`}>
      {label}
    </span>
    <span
      className={`tabular-nums ${
        bold ? "text-sm font-bold text-ink-900" : "font-medium text-ink-800"
      } ${highlight ? "text-warn-800" : ""}`}
    >
      ₹{Number(value || 0).toFixed(2)}
    </span>
  </div>
);

export default PaymentTab;
