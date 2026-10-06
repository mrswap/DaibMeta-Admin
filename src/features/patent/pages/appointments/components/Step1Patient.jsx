// import { useState, useEffect } from "react";
// import { FiArrowRight, FiUser, FiUserPlus, FiSearch } from "react-icons/fi";
// import { usePatients } from "../../../queries/patients";
// import { FilterSelect } from "../../../common/form";

// const Step1Patient = ({ formData, setFormData, onNext }) => {
//   const [patientType, setPatientType] = useState(
//     formData.patient_type || "existing",
//   );

//   // Load patients for existing dropdown
//   const { data: patientsData, isLoading: loadingPatients } = usePatients({
//     per_page: 100,
//     status: 1,
//   });
//   const patients = patientsData?.list || [];

//   const patientOptions = patients.map((p) => ({
//     value: p.id,
//     label: `${p.name} — ${p.patient_id || ""} · ${p.mobile || ""}`,
//   }));

//   // Auto-switch type when formData changes externally
//   useEffect(() => {
//     if (formData.patient_type !== patientType) {
//       setPatientType(formData.patient_type || "existing");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.patient_type]);

//   const handleTypeChange = (type) => {
//     setPatientType(type);
//     setFormData((prev) => ({
//       ...prev,
//       patient_type: type,
//       // Reset patient fields on type change
//       patient_id: null,
//       name: "",
//       mobile: "",
//     }));
//   };

//   const handlePatientSelect = (val) => {
//     if (!val) {
//       setFormData((prev) => ({ ...prev, patient_id: null }));
//       return;
//     }
//     const found = patients.find((p) => p.id === val.value);
//     setFormData((prev) => ({
//       ...prev,
//       patient_id: val.value,
//       name: found?.name || "",
//       mobile: found?.mobile || "",
//     }));
//   };

//   const selectedPatient = patients.find((p) => p.id === formData.patient_id);

//   const canProceed =
//     patientType === "existing"
//       ? !!formData.patient_id
//       : formData.name.trim() && formData.mobile.trim();

//   return (
//     <div className="space-y-5">
//       <div>
//         <h3 className="font-jakarta text-base font-bold text-ink-900">
//           Select Patient
//         </h3>
//         <p className="mt-1 text-sm text-ink-500">
//           Choose an existing patient or add a new walk-in / unregistered
//           patient.
//         </p>
//       </div>

//       {/* Patient type toggle */}
//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//         <button
//           type="button"
//           onClick={() => handleTypeChange("existing")}
//           className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition ${
//             patientType === "existing"
//               ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
//               : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
//           }`}
//         >
//           <div
//             className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
//               patientType === "existing"
//                 ? "bg-brand-600 text-surface"
//                 : "bg-ink-100 text-ink-500"
//             }`}
//           >
//             <FiSearch className="h-4 w-4" />
//           </div>
//           <div>
//             <p
//               className={`text-sm font-semibold ${
//                 patientType === "existing" ? "text-brand-800" : "text-ink-800"
//               }`}
//             >
//               Existing Patient
//             </p>
//             <p className="mt-0.5 text-[11px] text-ink-500">
//               Search and select from registered patients
//             </p>
//           </div>
//         </button>

//         <button
//           type="button"
//           onClick={() => handleTypeChange("new")}
//           className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition ${
//             patientType === "new"
//               ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
//               : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
//           }`}
//         >
//           <div
//             className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
//               patientType === "new"
//                 ? "bg-brand-600 text-surface"
//                 : "bg-ink-100 text-ink-500"
//             }`}
//           >
//             <FiUserPlus className="h-4 w-4" />
//           </div>
//           <div>
//             <p
//               className={`text-sm font-semibold ${
//                 patientType === "new" ? "text-brand-800" : "text-ink-800"
//               }`}
//             >
//               New / Walk-in
//             </p>
//             <p className="mt-0.5 text-[11px] text-ink-500">
//               Book without a patient account
//             </p>
//           </div>
//         </button>
//       </div>

