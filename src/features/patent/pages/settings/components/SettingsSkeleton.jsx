// const SettingsSkeleton = () => {
//   return (
//     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//       <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
//         {/* Left skeleton */}
//         <div className="border-b border-ink-100 bg-ink-50/40 p-3 lg:border-b-0 lg:border-r">
//           <div className="mb-4 h-3 w-24 animate-pulse rounded bg-ink-100" />
//           <div className="space-y-1.5">
//             {[...Array(9)].map((_, i) => (
//               <div
//                 key={i}
//                 className="h-9 animate-pulse rounded-lg bg-ink-100/80"
//               />
//             ))}
//           </div>
//         </div>

//         {/* Right skeleton */}
//         <div>
//           <div className="border-b border-ink-100 px-7 py-5">
//             <div className="h-4 w-32 animate-pulse rounded bg-ink-100" />
//             <div className="mt-2 h-3 w-56 animate-pulse rounded bg-ink-100" />
//           </div>
//           <div className="divide-y divide-ink-100">
//             {[...Array(5)].map((_, i) => (
//               <div key={i} className="space-y-2 px-7 py-5">
//                 <div className="h-3 w-28 animate-pulse rounded bg-ink-100" />
//                 <div className="h-10 w-full animate-pulse rounded-lg bg-ink-100" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsSkeleton;

// src/features/patent/pages/settings/components/SettingsSkeleton.jsx

import React from "react";

const SettingsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr] lg:items-start">
      {/* Left Skeleton */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="h-3 w-24 animate-pulse rounded bg-ink-200" />
        </div>
        <div className="space-y-1.5 p-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-full animate-pulse rounded-lg bg-ink-100/80"
            />
          ))}
        </div>
      </div>

      {/* Right Skeleton */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-ink-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-ink-100" />
              <div className="h-3 w-56 animate-pulse rounded bg-ink-100" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-100 bg-surface">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 px-5 py-5 sm:px-6">
              <div className="h-3 w-28 animate-pulse rounded bg-ink-100" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;
