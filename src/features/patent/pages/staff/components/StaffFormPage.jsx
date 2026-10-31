// src/features/patent/pages/staff/components/StaffFormPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUser, FiBriefcase } from "react-icons/fi";
import {
  useStaffMember,
  useCreateStaff,
  useUpdateStaff,
} from "../../../queries/staff";
import { useRoles } from "../../../queries/roles";
import { useActiveSpecializations } from "../../../queries/specializations";
import {
  TextInput,
  SelectField,
  MultiSelectField,
  ToggleSwitch,
  PhoneInputField,
  validatePhone,
} from "../../../common/form";
import Loader from "../../../common/Loader";
import ProfessionalProfileTab from "./ProfessionalProfileTab";

const StaffFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState("basic");

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();

  // Roles dropdown
  const { data: rolesData } = useRoles({ per_page: 100 });
  const roles = rolesData?.list || [];

  // Specializations dropdown (only active)
  const { data: specializationsData } = useActiveSpecializations();
  const specializations = specializationsData || [];

  // Edit mode: load staff details
  const { data: staffData, isLoading: isStaffLoading } = useStaffMember(
    isEdit ? id : null,
  );

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: `${r.label} (${r.name})`,
  }));

  const specializationOptions = specializations.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const isPending = createMutation.isPending || updateMutation.isPending;

  const isProvider = staffData?.role?.is_provider === true;

  // Reset to basic tab if not provider
  useEffect(() => {
    if (activeTab === "profile" && !isProvider) {
      setActiveTab("basic");
    }
  }, [activeTab, isProvider]);

  // Edit mode: role object
  const getRoleObject = () => {
    const roleId = staffData?.role_id || staffData?.role?.id;
    if (!roleId) return null;
    const roleObj = roles.find((r) => r.id === roleId);
    return roleObj
      ? { value: roleObj.id, label: `${roleObj.label} (${roleObj.name})` }
      : null;
  };

  // Edit mode: specializations array of objects
  const getSpecializationObjects = () => {
    if (
      !staffData?.specializations ||
      !Array.isArray(staffData.specializations)
    )
      return [];
    return staffData.specializations.map((s) => ({
      value: s.id,
      label: s.name,
    }));
  };

  const initialValues = {
    name: staffData?.name || "",
    email: staffData?.email || "",
    phone: staffData?.phone || "",
    password: "",
    password_confirmation: "",
    role_id: getRoleObject(),
    specializations: getSpecializationObjects(),
    status: staffData?.status ?? true,
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
    password: isEdit
      ? Yup.string()
          .nullable()
          .min(8, "Min 8 characters")
          .max(128, "Max 128 characters")
      : Yup.string()
          .required("Password is required")
          .min(8, "Min 8 characters")
          .max(128, "Max 128 characters"),
    password_confirmation: isEdit
      ? Yup.string()
          .nullable()
          .oneOf([Yup.ref("password")], "Passwords must match")
      : Yup.string()
          .required("Confirm password is required")
          .oneOf([Yup.ref("password")], "Passwords must match"),
    role_id: Yup.object().nullable().required("Role is required"),
    specializations: Yup.array().nullable(),
    status: Yup.boolean(),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role_id: values.role_id?.value,
      status: values.status,
      specializations: (values.specializations || []).map((s) => s.value),
    };

    if (values.password) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    if (isEdit) {
      updateMutation
        .mutateAsync({ id, payload })
        .then(() => navigate(`/staff/${id}`))
        .catch(() => setSubmitting(false));
    } else {
      createMutation
        .mutateAsync(payload)
        .then((res) => {
          // Backend response me naya staff id milta hai -> edit page pe redirect
          const newId =
            res?.data?.id || res?.id || res?.data?.staff?.id || null;
          if (newId) {
            navigate(`/staff/${newId}/edit`, { replace: true });
          } else {
            navigate("/staff", { replace: true });
          }
        })
        .catch(() => setSubmitting(false));
    }
  };

  // Edit mode loading
  if (isEdit && isStaffLoading) {
    return <Loader text="Loading staff details..." />;
  }

  // Edit mode: staff not found
  if (isEdit && !isStaffLoading && !staffData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/staff")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Staff Not Found
          </h1>
        </div>
        <div className="rounded-card border border-ink-100 bg-surface p-10 text-center">
          <p className="text-sm text-ink-500">
            The staff member you are trying to edit does not exist.
          </p>
          <button
            onClick={() => navigate("/staff")}
            className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Back to Staff
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/staff")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              {isEdit ? "Edit Staff" : "Add Staff"}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {isEdit
                ? `Update details for ${staffData?.name || "staff member"}`
                : "Create a new staff member account"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/staff")}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 sm:self-auto"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to List
        </button>
      </div>

      {/* Tabs — sirf edit mode + provider */}
      {isEdit && isProvider && (
        <div className="flex border-b border-ink-200">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "basic"
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            <FiUser className="h-4 w-4" /> Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            <FiBriefcase className="h-4 w-4" /> Professional Profile
          </button>
        </div>
      )}

      {/* Content */}
      <div className="rounded-card border border-ink-100 bg-surface p-6">
        {activeTab === "profile" && isEdit && isProvider ? (
          <ProfessionalProfileTab providerId={staffData.id} />
        ) : (
          <Formik
            key={id || "new"}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Basic Information
                </p>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <TextInput
                      label="Full Name"
                      name="name"
                      placeholder="Enter full name"
                      maxLength={150}
                      required
                    />
                  </div>

                  <TextInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    maxLength={150}
                    required
                  />

                  <PhoneInputField
                    label="Phone"
                    name="phone"
                    placeholder="Enter phone number"
                    defaultCountry="IN"
                    required
                  />

                  <div className="sm:col-span-2">
                    <SelectField
                      label="Role"
                      name="role_id"
                      options={roleOptions}
                      placeholder="Select role"
                      required
                    />
                  </div>

                  <TextInput
                    label={
                      isEdit ? "New Password (leave blank to keep)" : "Password"
                    }
                    name="password"
                    type="password"
                    placeholder={isEdit ? "Leave blank" : "Enter password"}
                    maxLength={128}
                    required={!isEdit}
                  />

                  <TextInput
                    label="Confirm Password"
                    name="password_confirmation"
                    type="password"
                    placeholder="Re-enter password"
                    maxLength={128}
                    required={!isEdit}
                  />
                </div>

                <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Specializations (Optional)
                </p>
                <MultiSelectField
                  label="Assigned Specializations"
                  name="specializations"
                  options={specializationOptions}
                  placeholder="Select specializations"
                />
                <p className="-mt-3 mb-4 text-xs text-form-help">
                  Optional — any staff member can have 0, 1 or multiple
                  specializations
                </p>

                <ToggleSwitch
                  name="status"
                  label="Status"
                  description="Toggle to activate or deactivate"
                />

                <div className="mt-4 flex justify-end gap-3 border-t border-ink-100 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/staff")}
                    disabled={isPending || isSubmitting}
                    className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || isSubmitting}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-4 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {(isPending || isSubmitting) && (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {isEdit ? "Update" : "Create"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default StaffFormPage;
