# DMT ADMIN PANEL — MASTER HANDOFF

# Version: 3.0 | Updated: 2026-10-07

#

# ⚠️ AI INSTRUCTIONS:

# 1. Yeh pura document padh ke samajh le — project, rules, structure, patterns, theme, progress.

# 2. User ke saath Hinglish mein baat karo (Hindi + English mix).

# 3. Har file ke liye: agar 100% yaad nahi toh user se current code MAANG LO (RULE #43).

# 4. FULL file dena — ek bhi line chhodi nahi (RULE #47).

# 5. No emojis in code. Only react-icons (Fi, Md, Lu).

# 6. Naya module banate waqt NEW MODULE TEMPLATE section follow karo.

# ═══════════════════════════════════════════════════════════════

## 1. PROJECT OVERVIEW

- **Name:** DMT Admin Panel
- **Type:** Clinic Management System (DiabMeta)
- **Frontend:** React 19 + Vite + Tailwind 4
- **Backend:** Laravel 12 + Sanctum (REST API)
- **Purpose:** Admin panel for DiabMeta clinic (Diabetes, Thyroid, Obesity)
- **Working Dir:** `E:\NetswapTechnology\DMT\`
- **Main Code Path:** `src/features/patent/`
- **Backend Base URL:** `https://daibmeta.netswaptech.com/api/v1`

## 2. TECH STACK (LOCKED)

React 19.2.8 | Vite 8.3.0 | Tailwind CSS 4.3.3 (v4 plugin) | React Router DOM 7.18.4 | TanStack Query 5.104.1 | Zustand 5.0.15 | Axios 1.20.0 | Formik 2.4.9 | Yup 1.7.1 | react-select 5.10.2 | react-icons 5.7.0 | react-day-picker 9.x | react-phone-number-input 3.x | date-fns 4.x

## 3. FOLDER STRUCTURE (LOCKED)

```
src/
├── lib/
│   ├── axios.js              (HTTP client + interceptors)
│   └── queryClient.js        (TanStack Query config)
├── stores/
│   ├── authStore.js          (user + token, persist)
│   └── uiStore.js            (sidebar state)
├── features/
│   └── patent/
│       ├── common/           ← SHARED COMPONENTS
│       │   ├── Loader.jsx
│       │   ├── ConfirmModal.jsx
│       │   ├── CustomEditor.jsx
│       │   ├── Error.jsx
│       │   ├── GlobalConfirmModal.jsx
│       │   ├── TruncateText.jsx
│       │   ├── form/
│       │   │   ├── TextInput.jsx
│       │   │   ├── TextareaField.jsx
│       │   │   ├── SelectField.jsx
│       │   │   ├── FilterSelect.jsx        (react-select, Formik-free)
│       │   │   ├── MultiSelectField.jsx    (react-select isMulti)
│       │   │   ├── Checkbox.jsx
│       │   │   ├── RadioGroup.jsx
│       │   │   ├── FormButton.jsx
│       │   │   ├── ToggleSwitch.jsx        (Formik)
│       │   │   ├── ActionToggle.jsx        (list actions)
│       │   │   ├── DatePicker.jsx          (custom, react-day-picker)
│       │   │   ├── PhoneInput.jsx          (custom, react-phone-number-input)
│       │   │   └── index.js
│       │   ├── table/CustomeTable.jsx      (server-side pagination)
│       │   ├── toast/ToastContext.jsx      (ToastProvider + useToast)
│       │   ├── layout/
│       │   └── notification/
│       ├── components/       (AdminSidebar, AdminNavbar)
│       ├── layout/           (AdminLayout)
│       ├── queries/          (API hooks per module)
│       ├── pages/            (feature pages)
│       └── routes/           (AdminRoutes, ProtectedRoute, PublicRoute)
├── App.jsx
├── index.css
└── main.jsx
```

## 4. ALL 48 CONSTITUTION RULES (DETAILED)

### Core Patterns (1-15)

