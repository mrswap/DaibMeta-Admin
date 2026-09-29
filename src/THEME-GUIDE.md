# 🎨 NST Health Admin — Theme Guide

> Ek hi file mein poori theme ka gyaan. Kabhi confusion ho to yahi khol lo.
> **Golden Rule:** Component mein kabhi real color ka naam mat likho. Sirf theme nickname likho.

---

## 📑 Table of Contents

1. [Theme kahan define hoti hai](#1-theme-kahan-define-hoti-hai)
2. [Theme Architecture — 3 layers](#2-theme-architecture--3-layers)
3. [Color families](#3-color-families)
4. [Cheat Sheet — purana vs naya](#4-cheat-sheet)
5. [Admin UI — component examples](#5-admin-ui--component-examples)
6. [Form Elements — component examples](#6-form-elements--component-examples)
7. [Table — component examples](#7-table--component-examples)
8. [Opacity / Transparency](#8-opacity--transparency)
9. [Naya component checklist](#9-naya-component-checklist)
10. [Theme change karni ho to](#10-theme-change-karni-ho-to)
11. [Common galtiyan](#11-common-galtiyan)
12. [Theme Preview Page](#12-theme-preview-page)
13. [File structure](#13-file-structure)

---

## 1. Theme kahan define hoti hai

**Sirf ek file:** `src/index.css`

Us file ke andar `@theme { ... }` block mein saare colors likhe hain. Wahi ek jagah hai jahan se poori app ka color control hota hai.

```css
@theme {
  /* Admin UI */
  --color-brand-600: rgb(5 150 105);
  --color-accent-50: rgb(240 249 255);
  --color-ink-800: rgb(30 41 59);

  /* Forms */
  --color-form-ring: rgb(34 166 153);
  --color-btn-primary-bg: rgb(34 166 153);

  /* Table */
  --color-table-head-bg: rgb(248 250 252);
  --color-table-page-active-bg: rgb(24 73 148);
  /* ... etc */
}
```

**Baaki kisi bhi file mein color define nahi karna.** Sirf use karna hai.

---

## 2. Theme Architecture — 3 layers

Poori app ke colors **3 independent layers** mein divided hain. Isse tum ek layer change karke baaki ko safe rakh sakte ho:

| Layer        | Prefix                                                       | Kya control karta hai                             | Kahan use hota hai       |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------- | ------------------------ |
| **Admin UI** | `brand`, `accent`, `ink`, `warn`, `danger`, `app`, `surface` | Sidebar, navbar, dashboard, layout                | Layout + page components |
| **Form**     | `form-*`, `btn-*`                                            | Input, textarea, select, checkbox, radio, buttons | Form components          |
| **Table**    | `table-*`                                                    | Table header, rows, pagination                    | Table components         |

**Fayda:**

- Form ka focus color badalna ho → sirf `form-*` chhuo, admin safe
- Table ka header dark karna ho → sirf `table-*` chhuo
- Brand color badalna ho → `brand-*` chhuo, forms/table safe

---

## 3. Color families

### 🎨 Admin UI families

| Family    | Kaam                        | Kab use karo                                               |
| --------- | --------------------------- | ---------------------------------------------------------- |
| `brand`   | Primary brand color (green) | Primary buttons, active nav, main CTA, "Completed" badge   |
| `accent`  | Info / soft blue            | In-Consult badge, search box bg, info surfaces, soft pills |
| `ink`     | Text + borders + greys      | Saara text, borders, dividers, muted labels, neutral bg    |
| `warn`    | Amber / warning             | "Arrived" status, pending state, highlighted row           |
| `danger`  | Red / alert                 | Notification dot, error text, alert badges                 |
| `app`     | Page background             | Poora page wrapper (`<div className="bg-app">`)            |
| `surface` | Card / navbar / sidebar bg  | Har card, navbar, sidebar, modal                           |

### 📝 Form families

| Family                   | Kaam                                 |
| ------------------------ | ------------------------------------ |
| `form-bg`                | Input / textarea / select background |
| `form-bg-disabled`       | Disabled input bg                    |
| `form-border`            | Normal border                        |
| `form-border-hover`      | Hover pe border                      |
| `form-border-focus`      | Focus pe border color                |
| `form-border-error`      | Error border                         |
| `form-border-disabled`   | Disabled border                      |
| `form-text`              | Input text color                     |
| `form-text-disabled`     | Disabled text                        |
| `form-placeholder`       | Placeholder text                     |
| `form-label`             | Label text                           |
| `form-required`          | `*` mark                             |
| `form-error`             | Error message text                   |
| `form-help`              | Helper text                          |
| `form-ring`              | Focus ring color                     |
| `form-ring-error`        | Error focus ring                     |
| `form-check-accent`      | Checkbox/radio checked color         |
| `btn-primary-bg`         | Primary form button                  |
| `btn-primary-bg-hover`   | Primary button hover                 |
| `btn-primary-text`       | Primary button text                  |
| `btn-secondary-bg`       | Secondary button                     |
| `btn-secondary-bg-hover` | Secondary button hover               |
| `btn-secondary-text`     | Secondary button text                |
| `btn-danger-bg`          | Danger button                        |
| `btn-danger-bg-hover`    | Danger button hover                  |
| `btn-danger-text`        | Danger button text                   |

### 📊 Table families

| Family                         | Kaam                   |
| ------------------------------ | ---------------------- |
| `table-bg`                     | Table card bg          |
| `table-border`                 | Outer border           |
| `table-head-bg`                | Thead background       |
| `table-head-text`              | Header text            |
| `table-head-border`            | Header bottom border   |
| `table-row-bg`                 | Row background         |
| `table-row-hover-bg`           | Row hover bg           |
| `table-row-border`             | Row divider            |
| `table-cell-text`              | Cell text              |
| `table-empty-text`             | "No data" text         |
| `table-page-text`              | "Showing X of Y"       |
| `table-page-active-bg`         | Active page btn bg     |
| `table-page-active-text`       | Active page btn text   |
| `table-page-btn-border`        | Normal page btn border |
| `table-page-btn-text`          | Normal page btn text   |
| `table-page-btn-hover-border`  | Page btn hover border  |
| `table-page-btn-hover-text`    | Page btn hover text    |
| `table-page-btn-disabled-bg`   | Disabled page btn bg   |
| `table-page-btn-disabled-text` | Disabled page btn text |
| `table-page-border`            | Pagination top border  |
| `table-dots`                   | `...` dots color       |

---

## 4. Cheat Sheet

**Yaad rakhne ka ek hi trick:** purana color → theme nickname

### Admin UI migration

| ❌ Purana            | ✅ Naya            | Kab               |
| -------------------- | ------------------ | ----------------- |
| `bg-emerald-50`      | `bg-brand-50`      | halka green bg    |
| `bg-emerald-600`     | `bg-brand-600`     | solid green       |
| `text-emerald-700`   | `text-brand-700`   | green text        |
| `border-emerald-200` | `border-brand-200` | green border      |
| `bg-sky-50`          | `bg-accent-50`     | soft blue bg      |
| `bg-sky-100`         | `bg-accent-100`    | blue bg           |
| `text-sky-900`       | `text-accent-900`  | dark blue text    |
| `bg-blue-600`        | `bg-accent-600`    | solid blue button |
| `bg-slate-50`        | `bg-ink-50`        | lightest grey     |
| `bg-slate-100`       | `bg-ink-100`       | light grey        |
| `text-slate-500`     | `text-ink-500`     | muted text        |
| `text-slate-800`     | `text-ink-800`     | primary text      |
| `text-slate-900`     | `text-ink-900`     | heading text      |
| `border-slate-100`   | `border-ink-100`   | very light border |
| `border-slate-200`   | `border-ink-200`   | light border      |
| `bg-amber-50`        | `bg-warn-50`       | light amber       |
| `bg-amber-100`       | `bg-warn-100`      | amber bg          |
| `text-amber-900`     | `text-warn-900`    | dark amber text   |
| `bg-red-500`         | `bg-danger-500`    | red dot           |
| `bg-red-50`          | `bg-danger-50`     | light red         |
| `bg-white`           | `bg-surface`       | card / navbar bg  |
| `bg-[#f8f9ff]`       | `bg-app`           | page background   |

### Form migration

| ❌ Purana                   | ✅ Naya                             |
| --------------------------- | ----------------------------------- |
| `border-gray-300`           | `border-form-border`                |
| `focus:ring-blue-500`       | `focus:ring-form-ring`              |
| `focus:border-blue-500`     | `focus:border-form-border-focus`    |
| `text-[#29324C]` (label)    | `text-form-label`                   |
| `text-red-500` (error)      | `text-form-error`                   |
| `text-red-500` (\* mark)    | `text-form-required`                |
| `bg-gray-100` (disabled)    | `bg-form-bg-disabled`               |
| `bg-[#22A699]` (button)     | `bg-btn-primary-bg`                 |
| `hover:bg-[#1c8c82]`        | `hover:bg-btn-primary-bg-hover`     |
| `placeholder:text-gray-400` | `placeholder:text-form-placeholder` |

### Table migration

| ❌ Purana                     | ✅ Naya                        |
| ----------------------------- | ------------------------------ |
| `border-gray-300`             | `border-table-border`          |
| `bg-slate-50` (thead)         | `bg-table-head-bg`             |
| `text-[#090F31]`              | `text-table-head-text`         |
| `hover:bg-slate-50` (row)     | `hover:bg-table-row-hover-bg`  |
| `border-slate-100` (row)      | `border-table-row-border`      |
| `text-gray-700` (cell)        | `text-table-cell-text`         |
| `bg-[#184994]` (active page)  | `bg-table-page-active-bg`      |
| `border-slate-200` (page btn) | `border-table-page-btn-border` |

---

## 5. Admin UI — component examples

### 🟢 Primary Button

```jsx
<button className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition shadow-sm">
  New Appointment
</button>
```

### ⚪ Secondary Button

```jsx
<button className="px-4 py-2 rounded-lg bg-ink-100 text-ink-700 font-medium hover:bg-ink-200 transition">
  View Summary
</button>
```

### 🔵 Info Button

```jsx
<button className="px-3 py-1.5 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 shadow-sm">
  Open Chart
</button>
```

### 🃏 Card

```jsx
<div className="bg-surface rounded-xl p-4 shadow-sm border border-ink-100">
  ...
</div>
```

### 📝 Heading + Subtext

```jsx
<h1 className="text-2xl font-bold text-ink-800 tracking-tight">Appointments</h1>
<p className="text-sm text-ink-500 mt-1">
  Manage patient bookings, walk-ins, and schedule statuses
</p>
```

### 📍 Active NavLink

```jsx
<NavLink
  to={path}
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-50 text-brand-700 font-semibold"
        : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
    }`
  }
>
  {name}
</NavLink>
```

### 🏷️ Badges

```jsx
{
  /* Completed */
}
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
  Completed
</span>;

{
  /* In-Consult */
}
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-900">
  <span className="w-1.5 h-1.5 rounded-full bg-accent-600"></span>
  In-Consult
</span>;

{
  /* Arrived */
}
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warn-100 text-warn-900">
  Arrived
</span>;

{
  /* Booked */
}
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-600">
  Booked
</span>;
```

### 🔴 Notification Dot

```jsx
<span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-danger-500"></span>
```

### 🔍 Search Input (Admin)

```jsx
<div className="relative">
  <FiSearch className="absolute left-3 top-3 text-ink-400" />
  <input
    type="text"
    placeholder="Search..."
    className="w-full h-10 pl-9 pr-4 rounded-lg bg-ink-50 border border-ink-100 text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
  />
</div>
```

### 🖼️ Page Wrapper

```jsx
<div className="flex flex-col gap-6 bg-app p-4 font-sans">...</div>
```

### 🌈 Gradient Avatar

```jsx
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-sm font-bold">
  DM
</div>
```

---

## 6. Form Elements — component examples

### 🧩 TextInput

```jsx
<TextInput
  label="Full Name"
  name="name"
  placeholder="Enter patient name"
  required
/>
```

**Under the hood:**

```jsx
className="
  w-full px-3 py-2 rounded-md text-sm
  bg-form-bg text-form-text
  placeholder:text-form-placeholder
  border border-form-border
  hover:border-form-border-hover
  focus:outline-none
  focus:border-form-border-focus
  focus:ring-1 focus:ring-form-ring
"
```

### 🧩 TextareaField

```jsx
<TextareaField
  label="Clinical Notes"
  name="bio"
  rows={4}
  placeholder="Patient history, symptoms..."
/>
```

### 🧩 SelectField (react-select)

```jsx
<SelectField
  label="Assigned Doctor"
  name="doctor"
  options={selectOptions}
  placeholder="Choose doctor..."
  required
/>
```

> **Note:** `react-select` inline styles use karta hai, isliye wahan **CSS variables directly** use hote hain: `var(--color-form-ring)`, `var(--color-form-border)`, etc.

### 🧩 Checkbox

```jsx
<Checkbox label="I agree to the terms" name="terms" />
```

### 🧩 RadioGroup

```jsx
<RadioGroup
  label="Gender"
  name="gender"
  options={[
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ]}
/>
```

### 🧩 FormButton

```jsx
<FormButton text="Submit Form" type="submit" />
```

**Under the hood:**

```jsx
className="
  w-full py-2 rounded-lg font-medium
  bg-btn-primary-bg
  hover:bg-btn-primary-bg-hover
  text-btn-primary-text
  focus:ring-2 focus:ring-form-ring
"
```

### 📋 Complete Formik Form

```jsx
<Formik
  initialValues={{ name: "", email: "", doctor: null, gender: "" }}
  onSubmit={(values) => console.log(values)}
>
  <Form className="max-w-2xl">
    <TextInput label="Full Name" name="name" required />
    <TextInput label="Email" name="email" type="email" />
    <SelectField label="Doctor" name="doctor" options={options} />
    <TextareaField label="Notes" name="bio" rows={3} />
    <RadioGroup label="Gender" name="gender" options={genders} />
    <Checkbox label="I agree" name="terms" />
    <FormButton text="Submit" />
  </Form>
</Formik>
```

---

## 7. Table — component examples

### 📊 CustomeTable — Client-side

```jsx
<CustomeTable
  columns={[
    { header: "Patient", accessor: "name" },
    { header: "Age", accessor: "age" },
    {
      header: "Status",
      accessor: "status",
      render: (val) => <StatusBadge status={val} />,
    },
  ]}
  data={patients}
  serverSide={false}
  itemsPerPage={10}
  emptyText="No patients found."
/>
```

### 📊 CustomeTable — Server-side

```jsx
<CustomeTable
  columns={columns}
  data={currentPageData}
  serverSide={true}
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalItems}
  onPageChange={(p) => setPage(p)}
  itemsPerPage={10}
/>
```

### 🎨 Table styling tokens in use

```jsx
{/* Container */}
<div className="bg-table-bg border-table-border rounded-xl">

{/* Header */}
<thead className="bg-table-head-bg">
  <th className="text-table-head-text border-b border-table-head-border">

{/* Row */}
<tr className="bg-table-row-bg hover:bg-table-row-hover-bg border-b border-table-row-border">
  <td className="text-table-cell-text">

{/* Pagination */}
<button className="bg-table-page-active-bg text-table-page-active-text">
<button className="border-table-page-btn-border text-table-page-btn-text">
```

---

## 8. Opacity / Transparency

`/` lagakar opacity de sakte ho:

```jsx
<div className="bg-brand-100/70">...</div>       {/* 70% */}
<div className="bg-accent-50/60">...</div>       {/* 60% */}
<div className="bg-warn-50/70">...</div>         {/* 70% */}
<div className="ring-brand-500/20">...</div>     {/* 20% ring */}
<div className="bg-table-row-hover-bg/50">...</div>
```

---

## 9. Naya component checklist

### Admin UI component

- [ ] **Card?** → `bg-surface border-ink-100 rounded-xl`
- [ ] **Primary button?** → `bg-brand-600 text-white hover:bg-brand-700`
- [ ] **Secondary button?** → `bg-ink-100 text-ink-700 hover:bg-ink-200`
- [ ] **Heading?** → `text-ink-800` ya `text-ink-900`
- [ ] **Muted text?** → `text-ink-500`
- [ ] **Border?** → `border-ink-100` ya `border-ink-200`
- [ ] **Status?** → `brand` / `accent` / `warn` / `danger`
- [ ] **Page wrapper?** → `bg-app`

### Form component

- [ ] **Input bg?** → `bg-form-bg`
- [ ] **Input border?** → `border-form-border`
- [ ] **Focus ring?** → `focus:ring-form-ring`
- [ ] **Focus border?** → `focus:border-form-border-focus`
- [ ] **Label?** → `text-form-label`
- [ ] **Error text?** → `text-form-error`
- [ ] **`*` mark?** → `text-form-required`
- [ ] **Disabled?** → `bg-form-bg-disabled text-form-text-disabled`
- [ ] **Button?** → `bg-btn-primary-bg hover:bg-btn-primary-bg-hover`

### Table component

- [ ] **Container?** → `bg-table-bg border-table-border`
- [ ] **Header?** → `bg-table-head-bg text-table-head-text`
- [ ] **Row hover?** → `hover:bg-table-row-hover-bg`
- [ ] **Divider?** → `border-table-row-border`
- [ ] **Cell text?** → `text-table-cell-text`
- [ ] **Active page?** → `bg-table-page-active-bg text-table-page-active-text`

---

## 10. Theme change karni ho to

### 🟢 Brand color badalna (green → blue)

```css
--color-brand-600: rgb(37 99 235);
--color-brand-700: rgb(29 78 216);
```

**Effect:** Saare primary buttons, active navlinks, "Completed" badges, "New" button — sab blue.

### 🎨 Page background

```css
--color-app: rgb(245 247 250);
```

### 🃏 Card background

```css
--color-surface: rgb(255 255 255);
```

### 📝 Text colors

```css
--color-ink-800: rgb(30 41 59); /* primary */
--color-ink-500: rgb(100 116 139); /* muted */
```

### 🔵 Accent (info) color

```css
--color-accent-600: rgb(147 51 234); /* purple */
```

### ⚠️ Arrived (warn) color

```css
--color-warn-100: rgb(254 215 170);
--color-warn-900: rgb(154 52 18);
```

### 📝 Form focus ring color

```css
--color-form-ring: rgb(236 72 153); /* pink */
--color-form-border-focus: rgb(236 72 153);
```

**Effect:** Saare inputs, textareas, selects ka focus pink ho jayega.

### 📝 Form button color

```css
--color-btn-primary-bg: rgb(37 99 235);
--color-btn-primary-bg-hover: rgb(29 78 216);
```

**Effect:** Form submit buttons blue ho jayenge (admin UI ke buttons safe).

### 📊 Table active page color

```css
--color-table-page-active-bg: rgb(220 38 38);
```

**Effect:** Table ka active page button red.

### 📊 Table header dark

```css
--color-table-head-bg: rgb(30 41 59);
--color-table-head-text: rgb(255 255 255);
```

**Effect:** Table header dark ho jayega, text white.

---

## 11. Common galtiyan

### ❌ Ye NAHI karna

```jsx
// Purane hardcoded colors mat likho
<div className="bg-emerald-600 text-slate-800 border-sky-100" />

// Arbitrary hex mat likho
<div className="bg-[#10b981]" />

// Inline style mein RGB mat likho
<div style={{ backgroundColor: "rgb(5 150 105)" }} />

// Dark mode vari kabhi add mat karo
```

### ✅ Ye karna

```jsx
// Admin UI
<div className="bg-brand-600 text-ink-800 border-accent-100" />

// Form
<input className="bg-form-bg border-form-border focus:ring-form-ring" />

// Table
<th className="bg-table-head-bg text-table-head-text" />
```

### 🚨 Color missing lage to

Jaise `bg-brand-950` chahiye par define nahi hai:

1. **`src/index.css` kholo**
2. `@theme` block mein add karo: `--color-brand-950: rgb(2 44 34);`
3. Ab `bg-brand-950` use kar sakte ho

**Kabhi component mein naya color define mat karo.**

---

## 12. Theme Preview Page

Poori app ke saare components ek hi page pe dekhne ke liye ek **living style guide** page bana hua hai.

### URL

```
http://localhost:5173/admin/theme-preview
```

### Kya dikhta hai

1. 🎨 **Color palette** — saare brand/accent/ink/warn/danger/table/form swatches
2. 🔘 **Buttons** — 6 variants (brand, accent, danger, secondary, ghost, disabled)
3. 🏷️ **Badges** — 5 status states
4. 📝 **Typography** — headings + body text
5. 🃏 **Cards** — 3 types (simple, info, success)
6. 📋 **Form elements** — saare form components with Formik
7. 📊 **Table** — CustomeTable with pagination

### Kab use karo

- **Kal ko color change karo** → is page pe turant dikhega
- **Naya component banao** → isi page pe add karo taaki preview mile
- **Designer/client ko dikhana ho** → ek URL, saara UI

### File location

```
src/pages/ThemePreview.jsx
```

### Route

```jsx
// src/routes/AdminRoutes.jsx
<Route path="theme-preview" element={<ThemePreview />} />
```

### Sidebar link (optional)

`AdminSidebar.jsx` ke `menuSections` array mein add karo:

```jsx
{
  title: "Developer",
  items: [
    { name: "Theme Preview", path: "/admin/theme-preview", icon: MdOutlineSettings },
  ],
},
```

---

## 13. File structure

```
dmt-admin/
├── src/
│   ├── index.css                    ← 🎨 THEME YAHAN HAI (only edit this for colors)
│   ├── App.css                      ← khaali rakho
│   ├── App.jsx
│   ├── main.jsx
│   │
│   ├── layouts/
│   │   └── AdminLayout.jsx          ← sidebar + navbar + outlet
│   │
│   ├── components/
│   │   ├── AdminNavbar.jsx
│   │   ├── AdminSidebar.jsx
│   │   │
│   │   ├── form/                    ← form components (alag theme layer)
│   │   │   ├── TextInput.jsx
│   │   │   ├── TextareaField.jsx
│   │   │   ├── SelectField.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   ├── RadioGroup.jsx
│   │   │   └── FormButton.jsx
│   │   │
│   │   └── table/                   ← table components (alag theme layer)
│   │       └── CustomeTable.jsx
│   │
│   ├── pages/
│   │   └── ThemePreview.jsx         ← 🎨 living style guide
│   │
│   ├── routes/
│   │   └── AdminRoutes.jsx          ← /admin/* routes
│   │
│   └── features/
│       └── patient/
│           └── pages/
│               └── dashboard/
│                   └── Dashboard.jsx
│
└── THEME-GUIDE.md                   ← ye file
```

---

## 🎯 One-Line Summary

> **3 theme layers:** Admin UI (`brand` / `accent` / `ink`) · Forms (`form-*` / `btn-*`) · Table (`table-*`)
> **Color ki asli value sirf `src/index.css` ke `@theme` mein hai.**
> **Component mein sirf nickname likho.**
> **Kal ko change karna ho → `index.css` badlo, poori app update.**

---

## 🧪 Quick Test

Ye kar ke dekh — poori app ka color turant badal jayega:

```css
/* src/index.css */
--color-brand-600: rgb(37 99 235); /* green → blue */
--color-form-ring: rgb(236 72 153); /* form focus pink */
--color-table-page-active-bg: rgb(220 38 38); /* table page red */
```

Save karo, browser refresh karo. **Buttons blue, form focus pink, table page red.** Ye proof hai ki theme centralized hai.

---

## 📚 Related Files

- **`src/index.css`** — saare theme tokens
- **`src/pages/ThemePreview.jsx`** — living style guide
- **`THEME-GUIDE.md`** — ye document

---

**Last updated:** Aaj
**Maintained by:** Tum
**Kabhi confusion ho to:** Ye file kholo, `Section 4 (Cheat Sheet)` dekho. 90% doubts wahi solve ho jayenge.
