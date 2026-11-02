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
  FiClipboard,
  FiBell,
  FiCamera,
  FiTrendingUp,
  FiFolder,
  FiChevronDown,
  FiPackage,
  FiDroplet,
  FiImage,
  FiMonitor,
  FiUsers,
  FiShoppingBag,
  FiShield,
  FiHelpCircle,
  FiList,
  FiAward,
} from "react-icons/fi";
import {
  MdOutlineDashboard,
  MdOutlineBadge,
  MdOutlineAdminPanelSettings,
  MdOutlineSettings,
  MdOutlineEventNote,
} from "react-icons/md";
import { LuUserRound, LuGraduationCap } from "react-icons/lu";
import {
  TbCategory,
  TbCategory2,
  TbBox,
  TbReceiptRupee,
  TbUserSquareRounded,
  TbLayoutBoard,
} from "react-icons/tb";

import logo from "../../../assets/daibmetalogo.jpeg";

const menuSections = [
  {
    title: "Clinical",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: MdOutlineDashboard },
      { name: "Appointments", path: "/appointments", icon: FiCalendar },
      { name: "Booking Calendar", path: "/booking-calendar", icon: FiGrid },
      {
        name: "Exception Calendar",
        path: "/exception-management",
        icon: FiAlertTriangle,
      },
      { name: "Visits", path: "/visits", icon: FiActivity },
      { name: "Patients", path: "/patients", icon: LuUserRound },
      { name: "Availability", path: "/provider-availabilities", icon: FiClock },
    ],
  },
  {
    title: "Team",
    items: [
      { name: "Staff", path: "/staff", icon: MdOutlineBadge },
      { name: "Roles", path: "/roles", icon: MdOutlineAdminPanelSettings },
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
    title: "Operations",
    items: [
      {
        name: "Health Quiz",
        collapsible: true,
        icon: FiHelpCircle,
        items: [
          {
            name: "Questions",
            path: "/health-quiz/questions",
            icon: FiList,
          },
          {
            name: "History",
            path: "/health-quiz/history",
            icon: FiClock,
          },
          {
            name: "Leaderboard",
            path: "/health-quiz/leaderboard",
            icon: FiAward,
          },
        ],
      },
      {
        name: "CMS",
        collapsible: true,
        icon: FiMonitor,
        items: [
          {
            name: "Book Appointment",
            path: "/cms/book-appointment",
            icon: FiCalendar,
          },
          { name: "BMI", path: "/cms/bmi", icon: FiActivity },
          { name: "Diabetes", path: "/cms/diabetes", icon: FiHeart },
          { name: "BP and Sugar", path: "/cms/sugar", icon: FiDroplet },
          {
            name: "Know Your Diseases",
            path: "/cms/disease",
            icon: FiClipboard,
          },
          {
            name: "Know Your Symptoms",
            path: "/cms/symptoms",
            icon: FiAlertTriangle,
          },
          { name: "Pill Reminder", path: "/cms/reminder", icon: FiBell },
          { name: "Scan Food", path: "/cms/scan-food", icon: FiCamera },
          { name: "Calories", path: "/cms/calories", icon: FiTrendingUp },
          { name: "Records", path: "/cms/records", icon: FiFolder },
          { name: "Period Tracker", path: "/cms/period", icon: FiCalendar },
          { name: "Banners", path: "/cms/banners", icon: FiImage },
          {
            name: "Clinical Privileges",
            path: "/cms/clinical-privileges",
            icon: FiShield,
          },
        ],
      },
      {
        name: "Store",
        collapsible: true,
        icon: FiShoppingBag,
        items: [
          {
            name: "Flash Cards",
            path: "/store/flash-cards",
            icon: TbLayoutBoard,
          },
          { name: "Category", path: "/store/categories", icon: TbCategory },
          {
            name: "Subcategory",
            path: "/store/subcategories",
            icon: TbCategory2,
          },
          { name: "Product", path: "/store/products", icon: TbBox },
          { name: "Charges", path: "/store/charges", icon: TbReceiptRupee },
          { name: "Leads", path: "/store/leads", icon: FiUsers },
          {
            name: "Seller Info",
            path: "/store/seller",
            icon: TbUserSquareRounded,
          },
        ],
      },
      {
        name: "Service Manager",
        collapsible: true,
        icon: FiBriefcase,
        items: [
          {
            name: "Health Packages",
            path: "/health-packages",
            icon: FiPackage,
          },
          { name: "Services", path: "/service-manager", icon: FiBriefcase },
          {
            name: "Service Leads",
            path: "/service-manager/leads",
            icon: FiUsers,
          },
        ],
      },
      { name: "Health Tips", path: "/health-tips", icon: FiHeart },
      { name: "Settings", path: "/settings", icon: MdOutlineSettings },
    ],
  },
];

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    "Health Quiz": false,
    CMS: false,
    Store: false,
    "Service Manager": false,
  });

  useEffect(() => {
    if (location.pathname.startsWith("/health-quiz")) {
      setOpenSections((prev) => ({ ...prev, "Health Quiz": true }));
    }
    if (location.pathname.startsWith("/cms")) {
      setOpenSections((prev) => ({ ...prev, CMS: true }));
    }
    if (location.pathname.startsWith("/store")) {
      setOpenSections((prev) => ({ ...prev, Store: true }));
    }
    if (
      location.pathname.startsWith("/health-packages") ||
      location.pathname.startsWith("/service-manager")
    ) {
      setOpenSections((prev) => ({ ...prev, "Service Manager": true }));
    }
  }, [location.pathname]);

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderCollapsible = (item) => {
    const isOpen = openSections[item.name];
    const hasActiveChild = item.items.some((child) =>
      location.pathname.startsWith(child.path.split("/").slice(0, 2).join("/")),
    );

    return (
      <div key={item.name} className="mb-1">
        <button
          type="button"
          onClick={() => toggleSection(item.name)}
          className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
            hasActiveChild
              ? "text-brand-700 font-semibold"
              : "text-ink-700 hover:bg-ink-50 hover:text-ink-900 font-medium"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="text-sm">{item.name}</span>
          </div>
          <FiChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="space-y-0.5 pl-9">
              {item.items.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
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
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 transform flex-col border-r border-ink-100 bg-surface transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
                {section.items.map((item) => {
                  if (item.collapsible) return renderCollapsible(item);
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-50 font-semibold text-brand-700"
                            : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
