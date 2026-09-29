import React from "react";
import { FiMenu, FiSearch, FiBell, FiPlus } from "react-icons/fi";

const serif = {
  fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif",
};

const AVATAR_URL = "";

const AdminNavbar = ({ setSidebarOpen }) => {
  return (
    <header className="h-16 bg-surface border-b border-ink-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-ink-100 transition"
        >
          <FiMenu className="w-5 h-5 text-ink-700" />
        </button>

        <div className="hidden sm:flex items-center gap-3 bg-accent-50 rounded-lg px-3 py-2 w-full max-w-md">
          <FiSearch className="w-4 h-4 text-ink-700" />
          <input
            type="text"
            placeholder="Search EHR, patient MRN, doctor, orders..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink-500 text-ink-700"
          />
          <kbd className="hidden md:inline-block text-[11px] font-bold text-ink-600 bg-accent-100/70 px-1.5 py-0.5 rounded font-sans">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 text-brand-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-brand-500"></span>
          Clinic Open
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition shadow-sm">
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </button>

        <button className="relative p-1.5 text-ink-800 hover:text-ink-600 transition">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-danger-500"></span>
        </button>

        <div className="flex items-center gap-3">
          {AVATAR_URL ? (
            <img
              src={AVATAR_URL}
              alt="Dr. Mehta"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-sm font-bold">
              DM
            </div>
          )}
          <div className="hidden lg:block text-left">
            <p
              style={serif}
              className="text-sm font-bold text-ink-900 leading-tight"
            >
              Dr. Mehta
            </p>
            <p className="text-xs text-ink-800 font-semibold">
              Chief Medical Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
