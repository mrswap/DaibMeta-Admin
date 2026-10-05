import React from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────
   Dummy data — baad mein API se replace karna
   ───────────────────────────────────────────────────────── */
const stats = [
  { label: "Today's Appointments", value: "48", note: "12 remaining" },
  { label: "Waiting", value: "3", note: "Arrived, not yet seen" },
  { label: "Completed", value: "31", note: "Consultations done" },
  { label: "Pending Orders", value: "7", note: "To be dispatched" },
];

const todayAppointments = [
  {
    id: 1,
    time: "09:00 AM",
    patient: "Rajesh Sharma",
    doctor: "Dr. Mehta",
    status: "Completed",
  },
  {
    id: 2,
    time: "10:00 AM",
    patient: "Vikram Singhania",
    doctor: "Dr. Mehta",
    status: "In-Consult",
  },
  {
    id: 3,
    time: "10:30 AM",
    patient: "Sneha Kulkarni",
    doctor: "Dr. Rakesh",
    status: "Arrived",
  },
  {
    id: 4,
    time: "11:00 AM",
    patient: "Amitav Ghosh",
    doctor: "Dr. Arvind Rao",
    status: "Arrived",
  },
  {
    id: 5,
    time: "11:30 AM",
    patient: "Sunita Verma",
    doctor: "Dr. Mehta",
    status: "Booked",
  },
  {
    id: 6,
    time: "12:00 PM",
    patient: "Mohammed Tariq",
    doctor: "Dr. Neha Kapoor",
    status: "Booked",
  },
];

const doctorsOnDuty = [
  { id: 1, name: "Dr. Mehta", dept: "General Consult", status: "In Consult" },
  { id: 2, name: "Dr. Rakesh", dept: "Orthopedics", status: "Available" },
  { id: 3, name: "Dr. Arvind Rao", dept: "Diabetology", status: "Available" },
  { id: 4, name: "Dr. Neha Kapoor", dept: "ENT", status: "On Break" },
];

const appointmentBadge = {
  Completed: "bg-brand-50 text-brand-800",
  "In-Consult": "bg-accent-100 text-accent-900",
  Arrived: "bg-warn-100 text-warn-900",
  Booked: "bg-ink-100 text-ink-600",
};

const doctorBadge = {
  Available: "bg-brand-50 text-brand-800",
  "In Consult": "bg-accent-100 text-accent-900",
  "On Break": "bg-ink-100 text-ink-600",
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const adminName = "Dr. Mehta"; // TODO: logged-in user se lo
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            {getGreeting()}, {adminName}
          </h1>
          <p className="mt-1 text-sm text-ink-500">{today}</p>
        </div>
        <Link
          to="/dashboard/add-slot"
          className="inline-flex h-10 items-center justify-center self-start rounded-lg bg-btn-primary-bg px-4 text-sm font-semibold text-btn-primary-text transition hover:bg-btn-primary-bg-hover md:self-auto"
        >
          + New Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-ink-100 bg-surface p-4"
          >
            <p className="text-xs font-medium text-ink-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-ink-900">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-ink-500">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        {/* Today's appointments */}
        <div className="overflow-hidden rounded-card border border-table-border bg-table-bg xl:col-span-2">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-900">
              Today&apos;s Appointments
            </h2>
            <Link
              to="/admin/appointments"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-y border-table-head-border bg-table-head-bg text-[11px] font-bold uppercase tracking-wider text-table-head-text">
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Doctor</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-table-empty-text"
                    >
                      No appointments today
                    </td>
                  </tr>
                )}
                {todayAppointments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-table-row-border bg-table-row-bg text-table-cell-text transition-colors last:border-b-0 hover:bg-table-row-hover-bg"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums">
                      {a.time}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-900">
                      {a.patient}
                    </td>
                    <td className="px-4 py-3">{a.doctor}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${appointmentBadge[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctors on duty */}
        <div className="rounded-card border border-ink-100 bg-surface">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-900">
              Doctors on Duty
            </h2>
            <Link
              to="/admin/doctors"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <ul className="divide-y divide-ink-100 border-t border-ink-100">
            {doctorsOnDuty.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink-900">{d.name}</p>
                  <p className="text-xs text-ink-500">{d.dept}</p>
                </div>
                <span
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${doctorBadge[d.status]}`}
                >
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
