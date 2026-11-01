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
  FiInfo,
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
  const validSlabs = slabs.filter(
    (s) => s.min_amount !== "" && s.min_amount !== null,
  );

  if (validSlabs.length <= 1) return false;

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
      return true;
    }
  }
  return false;
};

const ChargesForm = () => {
  const navigate = useNavigate();

  const { data: chargesData, isLoading } = useStoreCharges();
  const saveMutation = useSaveStoreCharges();

  // Prepare initial values
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Store Charges
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
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
          <Form className="rounded-card border border-ink-100 bg-surface shadow-sm p-5 sm:p-6 space-y-8">
            {/* Info Alert */}
            <div className="flex items-start gap-3 rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-accent-800">
              <FiInfo className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Ranges are inclusive. The <strong>Max Amount</strong> can be
                left blank to indicate <strong>Unlimited</strong> upper range.
                Slabs must not overlap.
              </p>
            </div>

            {/* SECTION 1: Delivery Fees */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiTruck className="text-brand-600 h-5 w-5" />
                  <div>
                    <h2 className="text-sm font-semibold text-ink-900">
                      Delivery Fees
                    </h2>
                    <p className="text-[11px] text-ink-500">
                      Setup amount-based delivery slabs
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-ink-50 border border-ink-200 px-2.5 py-1 rounded-full text-ink-600">
                  {values.delivery_charges.length} / {MAX_SLABS} slabs
                </span>
              </div>

              <FieldArray name="delivery_charges">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.delivery_charges.map((slab, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 sm:p-0 bg-ink-50/30 sm:bg-transparent rounded-lg border border-ink-100 sm:border-0"
                      >
                        <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
                          <TextInput
                            name={`delivery_charges.${index}.min_amount`}
                            placeholder="Min (₹)"
                            type="number"
                          />
                          <TextInput
                            name={`delivery_charges.${index}.max_amount`}
                            placeholder="Max (₹) - Blank for unlimited"
                            type="number"
                          />
                          <TextInput
                            name={`delivery_charges.${index}.charge_amount`}
                            placeholder="Charge (₹)"
                            type="number"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={values.delivery_charges.length === 1}
                          className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-400 hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Remove Slab"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>

                        {/* Mobile Remove Button */}
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={values.delivery_charges.length === 1}
                          className="flex sm:hidden w-full items-center justify-center gap-2 rounded-lg border border-danger-200 bg-danger-50 py-2 text-xs font-medium text-danger-600 disabled:opacity-50"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                          Remove Slab
                        </button>
                      </div>
                    ))}

                    {typeof errors.delivery_charges === "string" && (
                      <p className="text-xs text-danger-600 bg-danger-50 p-2 rounded border border-danger-100">
                        {errors.delivery_charges}
                      </p>
                    )}

                    <div className="pt-2">
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
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                        Add Delivery Slab
                      </button>
                    </div>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* SECTION 2: Processing Fees */}
            <div className="border-t border-ink-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiCpu className="text-brand-600 h-5 w-5" />
                  <div>
                    <h2 className="text-sm font-semibold text-ink-900">
                      Processing Fees
                    </h2>
                    <p className="text-[11px] text-ink-500">
                      Setup processing fee slabs
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-ink-50 border border-ink-200 px-2.5 py-1 rounded-full text-ink-600">
                  {values.processing_charges.length} / {MAX_SLABS} slabs
                </span>
              </div>

              <FieldArray name="processing_charges">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.processing_charges.map((slab, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 sm:p-0 bg-ink-50/30 sm:bg-transparent rounded-lg border border-ink-100 sm:border-0"
                      >
                        <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
                          <TextInput
                            name={`processing_charges.${index}.min_amount`}
                            placeholder="Min (₹)"
                            type="number"
                          />
                          <TextInput
                            name={`processing_charges.${index}.max_amount`}
                            placeholder="Max (₹) - Blank for unlimited"
                            type="number"
                          />
                          <TextInput
                            name={`processing_charges.${index}.charge_amount`}
                            placeholder="Charge (₹)"
                            type="number"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={values.processing_charges.length === 1}
                          className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-400 hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Remove Slab"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={values.processing_charges.length === 1}
                          className="flex sm:hidden w-full items-center justify-center gap-2 rounded-lg border border-danger-200 bg-danger-50 py-2 text-xs font-medium text-danger-600 disabled:opacity-50"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                          Remove Slab
                        </button>
                      </div>
                    ))}

                    {typeof errors.processing_charges === "string" && (
                      <p className="text-xs text-danger-600 bg-danger-50 p-2 rounded border border-danger-100">
                        {errors.processing_charges}
                      </p>
                    )}

                    <div className="pt-2">
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
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                        Add Processing Slab
                      </button>
                    </div>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* SECTION 3: Other Fees */}
            <div className="border-t border-ink-100 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <FiMoreHorizontal className="text-brand-600 h-5 w-5" />
                <div>
                  <h2 className="text-sm font-semibold text-ink-900">
                    Other Fees
                  </h2>
                  <p className="text-[11px] text-ink-500">
                    One fixed amount applied per booking
                  </p>
                </div>
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
            <div className="flex flex-col-reverse gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 mt-6">
              <button
                type="submit"
                disabled={isSubmitting || saveMutation.isPending}
                className="flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-6 py-2.5 font-semibold text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
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
