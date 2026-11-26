// // src/features/patent/pages/dashboard/DashboardPage.jsx

// import { useState, useMemo, useRef, useEffect, memo } from "react";
// import {
//   FiUsers,
//   FiUserCheck,
//   FiUserX,
//   FiUserPlus,
//   FiActivity,
//   FiCalendar,
//   FiGift,
//   FiClock,
//   FiFileText,
//   FiDollarSign,
//   FiPercent,
//   FiCreditCard,
//   FiShoppingBag,
//   FiPackage,
//   FiTruck,
//   FiRefreshCw,
//   FiLock,
//   FiHome,
//   FiSmartphone,
//   FiRepeat,
//   FiCheckCircle,
//   FiLayers,
//   FiTag,
// } from "react-icons/fi";
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { useDashboardReport, PERIOD_OPTIONS } from "../../queries/reports";
// import { FilterSelect, DatePicker } from "../../common/form";
// import { usePermission } from "../../hooks/usePermission";
// import Loader from "../../common/Loader";

// // ==================== HELPERS ====================
// const COLORS = [
//   "#2563eb",
//   "#16a34a",
//   "#f59e0b",
//   "#dc2626",
//   "#7c3aed",
//   "#0891b2",
//   "#db2777",
//   "#65a30d",
// ];
// const GRID = "#eef0f3";
// const AXIS_TICK = { fontSize: 11, fill: "#6b7280" };
// const LEGEND_STYLE = { fontSize: 11 };
// const BAR_CURSOR = { fill: "#f3f4f6" };
// const DOT = { r: 4, strokeWidth: 2, fill: "#fff" };
// const EMPTY = [];

// const num = (v) => Number(v) || 0;

// const formatCurrency = (v) => {
//   const n = Number(v);
//   if (isNaN(n)) return "₹0.00";
//   return `₹${n.toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;
// };

// const pretty = (s) =>
//   String(s ?? "")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// const same = (s) => s;

// const formatDate = (d) => {
//   if (!d) return "";
//   const dt = new Date(d);
//   if (isNaN(dt)) return d;
//   return dt.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const shortDate = (d) => {
//   if (!d) return "";
//   if (/^\d{4}-\d{2}$/.test(d)) {
//     return new Date(`${d}-01`).toLocaleDateString("en-IN", {
//       month: "short",
//       year: "numeric",
//     });
//   }
//   const dt = new Date(d);
//   if (isNaN(dt)) return d;
//   return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
// };

// const toList = (arr, labelKey, valueKey, fmtLabel = pretty) =>
//   Array.isArray(arr)
//     ? arr.map((r) => ({ name: fmtLabel(r[labelKey]), value: num(r[valueKey]) }))
//     : EMPTY;

// const toSeries = (arr, labelKey, keys) =>
//   Array.isArray(arr)
//     ? arr.map((r) => {
//         const row = { label: shortDate(r[labelKey]) };
//         keys.forEach((k) => (row[k] = num(r[k])));
//         return row;
//       })
//     : EMPTY;

// const hasData = (list) => list.length > 0 && list.some((r) => r.value > 0);

// // ==================== STATIC CONFIG (module level => stable references) ====================
// // [label, summaryKey, icon, tone, isCurrency]
// const PATIENT_STATS = [
//   ["Total patients", "total_patients", FiUsers, "brand"],
//   ["Primary patients", "primary_patients", FiUserCheck, "accent"],
//   ["Family members", "family_members", FiUsers, "warn"],
//   ["Registered today", "registered_today", FiUserPlus, "brand"],
//   ["Active patients", "active_patients", FiUserCheck, "accent"],
//   ["Inactive patients", "inactive_patients", FiUserX, "danger"],
//   ["Clinic patients", "clinic_patients", FiHome, "ink"],
//   ["App only / no visit", "app_only_or_no_visit_patients", FiSmartphone, "ink"],
// ];
// const APPT_STATS = [
//   ["Total appointments", "total_appointments", FiCalendar, "brand"],
//   [
//     "Unique registered patients",
//     "unique_registered_patients",
//     FiUsers,
//     "accent",
//   ],
//   [
//     "Registered patient appts",
//     "registered_patient_appointments",
//     FiUserCheck,
//     "accent",
//   ],
//   ["Walk-in appointments", "walk_in_appointments", FiUserPlus, "warn"],
//   ["Free slot appointments", "free_slot_appointments", FiGift, "ink"],
//   ["Normal slot appointments", "normal_slot_appointments", FiClock, "brand"],
// ];
// const VISIT_STATS = [
//   ["Total visits", "total_visits", FiActivity, "brand"],
//   ["Unique patients", "unique_patients", FiUsers, "accent"],
//   ["Completed visits", "completed_visits", FiCheckCircle, "accent"],
//   ["Consultation visits", "consultation_visits", FiFileText, "ink"],
//   ["Visits with follow-up", "visits_with_follow_up", FiRepeat, "warn"],
// ];
// const FIN_STATS = [
//   ["Payment records", "total_payment_records", FiFileText, "brand"],
//   ["Visits with payment", "total_visits", FiActivity, "ink"],
//   ["Total amount", "total_amount", FiDollarSign, "accent", true],
//   ["Total tax", "total_tax", FiPercent, "warn", true],
//   ["Total balance", "total_balance", FiCreditCard, "danger", true],
// ];
// const STORE_STATS = [
//   ["Total bookings", "total_bookings", FiShoppingBag, "brand"],
//   ["Unique patients", "unique_patients", FiUsers, "accent"],
//   ["Quantity sold", "total_quantity_sold", FiTruck, "warn"],
//   ["Unique products", "unique_products_sold", FiPackage, "ink"],
//   ["Item value", "total_item_value", FiTag, "accent", true],
//   ["Subtotal", "total_subtotal", FiLayers, "brand", true],
//   ["Delivery charge", "total_delivery_charge", FiTruck, "warn", true],
//   ["Processing charge", "total_processing_charge", FiCreditCard, "ink", true],
//   ["Other charge", "total_other_charge", FiPercent, "ink", true],
//   ["Total order value", "total_order_value", FiDollarSign, "accent", true],
// ];

