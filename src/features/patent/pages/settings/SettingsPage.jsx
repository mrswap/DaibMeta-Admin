import { useState } from "react";
import {
  FiHome,
  FiImage,
  FiAlignLeft,
  FiSmartphone,
  FiUser,
  FiCalendar,
  FiMail,
  FiCpu,
  FiActivity,
  FiRefreshCw,
  FiSliders,
  FiLock,
} from "react-icons/fi";
import { useSettings, groupSettings } from "../../queries/settings";
import SettingsGroupTab from "./components/SettingsGroupTab";
import SettingsSkeleton from "./components/SettingsSkeleton";

const GROUP_CONFIG = [
  {
    key: "clinic",
    label: "Clinic",
    description: "Basic clinic information and contact details",
    icon: FiHome,
  },
  {
    key: "branding",
    label: "Branding",
    description: "Logos, favicon, and app name",
    icon: FiImage,
  },
  {
    key: "footer",
    label: "Footer",
    description: "Footer text and powered by settings",
    icon: FiAlignLeft,
  },
  {
    key: "app",
    label: "App",
    description: "Mobile app configuration and version info",
    icon: FiSmartphone,
  },
  {
    key: "admin",
    label: "Admin Panel",
    description: "Admin panel display and preferences",
    icon: FiUser,
  },
  {
    key: "appointment",
    label: "Appointment",
    description: "Booking, slot, and cancellation rules",
    icon: FiCalendar,
  },
  {
    key: "smtp",
    label: "SMTP",
    description: "Email server configuration",
    icon: FiMail,
    restricted: true,
  },
  {
    key: "openai",
    label: "OpenAI",
    description: "AI integration configuration",
    icon: FiCpu,
    restricted: true,
  },
  {
    key: "firebase",
    label: "Firebase",
    description: "Push notification and analytics config",
    icon: FiActivity,
    restricted: true,
  },
];

const SettingsPage = () => {
  const [activeGroup, setActiveGroup] = useState("clinic");
  const { data, isLoading, isFetching, refetch } = useSettings();

  const grouped = groupSettings(data || []);
  const activeConfig = GROUP_CONFIG.find((g) => g.key === activeGroup);
  const activeSettings = grouped[activeGroup] || [];

  const totalSettings = Object.values(grouped).reduce(
    (acc, arr) => acc + arr.length,
    0,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold tracking-tight text-ink-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage system configuration and preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-ink-500 sm:inline">
            {totalSettings} settings across {GROUP_CONFIG.length} groups
          </span>
          <button
            onClick={() => refetch()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <SettingsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr] lg:items-start">
          {/* Left menu — sticky */}
          <aside className="lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
              <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FiSliders className="h-4 w-4 text-ink-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Configuration
                  </p>
                </div>
              </div>

              <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
                {GROUP_CONFIG.map(({ key, label, icon: Icon, restricted }) => {
                  const count = grouped[key]?.length || 0;
                  const isActive = activeGroup === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveGroup(key)}
                      className={`group flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors lg:w-full lg:shrink ${
                        isActive
                          ? "bg-brand-50 font-semibold text-brand-700"
                          : "font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? "text-brand-600"
                            : "text-ink-400 group-hover:text-ink-600"
                        }`}
                      />
                      <span className="whitespace-nowrap lg:flex-1 lg:whitespace-normal">
                        {label}
                      </span>
                      {restricted && (
                        <FiLock
                          className={`h-3 w-3 shrink-0 ${
                            isActive ? "text-warn-600" : "text-ink-400"
                          }`}
                        />
                      )}
                      {count > 0 && (
                        <span
                          className={`hidden rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums lg:inline ${
                            isActive
                              ? "bg-brand-100 text-brand-700"
                              : "bg-ink-100 text-ink-500"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right content — normal flow */}
          <div className="min-w-0">
            {/* Group header */}
            {activeConfig && (
              <div className="mb-4 overflow-hidden rounded-xl border border-ink-100 bg-surface px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50">
                    <activeConfig.icon className="h-4 w-4 text-ink-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-jakarta text-base font-bold text-ink-900">
                        {activeConfig.label}
                      </h2>
                      {activeConfig.restricted && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-warn-200 bg-warn-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warn-800">
                          <FiLock className="h-2.5 w-2.5" />
                          Restricted
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {activeConfig.description}
                    </p>
                  </div>
                  <span className="hidden shrink-0 rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[11px] font-medium text-ink-600 sm:inline">
                    {activeSettings.length}{" "}
                    {activeSettings.length === 1 ? "setting" : "settings"}
                  </span>
                </div>
              </div>
            )}

            <SettingsGroupTab group={activeGroup} settings={activeSettings} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
