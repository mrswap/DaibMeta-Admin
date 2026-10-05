import { useState, useRef, useEffect } from "react";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiPlus,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useLogout } from "../pages/auth/queries";
import { useToast } from "../common/toast/ToastContext";
import ConfirmModal from "../common/ConfirmModal";

const AdminNavbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const dropdownRef = useRef(null);

  // Robust initials — handles multiple spaces, single names, empty
  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setConfirmLogout(true);
  };

  const handleLogoutConfirm = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        setConfirmLogout(false);
        toast.info("You have been logged out");
        navigate("/login");
      },
    });
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    navigate("/settings");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-100 bg-surface px-4 sm:px-6">
        {/* Left: menu + search */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer rounded-lg p-2 text-ink-700 transition hover:bg-ink-100 lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <div className="hidden w-full max-w-md items-center gap-3 rounded-lg bg-accent-50 px-3 py-2 sm:flex">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-500" />
            <input
              type="text"
              placeholder="Search patient, MRN, doctor..."
              className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-500"
            />
          </div>
        </div>

        {/* Right: new + notifications + profile */}
        <div className="flex items-center gap-4">
          <button className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700">
            <FiPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            aria-label="Notifications"
            className="relative cursor-pointer rounded-lg p-1.5 text-ink-700 transition hover:bg-ink-50 hover:text-ink-900"
          >
            <FiBell className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-danger-500" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-1 transition hover:bg-ink-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-surface">
                {getInitials(user?.name)}
              </div>
              <div className="hidden text-left leading-tight lg:block">
                <p className="text-sm font-semibold text-ink-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-ink-500">
                  {user?.is_super_admin
                    ? "Super Admin"
                    : user?.role?.label || "Admin"}
                </p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-lg">
                {/* User info header */}
                <div className="border-b border-ink-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {user?.email || ""}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={handleSettings}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-ink-50"
                  >
                    <FiSettings className="h-4 w-4" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogoutClick}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-danger-600 transition hover:bg-danger-50"
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        open={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout from admin panel?"
        confirmText="Logout"
        variant="warn"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmLogout(false)}
        loading={logoutMutation.isPending}
      />
    </>
  );
};

export default AdminNavbar;
