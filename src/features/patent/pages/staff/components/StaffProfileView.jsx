// // src/features/patent/pages/staff/StaffProfileView.jsx

// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiUser,
//   FiBriefcase,
//   FiMail,
//   FiPhone,
//   FiShield,
// } from "react-icons/fi";
// import { useStaffMember } from "../../queries/staff";
// import Loader from "../../common/Loader";
// import ProfessionalProfileTab from "./components/ProfessionalProfileTab";

// const StaffProfileView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("basic");

//   const { data, isLoading } = useStaffMember(id);

//   if (isLoading) return <Loader text="Loading staff profile..." />;
//   if (!data)
//     return (
//       <div className="p-10 text-center text-ink-500">Staff not found.</div>
//     );

//   const isProvider = data?.role?.is_provider === true;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/staff")}
//             className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50 transition-colors"
//           >
//             <FiArrowLeft className="h-5 w-5" />
//           </button>
//           <div>
//             <h1 className="font-jakarta text-2xl font-bold text-ink-900">
//               {data.name}
//             </h1>
//             <p className="text-sm text-ink-500">
//               Staff ID: #{data.id} • Role: {data.role?.label || "N/A"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex border-b border-ink-200">
//         <button
//           onClick={() => setActiveTab("basic")}
//           className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
//             activeTab === "basic"
//               ? "border-brand-600 text-brand-700"
//               : "border-transparent text-ink-500 hover:text-ink-800"
//           }`}
//         >
//           <FiUser className="h-4 w-4" /> Basic Info
//         </button>
//         {isProvider && (
//           <button
//             onClick={() => setActiveTab("profile")}
//             className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
//               activeTab === "profile"
//                 ? "border-brand-600 text-brand-700"
//                 : "border-transparent text-ink-500 hover:text-ink-800"
//             }`}
//           >
//             <FiBriefcase className="h-4 w-4" /> Professional Profile
//           </button>
//         )}
//       </div>

//       {/* Content Area */}
//       <div className="rounded-card border border-ink-100 bg-surface p-6">
//         {activeTab === "basic" ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Left Side: Basic Details */}
//             <div className="space-y-5">
//               <div>
//                 <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">
//                   Contact Info
//                 </h3>
//                 <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/30 p-4">
//                   <div className="flex items-center gap-3">
//                     <FiMail className="text-ink-400" />
//                     <div>
//                       <p className="text-xs text-ink-500">Email</p>
//                       <p className="text-sm font-medium text-ink-900">
//                         {data.email}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <FiPhone className="text-ink-400" />
//                     <div>
//                       <p className="text-xs text-ink-500">Phone</p>
//                       <p className="text-sm font-medium text-ink-900">
//                         {data.phone || "—"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">
//                   Account Details
//                 </h3>
//                 <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/30 p-4">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-ink-600">Status</span>
//                     <span
//                       className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                         data.status
//                           ? "bg-brand-50 text-brand-700"
//                           : "bg-ink-100 text-ink-600"
//                       }`}
//                     >
//                       {data.status ? "Active" : "Inactive"}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-ink-600">Role</span>
//                     <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
//                       {data.role?.label || data.role?.name}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-ink-600">Super Admin</span>
//                     <span className="text-sm font-medium text-ink-900">
//                       {data.is_super_admin ? "Yes" : "No"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Side: Specializations */}
//             <div className="space-y-5">
//               <div>
//                 <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">
//                   Specializations
//                 </h3>
//                 <div className="rounded-lg border border-ink-100 bg-ink-50/30 p-4 min-h-[100px]">
//                   {data.specializations && data.specializations.length > 0 ? (
//                     <div className="flex flex-wrap gap-2">
//                       {data.specializations.map((s) => (
//                         <span
//                           key={s.id}
//                           className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
//                         >
//                           {s.name}
//                         </span>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-ink-500 italic">
//                       No specializations assigned.
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">
//                   Audit Information
//                 </h3>
//                 <div className="rounded-lg border border-ink-100 bg-ink-50/30 p-4 space-y-2">
//                   <p className="text-xs text-ink-600">
//                     Last Login:{" "}
//                     <span className="font-medium text-ink-900">
//                       {data.last_login_at
//                         ? new Date(data.last_login_at).toLocaleString()
//                         : "Never"}
//                     </span>
//                   </p>
//                   <p className="text-xs text-ink-600">
//                     Created At:{" "}
//                     <span className="font-medium text-ink-900">
//                       {new Date(data.created_at).toLocaleString()}
//                     </span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <ProfessionalProfileTab providerId={data.id} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default StaffProfileView;