// const L_REG = [{ key: "total", name: "Registrations", color: "#2563eb" }];
// const L_APPT = [{ key: "total", name: "Appointments", color: "#16a34a" }];
// const L_VISIT = [{ key: "total", name: "Visits", color: "#f59e0b" }];
// const L_FOLLOW = [{ key: "total", name: "Follow-ups", color: "#db2777" }];
// const L_PAY = [
//   { key: "total_amount", name: "Amount", color: "#2563eb", currency: true },
//   { key: "total_balance", name: "Balance", color: "#dc2626", currency: true },
// ];
// const L_PAY_REC = [{ key: "total_records", name: "Records", color: "#7c3aed" }];
// const L_BOOK = [{ key: "total_bookings", name: "Bookings", color: "#16a34a" }];
// const L_ORDER = [
//   {
//     key: "total_order_value",
//     name: "Order value",
//     color: "#2563eb",
//     currency: true,
//   },
// ];

// // ==================== LAYOUT PIECES ====================
// // Mounts children only when the block is close to the viewport (big win with 25+ charts)
// const LazyMount = ({ children, className }) => {
//   const ref = useRef(null);
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     if (show) return;
//     const el = ref.current;
//     if (!el || typeof IntersectionObserver === "undefined") {
//       setShow(true);
//       return;
//     }
//     const io = new IntersectionObserver(
//       ([e]) => {
//         if (e.isIntersecting) {
//           setShow(true);
//           io.disconnect();
//         }
//       },
//       { rootMargin: "300px" },
//     );
//     io.observe(el);
//     return () => io.disconnect();
//   }, [show]);

//   return (
//     <div ref={ref} className={className}>
//       {show ? children : null}
//     </div>
//   );
// };

// const Section = ({ title, subtitle, note, children }) => (
//   <section className="space-y-4">
//     <div>
//       <h2 className="text-base font-semibold text-ink-900">{title}</h2>
//       {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
//     </div>
//     {note && (
//       <div className="rounded-lg border border-warn-200 bg-warn-50/50 px-3 py-2 text-xs text-warn-900">
//         {note}
//       </div>
//     )}
//     {children}
//   </section>
// );

// const TONES = {
//   brand: "bg-brand-50 text-brand-700",
//   accent: "bg-accent-50 text-accent-800",
//   warn: "bg-warn-100 text-warn-900",
//   danger: "bg-danger-50 text-danger-700",
//   ink: "bg-ink-100 text-ink-700",
// };

// const StatCard = memo(
//   ({ label, value, icon: Icon, tone = "brand", currency }) => (
//     <div className="rounded-xl border border-ink-100 bg-surface p-4">
//       <div
//         className={`flex h-8 w-8 items-center justify-center rounded-lg ${
//           TONES[tone] || TONES.brand
//         }`}
//       >
//         <Icon className="h-4 w-4" />
//       </div>
//       <p className="mt-3 text-2xl font-bold leading-none text-ink-900">
//         {currency ? formatCurrency(value) : num(value).toLocaleString("en-IN")}
//       </p>
//       <p className="mt-1.5 text-xs text-ink-500">{label}</p>
//     </div>
//   ),
// );

