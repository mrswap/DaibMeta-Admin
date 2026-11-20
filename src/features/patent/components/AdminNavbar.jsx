// // src/features/patent/components/AdminNavbar.jsx

// import { useState, useRef, useEffect } from "react";
// import { FiMenu, FiBell, FiSettings, FiLogOut } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { useAuthStore } from "../../../stores/authStore";
// import { useLogout } from "../pages/auth/queries";
// import { useToast } from "../common/toast/ToastContext";
// import ConfirmModal from "../common/ConfirmModal";
// import NotificationDropdown from "../common/noitification/NotificationDropdown";
// import { useUnreadCount } from "../queries/notifications";

// const AdminNavbar = ({ setSidebarOpen }) => {
// const navigate = useNavigate();
// const user = useAuthStore((s) => s.user);
// const logoutMutation = useLogout();
// const toast = useToast();

// const [profileOpen, setProfileOpen] = useState(false);
// const [notifOpen, setNotifOpen] = useState(false);
// const [confirmLogout, setConfirmLogout] = useState(false);

// const profileRef = useRef(null);

// const { data: unreadCount = 0 } = useUnreadCount();

// const getInitials = (name = "") => {
//   const parts = name.trim().split(/\s+/).filter(Boolean);
//   if (parts.length === 0) return "A";
//   if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//   return (
//     parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
//   ).toUpperCase();
// };

// // Close profile dropdown on outside click
// useEffect(() => {
//   const handleClickOutside = (e) => {
//     if (profileRef.current && !profileRef.current.contains(e.target)) {
//       setProfileOpen(false);
//     }
//   };
//   document.addEventListener("mousedown", handleClickOutside);
//   return () => document.removeEventListener("mousedown", handleClickOutside);
// }, []);

// // Escape closes everything
// useEffect(() => {
//   const handleEscape = (e) => {
//     if (e.key === "Escape") {
//       setProfileOpen(false);
//       setNotifOpen(false);
//     }
//   };
//   document.addEventListener("keydown", handleEscape);
//   return () => document.removeEventListener("keydown", handleEscape);
// }, []);

// const handleLogoutClick = () => {
//   setProfileOpen(false);
//   setConfirmLogout(true);
// };

// const handleLogoutConfirm = () => {
//   logoutMutation.mutate(undefined, {
//     onSettled: () => {
//       setConfirmLogout(false);
//       toast.info("You have been logged out");
//       navigate("/login");
//     },
//   });
// };

// const handleSettings = () => {
//   setProfileOpen(false);
//   navigate("/settings");
// };

// const handleToggleNotif = () => {
//   setNotifOpen((v) => !v);
//   setProfileOpen(false);
// };

// const handleToggleProfile = () => {
//   setProfileOpen((v) => !v);
//   setNotifOpen(false);
// };

// const displayCount = unreadCount > 99 ? "99+" : unreadCount;

// return (
//   <>
//     <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-100 bg-surface px-4 sm:px-6">
//       {/* Left */}
//       <div className="flex flex-1 items-center gap-4">
//         <button
//           onClick={() => setSidebarOpen(true)}
//           aria-label="Open menu"
//           className="cursor-pointer rounded-lg p-2 text-ink-700 transition hover:bg-ink-100 lg:hidden"
//         >
//           <FiMenu className="h-5 w-5" />
//         </button>
//       </div>

//       {/* Right */}
//       <div className="flex items-center gap-3">
//         {/* Bell */}
//         <div className="relative">
//           <button
//             onClick={handleToggleNotif}
//             aria-label="Notifications"
//             aria-haspopup="true"
//             aria-expanded={notifOpen}
//             className="relative cursor-pointer rounded-lg p-1.5 text-ink-700 transition hover:bg-ink-50 hover:text-ink-900"
//           >
//             <FiBell className="h-5 w-5" />
//             {unreadCount > 0 && (
//               <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold leading-none text-surface">
//                 {displayCount}
//               </span>
//             )}
//           </button>

//           <NotificationDropdown
//             open={notifOpen}
//             onClose={() => setNotifOpen(false)}
//           />
//         </div>

//         {/* Profile */}
//         <div className="relative" ref={profileRef}>
//           <button
//             onClick={handleToggleProfile}
//             aria-haspopup="true"
//             aria-expanded={profileOpen}
//             className="flex cursor-pointer items-center gap-3 rounded-lg p-1 transition hover:bg-ink-50"
//           >
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-surface">
//               {getInitials(user?.name)}
//             </div>
//             <div className="hidden text-left leading-tight lg:block">
//               <p className="text-sm font-semibold text-ink-900">
//                 {user?.name || "Admin"}
//               </p>
//               <p className="text-xs text-ink-500">
//                 {user?.is_super_admin
//                   ? "Super Admin"
//                   : user?.role?.label || "Admin"}
//               </p>
//             </div>
//           </button>

//           {profileOpen && (
//             <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-lg">
//               <div className="border-b border-ink-100 px-4 py-3">
//                 <p className="truncate text-sm font-semibold text-ink-900">
//                   {user?.name || "Admin"}
//                 </p>
//                 <p className="truncate text-xs text-ink-500">
//                   {user?.email || ""}
//                 </p>
//               </div>

//               <div className="py-1">
//                 <button
//                   onClick={handleSettings}
//                   className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-ink-50"
//                 >
//                   <FiSettings className="h-4 w-4" />
//                   Settings
//                 </button>

//                 <button
//                   onClick={handleLogoutClick}
//                   className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-danger-600 transition hover:bg-danger-50"
//                 >
//                   <FiLogOut className="h-4 w-4" />
//                   Logout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>

//     <ConfirmModal
//       open={confirmLogout}
//       title="Logout"
//       message="Are you sure you want to logout from admin panel?"
//       confirmText="Logout"
//       variant="warn"
//       onConfirm={handleLogoutConfirm}
//       onCancel={() => setConfirmLogout(false)}
//       loading={logoutMutation.isPending}
//     />
//   </>
// );
// };

// export default AdminNavbar;

// src/features/patent/components/AdminNavbar.jsx

import { useState, useRef, useEffect } from "react";
import { FiMenu, FiBell, FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useLogout } from "../pages/auth/queries";
import { useToast } from "../common/toast/ToastContext";
import ConfirmModal from "../common/ConfirmModal";
import NotificationDropdown from "../common/noitification/NotificationDropdown";
import { useUnreadCount } from "../queries/notifications";

const AdminNavbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const toast = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const profileRef = useRef(null);

  const { data: unreadCount = 0 } = useUnreadCount();

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape closes everything
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogoutClick = () => {
    setProfileOpen(false);
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
    setProfileOpen(false);
    navigate("/settings");
  };

  const handleMyProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const handleToggleNotif = () => {
    setNotifOpen((v) => !v);
    setProfileOpen(false);
  };

  const handleToggleProfile = () => {
    setProfileOpen((v) => !v);
    setNotifOpen(false);
  };

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-100 bg-surface px-4 sm:px-6">
        {/* Left */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer rounded-lg p-2 text-ink-700 transition hover:bg-ink-100 lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <div className="relative">
            <button
              onClick={handleToggleNotif}
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={notifOpen}
              className="relative cursor-pointer rounded-lg p-1.5 text-ink-700 transition hover:bg-ink-50 hover:text-ink-900"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold leading-none text-surface">
                  {displayCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={handleToggleProfile}
              aria-haspopup="true"
              aria-expanded={profileOpen}
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

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-lg">
                <div className="border-b border-ink-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {user?.email || ""}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleMyProfile}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-ink-50"
                  >
                    <FiUser className="h-4 w-4" />
                    My Profile
                  </button>

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
