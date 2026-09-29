import React from "react";
import { NavLink } from "react-router-dom";
import { FiActivity, FiX } from "react-icons/fi";
import {
  MdLocalHospital,
  MdUnfoldMore,
  MdOutlineDashboard,
  MdOutlineCalendarToday,
  MdOutlineDescription,
  MdOutlineBadge,
  MdOutlineInsights,
  MdOutlineMedication,
  MdOutlineReceiptLong,
  MdOutlineLocalShipping,
  MdOutlineNotificationsNone,
  MdOutlineViewCarousel,
  MdOutlineAssessment,
  MdOutlineSettings,
} from "react-icons/md";
import {
  LuUserRound,
  LuStethoscope,
  LuApple,
  LuHandHeart,
} from "react-icons/lu";

const serif = {
  fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif",
};

const menuSections = [
  {
    title: "Clinical Core",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: MdOutlineDashboard },
      {
        name: "Appointments",
        path: "/admin/appointments",
        icon: MdOutlineCalendarToday,
      },
      { name: "Patients", path: "/admin/patients", icon: LuUserRound },
      { name: "Visits", path: "/admin/visits", icon: MdOutlineDescription },
    ],
  },
  {
    title: "Care Professionals",
    items: [
      { name: "Doctors", path: "/admin/doctors", icon: LuStethoscope },
      { name: "Dietitians", path: "/admin/dietitians", icon: LuApple },
      { name: "Staff", path: "/admin/staff", icon: MdOutlineBadge },
    ],
  },
  {
    title: "Services & Commerce",
    items: [
      {
        name: "Free Services",
        path: "/admin/free-services",
        icon: LuHandHeart,
      },
      {
        name: "Health Tools",
        path: "/admin/health-tools",
        icon: MdOutlineInsights,
      },
      { name: "Products", path: "/admin/products", icon: MdOutlineMedication },
      { name: "Orders", path: "/admin/orders", icon: MdOutlineReceiptLong },
      {
        name: "Delivery",
        path: "/admin/delivery",
        icon: MdOutlineLocalShipping,
      },
    ],
  },
  {
    title: "Operations & Reports",
    items: [
      {
        name: "Notifications",
        path: "/admin/notifications",
        icon: MdOutlineNotificationsNone,
      },
      { name: "Banners", path: "/admin/banners", icon: MdOutlineViewCarousel },
      { name: "Reports", path: "/admin/reports", icon: MdOutlineAssessment },
      { name: "Settings", path: "/admin/settings", icon: MdOutlineSettings },
    ],
  },
];

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-surface border-r border-ink-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
        `}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <FiActivity className="w-5 h-5" />
            </div>
            <div>
              <h1
                style={serif}
                className="text-base font-bold text-ink-900 leading-tight"
              >
                NST Health
              </h1>
              <p className="text-xs text-ink-600 font-medium">CuraClinic OS</p>
            </div>
          </div>
          <span className="hidden lg:block w-2 h-2 rounded-full bg-brand-500"></span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-ink-400 hover:text-ink-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent-50 border border-accent-100 cursor-pointer hover:bg-accent-100 transition">
            <div className="flex items-center gap-2.5">
              <MdLocalHospital className="w-5 h-5 text-brand-600" />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-medium text-ink-600 uppercase">
                  Branch
                </span>
                <span className="text-xs font-bold text-ink-900">
                  Central Metro Clinic
                </span>
              </div>
            </div>
            <MdUnfoldMore className="w-4 h-4 text-ink-700" />
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="px-2 text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-1">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={name}
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3">
          <div className="p-3 rounded-xl bg-accent-50 border border-accent-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-ink-700 uppercase">
                System Pulse
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-700">
              <span>Sync latency</span>
              <span className="text-sm font-semibold text-ink-900">18ms</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
