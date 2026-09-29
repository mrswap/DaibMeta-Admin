import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { markNotificationAsRead } from "../../../../redux/slice/notificationSlicer";
import {
  IoArrowBack,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoMailOpenOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import { FaChalkboardTeacher, FaTrophy, FaGraduationCap } from "react-icons/fa";
import { GiDiploma } from "react-icons/gi";
import { HiOutlineBell } from "react-icons/hi2";
import {
  PageBody,
  PageHeader,
  PageHeaderLeft,
  PageLayout,
  PageTitle,
  PageSubtitle,
} from "../layout";
import Breadcrumb from "../layout/Breadcrumb";
import { useTranslation } from "react-i18next";

const NotificationDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const notification = location.state?.notification;

  const getIcon = (type) => {
    const icons = {
      TRAINING_ASSIGNED: <FaChalkboardTeacher size={28} />,
      ASSESSMENT_COMPLETED: <IoCheckmarkCircle size={28} />,
      CERTIFICATE_ISSUED: <GiDiploma size={28} />,
      COURSE_COMPLETED: <FaGraduationCap size={28} />,
      ACHIEVEMENT_UNLOCKED: <FaTrophy size={28} />,
    };
    return icons[type] || <HiOutlineBell size={28} />;
  };

  const getIconBackground = (type) => {
    const bgColors = {
      TRAINING_ASSIGNED: "bg-blue-100 text-blue-600",
      ASSESSMENT_COMPLETED: "bg-green-100 text-green-600",
      CERTIFICATE_ISSUED: "bg-purple-100 text-purple-600",
      COURSE_COMPLETED: "bg-emerald-100 text-emerald-600",
      ACHIEVEMENT_UNLOCKED: "bg-amber-100 text-amber-600",
    };
    return bgColors[type] || "bg-indigo-100 text-indigo-600";
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

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
    return date.toLocaleDateString();
  };

  if (!notification) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <IoCloseCircleOutline className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">
              {t("notification.notFound")}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {t("notification.notFoundDescription")}
            </p>
            <button
              onClick={() => navigate("/notifications")}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 mx-auto"
            >
              <IoArrowBack size={16} />
              {t("notification.goBack")}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), path: "/" },
          { label: t("breadcrumb.notifications"), path: "/notifications" },
          {
            label: t("breadcrumb.notificationDetails"),
            path: `/notifications/${id}`,
          },
        ]}
      />

      <PageHeader>
        <PageHeaderLeft>
          <div className="flex items-center gap-4">
            <div
              className={`rounded-xl p-3 ${getIconBackground(notification.type)} shadow-sm`}
            >
              {getIcon(notification.type)}
            </div>
            <div>
              <PageTitle>{notification.title}</PageTitle>
              <PageSubtitle>{t("notification.detailSubtitle")}</PageSubtitle>
            </div>
          </div>
        </PageHeaderLeft>
      </PageHeader>

      <PageBody>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-50 rounded-full p-1.5">
                  <IoTimeOutline className="text-indigo-500 text-sm" />
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {getRelativeTime(notification.created_at)}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="prose max-w-none">
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    {notification.title}
                  </h2>
                  {!notification.is_read && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      {t("notification.new")}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </PageLayout>
  );
};

export default NotificationDetail;