// const StatGrid = memo(({ items, summary }) => (
//   <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
//     {items.map(([label, key, icon, tone, currency]) => (
//       <StatCard
//         key={key}
//         label={label}
//         value={summary[key]}
//         icon={icon}
//         tone={tone}
//         currency={currency}
//       />
//     ))}
//   </div>
// ));

// const ChartGrid = ({ children }) => (
//   <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{children}</div>
// );

// const ChartCard = ({ title, empty, children }) => (
//   <div className="rounded-xl border border-ink-100 bg-surface p-4">
//     <p className="mb-3 text-sm font-semibold text-ink-800">{title}</p>
//     {empty ? (
//       <div className="flex h-56 items-center justify-center rounded-lg bg-ink-50 text-xs text-ink-400">
//         No data for this period
//       </div>
//     ) : (
//       <LazyMount className="h-56 w-full">{children}</LazyMount>
//     )}
//   </div>
// );

// // ==================== CHART WRAPPERS (memoised, animations off) ====================
// const Donut = memo(({ title, data }) => {
//   const filtered = data.filter((d) => d.value > 0);
//   return (
//     <ChartCard title={title} empty={filtered.length === 0}>
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={filtered}
//             dataKey="value"
//             nameKey="name"
//             cx="50%"
//             cy="46%"
//             innerRadius={48}
//             outerRadius={76}
//             paddingAngle={2}
//             isAnimationActive={false}
//             label={({ value }) => value}
//           >
//             {filtered.map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
//         </PieChart>
//       </ResponsiveContainer>
//     </ChartCard>
//   );
// });

// const Bars = memo(({ title, data, color, currency, horizontal }) => (
//   <ChartCard title={title} empty={!hasData(data)}>
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart
//         data={data}
//         layout={horizontal ? "vertical" : "horizontal"}
//         margin={{ left: horizontal ? 30 : 0, right: 12 }}
//       >
//         <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
//         {horizontal ? (
//           <>
//             <XAxis type="number" tick={AXIS_TICK} allowDecimals={false} />
//             <YAxis
//               type="category"
//               dataKey="name"
//               tick={AXIS_TICK}
//               width={110}
//             />
//           </>
//         ) : (
//           <>
//             <XAxis dataKey="name" tick={AXIS_TICK} interval={0} />
//             <YAxis tick={AXIS_TICK} allowDecimals={!!currency} />
//           </>
//         )}
//         <Tooltip
//           formatter={(v) => (currency ? formatCurrency(v) : v)}
//           cursor={BAR_CURSOR}
//         />
//         <Bar
//           dataKey="value"
//           name={currency ? "Amount" : "Count"}
//           fill={color}
//           radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
//           maxBarSize={48}
//           isAnimationActive={false}
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   </ChartCard>
// ));

// const Trend = memo(({ title, data, lines }) => (
//   <ChartCard title={title} empty={data.length === 0}>
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={data} margin={{ left: 0, right: 16, top: 6 }}>
//         <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
//         <XAxis dataKey="label" tick={AXIS_TICK} />
//         <YAxis tick={AXIS_TICK} allowDecimals={false} />
//         <Tooltip
//           formatter={(v, _n, p) => {
//             const l = lines.find((x) => x.key === p.dataKey);
//             return l?.currency ? formatCurrency(v) : v;
//           }}
//         />
//         {lines.length > 1 && (
//           <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
//         )}
//         {lines.map((l) => (
//           <Line
//             key={l.key}
//             type="monotone"
//             dataKey={l.key}
//             name={l.name}
//             stroke={l.color}
//             strokeWidth={2.5}
//             dot={DOT}
//             activeDot={{ r: 5 }}
//             isAnimationActive={false}
//           />
//         ))}
//       </LineChart>
//     </ResponsiveContainer>
//   </ChartCard>
// ));

// const PaymentStatusTable = memo(({ rows }) => (
//   <div className="rounded-xl border border-ink-100 bg-surface p-4">
//     <p className="mb-3 text-sm font-semibold text-ink-800">
//       Payment status breakdown
//     </p>
//     {rows.length === 0 ? (
//       <div className="flex h-24 items-center justify-center rounded-lg bg-ink-50 text-xs text-ink-400">
//         No data for this period
//       </div>
//     ) : (
//       <div className="overflow-x-auto">
//         <table className="w-full text-left text-sm">
//           <thead>
//             <tr className="border-b border-ink-100 text-xs text-ink-500">
//               <th className="pb-2 font-medium">Status</th>
//               <th className="pb-2 text-right font-medium">Records</th>
//               <th className="pb-2 text-right font-medium">Amount</th>
//               <th className="pb-2 text-right font-medium">Balance</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r) => (
//               <tr
//                 key={r.payment_status}
//                 className="border-b border-ink-50 last:border-0"
//               >
//                 <td className="py-2.5">
//                   <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
//                     {pretty(r.payment_status)}
//                   </span>
//                 </td>
//                 <td className="py-2.5 text-right text-ink-700">
//                   {num(r.total_records)}
//                 </td>
//                 <td className="py-2.5 text-right font-medium text-ink-900">
//                   {formatCurrency(r.total_amount)}
//                 </td>
//                 <td className="py-2.5 text-right text-ink-700">
//                   {formatCurrency(r.total_balance)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     )}
//   </div>
// ));

