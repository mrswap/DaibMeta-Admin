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

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected */}
      <Route path="/" element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/add-slot" element={<DoctorSlots />} />
        <Route path="/theme-preview" element={<ThemePreview />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/appointment/add" element={<AddAppointment />} />

        {/* Clinical */}
        <Route path="/patients" element={<PatientList />} />

        {/* Masters */}
        <Route path="/specializations" element={<SpecializationList />} />
        <Route path="/appointment-types" element={<AppointmentTypeList />} />

        {/* Team */}
        <Route path="/roles" element={<RoleList />} />
        <Route path="/staff" element={<StaffList />} />

        {/* Provider Availability */}
        <Route path="/provider-availabilities" element={<AvailabilityList />} />
        <Route
          path="/provider-availabilities/new"
          element={<AvailabilityWizard />}
        />
        <Route
          path="/provider-availabilities/:id"
          element={<AvailabilityView />}
        />
        <Route
          path="/provider-availabilities/:id/edit"
          element={<AvailabilityWizard />}
        />
        <Route
          path="/provider-availabilities/:id/exceptions"
          element={<AvailabilityExceptions />}
        />

        {/* Operations */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
