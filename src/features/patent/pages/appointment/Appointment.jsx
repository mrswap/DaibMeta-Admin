import React from "react";
import {
  FiSearch,
  FiCalendar,
  FiPlus,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const appointmentsData = [
  {
    id: 1,
    time: "09:00 AM",
    patient: "Rajesh Sharma",
    age: "45y, Male",
    phone: "+91 98201 44890",
    doctor: "Dr. Mehta",
    dept: "General Consult",
    status: "Completed",
    action: "View Summary",
  },
  {
    id: 2,
    time: "09:30 AM",
    patient: "Priya Patel",
    age: "32y, Female",
    phone: "+91 98112 33410",
    doctor: "Dr. Ananya Sen",
    dept: "Gynecology",
    status: "Completed",
    action: "View Summary",
  },
  {
    id: 3,
    time: "10:00 AM",
    patient: "Vikram Singhania",
    age: "58y, Male",
    phone: "+91 97230 11982",
    doctor: "Dr. Mehta",
    dept: "Cardiology",
    status: "In-Consult",
    action: "Open Chart",
  },
  {
    id: 4,
    time: "10:30 AM",
    patient: "Sneha Kulkarni",
    age: "28y, Female",
    phone: "+91 99304 88721",
    doctor: "Dr. Rakesh",
    dept: "Orthopedics",
    status: "Arrived",
    action: "Start Consult",
    highlight: true,
  },
  {
    id: 5,
    time: "11:00 AM",
    patient: "Amitav Ghosh",
    age: "62y, Male",
    phone: "+91 98402 77612",
    doctor: "Dr. Arvind Rao",
    dept: "Diabetology",
    status: "Arrived",
    action: "Start Consult",
  },
  {
    id: 6,
    time: "11:30 AM",
    patient: "Sunita Verma",
    age: "41y, Female",
    phone: "+91 98765 43210",
    doctor: "Dr. Mehta",
    dept: "Routine Checkup",
    status: "Booked",
    action: "Check-in",
  },
  {
    id: 7,
    time: "12:00 PM",
    patient: "Mohammed Tariq",
    age: "36y, Male",
    phone: "+91 98210 55432",
    doctor: "Dr. Neha Kapoor",
    dept: "ENT",
    status: "Booked",
    action: "Check-in",
  },
];

const rowBg = (row) =>
  row.status === "In-Consult"
    ? "bg-accent-50/60"
    : row.highlight
      ? "bg-warn-50/70"
      : "";

const timeColor = (row) => {
  if (row.status === "In-Consult") return "text-accent-900 font-semibold";
  if (row.highlight) return "text-danger-900 font-semibold";
  if (row.status === "Booked") return "text-ink-600 font-medium";
  return "text-brand-800 font-semibold";
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
          Completed
        </span>
      );
    case "In-Consult":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-900 leading-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-600 shrink-0"></span>
          <span>In-Consult</span>
        </span>
      );
    case "Arrived":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warn-100 text-warn-900">
          Arrived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-600">
          Booked
        </span>
      );
  }
};

const getActionButton = (status, action) => {
  const base = "px-3 py-1.5 rounded-lg text-xs transition leading-tight";
  if (status === "Completed")
    return (
      <button
        className={`${base} w-24 py-2.5 bg-ink-100 text-ink-600 font-medium hover:bg-ink-200`}
      >
        {action}
      </button>
    );
  if (status === "In-Consult")
    return (
      <button
        className={`${base} bg-accent-600 text-white font-semibold hover:bg-accent-700 shadow-sm`}
      >
        {action}
      </button>
    );
  if (status === "Arrived")
    return (
      <button
        className={`${base} bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-sm`}
      >
        {action}
      </button>
    );
  return (
    <button
      className={`${base} px-4 py-2 bg-accent-50 text-brand-700 font-semibold hover:bg-brand-600 hover:text-white`}
    >
      {action}
    </button>
  );
};

const filters = [
  { label: "All (48)", active: true },
  { label: "Arrived (3)" },
  { label: "In-Consult (2)" },
  { label: "Booked (10)" },
  { label: "Completed (31)" },
];

const calendarDays = [
  ["30", true],
  ...Array.from({ length: 31 }, (_, i) => [String(i + 1), false]),
  ["1", true],
  ["2", true],
  ["3", true],
];

const slots = [
  { time: "10:00 - 10:15 AM", type: "consult" },
  { time: "10:30 - 10:45 AM", type: "arrived" },
  { time: "10:45 - 11:00 AM", type: "free" },
  { time: "11:00 - 11:15 AM", type: "free" },
  { time: "11:15 - 11:30 AM", type: "free" },
  { time: "11:30 - 11:45 AM", type: "booked" },
];