// // ==================== DASHBOARD ====================
// const DashboardPage = () => {
//   const { can, isLoading: permLoading } = usePermission();
//   const canView = can("dashboard", "view");

//   const [period, setPeriod] = useState(
//     PERIOD_OPTIONS.find((p) => p.value === "this_month"),
//   );
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const isCustom = period?.value === "custom";

//   const params = useMemo(() => {
//     const p = { period: period?.value || "this_month" };
//     if (isCustom) {
//       if (fromDate) p.from_date = fromDate;
//       if (toDate) p.to_date = toDate;
//     }
//     return p;
//   }, [period, isCustom, fromDate, toDate]);

//   // custom range: wait until both dates are picked (no half-baked requests)
//   const ready = canView && (!isCustom || (fromDate && toDate));

//   const {
//     data: raw,
//     isLoading,
//     isFetching,
//     refetch,
//   } = useDashboardReport(params, {
//     enabled: !!ready,
//     staleTime: 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const data = raw?.data?.patients ? raw.data : raw;

//   // All derived chart data computed ONCE per response, not on every render
//   const d = useMemo(() => {
//     const pS = data?.patients?.summary || {};
//     const pC = data?.patients?.charts || {};
//     const aS = data?.appointments?.summary || {};
//     const aC = data?.appointments?.charts || {};
//     const vS = data?.visits?.summary || {};
//     const vC = data?.visits?.charts || {};
//     const fS = data?.financial?.summary || {};
//     const fC = data?.financial?.charts || {};
//     const sS = data?.store?.summary || {};
//     const sC = data?.store?.charts || {};

//     return {
//       filters: data?.filters || {},
//       pS,
//       aS,
//       vS,
//       fS,
//       sS,
//       gender: toList(pC.gender_distribution, "label", "value"),
//       patientType: toList(pC.patient_type_distribution, "label", "value", same),
//       age: toList(pC.age_distribution, "label", "value", same),
//       regTrend: toSeries(pC.registration_trend, "period", ["total"]),

//       apptStatus: toList(aS.status_breakdown, "status", "total"),
//       apptSource: toList(
//         aS.booking_source_breakdown,
//         "booking_source",
//         "total",
//       ),
//       apptTrend: toSeries(aC.appointment_trend, "date", ["total"]),
//       apptProvider: toList(
//         aC.provider_breakdown,
//         "provider_name",
//         "total",
//         same,
//       ),
//       apptType: toList(
//         aC.appointment_type_breakdown,
//         "appointment_type",
//         "total",
//         same,
//       ),

//       visitStatus: toList(vS.status_breakdown, "status", "total"),
//       visitType: toList(vS.visit_type_breakdown, "visit_type", "total"),
//       visitPay: toList(vS.payment_status_breakdown, "payment_status", "total"),
//       visitProvider: toList(
//         vC.provider_breakdown,
//         "provider_name",
//         "total",
//         same,
//       ),
//       visitTrend: toSeries(vC.visit_trend, "date", ["total"]),
//       followTrend: toSeries(vC.follow_up_trend, "date", ["total"]),

//       payRows: fS.payment_status_breakdown || EMPTY,
//       finProvider: toList(
//         fC.provider_breakdown,
//         "provider_name",
//         "total_amount",
//         same,
//       ),
//       payTrend: toSeries(fC.payment_trend, "date", [
//         "total_amount",
//         "total_balance",
//       ]),
//       payRecTrend: toSeries(fC.payment_trend, "date", ["total_records"]),

//       storeStatus: toList(sS.status_breakdown, "status", "total"),
//       bookTrend: toSeries(sC.booking_trend, "date", ["total_bookings"]),
//       orderTrend: toSeries(sC.booking_trend, "date", ["total_order_value"]),
//       prodSales: toList(
//         sC.product_breakdown,
//         "product_name",
//         "total_sales",
//         same,
//       ),
//       prodQty: toList(
//         sC.product_breakdown,
//         "product_name",
//         "total_quantity",
//         same,
//       ),
//       catSales: toList(
//         sC.category_breakdown,
//         "category_name",
//         "total_sales",
//         same,
//       ),
//     };
//   }, [data]);