// src/features/patent/pages/staff/components/StaffProfileView.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { useStaffMember } from "../../../queries/staff";
import Loader from "../../../common/Loader";
import ProfessionalProfileTab from "./ProfessionalProfileTab";

const StaffProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");

  const { data, isLoading } = useStaffMember(id);

  if (isLoading) return <Loader text="Loading staff profile..." />;

  if (!data)
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/staff")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Staff Not Found
          </h1>
        </div>
        <div className="rounded-card border border-ink-100 bg-surface p-10 text-center">
          <p className="text-sm text-ink-500">
            The staff member you are looking for does not exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/staff")}
            className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Back to Staff
          </button>
        </div>
      </div>
    );

  const isProvider = data?.role?.is_provider === true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/staff")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              {data.name}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Staff ID: #{data.id}
              {data.role?.label ? ` • Role: ${data.role.label}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/staff")}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 sm:self-auto"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to List
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-200">
        <button
          onClick={() => setActiveTab("basic")}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "basic"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-ink-500 hover:text-ink-800"
          }`}
        >
          <FiUser className="h-4 w-4" /> Basic Info
        </button>
        {isProvider && (
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            <FiBriefcase className="h-4 w-4" /> Professional Profile
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="rounded-card border border-ink-100 bg-surface p-6">
        {activeTab === "basic" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Side: Basic Details */}
            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Contact Info
                </h3>
                <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/30 p-4">
                  <div className="flex items-center gap-3">
                    <FiMail className="text-ink-400" />
                    <div>
                      <p className="text-xs text-ink-500">Email</p>
                      <p className="text-sm font-medium text-ink-900">
                        {data.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-ink-400" />
                    <div>
                      <p className="text-xs text-ink-500">Phone</p>
                      <p className="text-sm font-medium text-ink-900">
                        {data.phone || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Account Details
                </h3>
                <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-600">Status</span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        data.status
                          ? "bg-brand-50 text-brand-700"
                          : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {data.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-600">Role</span>
                    <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
                      {data.role?.label || data.role?.name || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-600">Super Admin</span>
                    <span className="text-sm font-medium text-ink-900">
                      {data.is_super_admin ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Specializations */}
            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Specializations
                </h3>
                <div className="min-h-[100px] rounded-lg border border-ink-100 bg-ink-50/30 p-4">
                  {data.specializations && data.specializations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.specializations.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-ink-500">
                      No specializations assigned.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Audit Information
                </h3>
                <div className="space-y-2 rounded-lg border border-ink-100 bg-ink-50/30 p-4">
                  <p className="text-xs text-ink-600">
                    Last Login:{" "}
                    <span className="font-medium text-ink-900">
                      {data.last_login_at
                        ? new Date(data.last_login_at).toLocaleString()
                        : "Never"}
                    </span>
                  </p>
                  <p className="text-xs text-ink-600">
                    Created At:{" "}
                    <span className="font-medium text-ink-900">
                      {data.created_at
                        ? new Date(data.created_at).toLocaleString()
                        : "—"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ProfessionalProfileTab providerId={data.id} />
        )}
      </div>
    </div>
  );
};

export default StaffProfileView;
