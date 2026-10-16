// src/features/patent/components/AdminSidebar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiActivity,
  FiGrid,
  FiAlertTriangle,
  FiBriefcase,
  FiHeart,
  FiBookOpen,
  FiClipboard,
  FiBell,
  FiCamera,
  FiTrendingUp,
  FiFolder,
  FiChevronDown,
} from "react-icons/fi";
import {
  MdOutlineDashboard,
  MdOutlineBadge,
  MdOutlineAdminPanelSettings,
  MdOutlineSettings,
  MdOutlineEventNote,
} from "react-icons/md";
import { LuUserRound, LuGraduationCap } from "react-icons/lu";
import logo from "../../../assets/daibmetalogo.jpeg";

const menuSections = [
  {
    title: "Clinical",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: MdOutlineDashboard,
      },
      {
        name: "Appointments",
        path: "/appointments",
        icon: FiCalendar,
      },
      {
        name: "Booking Calendar",
        path: "/booking-calendar",
        icon: FiGrid,
      },
      {
        name: "Exception Calendar",
        path: "/exception-management",
        icon: FiAlertTriangle,
      },
      {
        name: "Visits",
        path: "/visits",
        icon: FiActivity,
      },
      {
        name: "Patients",
        path: "/patients",
        icon: LuUserRound,
      },
      {
        name: "Availability",
        path: "/provider-availabilities",
        icon: FiClock,
      },
    ],
  },
  {
    title: "Team",
    items: [
      {
        name: "Staff",
        path: "/staff",
        icon: MdOutlineBadge,
      },
      {
        name: "Roles",
        path: "/roles",
        icon: MdOutlineAdminPanelSettings,
      },
    ],
  },
  {
    title: "Masters",
    items: [
      {
        name: "Specializations",
        path: "/specializations",
        icon: LuGraduationCap,
      },
      {
        name: "Appointment Types",
        path: "/appointment-types",
        icon: MdOutlineEventNote,
      },
    ],
  },
  {
    title: "CMS",
    collapsible: true,
    icon: FiGrid,
    items: [
      {
        name: "Book Appointment",
        path: "/cms/book-appointment",
        icon: FiCalendar,
      },
      {
        name: "BMI",
        path: "/cms/bmi",
        icon: FiActivity,
      },
      {
        name: "Diabetes",
        path: "/cms/diabetes",
        icon: FiHeart,
      },
      {
        name: "Sugar",
        path: "/cms/sugar",
        icon: FiBookOpen,
      },
      {
        name: "Disease",
        path: "/cms/disease",
        icon: FiClipboard,
      },
      {
        name: "Reminder",
        path: "/cms/reminder",
        icon: FiBell,
      },
      {
        name: "Scan Food",
        path: "/cms/scan-food",
        icon: FiCamera,
      },
      {
        name: "Calories",
        path: "/cms/calories",
        icon: FiTrendingUp,
      },
      {
        name: "Records",
        path: "/cms/records",
        icon: FiFolder,
      },
      {
        name: "Period",
        path: "/cms/period",
        icon: FiCalendar,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        name: "Service Manager",
        path: "/service-manager",
        icon: FiBriefcase,
        isStatic: true,
      },
      {
        name: "Health Tips",
        path: "/health-tips",
        icon: FiHeart,
        isStatic: true,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: MdOutlineSettings,
      },
    ],
  },
];

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [cmsOpen, setCmsOpen] = useState(false);

  // Auto-open CMS if any CMS route is active
  useEffect(() => {
    if (location.pathname.startsWith("/cms")) {
      setCmsOpen(true);
    }
  }, [location.pathname]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 transform flex-col border-r border-ink-100 bg-surface transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-4">
          <img src={logo} alt="DiabMeta" className="h-12 w-auto" />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="cursor-pointer text-ink-400 hover:text-ink-700 lg:hidden"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {menuSections.map((section) => {
            // ==================== COLLAPSIBLE SECTION (CMS) ====================
            if (section.collapsible) {
              const SectionIcon = section.icon;
              const hasActiveChild = section.items.some((item) =>
                location.pathname.startsWith(
                  item.path.split("/").slice(0, 2).join("/"),
                ),
              );

              return (
                <div key={section.title}>
                  <button
                    type="button"
                    onClick={() => setCmsOpen((v) => !v)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left transition-colors ${
                      hasActiveChild
                        ? "text-brand-700"
                        : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon className="h-4 w-4 shrink-0" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {section.title}
                      </span>
                    </div>
                    <FiChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        cmsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      cmsOpen
                        ? "grid-rows-[1fr] opacity-100 mt-1"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-0.5 pl-2">
                        {section.items.map(({ name, path, icon: Icon }) => (
                          <NavLink
                            key={name}
                            to={path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-brand-50 font-semibold text-brand-700"
                                  : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                              }`
                            }
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ==================== NORMAL SECTION ====================
            return (
              <div key={section.title}>
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map(({ name, path, icon: Icon, isStatic }) => (
                    <NavLink
                      key={name}
                      to={path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-50 font-semibold text-brand-700"
                            : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                        }`
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="relative inline-block">
                        {name}
                        {isStatic && (
                          <span className="pointer-events-none absolute left-0 right-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-danger-500" />
                        )}
                      </span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