//   // ==================== GUARD ====================
//   if (permLoading && !canView) {
//     return <Loader text="Checking permissions..." />;
//   }
//   if (!canView) {
//     return (
//       <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
//         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
//           <FiLock className="h-7 w-7" />
//         </div>
//         <h2 className="mt-4 text-lg font-semibold text-ink-900">
//           Access denied
//         </h2>
//         <p className="mt-1 max-w-md text-sm text-ink-500">
//           You do not have permission to view the dashboard.
//         </p>
//       </div>
//     );
//   }

//   // ==================== RENDER ====================
//   return (
//     <div className="space-y-10">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div className="min-w-0">
//           <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
//             Dashboard
//           </h1>
//           <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
//             {d.filters.from_date
//               ? `Clinic overview · ${formatDate(d.filters.from_date)} to ${formatDate(d.filters.to_date)}`
//               : "Clinic operations overview"}
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <div className="w-40">
//             <FilterSelect
//               value={period}
//               onChange={setPeriod}
//               options={PERIOD_OPTIONS}
//               placeholder="This Month"
//               isClearable={false}
//             />
//           </div>

//           {isCustom && (
//             <>
//               <div className="w-40">
//                 <DatePicker
//                   name="from_date"
//                   isFormik={false}
//                   value={fromDate}
//                   onChange={(v) => setFromDate(v || "")}
//                   placeholder="From date"
//                   max={toDate || ""}
//                 />
//               </div>
//               <div className="w-40">
//                 <DatePicker
//                   name="to_date"
//                   isFormik={false}
//                   value={toDate}
//                   onChange={(v) => setToDate(v || "")}
//                   placeholder="To date"
//                   min={fromDate || ""}
//                 />
//               </div>
//             </>
//           )}

//           <button
//             onClick={() => refetch()}
//             title="Refresh"
//             className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
//           >
//             <FiRefreshCw
//               className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
//             />
//           </button>
//         </div>
//       </div>

//       {isLoading ? (
//         <Loader text="Loading dashboard..." />
//       ) : (
//         <>
//           {/* ==================== PATIENTS ==================== */}
//           <Section
//             title="Patients"
//             subtitle="Registrations, demographics and how patients reach the clinic"
//           >
//             <StatGrid items={PATIENT_STATS} summary={d.pS} />
//             <ChartGrid>
//               <Donut title="Gender distribution" data={d.gender} />
//               <Donut title="Patient type" data={d.patientType} />
//               <Bars title="Age distribution" data={d.age} color="#2563eb" />
//               <Trend
//                 title="Registration trend"
//                 data={d.regTrend}
//                 lines={L_REG}
//               />
//             </ChartGrid>
//           </Section>

//           {/* ==================== APPOINTMENTS ==================== */}
//           <Section
//             title="Appointments"
//             subtitle="Bookings, sources and slot usage"
//           >
//             <StatGrid items={APPT_STATS} summary={d.aS} />
//             <ChartGrid>
//               <Donut title="Status breakdown" data={d.apptStatus} />
//               <Donut title="Booking source" data={d.apptSource} />
//               <Trend
//                 title="Appointment trend"
//                 data={d.apptTrend}
//                 lines={L_APPT}
//               />
//               <Bars
//                 title="Appointments by provider"
//                 data={d.apptProvider}
//                 color="#7c3aed"
//               />
//               <Bars
//                 title="Appointments by type"
//                 data={d.apptType}
//                 color="#0891b2"
//                 horizontal
//               />
//             </ChartGrid>
//           </Section>

//           {/* ==================== VISITS ==================== */}
//           <Section title="Visits" subtitle="Consultations and follow-ups">
//             <StatGrid items={VISIT_STATS} summary={d.vS} />
//             <ChartGrid>
//               <Donut title="Visit status" data={d.visitStatus} />
//               <Donut title="Visit type" data={d.visitType} />
//               <Donut title="Payment status" data={d.visitPay} />
//               <Bars
//                 title="Visits by provider"
//                 data={d.visitProvider}
//                 color="#0891b2"
//               />
//               <Trend title="Visit trend" data={d.visitTrend} lines={L_VISIT} />
//               <Trend
//                 title="Follow-up trend"
//                 data={d.followTrend}
//                 lines={L_FOLLOW}
//               />
//             </ChartGrid>
//           </Section>

