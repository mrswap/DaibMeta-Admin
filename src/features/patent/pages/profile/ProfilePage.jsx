// src/features/patent/pages/profile/ProfilePage.jsx

import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiMail, FiPhone, FiShield } from "react-icons/fi";
import { useMe, useUpdateProfile } from "../auth/queries";
import { useAuthStore } from "../../../../stores/authStore";
import { TextInput, PhoneInputField, validatePhone } from "../../common/form";
import Loader from "../../common/Loader";

// ==================== FORM BODY ====================
const ProfileFormInner = ({ isPending, onCancel }) => {
  const { values, initialValues } = useFormikContext();

  const isDirty = useMemo(
    () =>
      values.name !== initialValues.name ||
      values.email !== initialValues.email ||
      values.phone !== initialValues.phone,
    [values, initialValues],
  );

  return (
    <Form className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextInput
            label="Full Name"
            name="name"
            placeholder="Enter full name"
            maxLength={150}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email address"
            maxLength={150}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <PhoneInputField
            label="Phone Number"
            name="phone"
            placeholder="Enter phone number"
            defaultCountry="IN"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-4 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          Update Profile
        </button>
      </div>
    </Form>
  );
};

// ==================== MAIN PAGE ====================
const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const { data: meData, isLoading: meLoading } = useMe();
  const updateProfile = useUpdateProfile();

  // Sync fresh /auth/me data into authStore so navbar also updates
  useEffect(() => {
    if (meData) {
      updateUser(meData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  // Prefer fresh data from /auth/me, fallback to cached store
  const currentUser = meData || user;

  const isSuperAdmin = currentUser?.is_super_admin === true;
  const roleLabel = isSuperAdmin
    ? "Super Admin"
    : currentUser?.role?.label || "Admin";

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const initialValues = {
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Name is required")
      .max(150, "Max 150 characters"),
    email: Yup.string()
      .trim()
      .email("Invalid email address")
      .required("Email is required")
      .max(150, "Max 150 characters"),
    phone: Yup.string()
      .trim()
      .required("Phone is required")
      .test("phone", "Invalid phone number", validatePhone),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || null,
    };

    updateProfile.mutateAsync(payload).finally(() => setSubmitting(false));
  };

  if (meLoading) {
    return <Loader text="Loading profile..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My Profile</h1>
          <p className="mt-1 text-sm text-ink-500">
            View and update your account information
          </p>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* Left: Summary */}
        <div className="rounded-xl border border-ink-100 bg-surface p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-surface">
              {getInitials(currentUser?.name)}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-ink-900">
              {currentUser?.name || "Admin"}
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              {currentUser?.email || ""}
            </p>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isSuperAdmin
                  ? "bg-warn-100 text-warn-900"
                  : "bg-accent-50 text-accent-800"
              }`}
            >
              <FiShield className="h-3 w-3" />
              {roleLabel}
            </span>
          </div>

          <div className="mt-6 space-y-3 border-t border-ink-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <FiMail className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="truncate">{currentUser?.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <FiPhone className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="truncate">{currentUser?.phone || "—"}</span>
            </div>
          </div>
        </div>

        {/* Right: Edit form */}
        <div className="rounded-xl border border-ink-100 bg-surface p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-ink-900">
              Account Information
            </h3>
            <p className="mt-0.5 text-sm text-ink-500">
              Update your personal details
            </p>
          </div>

          <Formik
            key={currentUser?.id || "profile"}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            <ProfileFormInner
              isPending={updateProfile.isPending}
              onCancel={() => navigate(-1)}
            />
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
