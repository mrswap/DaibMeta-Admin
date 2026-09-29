import React, { useState } from "react";
import { Formik, Form } from "formik";

// Components
import TextInput from "./features/patent/common/form/TextInput";
import TextareaField from "./features/patent/common/form/TextareaField";
import SelectField from "./features/patent/common/form/SelectField";
import Checkbox from "./features/patent/common/form/Checkbox";
import RadioGroup from "./features/patent/common/form/RadioGroup";
import FormButton from "./features/patent/common/form/FormButton";
import CustomeTable from "./features/patent/common/table/CustomeTable";

/* =========================================================
   THEME PREVIEW PAGE
   Ek hi page pe saare components — admin UI, forms, table
   ========================================================= */
 
const selectOptions = [
  { value: "mehta", label: "Dr. Mehta" },
  { value: "rakesh", label: "Dr. Rakesh" },
  { value: "ananya", label: "Dr. Ananya Sen" },
  { value: "arvind", label: "Dr. Arvind Rao" },
];

const radioOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const tableColumns = [
  { header: "Patient", accessor: "name" },
  { header: "Age", accessor: "age" },
  { header: "Doctor", accessor: "doctor" },
  { header: "Department", accessor: "dept" },
  {
    header: "Status",
    accessor: "status",
    render: (val) => {
      const map = {
        Completed: "bg-brand-50 text-brand-800 border border-brand-200",
        "In-Consult": "bg-accent-100 text-accent-900",
        Arrived: "bg-warn-100 text-warn-900",
        Booked: "bg-ink-100 text-ink-600",
      };
      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${map[val] || map.Booked}`}
        >
          {val}
        </span>
      );
    },
  },
];

const tableData = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: [
    "Rajesh Sharma",
    "Priya Patel",
    "Vikram Singhania",
    "Sneha Kulkarni",
    "Amitav Ghosh",
  ][i % 5],
  age: `${25 + i}y`,
  doctor: ["Dr. Mehta", "Dr. Rakesh", "Dr. Ananya Sen"][i % 3],
  dept: ["Cardiology", "Orthopedics", "Gynecology"][i % 3],
  status: ["Completed", "In-Consult", "Arrived", "Booked"][i % 4],
}));

const Section = ({ title, subtitle, children }) => (
  <section className="bg-surface border border-ink-100 rounded-xl p-6 shadow-sm">
    <div className="mb-5">
      <h2
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
        }}
        className="text-lg font-bold text-ink-900"
      >
        {title}
      </h2>
      {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const Swatch = ({ name, className, text = "" }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-16 h-16 rounded-lg border border-ink-200 shadow-sm ${className} flex items-center justify-center text-xs font-bold ${text}`}
    ></div>
    <span className="text-[10px] text-ink-600 font-medium text-center leading-tight">
      {name}
    </span>
  </div>
);

const ThemePreview = () => {
  const [page, setPage] = useState(1);

  return (
    <div className="min-h-screen bg-app p-6 sm:p-8 font-inter">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* ================= HEADER ================= */}
        <div>
          <h1
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            className="text-3xl font-bold text-ink-900"
          >
            Theme Preview
          </h1>
          <p className="text-ink-500 mt-1">
            Saare components ek hi page pe — colors, buttons, forms, table
          </p>
        </div>

        {/* ================= 1. COLOR PALETTE ================= */}
        <Section
          title="1. Color Palette"
          subtitle="Theme ki saari color families — index.css ke @theme se aati hain"
        >
          {/* Brand */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase mb-3">
              Brand (primary actions)
            </p>
            <div className="flex flex-wrap gap-3">
              <Swatch name="brand-50" className="bg-brand-50" />
              <Swatch name="brand-100" className="bg-brand-100" />
              <Swatch name="brand-200" className="bg-brand-200" />
              <Swatch name="brand-500" className="bg-brand-500" />
              <Swatch
                name="brand-600"
                className="bg-brand-600"
                text="text-white"
              />
              <Swatch
                name="brand-700"
                className="bg-brand-700"
                text="text-white"
              />
              <Swatch
                name="brand-800"
                className="bg-brand-800"
                text="text-white"
              />
            </div>
          </div>

          {/* Accent */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase mb-3">
              Accent (info surfaces)
            </p>
            <div className="flex flex-wrap gap-3">
              <Swatch name="accent-50" className="bg-accent-50" />
              <Swatch name="accent-100" className="bg-accent-100" />
              <Swatch name="accent-200" className="bg-accent-200" />
              <Swatch
                name="accent-500"
                className="bg-accent-500"
                text="text-white"
              />
              <Swatch
                name="accent-600"
                className="bg-accent-600"
                text="text-white"
              />
              <Swatch
                name="accent-700"
                className="bg-accent-700"
                text="text-white"
              />
              <Swatch
                name="accent-900"
                className="bg-accent-900"
                text="text-white"
              />
            </div>
          </div>

          {/* Ink */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase mb-3">
              Ink (text + borders)
            </p>
            <div className="flex flex-wrap gap-3">
              <Swatch name="ink-50" className="bg-ink-50" />
              <Swatch name="ink-100" className="bg-ink-100" />
              <Swatch name="ink-200" className="bg-ink-200" />
              <Swatch name="ink-400" className="bg-ink-400" />
              <Swatch name="ink-500" className="bg-ink-500" text="text-white" />
              <Swatch name="ink-700" className="bg-ink-700" text="text-white" />
              <Swatch name="ink-800" className="bg-ink-800" text="text-white" />
              <Swatch name="ink-900" className="bg-ink-900" text="text-white" />
            </div>
          </div>

          {/* Warn + Danger */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-ink-500 uppercase mb-3">
                Warn (pending / arrived)
              </p>
              <div className="flex flex-wrap gap-3">
                <Swatch name="warn-50" className="bg-warn-50" />
                <Swatch name="warn-100" className="bg-warn-100" />
                <Swatch
                  name="warn-800"
                  className="bg-warn-800"
                  text="text-white"
                />
                <Swatch
                  name="warn-900"
                  className="bg-warn-900"
                  text="text-white"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-500 uppercase mb-3">
                Danger (alerts)
              </p>
              <div className="flex flex-wrap gap-3">
                <Swatch name="danger-50" className="bg-danger-50" />
                <Swatch name="danger-100" className="bg-danger-100" />
                <Swatch
                  name="danger-500"
                  className="bg-danger-500"
                  text="text-white"
                />
                <Swatch
                  name="danger-600"
                  className="bg-danger-600"
                  text="text-white"
                />
              </div>
            </div>
          </div>

          {/* Surfaces */}
          <div>
            <p className="text-xs font-semibold text-ink-500 uppercase mb-3">
              Surfaces
            </p>
            <div className="flex flex-wrap gap-3">
              <Swatch name="app" className="bg-app" />
              <Swatch name="surface" className="bg-surface" />
            </div>
          </div>
        </Section>

        {/* ================= 2. BUTTONS ================= */}
        <Section
          title="2. Buttons"
          subtitle="Admin UI + form buttons ka comparison"
        >
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition shadow-sm">
              Primary (Brand)
            </button>
            <button className="px-4 py-2 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 transition shadow-sm">
              Info (Accent)
            </button>
            <button className="px-4 py-2 rounded-lg bg-danger-600 text-white font-semibold hover:bg-danger-500 transition shadow-sm">
              Danger
            </button>
            <button className="px-4 py-2 rounded-lg bg-ink-100 text-ink-700 font-medium hover:bg-ink-200 transition">
              Secondary (Ink)
            </button>
            <button className="px-4 py-2 rounded-lg bg-accent-50 text-brand-700 font-semibold hover:bg-brand-600 hover:text-white transition">
              Ghost
            </button>
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-ink-100 text-ink-400 font-medium cursor-not-allowed"
            >
              Disabled
            </button>
          </div>
        </Section>

        {/* ================= 3. BADGES ================= */}
        <Section title="3. Status Badges" subtitle="Different states ke badges">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
              Completed
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-900">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-600"></span>
              In-Consult
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warn-100 text-warn-900">
              Arrived
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-600">
              Booked
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-danger-100 text-danger-900">
              Cancelled
            </span>
          </div>
        </Section>

        {/* ================= 4. TEXT & TYPOGRAPHY ================= */}
        <Section title="4. Typography" subtitle="Text colors aur sizes">
          <div className="space-y-2">
            <h1
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              className="text-3xl font-bold text-ink-900"
            >
              Heading 1 (serif)
            </h1>
            <h2 className="text-xl font-bold text-ink-800">Heading 2</h2>
            <h3 className="text-lg font-semibold text-ink-800">Heading 3</h3>
            <p className="text-base text-ink-700">
              Body text — ye normal paragraph hai. Ink-700 use hota hai.
            </p>
            <p className="text-sm text-ink-500">
              Muted text — ink-500, secondary info ke liye.
            </p>
            <p className="text-xs text-ink-400">
              Caption text — ink-400, sabse halka.
            </p>
          </div>
        </Section>

        {/* ================= 5. CARDS ================= */}
        <Section title="5. Cards" subtitle="Surfaces aur borders">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface border border-ink-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-ink-900 mb-1">Simple Card</h3>
              <p className="text-sm text-ink-500">
                `bg-surface border-ink-100`
              </p>
            </div>
            <div className="bg-accent-50 border border-accent-100 rounded-xl p-5">
              <h3 className="font-bold text-accent-900 mb-1">Info Card</h3>
              <p className="text-sm text-accent-700">
                `bg-accent-50 border-accent-100`
              </p>
            </div>
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
              <h3 className="font-bold text-brand-900 mb-1">Success Card</h3>
              <p className="text-sm text-brand-700">
                `bg-brand-50 border-brand-100`
              </p>
            </div>
          </div>
        </Section>

        {/* ================= 6. FORM ELEMENTS ================= */}
        <Section
          title="6. Form Elements"
          subtitle="Saare form components ek saath — Formik ke saath"
        >
          <Formik
            initialValues={{
              name: "",
              email: "",
              doctor: null,
              bio: "",
              gender: "",
              terms: false,
            }}
            onSubmit={(values) => {
              alert("Form submitted: " + JSON.stringify(values, null, 2));
            }}
          >
            <Form className="max-w-2xl">
              <TextInput
                label="Full Name"
                name="name"
                placeholder="Enter patient name"
                required
              />
              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="patient@example.com"
              />
              <SelectField
                label="Assigned Doctor"
                name="doctor"
                options={selectOptions}
                placeholder="Choose doctor..."
                required
              />
              <TextareaField
                label="Clinical Notes"
                name="bio"
                rows={3}
                placeholder="Patient history, symptoms..."
              />
              <RadioGroup label="Gender" name="gender" options={radioOptions} />
              <Checkbox
                label="I agree to the terms and conditions"
                name="terms"
              />

              <div className="mt-5 max-w-xs">
                <FormButton text="Submit Form" />
              </div>
            </Form>
          </Formik>
        </Section>

        {/* ================= 7. TABLE ================= */}
        <Section
          title="7. Table"
          subtitle="CustomTable with pagination (23 rows, 10 per page)"
        >
          <CustomeTable
            columns={tableColumns}
            data={tableData}
            serverSide={false}
            itemsPerPage={10}
            emptyText="No patients found."
          />
        </Section>

        {/* ================= FOOTER ================= */}
        <div className="text-center text-xs text-ink-400 pb-8">
          🎨 Theme tokens `src/index.css` ke `@theme` block se aa rahe hain
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
