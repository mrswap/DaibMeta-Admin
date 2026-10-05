import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/dashboad/Dashboard";
import ThemePreview from "../../../ThemePreview";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import Appointment from "../pages/appointment/Appointment";
import AddAppointment from "../pages/appointment/components/AddAppointment";
import DoctorSlots from "../pages/dashboad/components/DoctroSlots";

import SpecializationList from "../pages/specializations/SpecializationList";
import RoleList from "../pages/roles/RoleList";
import StaffList from "../pages/staff/StaffList";
import AppointmentTypeList from "../pages/appointmentTypes/AppointmentTypeList";
import SettingsPage from "../pages/settings/SettingsPage";
import PatientList from "../pages/patients/PatientList";

import AvailabilityList from "../pages/providerAvailability/AvailabilityList";
import AvailabilityWizard from "../pages/providerAvailability/AvailabilityWizard";
import AvailabilityView from "../pages/providerAvailability/AvailabilityView";
import AvailabilityExceptions from "../pages/providerAvailability/AvailabilityExceptions";

import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import ComingSoon from "../pages/ComingSoon";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* ==================== PROTECTED ROUTES ==================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<ComingSoon />} />
          <Route path="dashboard/add-slot" element={<DoctorSlots />} />
          <Route path="theme-preview" element={<ThemePreview />} />

          {/* Clinical */}
          <Route path="appointment" element={<ComingSoon />} />
          <Route path="appointment/add" element={<AddAppointment />} />
          <Route path="patients" element={<PatientList />} />

          {/* Masters */}
          <Route path="specializations" element={<SpecializationList />} />
          <Route path="appointment-types" element={<AppointmentTypeList />} />

          {/* Team */}
          <Route path="roles" element={<RoleList />} />
          <Route path="staff" element={<StaffList />} />

          {/* Provider Availability */}
          <Route
            path="provider-availabilities"
            element={<AvailabilityList />}
          />
          <Route
            path="provider-availabilities/new"
            element={<AvailabilityWizard />}
          />
          <Route
            path="provider-availabilities/:id"
            element={<AvailabilityView />}
          />
          <Route
            path="provider-availabilities/:id/edit"
            element={<AvailabilityWizard />}
          />
          <Route
            path="provider-availabilities/:id/exceptions"
            element={<AvailabilityExceptions />}
          />

          {/* Operations */}
          <Route path="settings" element={<SettingsPage />} />

          {/* ==================== 404 FALLBACK ==================== */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* ==================== GLOBAL 404 ==================== */}
      {/* For routes outside layout (or if user hits unknown route while not in app) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
