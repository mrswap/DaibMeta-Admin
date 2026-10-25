// src/features/patent/pages/serviceManager/ServiceItemForm.jsx

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPackage } from "react-icons/fi";
import TextInput from "../../common/form/TextInput";
import FormButton from "../../common/form/FormButton";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import Loader from "../../common/Loader";
import {
  useService,
  useServiceTest,
  useCreateServiceTest,
  useUpdateServiceTest,
} from "../../queries/serviceManager";

const ServiceItemForm = () => {
  const { id, itemId } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data: service, isLoading: isServiceLoading } = useService(id);
  const { data: existingTest, isLoading: isTestLoading } = useServiceTest(
    id,
    itemId,
  );

  const createMutation = useCreateServiceTest();
  const updateMutation = useUpdateServiceTest();

  // Loading state
  if (isServiceLoading || (itemId && isTestLoading)) {
    return <Loader text="Loading test details..." />;
  }

  if (!service) {
    return (
      <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
        <h3 className="font-jakarta text-base font-semibold text-ink-900">
          Service not found
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          The service you are trying to add tests to does not exist.
        </p>
      </div>
    );
  }

  const initialValues = {
    name: existingTest?.name || "",
    mrp: existingTest?.mrp || "",
    discount_price: existingTest?.discount_price || "",
    is_active: existingTest?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Test name is required")
      .max(150, "Maximum 150 characters allowed"),
    mrp: Yup.number()
      .required("MRP is required")
      .min(0, "MRP must be positive")
      .typeError("MRP must be a valid number"),
    discount_price: Yup.number()
      .required("Discount price is required")
      .min(0, "Discount price must be positive")
      .typeError("Discount price must be a valid number")
      .test(
        "discount-lte-mrp",
        "Discount price cannot be greater than MRP",
        function (value) {
          const { mrp } = this.parent;
          if (
            value === undefined ||
            value === "" ||
            mrp === undefined ||
            mrp === ""
          ) {
            return true;
          }
          return Number(value) <= Number(mrp);
        },
      ),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      name: values.name,
      mrp: Number(values.mrp),
      discount_price: Number(values.discount_price),
      is_active: values.is_active,
    };

    const onSuccess = () => navigate(`/service-manager/${id}`);

    if (itemId) {
      // Update
      updateMutation.mutate(
        { serviceId: id, testId: itemId, payload },
        { onSettled: () => setSubmitting(false), onSuccess },
      );
    } else {
      // Create
      createMutation.mutate(
        { serviceId: id, payload },
        { onSettled: () => setSubmitting(false), onSuccess },
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/service-manager/${id}`)}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            {itemId ? "Edit Test" : "Add Test"}
          </h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {service.name} — Rate Card
          </p>
        </div>
      </div>

      <Formik
        key={itemId || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            {/* Section: Test Details */}
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                <FiPackage className="h-5 w-5 text-brand-600" />
                <h2 className="font-jakarta text-base font-semibold text-ink-900">
                  Test Details
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <TextInput
                    label="Test Name"
                    name="name"
                    placeholder="Enter test name"
                    maxLength={150}
                    required
                  />
                </div>
                <TextInput
                  label="MRP (₹)"
                  name="mrp"
                  type="number"
                  placeholder="Enter MRP"
                  required
                />
                <TextInput
                  label="Discount Price (₹)"
                  name="discount_price"
                  type="number"
                  placeholder="Enter final price"
                  required
                />
                <div className="md:col-span-2 flex items-center pt-2">
                  <ToggleSwitch label="Active Status" name="is_active" />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/service-manager/${id}`)}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                Cancel
              </button>
              <FormButton
                type="submit"
                text={itemId ? "Update Test" : "Add Test"}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="!w-auto !px-4"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ServiceItemForm;
