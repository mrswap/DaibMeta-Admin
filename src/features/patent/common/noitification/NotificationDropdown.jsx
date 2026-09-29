import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllNotifications,
  markNotificationAsRead,
  getUnreadCount,
  markAllAsRead,
} from "../../../../redux/slice/notificationSlicer";
import {
  IoNotificationsOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
} from "react-icons/io5";
import { MdDoneAll } from "react-icons/md";
import { FaChalkboardTeacher, FaTrophy, FaGraduationCap } from "react-icons/fa";
import { GiDiploma } from "react-icons/gi";
import { HiOutlineBell, HiOutlineBellAlert } from "react-icons/hi2";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Loader from "../Loader";
import { useTranslation } from "react-i18next";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  const { notifications, unreadCount, pagination, isLoading } = useSelector(
    (state) => state.notification,
  );

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      dispatch(getAllNotifications({ page: currentPage, per_page: 4 }));
      dispatch(getUnreadCount());
    }
  }, [isOpen, dispatch, currentPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return t("notification.justNow");
    if (diffMinutes < 60) return `${diffMinutes} ${t("notification.minAgo")}`;
    if (diffHours < 24)
      return `${diffHours} ${t("notification.hourAgo", { count: diffHours })}`;
    if (diffDays === 1) return t("notification.yesterday");
    if (diffDays < 7) return `${diffDays} ${t("notification.daysAgo")}`;
    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    const icons = {
      TRAINING_ASSIGNED: <FaChalkboardTeacher size={16} />,
      ASSESSMENT_COMPLETED: <IoCheckmarkCircle size={16} />,
      CERTIFICATE_ISSUED: <GiDiploma size={16} />,
      COURSE_COMPLETED: <FaGraduationCap size={16} />,
      ACHIEVEMENT_UNLOCKED: <FaTrophy size={16} />,
    };
    return icons[type] || <HiOutlineBell size={16} />;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await dispatch(markNotificationAsRead(notification.id));

      dispatch(getUnreadCount());
      dispatch(
        getAllNotifications({
          page: currentPage,
          per_page: 4,
        }),
      );
    }

    navigate(`/notifications/${notification.id}`, {
      state: { notification },
    });

    onClose();
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await dispatch(markAllAsRead());

      dispatch(getUnreadCount());
      dispatch(
        getAllNotifications({
          page: currentPage,
          per_page: 4,
        }),
      );
    }
  };

  const handleViewAllNotifications = () => {
    navigate("/notifications");
    onClose();
  };

  const nextPage = () => {
    if (currentPage < pagination.last_page) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        ref={dropdownRef}
        className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
        style={{ top: "100%" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <IoNotificationsOutline className="text-gray-700 text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 tracking-wide">
                {t("notification.notifications")}
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200"
              >
                <MdDoneAll size={16} />
                {t("notification.markAllAsRead")}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5 font-light tracking-wide">
            {t("notification.stayUpdated")}
          </p>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
          {isLoading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50/80 ${
                    !notification.is_read ? "bg-indigo-50/20" : "bg-white"
                  }`}
                >
                  {!notification.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500"></div>
                  )}

                  <div className="flex gap-3">
                    <div>
                      <span
                        className={`flex rounded-full p-2 mt-0.5 ${
                          !notification.is_read
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {getIcon(notification.type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-sm font-medium tracking-wide ${
                            !notification.is_read
                              ? "text-gray-900 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                          <IoTimeOutline size={11} />
                          <span>
                            {getRelativeTime(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-3 flex items-center text-indigo-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 uppercase tracking-wider">
                        {t("notification.readMore")}
                        <svg
                          className="ml-1 w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    <IoChevronBack size={18} />
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">
                      {t("notification.page")}{" "}
                      <span className="font-medium text-indigo-600">
                        {currentPage}
                      </span>{" "}
                      {t("notification.of")} {pagination.last_page}
                    </span>
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === pagination.last_page}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      currentPage === pagination.last_page
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    <IoChevronForward size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                <HiOutlineBellAlert className="text-gray-300 text-3xl" />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                {t("notification.noNotifications")}
              </p>
              <p className="text-gray-400 text-xs mt-1.5 font-light">
                {t("notification.quietCenter")}
              </p>
            </div>
          )}
        </div>

        {/* Sticky View All Button */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white shadow-lg">
          <button
            onClick={handleViewAllNotifications}
            className="w-full py-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>{t("notification.viewAll")}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