**#1 — Folder structure LOCKED**
Har naya module: `pages/<moduleName>/` mein `<ModuleName>List.jsx` + `components/<ModuleName>Form.jsx` + `components/<ModuleName>View.jsx`

**#2 — Theme tokens ONLY**
Custom tokens use karo (brand, accent, ink, warn, danger). Tailwind defaults NEVER.
❌ text-gray-500, bg-blue-600 | ✅ text-ink-500, bg-brand-600

**#3 — Custom components ALWAYS**
Raw HTML inputs NEVER. Always use TextInput, SelectField, FilterSelect, DatePicker, PhoneInputField, etc.

**#4 — State management split**
Server state → TanStack Query. Client state → Zustand. Form state → Formik.

**#5 — Formik pattern**

```jsx
<Formik
  key={initialData?.id || "new"}
  initialValues={initialValues}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
  enableReinitialize
>
  <Form>{/* fields */}</Form>
</Formik>
```

**#6 — Query-level toast**
Toast in query's `onSuccess`/`onError`, NOT in component.

**#7 — Response normalize**
List APIs return `{ list, meta }`.

```js
const list = data?.list || [];
const meta = data?.meta || {};
```

**#8 — Cursor pointer on all clickable**
`cursor-pointer` when enabled, `cursor-not-allowed` when disabled.

**#9 — getErrorMessage helper**

```js
export const getErrorMessage = (err) => {
  const data = err.response?.data;
  return data?.errors ? Object.values(data.errors)[0]?.[0] : data?.message;
};
```

**#10 — Loader component**
`<Loader text="Loading..." />`

**#11 — ConfirmModal for destructive actions**
Delete/toggle actions always confirm.

**#12 — Sidebar hidden items**
Only completed modules visible.

**#13 — Route groups**
Routes under `/features/patent/routes/`.

**#14 — No inline styles**
Tailwind classes only (except dynamic positioning in DatePicker).

**#15 — Icon library**
react-icons only (Fi, Md, Lu). No emoji, no images.

### Form & View (16-25)

**#16 — Section-wise forms & views**

```jsx
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-4 flex items-start gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      {subtitle && <p className="text-[11px] text-ink-500">{subtitle}</p>}
    </div>
  </div>
);
```

**#17 — Optional relationships**
Nullable in Yup. Conditional on parent field.

**#18 — Overflow in tables**
`truncate` with `max-w-md` or `title` attribute.

**#19 — Sidebar enabled/disabled**
Completed → enabled. Pending → disabled + tooltip.

**#20 — NO EMOJIS**
Only react-icons. Chat mein emoji chalega, code mein nahi.

**#21 — Professional UI defaults**
Rounded corners, soft shadows, proper spacing.

**#22 — No raw technical keys visible**
Humanize snake_case → Title Case. Acronyms uppercase (URL, API, ID).

**#23 — Backend keys = source of truth**
Exact match backend field name.

**#24 — Split-pane layouts**
`grid lg:grid-cols-[280px_1fr]` for complex pages.

**#25 — Full page scroll + sticky**
Header/footer/sidebar sticky.

### Misc (26-35)

**#26 — Navbar rules** — fixed top, breadcrumbs below.

**#27 — Axios content-type handling** — FormData auto, NO manual Content-Type.

**#28 — File upload base64** — Laravel PUT workaround.

**#29 — Non-Formik forms use FilterSelect**

**#30 — Sidebar only completed modules**

**#31 — ActionToggle in lists**

**#32 — 2 toggle types** — ToggleSwitch (forms), ActionToggle (lists)

**#33 — Route protection** — PublicRoute / ProtectedRoute

**#34 — 404 fallback** — NotFound with dynamic home button

**#35 — Route structure** — Pending → ComingSoon

### Wizard & State (36-40)

**#36 — Wizard clickable steps** — only visited steps clickable.

**#37 — Dirty state via useMemo**