const Appointment = () => {
  return (
    <div className="flex flex-col gap-6 bg-app p-4 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">
            Appointments
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Manage patient bookings, walk-ins, and schedule statuses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface border border-ink-200 text-ink-700 text-sm font-semibold shadow-sm hover:bg-ink-50 transition">
            <FiCalendar className="text-brand-600" />
            <span>Today: Oct 24, 2024</span>
            <FiChevronDown className="text-ink-400" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-600 text-white text-sm font-bold shadow-sm hover:bg-brand-700 transition">
            <FiPlus className="text-lg" />
            <Link to={"appointment/add"}>
              <span>New Appointment</span>
            </Link>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-3">
          <div className="relative w-full sm:w-[278px]">
            <FiSearch className="absolute left-3 top-3 text-ink-400" />
            <input
              type="text"
              placeholder="Search patient name, phone, MRN..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-ink-50 border border-ink-100 text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          <div className="relative">
            <select className="h-10 w-[195px] pl-3 pr-10 rounded-lg bg-ink-50 border border-ink-100 text-sm text-ink-700 font-medium focus:outline-none appearance-none cursor-pointer">
              <option>All Doctors</option>
              <option>Dr. Mehta (Admin)</option>
              <option>Dr. Rakesh (Orthopedics)</option>
              <option>Dr. Ananya Sen (Gynecology)</option>
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-ink-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.label}
              className={
                f.active
                  ? "px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-600 text-white shadow-sm"
                  : "px-4 py-1.5 rounded-full text-xs font-medium bg-ink-100 text-ink-700 hover:bg-ink-200 transition"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 items-start">
        {/* LEFT: Appointments Table */}
        <div className="xl:col-span-7 bg-surface rounded-xl shadow-sm border border-ink-100 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-100 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  <th className="py-3 pl-4 pr-2">Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor &amp; Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pr-4 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 text-sm">
                {appointmentsData.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${rowBg(row)}`}
                  >
                    <td className={`py-4 pl-4 pr-2 text-sm ${timeColor(row)}`}>
                      {row.time}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink-800">
                          {row.patient}
                        </span>
                        <span className="text-[11px] text-ink-500">
                          {row.age} • {row.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink-800">
                          {row.doctor}
                        </span>
                        <span className="text-[11px] text-ink-500">
                          {row.dept}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(row.status)}</td>
                    <td className="py-4 pr-4 pl-2 text-right">
                      {getActionButton(row.status, row.action)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-surface border-t border-ink-100">
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500">
                Showing <span className="font-semibold text-ink-800">1-8</span>{" "}
                of <span className="font-semibold text-ink-800">48</span>{" "}
                bookings
              </span>
              <div className="flex items-center gap-1 text-xs text-ink-500">
                <span className="w-1 h-1 rounded-full bg-ink-300"></span>
                <select className="bg-transparent font-medium text-ink-700 cursor-pointer focus:outline-none">
                  <option>8 per page</option>
                  <option>15 per page</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="px-2 py-1 rounded-md text-ink-400 text-xs font-medium disabled:opacity-60"
                disabled
              >
                Previous
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md bg-brand-600 text-white text-xs font-semibold shadow-sm">
                1
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-600 text-xs font-medium">
                2
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-600 text-xs font-medium">
                3
              </button>
              <button className="px-2 py-1 rounded-md text-ink-600 text-xs font-medium hover:bg-ink-100">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Calendar & Slots */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* Calendar */}
          <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-brand-600" />
                <span className="text-sm font-bold text-ink-800">
                  October 2024
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-ink-100 text-ink-500">
                  <FiChevronLeft />
                </button>
                <button className="p-1 rounded hover:bg-ink-100 text-ink-500">
                  <FiChevronRight />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-ink-500 mb-2">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
              {calendarDays.map(([d, muted], i) =>
                d === "24" && !muted ? (
                  <div key={i} className="flex flex-col items-center py-1">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-600 text-white font-bold shadow-sm">
                      24
                    </span>
                  </div>
                ) : (
                  <span
                    key={i}
                    className={`py-1 ${muted ? "text-ink-300" : "text-ink-700"}`}
                  >
                    {d}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Doctor Slots */}
          <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  DR
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-800 leading-tight">
                    Dr. Rakesh
                  </p>
                  <p className="text-[11px] text-ink-500">
                    Orthopedics • Room 3B
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-100">
                12 Available
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {slots.map((s) => {
                const wrap = {
                  consult: "bg-accent-50 border border-accent-100",
                  arrived: "bg-warn-50 border border-warn-100",
                  free: "border border-transparent hover:bg-brand-50 hover:border-brand-100 cursor-pointer group",
                  booked: "bg-accent-50 border border-accent-100",
                }[s.type];
                return (
                  <div
                    key={s.time}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-xs transition-colors ${wrap}`}
                  >
                    <span className="font-medium text-ink-700 text-[13px]">
                      {s.time}
                    </span>
                    {s.type === "consult" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-100 text-accent-800">
                        In-Consult
                      </span>
                    )}
                    {s.type === "arrived" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warn-100 text-warn-800">
                        Sneha (Arrived)
                      </span>
                    )}
                    {s.type === "free" && (
                      <button className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800 group-hover:bg-brand-200 transition">
                        Book Slot
                      </button>
                    )}
                    {s.type === "booked" && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-ink-200 text-ink-600">
                        Booked
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-4 py-2.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition shadow-sm">
              + Quick Reserve Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
