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

// Service Manager Imports
import ServiceManagerList from "../pages/serviceManager/ServiceManagerList";
import ServiceManagerView from "../pages/serviceManager/ServiceManagerView";
import ServiceManagerForm from "../pages/serviceManager/ServiceManagerForm";
import ServiceItemForm from "../pages/serviceManager/ServiceItemForm";
import ServiceLeadList from "../pages/serviceManager/leads/ServiceLeadList";
import ServiceLeadDetails from "../pages/serviceManager/leads/ServiceLeadDetails";

import HealthTipsList from "../pages/healthTips/HealthTipsList";
import HealthTipsView from "../pages/healthTips/HealthTipsView";
import HealthTipsForm from "../pages/healthTips/HealthTipsForm";

import HealthPackagesList from "../pages/healthPackages/HealthPackagesList";
import HealthPackagesView from "../pages/healthPackages/HealthPackagesView";
import HealthPackagesForm from "../pages/healthPackages/HealthPackagesForm";

// ==================== CMS IMPORTS ====================
import BookAppointmentUI from "../pages/cms/BookAppointment/BookAppointmentUI";
import BmiUI from "../pages/cms/Bmi/BmiUI";
import DiabetesUI from "../pages/cms/Diabetes/DiabetesUI";
import SugarUI from "../pages/cms/Sugar/SugarUI";

import DiseaseUI from "../pages/cms/Disease/DiseaseUI";
import DiseaseList from "../pages/cms/Disease/DiseaseList";
import DiseaseForm from "../pages/cms/Disease/DiseaseForm";

import SymptomsUI from "../pages/cms/Symptoms/SymptomsUI";
import SymptomsList from "../pages/cms/Symptoms/SymptomsList";
import SymptomsForm from "../pages/cms/Symptoms/SymptomsForm";

import PeriodUI from "../pages/cms/Period/PeriodUI";
import PeriodHealthGuide from "../pages/cms/Period/PeriodHealthGuide";
import PeriodForm from "../pages/cms/Period/PeriodForm";

import ReminderUI from "../pages/cms/Reminder/ReminderUI";
import ScanFoodUI from "../pages/cms/ScanFood/ScanFoodUI";
import CaloriesUI from "../pages/cms/Calories/CaloriesUI";
import RecordsUI from "../pages/cms/Records/RecordsUI";

import BannerList from "../pages/cms/banners/BannerList";
import BannerForm from "../pages/cms/banners/BannerForm";

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
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="appointments/book" element={<AppointmentBooking />} />
          <Route path="appointments/:id" element={<AppointmentView />} />
          <Route path="appointments/:id/edit" element={<AppointmentEdit />} />
          <Route path="booking-calendar" element={<BookingCalendar />} />
          <Route
            path="exception-management"
            element={<ExceptionManagementList />}
          />
          <Route path="visits" element={<VisitList />} />
          <Route path="visits/new" element={<VisitNew />} />
          <Route path="visits/:id" element={<VisitDetail />} />
          <Route path="visits/:id/edit" element={<VisitEdit />} />
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

          {/* ==================== Service Manager & Packages ==================== */}
          <Route path="service-manager" element={<ServiceManagerList />} />
          <Route path="service-manager/new" element={<ServiceManagerForm />} />
          <Route path="service-manager/leads" element={<ServiceLeadList />} />
          <Route
            path="service-manager/leads/:id"
            element={<ServiceLeadDetails />}
          />
          <Route path="service-manager/:id" element={<ServiceManagerView />} />
          <Route
            path="service-manager/:id/edit"
            element={<ServiceManagerForm />}
          />
          <Route
            path="service-manager/:id/items/new"
            element={<ServiceItemForm />}
          />
          <Route
            path="service-manager/:id/items/:itemId/edit"
            element={<ServiceItemForm />}
          />

          <Route path="health-packages" element={<HealthPackagesList />} />
          <Route path="health-packages/new" element={<HealthPackagesForm />} />
          <Route path="health-packages/:id" element={<HealthPackagesView />} />
          <Route
            path="health-packages/:id/edit"
            element={<HealthPackagesForm />}
          />

          <Route path="health-tips" element={<HealthTipsList />} />
          <Route path="health-tips/new" element={<HealthTipsForm />} />
          <Route path="health-tips/:id" element={<HealthTipsView />} />
          <Route path="health-tips/:id/edit" element={<HealthTipsForm />} />

          {/* ==================== CMS (Patient App) ==================== */}
          <Route path="cms/banners" element={<BannerList />} />
          <Route path="cms/banners/new" element={<BannerForm />} />
          <Route path="cms/banners/:id/edit" element={<BannerForm />} />

          <Route path="cms/book-appointment" element={<BookAppointmentUI />} />
          <Route path="cms/bmi" element={<BmiUI />} />
          <Route path="cms/diabetes" element={<DiabetesUI />} />
          <Route path="cms/sugar" element={<SugarUI />} />

          <Route path="cms/disease" element={<DiseaseUI />} />
          <Route path="cms/disease/list" element={<DiseaseList />} />
          <Route path="cms/disease/:id" element={<DiseaseForm />} />

          <Route path="cms/symptoms" element={<SymptomsUI />} />
          <Route path="cms/symptoms/list" element={<SymptomsList />} />
          <Route path="cms/symptoms/:id" element={<SymptomsForm />} />

          <Route path="cms/period" element={<PeriodUI />} />
          <Route
            path="cms/period/health-guide"
            element={<PeriodHealthGuide />}
          />
          <Route path="cms/period/:id" element={<PeriodForm />} />

          <Route path="cms/reminder" element={<ReminderUI />} />
          <Route path="cms/scan-food" element={<ScanFoodUI />} />
          <Route path="cms/calories" element={<CaloriesUI />} />
          <Route path="cms/records" element={<RecordsUI />} />

          {/* ==================== Team & Masters ==================== */}
          <Route path="staff" element={<StaffList />} />
          <Route path="roles" element={<RoleList />} />
          <Route path="specializations" element={<SpecializationList />} />
          <Route path="appointment-types" element={<AppointmentTypeList />} />
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
