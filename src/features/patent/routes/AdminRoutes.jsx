// src/features/patent/routes/AdminRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/dashboad/Dashboard";
import ThemePreview from "../../../ThemePreview";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";

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

import AppointmentList from "../pages/appointments/AppointmentList";
import AppointmentBooking from "../pages/appointments/AppointmentBooking";
import AppointmentView from "../pages/appointments/AppointmentView";
import AppointmentEdit from "../pages/appointments/AppointmentEdit";

import VisitList from "../pages/visits/VisitList";
import VisitNew from "../pages/visits/VisitNew";
import VisitEdit from "../pages/visits/VisitEdit";
import VisitDetail from "../pages/visits/VisitDetail";

import BookingCalendar from "../pages/bookingCalendar/BookingCalendar";
import ExceptionManagementList from "../pages/exceptionManagement/ExceptionManagementList";

import NotFound from "../pages/NotFound";
import ComingSoon from "../pages/ComingSoon";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

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

          {/* ==================== Dashboard ==================== */}
          <Route path="dashboard" element={<ComingSoon />} />
          <Route path="theme-preview" element={<ThemePreview />} />

          {/* ==================== Clinical ==================== */}
          <Route path="patients" element={<PatientList />} />

          {/* ==================== Appointments ==================== */}
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="appointments/book" element={<AppointmentBooking />} />
          <Route path="appointments/:id" element={<AppointmentView />} />
          <Route path="appointments/:id/edit" element={<AppointmentEdit />} />

          {/* ==================== Booking Calendar ==================== */}
          <Route path="booking-calendar" element={<BookingCalendar />} />

          {/* ==================== Exception Management ==================== */}
          <Route
            path="exception-management"
            element={<ExceptionManagementList />}
          />

          {/* ==================== Visits ==================== */}
          <Route path="visits" element={<VisitList />} />
          <Route path="visits/new" element={<VisitNew />} />
          <Route path="visits/:id" element={<VisitDetail />} />
          <Route path="visits/:id/edit" element={<VisitEdit />} />

          {/* ==================== Provider Availability ==================== */}
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

          {/* ==================== Team ==================== */}
          <Route path="staff" element={<StaffList />} />
          <Route path="roles" element={<RoleList />} />

          {/* ==================== Masters ==================== */}
          <Route path="specializations" element={<SpecializationList />} />
          <Route path="appointment-types" element={<AppointmentTypeList />} />

          {/* ==================== Operations ==================== */}
          <Route path="settings" element={<SettingsPage />} />

          {/* ==================== 404 FALLBACK ==================== */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* ==================== GLOBAL 404 ==================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