```js
const isDirty = useMemo(() => {
  if (!localSlots) return false;
  return localSlots.some((s) => s.blocked !== s.wasBlockedInitially);
}, [localSlots]);
```

**#38 — Formik-inside check** — Custom components need `<Formik>` wrapper.

**#39 — No modal during save**

**#40 — isSaving disables everything**

### Data (41-44)

**#41 — Backend keys humanize** — `created_at` → "Created At", `api_url` → "API URL"

**#42 — Feature flags on UI** — disabled + cursor-not-allowed + opacity-60

**#43 — FILE CERTAINTY RULE** — agar 100% yaad nahi, user se MAANG LO current code

**#44 — maxLength**
Name 150 | Email 150 | Description 500 | Notes 500 | Address 500 | Reason 500 | URL 500 | PIN 4 | Age 3 | Password 128

### Components (45-47)

**#45 — PhoneInput custom component**
`react-phone-number-input` wrapper. Formik + non-Formik. `validatePhone` export.

**#46 — DatePicker custom component**
`react-day-picker` wrapper. Month/year dropdowns. Position-aware.

**#47 — Always give FULL file**

### Deferred (48)

**#48 — Permission system** — deferred, backend API ke baad.

## 5. THEME TOKENS (LOCKED)

**Tokens:** `brand-50→800` (brand-600 MAIN) | `accent-50→900` | `ink-50→900` | `warn-50,100,200,800,900` | `danger-50,100,500,600,900` | `bg-app`, `bg-surface` | Form tokens: `form-bg, form-border, form-text, form-label, form-placeholder, form-error, form-ring, form-check-accent` | Table tokens: `table-bg, table-head-bg, table-head-text, table-row-bg, table-row-hover-bg, table-cell-text, table-page-*` | Radius: `rounded-card` | Fonts: `font-jakarta` (headings), `font-inter` (body)

🚫 NEVER: `text-gray-500`, `bg-blue-600` | ✅ ALWAYS: `text-ink-500`, `bg-brand-600`

## 6. PATTERNS (FOLLOW EXACTLY)

1. **Server State** → TanStack Query (`queries/*.js`), toast query-level, `{ list, meta }`
2. **Client State** → Zustand (`stores/`)
3. **Forms** → `<Formik>` component, `key` prop, `enableReinitialize`, maxLength
4. **Lists** → CustomeTable (server-side)
5. **Filters** → FilterSelect (react-select, Formik-free)
6. **Actions** → ActionToggle (green/gray toggle)
7. **Form status** → ToggleSwitch
8. **Cursor pointer** on all clickable
9. **No emojis** — only react-icons
10. **Dirty state** via useMemo
11. **Routes** — PublicRoute / ProtectedRoute / ComingSoon

## 7. CUSTOM COMPONENT USAGE

**DatePicker:**

```jsx
// Formik mode
<DatePicker label="Date of Birth" name="dob" placeholder="Select date" min="2020-01-01" max="2026-12-31" required />

// Non-Formik mode
<DatePicker name="date_from" isFormik={false} value={dateFromFilter} onChange={(v) => setDateFromFilter(v || "")} placeholder="From date" min={dateToFilter || ""} />
```

**PhoneInputField:**

```jsx
// Formik mode
<PhoneInputField label="Mobile" name="mobile" placeholder="Enter phone" defaultCountry="IN" required />

// Non-Formik mode
<PhoneInputField name="mobile" label="Mobile" isFormik={false} value={form.mobile} onChange={(val) => update("mobile", val || "")} defaultCountry="IN" />
```

**Phone validation:**

```js
import { validatePhone } from "common/form";
phone: Yup.string().required("Phone is required").test("phone", "Invalid phone", validatePhone),
```

## 8. 🆕 NEW MODULE CREATION TEMPLATE

### STEP 1 — Folder banao

```
src/features/patent/pages/<moduleName>/
├── <ModuleName>List.jsx
└── components/
    ├── <ModuleName>Form.jsx
    └── <ModuleName>View.jsx
```

