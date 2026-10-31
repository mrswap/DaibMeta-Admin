// src/features/patent/pages/store/charges/ChargesForm.jsx

import { useNavigate } from "react-router-dom";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiTruck,
  FiCpu,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import {
  useStoreCharges,
  useSaveStoreCharges,
} from "../../../queries/storeCharges";
import TextInput from "../../../common/form/TextInput";
import Loader from "../../../common/Loader";

const MAX_SLABS = 4;

// Helper function to validate overlapping slabs (sorting first)
const validateSlabs = (slabs) => {
  // Filter out empty slabs
  const validSlabs = slabs.filter(
    (s) => s.min_amount !== "" && s.min_amount !== null,
  );

  if (validSlabs.length <= 1) return false; // No overlap possible

  // Sort by min_amount ascending
  const sorted = [...validSlabs].sort(
    (a, b) => Number(a.min_amount) - Number(b.min_amount),
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentMax =
      sorted[i].max_amount === "" || sorted[i].max_amount === null
        ? Infinity
        : Number(sorted[i].max_amount);

    const nextMin = Number(sorted[i + 1].min_amount);

    if (currentMax >= nextMin) {
      return true; // Overlap found
    }
  }
  return false;
};

const ChargesForm = () => {
  const navigate = useNavigate();

  const { data: chargesData, isLoading } = useStoreCharges();
  const saveMutation = useSaveStoreCharges();

  // Prepare initial values based on fetched data
  const initialValues = {
    delivery_charges:
      chargesData?.delivery_charges?.length > 0
        ? chargesData.delivery_charges.map((c) => ({
            min_amount: c.min_amount,
            max_amount: c.max_amount,
            charge_amount: c.charge_amount,
          }))
        : [{ min_amount: "", max_amount: "", charge_amount: "" }],

    processing_charges:
      chargesData?.processing_charges?.length > 0
        ? chargesData.processing_charges.map((c) => ({
            min_amount: c.min_amount,
            max_amount: c.max_amount,
            charge_amount: c.charge_amount,
          }))
        : [{ min_amount: "", max_amount: "", charge_amount: "" }],

    other_charge: chargesData?.other_charge || "",
  };

  // Validation Schema
  const validationSchema = Yup.object({
    delivery_charges: Yup.array()
      .min(1, "At least one delivery slab is required")
      .max(MAX_SLABS, `Maximum ${MAX_SLABS} delivery slabs allowed`)
      .of(
        Yup.object().shape({
          min_amount: Yup.number()
            .typeError("Must be a number")
            .required("Required")
            .min(0, "Cannot be negative"),
          max_amount: Yup.number()
            .typeError("Must be a number")
            .nullable()
            .test(
              "is-greater",
              "Max must be greater than Min",
              function (value) {
                if (value === null || value === "") return true;
                return Number(value) > Number(this.parent.min_amount);
              },
            ),
          charge_amount: Yup.number()
            .typeError("Must be a number")
            .required("Required")
            .min(0, "Cannot be negative"),
        }),
      )
      .test("no-overlap", "Delivery slab ranges overlap", function (slabs) {
        return !validateSlabs(slabs);
      }),

    processing_charges: Yup.array()
      .min(1, "At least one processing slab is required")
      .max(MAX_SLABS, `Maximum ${MAX_SLABS} processing slabs allowed`)
      .of(
        Yup.object().shape({
          min_amount: Yup.number()
            .typeError("Must be a number")
            .required("Required")
            .min(0, "Cannot be negative"),
          max_amount: Yup.number()
            .typeError("Must be a number")
            .nullable()
            .test(
              "is-greater",
              "Max must be greater than Min",
              function (value) {
                if (value === null || value === "") return true;
                return Number(value) > Number(this.parent.min_amount);
              },
            ),
          charge_amount: Yup.number()
            .typeError("Must be a number")
            .required("Required")
            .min(0, "Cannot be negative"),
        }),
      )
      .test("no-overlap", "Processing slab ranges overlap", function (slabs) {
        return !validateSlabs(slabs);
      }),

    other_charge: Yup.number()
      .typeError("Must be a number")
      .required("Required")
      .min(0, "Cannot be negative"),
  });

  const handleSubmit = (values) => {
    const payload = {
      delivery_charges: values.delivery_charges.map((s) => ({
        min_amount: Number(s.min_amount),
        max_amount: s.max_amount === "" ? null : Number(s.max_amount),
        charge_amount: Number(s.charge_amount),
      })),
      processing_charges: values.processing_charges.map((s) => ({
        min_amount: Number(s.min_amount),
        max_amount: s.max_amount === "" ? null : Number(s.max_amount),
        charge_amount: Number(s.charge_amount),
      })),
      other_charge: Number(values.other_charge),
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return <Loader text="Loading charges..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Store Charges
          </h1>
          <p className="text-sm text-ink-500">
            Configure delivery, processing and other fees
          </p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting, errors }) => (
          <Form className="space-y-8">
            {/* Delivery Charges Section */}
            <div className="rounded-card border border-ink-100 bg-surface p-6">
              <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-2">
                <div className="flex items-center gap-2">
                  <FiTruck className="h-5 w-5 text-brand-600" />
                  <h3 className="font-semibold text-ink-900">Delivery Fees</h3>
                </div>
                <span className="text-xs text-ink-500">
                  {values.delivery_charges.length} / {MAX_SLABS} slabs
                </span>
              </div>

              <FieldArray name="delivery_charges">
                {({ push, remove }) => (
                  <div className="space-y-3">
                    {values.delivery_charges.map((slab, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <TextInput
                          name={`delivery_charges.${index}.min_amount`}
                          placeholder="Min (₹)"
                          type="number"
                        />
                        <TextInput
                          name={`delivery_charges.${index}.max_amount`}
                          placeholder="Max (₹) (Leave blank for unlimited)"
                          type="number"
                        />
                        <TextInput
                          name={`delivery_charges.${index}.charge_amount`}
                          placeholder="Charge (₹)"
                          type="number"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={values.delivery_charges.length === 1}
                          className="mt-1.5 cursor-pointer rounded-lg p-2.5 text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}

                    {typeof errors.delivery_charges === "string" && (
                      <p className="text-xs text-danger-500">
                        {errors.delivery_charges}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        push({
                          min_amount: "",
                          max_amount: "",
                          charge_amount: "",
                        })
                      }
                      disabled={values.delivery_charges.length >= MAX_SLABS}
                      className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiPlus className="h-3.5 w-3.5" />
                      Add Delivery Slab
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Processing Charges Section */}
            <div className="rounded-card border border-ink-100 bg-surface p-6">
              <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-2">
                <div className="flex items-center gap-2">
                  <FiCpu className="h-5 w-5 text-brand-600" />
                  <h3 className="font-semibold text-ink-900">
                    Processing Fees
                  </h3>
                </div>
                <span className="text-xs text-ink-500">
                  {values.processing_charges.length} / {MAX_SLABS} slabs
                </span>
              </div>

              <FieldArray name="processing_charges">
                {({ push, remove }) => (
                  <div className="space-y-3">
                    {values.processing_charges.map((slab, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <TextInput
                          name={`processing_charges.${index}.min_amount`}
                          placeholder="Min (₹)"
                          type="number"
                        />
                        <TextInput
                          name={`processing_charges.${index}.max_amount`}
                          placeholder="Max (₹) (Leave blank for unlimited)"
                          type="number"
                        />
                        <TextInput
                          name={`processing_charges.${index}.charge_amount`}
                          placeholder="Charge (₹)"
                          type="number"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={values.processing_charges.length === 1}
                          className="mt-1.5 cursor-pointer rounded-lg p-2.5 text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}

                    {typeof errors.processing_charges === "string" && (
                      <p className="text-xs text-danger-500">
                        {errors.processing_charges}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        push({
                          min_amount: "",
                          max_amount: "",
                          charge_amount: "",
                        })
                      }
                      disabled={values.processing_charges.length >= MAX_SLABS}
                      className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiPlus className="h-3.5 w-3.5" />
                      Add Processing Slab
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Other Charges Section */}
            <div className="rounded-card border border-ink-100 bg-surface p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-ink-100 pb-2">
                <FiMoreHorizontal className="h-5 w-5 text-brand-600" />
                <h3 className="font-semibold text-ink-900">Other Fees</h3>
              </div>
              <div className="max-w-xs">
                <TextInput
                  name="other_charge"
                  label="Fixed Charge Amount (₹)"
                  placeholder="e.g. 25"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || saveMutation.isPending}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-6 py-2.5 font-semibold text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isSubmitting || saveMutation.isPending) && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                Save Charges
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ChargesForm;