//           {/* ==================== FINANCIAL ==================== */}
//           <Section
//             title="Financial"
//             subtitle="Payments recorded against visits"
//             note="Amounts and balances are recorded payment values, not necessarily collected revenue."
//           >
//             <StatGrid items={FIN_STATS} summary={d.fS} />
//             <ChartGrid>
//               <PaymentStatusTable rows={d.payRows} />
//               <Bars
//                 title="Amount by provider"
//                 data={d.finProvider}
//                 color="#dc2626"
//                 currency
//               />
//               <Trend title="Payment trend" data={d.payTrend} lines={L_PAY} />
//               <Trend
//                 title="Payment records per day"
//                 data={d.payRecTrend}
//                 lines={L_PAY_REC}
//               />
//             </ChartGrid>
//           </Section>

//           {/* ==================== STORE ==================== */}
//           <Section title="Store" subtitle="Orders, products and charges">
//             <StatGrid items={STORE_STATS} summary={d.sS} />
//             <ChartGrid>
//               <Donut title="Booking status" data={d.storeStatus} />
//               <Trend title="Booking trend" data={d.bookTrend} lines={L_BOOK} />
//               <Trend
//                 title="Order value trend"
//                 data={d.orderTrend}
//                 lines={L_ORDER}
//               />
//               <Bars
//                 title="Sales by product"
//                 data={d.prodSales}
//                 color="#7c3aed"
//                 currency
//               />
//               <Bars
//                 title="Quantity by product"
//                 data={d.prodQty}
//                 color="#0891b2"
//               />
//               <Bars
//                 title="Sales by category"
//                 data={d.catSales}
//                 color="#f59e0b"
//                 currency
//               />
//             </ChartGrid>
//           </Section>
//         </>
//       )}
//     </div>
//   );
// };

// export default DashboardPage;

// src/features/patent/pages/dashboard/DashboardPage.jsx

import { useState, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiActivity,
  FiDollarSign,
  FiShoppingBag,
  FiRefreshCw,
  FiLock,
  FiArrowRight,
  FiTrendingUp,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useDashboardReport, PERIOD_OPTIONS } from "../../queries/reports";
import { FilterSelect, DatePicker } from "../../common/form";
import { usePermission } from "../../hooks/usePermission";
import Loader from "../../common/Loader";

// ==================== HELPERS ====================
const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

const num = (v) => Number(v) || 0;