### STEP 2 — Query file

`src/features/patent/queries/<moduleName>.js`

```js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { useToast } from "../common/toast/ToastContext";

export const queryKeys = {
  all: ["<moduleName>"],
  list: (params) => [...queryKeys.all, "list", params],
  detail: (id) => [...queryKeys.all, "detail", id],
};

export const getErrorMessage = (err) => {
  const data = err.response?.data;
  return data?.errors ? Object.values(data.errors)[0]?.[0] : data?.message;
};

export const use<ModuleName>s = (params) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get("/<endpoint>", { params });
      return {
        list: data.data?.data || data.data || [],
        meta: data.data?.meta || data.meta || {},
      };
    },
  });

export const use<ModuleName> = (id) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/<endpoint>/${id}`);
      return data.data || data;
    },
    enabled: !!id,
  });

export const useCreate<ModuleName> = () => {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload) => api.post("/<endpoint>", payload),
    onSuccess: () => {
      toast.success("Created successfully");
      qc.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdate<ModuleName> = () => {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }) => api.put(`/<endpoint>/${id}`, payload),
    onSuccess: () => {
      toast.success("Updated successfully");
      qc.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useDelete<ModuleName> = () => {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => api.delete(`/<endpoint>/${id}`),
    onSuccess: () => {
      toast.success("Deleted successfully");
      qc.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useToggle<ModuleName>Status = () => {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => api.patch(`/<endpoint>/${id}/toggle-status`),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};
```

### STEP 3 — List page

`<ModuleName>List.jsx`

```jsx
import { useState } from "react";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import {
  use<ModuleName>s,
  useToggle<ModuleName>Status,
  useDelete<ModuleName>,
} from "../../queries/<moduleName>";
import <ModuleName>Form from "./components/<ModuleName>Form";
import <ModuleName>View from "./components/<ModuleName>View";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, ActionToggle } from "../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const <ModuleName>List = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: null, item: null });

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } = use<ModuleName>s(params);
  const toggleStatus = useToggle<ModuleName>Status();
  const deleteMutation = useDelete<ModuleName>();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleAdd = () => { setEditData(null); setFormOpen(true); };
  const handleEdit = (item) => { setEditData(item); setFormOpen(true); };
  const handleView = (id) => setViewId(id);
  const handleToggleClick = (item) => setConfirm({ open: true, type: "toggle", item });
  const handleDeleteClick = (item) => setConfirm({ open: true, type: "delete", item });

  const handleConfirm = () => {
    const { type, item } = confirm;
    if (!item) return;
    const mutation = type === "toggle" ? toggleStatus : deleteMutation;
    mutation.mutate(item.id, {
      onSettled: () => setConfirm({ open: false, type: null, item: null }),
    });
  };

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const columns = [
    { header: "#", render: (_, __, idx) => <span className="text-ink-500">{idx + 1}</span> },
    { header: "Name", accessor: "name", render: (v) => <span className="font-medium text-ink-900">{v}</span> },
    { header: "Status", accessor: "status", render: (v) => <StatusBadge active={v} /> },
    {
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn title="View" onClick={() => handleView(row.id)}><FiEye className="h-4 w-4" /></IconBtn>
          <IconBtn title="Edit" onClick={() => handleEdit(row)}><FiEdit2 className="h-4 w-4" /></IconBtn>
          <ActionToggle active={row.status} onClick={() => handleToggleClick(row)} loading={toggleStatus.isPending && toggleStatus.variables === row.id} />
          <IconBtn title="Delete" onClick={() => handleDeleteClick(row)} danger><FiTrash2 className="h-4 w-4" /></IconBtn>
        </div>
      ),
    },
  ];

  const confirmConfig = confirm.type === "delete"
    ? { title: "Delete", message: `Delete "${confirm.item?.name}"?`, confirmText: "Delete", variant: "danger" }
    : { title: confirm.item?.status ? "Deactivate" : "Activate", message: "Continue?", confirmText: confirm.item?.status ? "Deactivate" : "Activate", variant: "warn" };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900"><ModuleName>s</h1>
          <p className="mt-1 text-sm text-ink-500">Manage <moduleName>s</p>
        </div>
        <button onClick={handleAdd} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700">
          <FiPlus className="h-4 w-4" />
          Add <ModuleName>
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input type="text" placeholder="Search..." value={search} maxLength={150} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder" />
        </div>
        <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTIONS} placeholder="All Status" isClearable width="w-40" />
        <button onClick={() => refetch()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50">
          <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <Loader text="Loading..." />
      ) : (
        <CustomeTable columns={columns} data={list} serverSide currentPage={currentPage} totalPages={lastPage} totalItems={total} itemsPerPage={metaPerPage} onPageChange={(p) => setPage(p)} emptyText={search ? "No results found." : "No data found."} />
      )}

      <<ModuleName>Form open={formOpen} onClose={() => { setFormOpen(false); setEditData(null); }} initialData={editData} />
      <<ModuleName>View open={!!viewId} onClose={() => setViewId(null)} id={viewId} />

      <ConfirmModal open={confirm.open} title={confirmConfig.title} message={confirmConfig.message} confirmText={confirmConfig.confirmText} variant={confirmConfig.variant} onConfirm={handleConfirm} onCancel={() => setConfirm({ open: false, type: null, item: null })} loading={toggleStatus.isPending || deleteMutation.isPending} />
    </div>
  );
};