//       {/* Patient selection */}
//       {patientType === "existing" ? (
//         <div>
//           <label className="mb-1.5 block text-xs font-medium text-form-label">
//             Search Patient <span className="text-form-required">*</span>
//           </label>
//           <FilterSelect
//             value={
//               selectedPatient
//                 ? {
//                     value: selectedPatient.id,
//                     label: `${selectedPatient.name} — ${selectedPatient.patient_id || ""} · ${selectedPatient.mobile || ""}`,
//                   }
//                 : null
//             }
//             onChange={handlePatientSelect}
//             options={patientOptions}
//             placeholder={
//               loadingPatients ? "Loading patients..." : "Search patient..."
//             }
//             isDisabled={loadingPatients}
//             isClearable
//           />

//           {selectedPatient && (
//             <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/50 p-3">
//               <div className="flex items-start gap-2.5">
//                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
//                   {selectedPatient.name
//                     ?.split(/\s+/)
//                     .filter(Boolean)
//                     .slice(0, 2)
//                     .map((w) => w[0])
//                     .join("")
//                     .toUpperCase()}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-sm font-semibold text-ink-900">
//                     {selectedPatient.name}
//                   </p>
//                   <p className="mt-0.5 text-[11px] text-ink-500">
//                     {selectedPatient.patient_id} · {selectedPatient.mobile}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <div className="sm:col-span-2">
//             <label className="mb-1.5 block text-xs font-medium text-form-label">
//               Patient Name <span className="text-form-required">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, name: e.target.value }))
//               }
//               placeholder="e.g. Rahul Sharma"
//               className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
//             />
//           </div>

//           <div className="sm:col-span-2">
//             <label className="mb-1.5 block text-xs font-medium text-form-label">
//               Mobile Number <span className="text-form-required">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.mobile}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, mobile: e.target.value }))
//               }
//               placeholder="e.g. 9876543210"
//               className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
//             />
//           </div>

//           <div className="sm:col-span-2 rounded-lg border border-warn-200 bg-warn-50/50 px-3 py-2.5">
//             <p className="text-[11px] text-warn-800">
//               This patient won't have a registered account, but the appointment
//               will be created with these details.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Actions */}
//       <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
//         <button
//           type="button"
//           onClick={onNext}
//           disabled={!canProceed}
//           className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
//             canProceed
//               ? "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
//               : "cursor-not-allowed bg-ink-100 text-ink-400"
//           }`}
//         >
//           Next
//           <FiArrowRight className="h-4 w-4" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Step1Patient;

import { useState, useEffect } from "react";
import { FiArrowRight, FiUserPlus, FiSearch, FiPlus } from "react-icons/fi";
import { usePatients } from "../../../queries/patients";
import { FilterSelect } from "../../../common/form";
import PatientForm from "../../patients/components/PatientForm";

