import React, { useState } from "react";
import logo from "../../../../assets/daibmetalogo.jpeg";
import { PhoneInputField } from "../../common/form";

const inputCls =
  "h-11 w-full rounded-lg border border-form-border bg-form-bg px-3.5 text-sm text-form-text outline-none transition placeholder:text-form-placeholder hover:border-form-border-hover focus:border-form-border-focus focus:ring-2 focus:ring-form-ring/20";

const labelCls = "mb-1.5 block text-xs font-medium text-form-label";

const roles = [
  { id: "doctor", label: "Doctor" },
  { id: "reception", label: "Reception" },
  { id: "pharmacist", label: "Pharmacy" },
  { id: "admin", label: "Clinic Admin" },
];

const facilities = [
  { value: "metro-central", label: "Metro Central (Indiranagar)" },
  { value: "koramangala", label: "Specialty OPD Hub (Koramangala)" },
  { value: "whitefield", label: "Care Point & Diagnostics (Whitefield)" },
  { value: "virtual", label: "Telehealth & Virtual Unit" },
];

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    role: "doctor",
    facility: "metro-central",
    agreed: false,
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // TODO: send-OTP API call
      // await api.post("/auth/register/send-otp", form);
      // TODO: navigate("/verify-otp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-4 py-8">
      <div className="w-full max-w-xl rounded-xl border border-ink-200 bg-surface p-6 shadow-sm sm:p-8">
        <img
          src={logo}
          alt="DiabMeta - Diabetes, Thyroid & Obesity Clinic"
          className="mx-auto mb-6 h-24 w-auto"
        />

        <h1 className="font-jakarta text-2xl font-bold tracking-tight text-ink-900">
          Create your account
        </h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">
          Enter your details to join your clinic workspace.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="full-name" className={labelCls}>
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Dr. Priya Sharma"
              maxLength={150}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="doctor@example.com"
              maxLength={150}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputCls}
            />
          </div>

          <PhoneInputField
            name="mobile"
            label="Mobile Number"
            placeholder="Enter phone number"
            defaultCountry="IN"
            required
            isFormik={false}
            value={form.mobile}
            onChange={(val) => update("mobile", val || "")}
          />

          <div>
            <span className={labelCls}>Role</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {roles.map(({ id, label }) => {
                const active = form.role === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update("role", id)}
                    className={`h-10 cursor-pointer rounded-lg border text-[13px] font-medium transition ${
                      active
                        ? "border-brand-600 bg-brand-50 text-brand-800"
                        : "border-form-border bg-surface text-ink-600 hover:border-form-border-hover"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="facility" className={labelCls}>
              Facility / Branch
            </label>
            <select
              id="facility"
              value={form.facility}
              onChange={(e) => update("facility", e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {facilities.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-tight text-ink-600">
            <input
              type="checkbox"
              required
              checked={form.agreed}
              onChange={(e) => update("agreed", e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-form-check-accent"
            />
            <span>
              I agree to the{" "}
              <a
                href="#"
                className="cursor-pointer font-medium text-brand-700 hover:underline"
              >
                Privacy Policy
              </a>{" "}
              and terms of use.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-600 text-sm font-semibold text-surface transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending OTP..." : "Send OTP & Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-500">
          Already registered?{" "}
          <a
            href="/login"
            className="cursor-pointer font-medium text-brand-700 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