const StatusBadge = ({ active }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"}`}>
    {active ? "Active" : "Inactive"}
  </span>
);

const IconBtn = ({ children, title, onClick, disabled, danger }) => (
  <button type="button" title={title} onClick={onClick} disabled={disabled} className={`cursor-pointer rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${danger ? "text-danger-500 hover:bg-danger-50" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"}`}>
    {children}
  </button>
);

export default <ModuleName>List;
```

### STEP 4 — Form component

`<ModuleName>Form.jsx`

```jsx
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
import { useCreate<ModuleName>, useUpdate<ModuleName> } from "../../../queries/<moduleName>";
import {
  TextInput, TextareaField, FormButton, ToggleSwitch,
  DatePicker,        // if date field
  PhoneInputField, validatePhone,  // if phone field
} from "../../../common/form";

const <ModuleName>Form = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;
  const createMutation = useCreate<ModuleName>();
  const updateMutation = useUpdate<ModuleName>();

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const initialValues = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    phone: initialData?.phone || "",
    date_field: initialData?.date_field || "",
    status: initialData?.status ?? true,
  };

  const validationSchema = Yup.object({
    name: Yup.string().trim().required("Name is required").max(150, "Max 150"),
    description: Yup.string().nullable(),
    phone: Yup.string().required("Phone is required").test("phone", "Invalid phone", validatePhone),
    date_field: Yup.string().nullable(),
    status: Yup.boolean(),
  });

  const handleSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      phone: values.phone.trim(),
      date_field: values.date_field || null,
      status: values.status,
    };
    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: initialData.id, payload })
      : createMutation.mutateAsync(payload);
    mutation.then(() => onClose()).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-surface px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900">
            {isEdit ? "Edit <ModuleName>" : "Add <ModuleName>"}
          </h2>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <Formik key={initialData?.id || "new"} initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
          <Form className="px-5 py-5">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextInput label="Name" name="name" placeholder="Enter name" maxLength={150} required />
              </div>
              <PhoneInputField label="Phone" name="phone" placeholder="Enter phone" defaultCountry="IN" required />
              <DatePicker label="Date Field" name="date_field" placeholder="Select date" />
              <div className="sm:col-span-2">
                <TextareaField label="Description" name="description" rows={3} placeholder="Short description..." maxLength={500} />
              </div>
            </div>

            <ToggleSwitch name="status" label="Status" description="Toggle to activate or deactivate" />

            <div className="mt-4 flex justify-end gap-3 border-t border-ink-100 pt-4">
              <button type="button" onClick={onClose} disabled={isPending} className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <div className="w-40">
                <FormButton type="submit" text={isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update" : "Create")} disabled={isPending} />
              </div>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default <ModuleName>Form;
```

### STEP 5 — View component

`<ModuleName>View.jsx`

```jsx
import { FiX } from "react-icons/fi";
import { use<ModuleName> } from "../../../queries/<moduleName>";
import Loader from "../../../common/Loader";

const <ModuleName>View = ({ open, onClose, id }) => {
  const { data, isLoading } = use<ModuleName>(id);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900"><ModuleName> Details</h2>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">
          {isLoading ? (
            <Loader text="Loading details..." />
          ) : (
            <div className="space-y-4">
              <Row label="Name" value={data?.name} />
              <Row label="Phone" value={data?.phone || "—"} />
              <Row label="Description" value={data?.description || "—"} />
              <Row label="Status" value={
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${data?.status ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"}`}>
                  {data?.status ? "Active" : "Inactive"}
                </span>
              } />
              <Row label="Created At" value={data?.created_at ? new Date(data.created_at).toLocaleString() : "—"} />
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-ink-100 px-5 py-4">
          <button onClick={onClose} className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4">
    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
    <div className="col-span-2 text-sm text-ink-800">{value}</div>
  </div>
);

export default <ModuleName>View;
```

### STEP 6 — Route add karo

`routes/AdminRoutes.jsx`:

```jsx
import <ModuleName>List from "../pages/<moduleName>/<ModuleName>List";
<Route path="/<moduleName>s" element={<<ModuleName>List />} />
```

### STEP 7 — Sidebar mein add karo

`components/AdminSidebar.jsx`:

```jsx
{ label: "<ModuleName>s", icon: FiIcon, path: "/<moduleName>s", enabled: true }
```

### NEW MODULE CHECKLIST

- [ ] Folder structure bana
- [ ] Query file bani (all hooks)
- [ ] List page bani (CustomeTable, FilterSelect, ActionToggle, ConfirmModal)
- [ ] Form component bani (Formik, key prop, maxLength, validation)
- [ ] View component bani (Loader, cursor-pointer)
- [ ] Route add ki
- [ ] Sidebar mein add kiya
- [ ] DatePicker integrate (agar date field)
- [ ] PhoneInputField integrate (agar phone field)
- [ ] maxLength sab inputs pe
- [ ] cursor-pointer sab clickable pe
- [ ] No emoji, only react-icons
- [ ] Theme tokens use kiye
- [ ] Toast query-level
- [ ] Test kiya

## 9. maxLength VALUES (RULE #44)

| Field             | maxLength                   |
| ----------------- | --------------------------- |
| Name              | 150                         |
| Email             | 150                         |
| Description       | 500                         |
| Notes             | 500                         |
| Address           | 500                         |
| Reason            | 500                         |
| URL               | 500                         |
| PIN               | 4                           |
| Age               | 3                           |
| Password          | 128                         |
| Sort Order        | number input (no maxLength) |
| Duration/Capacity | number input (no maxLength) |

## 10. ✅ COMPLETED MODULES (10 modules, ~50 files)

1. **AUTH** — Login.jsx ✅ | Register.jsx ✅ | VerifyEmail.jsx ✅
2. **SPECIALIZATIONS** — List ✅ | Form ✅ | View ✅
3. **ROLES** — List ✅ | Form ✅ | View ✅
4. **STAFF** — List ✅ | Form ✅ | View ✅
5. **APPOINTMENT TYPES** — List ✅ | Form ✅ | View ✅
6. **SETTINGS** — SettingsPage ✅ | SettingField ✅ | SettingsGroupTab ✅ | SettingsSkeleton ✅
7. **PATIENTS** — List ✅ | Form ✅ | View ✅ | Card ✅ | FamilyMembersSection ✅
8. **PROVIDER AVAILABILITY** — List ✅ | Wizard ✅ | View ✅ | WizardStepper ✅ | Step1 ✅ | Step2 ✅ | Step3 ✅ | Step4 ✅ | SlotCalendar ✅ | ExceptionForm ✅
9. **AVAILABILITY EXCEPTIONS** — AvailabilityExceptions.jsx ✅
10. **APPOINTMENTS** — List ✅ | Booking ✅ | View ✅ | Edit ✅ | StatusBadge ✅ | StatusModal ✅ | Step1 ✅ | Step2 ✅ | Step3 ✅ | Step4 ✅ | SlotGrid ✅ | AvailableDatesCalendar ✅

**Changes summary:**

- DatePicker integrated → 6 files
- PhoneInputField integrated → 3 files + Settings (key-based)
- maxLength → ~95% files
- cursor-pointer → ~95% files

## 11. ⏸️ PENDING MODULES (ComingSoon routes)

Visits, Doctors, Dietitians, Services, Free Services, Products, Orders, Delivery, Banners, Reports

## 12. ⚠️ IMPORTANT NOTES

**PHONE FIELDS — E.164 FORMAT:**
Phone fields E.164 (`+919876543210`) mein save ho rahe hain.

- Backend E.164 accept karta hai → as-is bhej ✅
- Backend 10-digit chahiye → `phone.replace(/^\+91/, "")`

**3 CALENDARS — ALAG PURPOSE:**

- `DatePicker` → generic date selection
- `AvailableDatesCalendar` → provider-available dates (slot booking)
- `SlotCalendar` → availability preview (overlap detection)

**SETTINGS PHONE DETECTION:**

```js
const isPhoneKey = (key) =>
  /phone|mobile|whatsapp|contact_number|contact_no/i.test(key || "");
```

## 13. 🔄 WORKFLOW

1. User bolega "X file mein Y change karo"
2. AI current code maangega agar yaad nahi (RULE #43)
3. User paste karega
4. AI FULL updated file dega (RULE #47)
5. User test karega, bataega

## 14. 📌 KEY BEHAVIORS

- Toast messages in ENGLISH
- Conversation in Hinglish
- Cursor pointer on all clickable
- No emojis in code
- All forms use `<Formik>` with `key` prop
- All lists use `CustomeTable`
- All filters use `FilterSelect`
- Form status → `ToggleSwitch`, List status → `ActionToggle`
- Query responses `{ list, meta }`
- Errors via `getErrorMessage`
- Active (green pill), Inactive (gray pill)
- Overlap slots: LIGHT RED (`bg-danger-50/60`, `text-danger-700`)
- Blocked slots: GRAY (`bg-ink-100`, `text-ink-500`)
- New slots: GREEN (`bg-brand-50`, `text-brand-700`)
- Time format: 2 lines — `"10:30 AM –"` / `"11:00 AM"`
- Period format: 2 lines — `"2026-12-03 –"` / `"2027-02-27"`

## 15. 📊 PROGRESS SUMMARY

| Category               | Status                       |
| ---------------------- | ---------------------------- |
| DatePicker integration | ✅ 100% (6 files)            |
| PhoneInputField        | ✅ 100% (3 files + Settings) |
| maxLength              | ✅ ~95%                      |
| cursor-pointer         | ✅ ~95%                      |
| Rule compliance        | ✅ All followed              |
| Completed modules      | ✅ 10/10                     |
| Pending modules        | ⏳ 10 (ComingSoon)           |

## 16. 🎯 HOW TO CONTINUE (Next Chat)

1. Yeh pura document paste karo naye chat mein
2. Bolo: "Yeh handoff hai. Main DMT Admin Panel pe kaam kar raha hoon. Ab next file bhej raha hoon: [filename]"
3. File ka current code paste karo
4. AI ko sab yaad aa jayega

═══════════════════════════════════════════════════════════════
END OF MASTER HANDOFF DOCUMENT
═══════════════════════════════════════════════════════════════