const Step1Patient = ({ formData, setFormData, onNext }) => {
  const [patientType, setPatientType] = useState(
    formData.patient_type || "existing",
  );
  const [patientFormOpen, setPatientFormOpen] = useState(false);

  const {
    data: patientsData,
    isLoading: loadingPatients,
    refetch,
  } = usePatients({ per_page: 100, status: 1 });
  const patients = patientsData?.list || [];

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.patient_id || ""} · ${p.mobile || ""}`,
  }));

  useEffect(() => {
    if (formData.patient_type !== patientType) {
      setPatientType(formData.patient_type || "existing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.patient_type]);

  const handleTypeChange = (type) => {
    setPatientType(type);
    setFormData((prev) => ({
      ...prev,
      patient_type: type,
      patient_id: null,
      name: "",
      mobile: "",
    }));
  };

  const handlePatientSelect = (val) => {
    if (!val) {
      setFormData((prev) => ({ ...prev, patient_id: null }));
      return;
    }
    const found = patients.find((p) => p.id === val.value);
    setFormData((prev) => ({
      ...prev,
      patient_id: val.value,
      name: found?.name || "",
      mobile: found?.mobile || "",
    }));
  };

  // When a new patient is created — auto-select it
  const handlePatientCreated = async (newPatient) => {
    setPatientFormOpen(false);
    await refetch();
    if (newPatient && newPatient.id) {
      setFormData((prev) => ({
        ...prev,
        patient_type: "existing",
        patient_id: newPatient.id,
        name: newPatient.name || "",
        mobile: newPatient.mobile || "",
      }));
      setPatientType("existing");
    }
  };

  const selectedPatient = patients.find((p) => p.id === formData.patient_id);

  const canProceed =
    patientType === "existing"
      ? !!formData.patient_id
      : formData.name.trim() && formData.mobile.trim();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-jakarta text-base font-bold text-ink-900">
          Select Patient
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Choose an existing patient or add a new walk-in / unregistered
          patient.
        </p>
      </div>

      {/* Patient type toggle */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleTypeChange("existing")}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition ${
            patientType === "existing"
              ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
              : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              patientType === "existing"
                ? "bg-brand-600 text-surface"
                : "bg-ink-100 text-ink-500"
            }`}
          >
            <FiSearch className="h-4 w-4" />
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${
                patientType === "existing" ? "text-brand-800" : "text-ink-800"
              }`}
            >
              Existing Patient
            </p>
            <p className="mt-0.5 text-[11px] text-ink-500">
              Search and select from registered patients
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange("new")}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition ${
            patientType === "new"
              ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
              : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              patientType === "new"
                ? "bg-brand-600 text-surface"
                : "bg-ink-100 text-ink-500"
            }`}
          >
            <FiUserPlus className="h-4 w-4" />
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${
                patientType === "new" ? "text-brand-800" : "text-ink-800"
              }`}
            >
              Walk-in / Unregistered
            </p>
            <p className="mt-0.5 text-[11px] text-ink-500">
              Book without creating a patient account
            </p>
          </div>
        </button>
      </div>

      {/* Patient selection */}
      {patientType === "existing" ? (
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-form-label">
                Search Patient <span className="text-form-required">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPatientFormOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
              >
                <FiPlus className="h-3 w-3" />
                Add New Patient
              </button>
            </div>
            <FilterSelect
              value={
                selectedPatient
                  ? {
                      value: selectedPatient.id,
                      label: `${selectedPatient.name} — ${selectedPatient.patient_id || ""} · ${selectedPatient.mobile || ""}`,
                    }
                  : null
              }
              onChange={handlePatientSelect}
              options={patientOptions}
              placeholder={
                loadingPatients ? "Loading patients..." : "Search patient..."
              }
              isDisabled={loadingPatients}
              isClearable
            />
          </div>

          {selectedPatient && (
            <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
                  {selectedPatient.name
                    ?.split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">
                    {selectedPatient.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-500">
                    {selectedPatient.patient_id} · {selectedPatient.mobile}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Patient Name <span className="text-form-required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Rahul Sharma"
              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Mobile Number <span className="text-form-required">*</span>
            </label>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mobile: e.target.value }))
              }
              placeholder="e.g. 9876543210"
              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
            />
          </div>

          <div className="sm:col-span-2 rounded-lg border border-ink-200 bg-ink-50/50 px-3 py-2.5">
            <p className="text-[11px] text-ink-700">
              This patient won't have a registered account, but the appointment
              will be created with these details.
            </p>
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setPatientFormOpen(true)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:w-auto"
            >
              <FiPlus className="h-3.5 w-3.5" />
              Or create a registered patient
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            canProceed
              ? "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
              : "cursor-not-allowed bg-ink-100 text-ink-400"
          }`}
        >
          Next
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Patient Form Modal — for creating new patient */}
      <PatientForm
        open={patientFormOpen}
        onClose={() => setPatientFormOpen(false)}
        initialData={null}
        onSuccess={handlePatientCreated}
      />
    </div>
  );
};

export default Step1Patient;
