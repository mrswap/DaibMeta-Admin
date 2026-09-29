import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../../../../redux/slice/notificationSlicer";
import {
  IoNotificationsOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoMailOpenOutline,
  IoMailOutline,
} from "react-icons/io5";
import { MdDoneAll, MdNotificationsActive } from "react-icons/md";
import { FaChalkboardTeacher, FaTrophy, FaGraduationCap } from "react-icons/fa";
import { GiDiploma } from "react-icons/gi";
import { HiOutlineBell, HiOutlineBellAlert } from "react-icons/hi2";
import { RiEmotionHappyLine } from "react-icons/ri";
import Loader from "../Loader";
import Error from "../Error";
import {
  PageBody,
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
  PageLayout,
  PageSubtitle,
  PageTitle,
} from "../layout";
import Breadcrumb from "../layout/Breadcrumb";
import { useTranslation } from "react-i18next";

const Notification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    notifications,
    analytics,
    unreadCount,
    pagination,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.notification);

  const [activeTab, setActiveTab] = useState("all");
  const [hoveredId, setHoveredId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getAllNotifications({ page: currentPage, per_page: 20 }));
    dispatch(getUnreadCount());
  }, [dispatch, currentPage]);

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications?.filter((notif) => !notif.is_read);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();

      await dispatch(
        getAllNotifications({
          page: currentPage,
          per_page: 20,
        }),
      );

      dispatch(getUnreadCount());
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      try {
        await dispatch(markAllAsRead()).unwrap();

        await dispatch(
          getAllNotifications({
            page: currentPage,
            per_page: 20,
          }),
        );

        dispatch(getUnreadCount());
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await dispatch(markNotificationAsRead(notification.id)).unwrap();

        dispatch(getUnreadCount());
      }

      navigate(`/notifications/${notification.id}`, {
        state: { notification },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < pagination.last_page ? currentPage + 1 : null;

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return t("notification.justNow");
    if (diffMinutes < 60) return `${diffMinutes} ${t("notification.minAgo")}`;
    if (diffHours < 24)
      return `${diffHours} ${t("notification.hourAgo", { count: diffHours })}`;
    if (diffDays === 1) return t("notification.yesterday");
    if (diffDays < 7) return `${diffDays} ${t("notification.daysAgo")}`;
    if (diffWeeks < 4)
      return `${diffWeeks} ${t("notification.weeksAgo", { count: diffWeeks })}`;
    if (diffMonths < 12)
      return `${diffMonths} ${t("notification.monthsAgo", { count: diffMonths })}`;
    return `${diffYears} ${t("notification.yearsAgo", { count: diffYears })}`;
  };

  const getIcon = (type) => {
    const icons = {
      TRAINING_ASSIGNED: <FaChalkboardTeacher size={18} />,
      ASSESSMENT_COMPLETED: <IoCheckmarkCircle size={18} />,
      CERTIFICATE_ISSUED: <GiDiploma size={18} />,
      COURSE_COMPLETED: <FaGraduationCap size={18} />,
      ACHIEVEMENT_UNLOCKED: <FaTrophy size={18} />,
    };
    return icons[type] || <HiOutlineBell size={18} />;
  };

  if (isLoading && notifications.length === 0) return <Loader />;
  if (isError) return <Error message={message} />;

  return (
    <PageLayout>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), path: "/" },
          { label: t("breadcrumb.notifications") },
        ]}
      />

      <PageHeader>
        <PageHeaderLeft>
          <PageTitle className="flex items-center gap-3">
            {t("notification.notifications")}
          </PageTitle>
          <PageSubtitle>{t("notification.stayUpdated")}</PageSubtitle>
        </PageHeaderLeft>
        <PageHeaderRight />
      </PageHeader>

      <PageBody>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("notification.stats.total")}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {analytics?.total || pagination.total || 0}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-full p-3">
                <IoNotificationsOutline className="text-indigo-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("notification.stats.unread")}
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {analytics?.unread || 0}
                </p>
              </div>
              <div className="bg-blue-50 rounded-full p-3">
                <MdNotificationsActive className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("notification.stats.read")}
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {analytics?.read || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <IoMailOpenOutline className="text-green-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-1">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setCurrentPage(1);
                }}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === "all"
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <IoMailOutline className="text-base" />
                  {t("notification.allNotifications")}
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab("unread");
                  setCurrentPage(1);
                }}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === "unread"
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <HiOutlineBellAlert className="text-base" />
                  {t("notification.unread")}
                  {unreadCount > 0 && (
                    <span className="ml-1.75 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mark All Read Button */}
          {unreadCount > 0 && activeTab === "all" && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-end">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200"
              >
                <MdDoneAll size={16} />
                {t("notification.markAllAsRead")}
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications && filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative transition-all duration-300 cursor-pointer ${
                    !notification.is_read
                      ? "bg-gradient-to-r from-indigo-50/30 to-transparent hover:bg-indigo-50/50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex gap-4">
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
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h4
                              className={`text-sm font-semibold ${
                                !notification.is_read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                              {!notification.is_read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap">
                            <IoTimeOutline size={12} />
                            <span>
                              {getRelativeTime(notification.created_at)}
                            </span>
                          </div>
                        </div>

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
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4">
                  {activeTab === "unread" ? (
                    <RiEmotionHappyLine className="text-gray-400 text-3xl" />
                  ) : (
                    <IoNotificationsOutline className="text-gray-400 text-3xl" />
                  )}
                </div>
                <h3 className="text-gray-700 font-medium mb-1">
                  {activeTab === "unread"
                    ? t("notification.allCaughtUp")
                    : t("notification.noNotificationsYet")}
                </h3>
                <p className="text-gray-400 text-sm">
                  {activeTab === "unread"
                    ? t("notification.allRead")
                    : t("notification.willAppear")}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && activeTab === "all" && (
            <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  {t("notification.showing")}{" "}
                  {(pagination.current_page - 1) * pagination.per_page + 1}{" "}
                  {t("notification.to")}{" "}
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total,
                  )}{" "}
                  {t("notification.of")}{" "}
                  <span className="font-semibold text-gray-900">
                    {pagination.total}
                  </span>{" "}
                  {t("notification.notifications")}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-sm"
                    }`}
                  >
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    {t("notification.previous")}
                  </button>

                  {prevPage && (
                    <button
                      onClick={() => handlePageChange(prevPage)}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-sm text-sm font-medium transition-all duration-200"
                    >
                      {prevPage}
                    </button>
                  )}

                  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white shadow-sm text-sm font-semibold min-w-[50px]">
                    {currentPage}
                  </button>

                  {nextPage && (
                    <button
                      onClick={() => handlePageChange(nextPage)}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-sm text-sm font-medium transition-all duration-200"
                    >
                      {nextPage}
                    </button>
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      currentPage === pagination.last_page
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-sm"
                    }`}
                  >
                    {t("notification.next")}
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
            </div>
          )}

          {pagination.last_page > 1 &&
            activeTab === "unread" &&
            notifications.length >= pagination.per_page && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                <p className="text-sm text-gray-500">
                  {t("notification.showingUnread", {
                    count: notifications.length,
                  })}
                </p>
              </div>
            )}
        </div>
      </PageBody>
    </PageLayout>
  );
};

export default Notification;
