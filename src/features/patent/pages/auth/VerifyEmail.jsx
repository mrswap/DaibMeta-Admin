import React, { useEffect, useRef, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import logo from "../../../../assets/daibmetalogo.jpeg";
import { useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 48;

const VerifyEmail = ({ phone = "+91 98201 •••21" }) => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  // Resend countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const focusAt = (i) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    setError("");
    setDigits((d) => d.map((x, idx) => (idx === i ? val : x)));
    if (val && i < OTP_LENGTH - 1) focusAt(i + 1);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) focusAt(i - 1);
    if (e.key === "ArrowLeft" && i > 0) focusAt(i - 1);
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) focusAt(i + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");
    if (!pasted.length) return;
    setError("");
    setDigits(Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] || ""));
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleResend = (channel) => {
    // TODO: resend OTP API call (channel: "sms" | "whatsapp")
    setDigits(Array(OTP_LENGTH).fill(""));
    setTimeLeft(RESEND_SECONDS);
    focusAt(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError("Enter all 6 digits.");
      focusAt(digits.findIndex((d) => !d));
      return;
    }

    setLoading(true);
    try {
      // TODO: verify-OTP API call
      // await api.post("/auth/verify-otp", { code });
      // TODO: navigate("/dashboard");
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleVerify = () => {
    // TODO: OTP login flow
    navigate("/dashboard");
  };

  const canResend = timeLeft <= 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-4">
      <div className="w-full max-w-md rounded-xl border border-ink-200 bg-surface p-6 shadow-sm sm:p-8">
        <img
          src={logo}
          alt="DiabMeta - Diabetes, Thyroid & Obesity Clinic"
          className="mx-auto mb-6 h-24 w-auto"
        />

        <a
          href="/register"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-ink-600 hover:text-brand-700"
        >
          <MdArrowBack size={16} />
          Back
        </a>

        <h1 className="font-jakarta text-2xl font-bold tracking-tight text-ink-900">
          Verify OTP
        </h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold tabular-nums text-ink-900">
            {phone}
          </span>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex justify-between gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                autoFocus={i === 0}
                maxLength={1}
                aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                value={digit}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={`h-14 w-full rounded-lg border bg-form-bg text-center text-xl font-bold tabular-nums text-form-text outline-none transition focus:ring-2 ${
                  error
                    ? "border-form-border-error focus:ring-form-ring-error/20"
                    : "border-form-border focus:border-form-border-focus focus:ring-form-ring/20"
                }`}
              />
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-2 text-xs font-medium text-form-error"
            >
              {error}
            </p>
          )}

          <div className="my-5 flex items-center justify-between text-[13px] text-ink-600">
            <span>
              {canResend ? (
                "Didn't get the code?"
              ) : (
                <>
                  Resend in{" "}
                  <span className="font-semibold tabular-nums text-ink-900">
                    00:{String(timeLeft).padStart(2, "0")}
                  </span>
                </>
              )}
            </span>
            <div className="flex items-center gap-3 font-medium">
              <button
                type="button"
                disabled={!canResend}
                onClick={() => handleResend("sms")}
                className="text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline"
              >
                SMS
              </button>
              <button
                type="button"
                disabled={!canResend}
                onClick={() => handleResend("whatsapp")}
                className="text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline"
              >
                WhatsApp
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={handleVerify}
            className="h-11 w-full rounded-lg bg-brand-600 text-sm font-semibold text-surface transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
