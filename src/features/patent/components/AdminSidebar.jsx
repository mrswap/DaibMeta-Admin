import React from "react";
import { NavLink } from "react-router-dom";
import { FiX } from "react-icons/fi";
import {
  MdOutlineDashboard,
  MdOutlineCalendarToday,
  MdOutlineDescription,
  MdOutlineBadge,
  MdOutlineAdminPanelSettings,
  MdOutlineMiscellaneousServices,
  MdOutlineMedication,
  MdOutlineReceiptLong,
  MdOutlineLocalShipping,
  MdOutlineViewCarousel,
  MdOutlineAssessment,
  MdOutlineSettings,
  MdOutlineEventNote,
} from "react-icons/md";
import {
  LuUserRound,
  LuStethoscope,
  LuApple,
  LuHandHeart,
  LuGraduationCap,
} from "react-icons/lu";
import logo from "../../../assets/daibmetalogo.jpeg";

const menuSections = [
  {
    title: "Clinical",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: MdOutlineDashboard,
        enabled: true,
      },
      {
        name: "Patients",
        path: "/patients",
        icon: LuUserRound,
        enabled: true,
      },
      {
        name: "Appointment",
        path: "/appointment",
        icon: MdOutlineCalendarToday,
        enabled: true,
      },
      {
        name: "Appointment Types",
        path: "/appointment-types",
        icon: MdOutlineEventNote,
        enabled: true,
      },
      {
        name: "Availability",
        path: "/provider-availabilities",
        icon: MdOutlineCalendarToday,
        enabled: true,
      },
      {
        name: "Visits",
        path: "/visits",
        icon: MdOutlineDescription,
        enabled: false,
      },
    ],
  },
  {
    title: "Team",
    items: [
      {
        name: "Doctors",
        path: "/doctors",
        icon: LuStethoscope,
        enabled: false,
      },
      {
        name: "Dietitians",
        path: "/dietitians",
        icon: LuApple,
        enabled: false,
      },
      { name: "Staff", path: "/staff", icon: MdOutlineBadge, enabled: true },
      {
        name: "Roles",
        path: "/roles",
        icon: MdOutlineAdminPanelSettings,
        enabled: true,
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
        enabled: true,
      },
      {
        name: "Services",
        path: "/services",
        icon: MdOutlineMiscellaneousServices,
        enabled: false,
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        name: "Free Services",
        path: "/free-services",
        icon: LuHandHeart,
        enabled: false,
      },
      {
        name: "Products",
        path: "/products",
        icon: MdOutlineMedication,
        enabled: false,
      },
      {
        name: "Orders",
        path: "/orders",
        icon: MdOutlineReceiptLong,
        enabled: false,
      },
      {
        name: "Delivery",
        path: "/delivery",
        icon: MdOutlineLocalShipping,
        enabled: false,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        name: "Banners",
        path: "/banners",
        icon: MdOutlineViewCarousel,
        enabled: false,
      },
      {
        name: "Reports",
        path: "/reports",
        icon: MdOutlineAssessment,
        enabled: false,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: MdOutlineSettings,
        enabled: true,
      },
    ],
  },
];

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
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
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(
                  ({ name, path, icon: Icon, enabled = true }) => {
                    if (!enabled) {
                      return (
                        <div
                          key={name}
                          title="Coming soon"
                          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-400 opacity-60"
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1">{name}</span>
                          <span className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-500">
                            Soon
                          </span>
                        </div>
                      );
                    }

                    return (
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
                        {name}
                      </NavLink>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