const formatCurrency = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "₹0";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const pretty = (s) =>
  String(s ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const toList = (arr, labelKey, valueKey) =>
  Array.isArray(arr)
    ? arr.map((r) => ({ name: pretty(r[labelKey]), value: num(r[valueKey]) }))
    : [];

const toTrend = (arr, labelKey, valueKey) =>
  Array.isArray(arr)
    ? arr.map((r) => ({
        label: formatDate(r[labelKey]),
        value: num(r[valueKey]),
      }))
    : [];

// ==================== MINI COMPONENTS ====================
const StatCard = memo(
  ({ label, value, icon: Icon, tone = "brand", currency }) => {
    const tones = {
      brand: "bg-brand-50 text-brand-700",
      accent: "bg-accent-50 text-accent-800",
      warn: "bg-warn-100 text-warn-900",
      danger: "bg-danger-50 text-danger-700",
      ink: "bg-ink-100 text-ink-700",
    };
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500 sm:text-[11px]">
            {label}
          </p>
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${
              tones[tone] || tones.brand
            }`}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <p className="mt-2 text-xl font-bold leading-none text-ink-900 sm:text-2xl">
          {currency
            ? formatCurrency(value)
            : num(value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  },
);

const MiniDonut = memo(({ data, color }) => {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0)
    return (
      <div className="flex h-24 items-center justify-center text-[11px] text-ink-400">
        No data
      </div>
    );
  return (
    <div className="flex items-center gap-3">
      <div className="h-20 w-20 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={36}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {filtered.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length] || color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {filtered.slice(0, 3).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] || color }}
            />
            <span className="truncate text-ink-600">{d.name}</span>
            <span className="ml-auto shrink-0 font-semibold text-ink-900">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

const MiniTrend = memo(({ data, color }) => {
  if (data.length === 0)
    return (
      <div className="flex h-24 items-center justify-center text-[11px] text-ink-400">
        No data
      </div>
    );
  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f3f5"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 2.5, fill: color }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// ==================== SECTION CARD ====================
const SectionCard = memo(
  ({ title, icon: Icon, tone = "brand", stats, children, onViewAll }) => {
    const tones = {
      brand: "bg-brand-50 text-brand-600",
      accent: "bg-accent-50 text-accent-600",
      warn: "bg-warn-100 text-warn-700",
      ink: "bg-ink-100 text-ink-700",
    };
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                tones[tone] || tones.brand
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <h2 className="truncate text-sm font-semibold text-ink-900">
              {title}
            </h2>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
            >
              View Report
              <FiArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 p-3">
            {stats.map((s, i) => (
              <div key={i} className="rounded-lg bg-ink-50/50 px-2.5 py-2">
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  {s.label}
                </p>
                <p className="mt-0.5 text-base font-bold leading-none text-ink-900">
                  {s.currency
                    ? formatCurrency(s.value)
                    : num(s.value).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        {children && (
          <div className="grid grid-cols-1 gap-2 border-t border-ink-50 p-3 sm:grid-cols-2">
            {children}
          </div>
        )}
      </div>
    );
  },
);

const MiniPanel = ({ title, children }) => (
  <div className="rounded-lg bg-ink-50/40 p-2.5">
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
      {title}
    </p>
    {children}
  </div>
);

// ==================== DASHBOARD ====================
const DashboardPage = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();
  const canView = can("dashboard", "view");

  const [period, setPeriod] = useState(
    PERIOD_OPTIONS.find((p) => p.value === "this_month"),
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isCustom = period?.value === "custom";
  const ready = canView && (!isCustom || (fromDate && toDate));

  const params = useMemo(() => {
    const p = { period: period?.value || "this_month" };
    if (isCustom) {
      if (fromDate) p.from_date = fromDate;
      if (toDate) p.to_date = toDate;
    }
    return p;
  }, [period, isCustom, fromDate, toDate]);

  const {
    data: raw,
    isLoading,
    isFetching,
    refetch,
  } = useDashboardReport(params, {
    enabled: !!ready,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const data = raw?.data?.patients ? raw.data : raw;

  const d = useMemo(() => {
    const pS = data?.patients?.summary || {};
    const pC = data?.patients?.charts || {};
    const aS = data?.appointments?.summary || {};
    const aC = data?.appointments?.charts || {};
    const vS = data?.visits?.summary || {};
    const vC = data?.visits?.charts || {};
    const fS = data?.financial?.summary || {};
    const fC = data?.financial?.charts || {};
    const sS = data?.store?.summary || {};
    const sC = data?.store?.charts || {};

    return {
      filters: data?.filters || {},
      pS,
      aS,
      vS,
      fS,
      sS,
      gender: toList(pC.gender_distribution, "label", "value"),
      regTrend: toTrend(pC.registration_trend, "period", "total"),
      apptStatus: toList(aS.status_breakdown, "status", "total"),
      apptTrend: toTrend(aC.appointment_trend, "date", "total"),
      visitStatus: toList(vS.status_breakdown, "status", "total"),
      visitTrend: toTrend(vC.visit_trend, "date", "total"),
      payTrend: toTrend(fC.payment_trend, "date", "total_amount"),
      payStatus: toList(
        fS.payment_status_breakdown,
        "payment_status",
        "total_records",
      ),
      storeStatus: toList(sS.status_breakdown, "status", "total"),
      bookTrend: toTrend(sC.booking_trend, "date", "total_bookings"),
    };
  }, [data]);

  // ==================== NAVIGATE + SCROLL TOP ====================
  const goToReport = (path) => {
    navigate(path);
    // Scroll to top after navigation
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  // ==================== GUARD ====================
  if (permLoading && !canView) return <Loader text="Checking permissions..." />;
  if (!canView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to view the dashboard.
        </p>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {d.filters.from_date
              ? `${formatDate(d.filters.from_date)} – ${formatDate(d.filters.to_date)}`
              : "Clinic overview"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36 sm:w-40">
            <FilterSelect
              value={period}
              onChange={setPeriod}
              options={PERIOD_OPTIONS}
              placeholder="This Month"
              isClearable={false}
            />
          </div>

          {isCustom && (
            <>
              <div className="w-36 sm:w-40">
                <DatePicker
                  name="from_date"
                  isFormik={false}
                  value={fromDate}
                  onChange={(v) => setFromDate(v || "")}
                  placeholder="From"
                  max={toDate || ""}
                />
              </div>
              <div className="w-36 sm:w-40">
                <DatePicker
                  name="to_date"
                  isFormik={false}
                  value={toDate}
                  onChange={(v) => setToDate(v || "")}
                  placeholder="To"
                  min={fromDate || ""}
                />
              </div>
            </>
          )}

          <button
            onClick={() => refetch()}
            title="Refresh"
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader text="Loading dashboard..." />
      ) : (
        <>
          {/* ========== TOP STATS ROW ========== */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
            <StatCard
              label="Total Patients"
              value={d.pS.total_patients}
              icon={FiUsers}
              tone="brand"
            />
            <StatCard
              label="Appointments"
              value={d.aS.total_appointments}
              icon={FiCalendar}
              tone="accent"
            />
            <StatCard
              label="Visits"
              value={d.vS.total_visits}
              icon={FiActivity}
              tone="warn"
            />
            <StatCard
              label="Revenue"
              value={d.fS.total_amount}
              icon={FiDollarSign}
              tone="brand"
              currency
            />
            <StatCard
              label="Store Orders"
              value={d.sS.total_bookings}
              icon={FiShoppingBag}
              tone="ink"
            />
          </div>

          {/* ========== SECTION CARDS GRID ========== */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* PATIENTS */}
            <SectionCard
              title="Patients"
              icon={FiUsers}
              tone="brand"
              onViewAll={() => goToReport("/reports/patients")}
              stats={[
                { label: "Total", value: d.pS.total_patients },
                { label: "New Today", value: d.pS.registered_today },
                { label: "Active", value: d.pS.active_patients },
                { label: "Family", value: d.pS.family_members },
              ]}
            >
              <MiniPanel title="Gender">
                <MiniDonut data={d.gender} color="#2563eb" />
              </MiniPanel>
              <MiniPanel title="Registrations">
                <MiniTrend data={d.regTrend} color="#2563eb" />
              </MiniPanel>
            </SectionCard>

            {/* APPOINTMENTS */}
            <SectionCard
              title="Appointments"
              icon={FiCalendar}
              tone="accent"
              onViewAll={() => goToReport("/reports/appointments")}
              stats={[
                { label: "Total", value: d.aS.total_appointments },
                { label: "Walk-in", value: d.aS.walk_in_appointments },
                { label: "Free Slot", value: d.aS.free_slot_appointments },
                {
                  label: "Unique Patients",
                  value: d.aS.unique_registered_patients,
                },
              ]}
            >
              <MiniPanel title="Status">
                <MiniDonut data={d.apptStatus} color="#16a34a" />
              </MiniPanel>
              <MiniPanel title="Trend">
                <MiniTrend data={d.apptTrend} color="#16a34a" />
              </MiniPanel>
            </SectionCard>

            {/* VISITS */}
            <SectionCard
              title="Visits"
              icon={FiActivity}
              tone="warn"
              onViewAll={() => goToReport("/reports/visits")}
              stats={[
                { label: "Total", value: d.vS.total_visits },
                { label: "Completed", value: d.vS.completed_visits },
                { label: "Unique Patients", value: d.vS.unique_patients },
                { label: "Follow-ups", value: d.vS.visits_with_follow_up },
              ]}
            >
              <MiniPanel title="Status">
                <MiniDonut data={d.visitStatus} color="#f59e0b" />
              </MiniPanel>
              <MiniPanel title="Trend">
                <MiniTrend data={d.visitTrend} color="#f59e0b" />
              </MiniPanel>
            </SectionCard>

            {/* FINANCIAL */}
            <SectionCard
              title="Financial"
              icon={FiDollarSign}
              tone="brand"
              onViewAll={() => goToReport("/reports/financial")}
              stats={[
                { label: "Revenue", value: d.fS.total_amount, currency: true },
                { label: "Records", value: d.fS.total_payment_records },
                { label: "Tax", value: d.fS.total_tax, currency: true },
                { label: "Balance", value: d.fS.total_balance, currency: true },
              ]}
            >
              <MiniPanel title="Payment Status">
                <MiniDonut data={d.payStatus} color="#2563eb" />
              </MiniPanel>
              <MiniPanel title="Payment Trend">
                <MiniTrend data={d.payTrend} color="#2563eb" />
              </MiniPanel>
            </SectionCard>

            {/* STORE */}
            <SectionCard
              title="Store"
              icon={FiShoppingBag}
              tone="ink"
              onViewAll={() => goToReport("/reports/store")}
              stats={[
                { label: "Orders", value: d.sS.total_bookings },
                {
                  label: "Order Value",
                  value: d.sS.total_order_value,
                  currency: true,
                },
                { label: "Qty Sold", value: d.sS.total_quantity_sold },
                { label: "Products", value: d.sS.unique_products_sold },
              ]}
            >
              <MiniPanel title="Status">
                <MiniDonut data={d.storeStatus} color="#7c3aed" />
              </MiniPanel>
              <MiniPanel title="Bookings">
                <MiniTrend data={d.bookTrend} color="#7c3aed" />
              </MiniPanel>
            </SectionCard>
          </div>

          {/* ========== QUICK INSIGHT ROW ========== */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-ink-400">
            <FiTrendingUp className="h-3 w-3" />
            <span>
              For detailed breakdowns and filters, open individual report pages.
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
