// src/features/patent/pages/cms/period/PeriodForm.jsx

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import FormikEditorField from "../../../common/form/FormikEditorField";
import FormButton from "../../../common/form/FormButton";
import Loader from "../../../common/Loader";
import { PERIOD_CARDS_LIST } from "./periodData";
import {
  useContentPage,
  useUpdateContentPage,
} from "../../../queries/contentPages";

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

// Map local static IDs to Backend API keys
const ID_TO_KEY_MAP = {
  1: "know_about_menstrual_period",
  2: "period_pain_relief",
  3: "period_hygiene",
  4: "food_lifestyle",
  5: "warning_signs",
  6: "myths_vs_facts",
};

const PeriodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const numericId = Number(id);
  const existingCard = PERIOD_CARDS_LIST.find((c) => c.id === numericId);
  const apiKey = ID_TO_KEY_MAP[numericId];

  // Queries
  const { data: apiData, isLoading } = useContentPage(apiKey);
  const updateMutation = useUpdateContentPage();

  if (!existingCard) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-card border border-ink-200 bg-surface p-10 text-center">
        <p className="text-lg font-semibold text-ink-900">Card not found</p>
        <button
          onClick={() => navigate("/cms/period/health-guide")}
          className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const initialValues = {
    heading: existingCard.title, // Locked
    content: apiData?.content || existingCard.content || "",
  };

  const validationSchema = Yup.object({
    content: Yup.string()
      .required("Content is required")
      .test("desc-length", "Maximum 10000 characters allowed", (val) => {
        return stripHtml(val).length <= 10000;
      }),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("heading", values.heading);
    formData.append("content", values.content);

    // Laravel PUT request workaround
    formData.append("_method", "PUT");

    updateMutation.mutate(
      { id: apiData?.id || numericId, payload: formData },
      {
        onSettled: () => setSubmitting(false),
        onSuccess: () => navigate("/cms/period/health-guide"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/cms/period/health-guide")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2.5 text-ink-600 shadow-sm transition-colors hover:bg-ink-50 hover:text-ink-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold tracking-tight text-ink-900">
            Edit Content
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="overflow-hidden rounded-card border border-ink-100 bg-surface shadow-sm">
              <div className="border-b border-ink-100 bg-ink-50/50 px-6 py-4 flex items-center gap-2">
                <FiFileText className="h-4 w-4 text-brand-600" />
                <h2 className="font-jakarta text-sm font-semibold text-ink-900">
                  Content Details
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Title block (Text only, no input) */}
                <div className="rounded-lg border border-ink-100 bg-ink-50/30 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 mb-1">
                    Title
                  </p>
                  <p className="text-base font-medium text-ink-900">
                    {existingCard.title}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-form-label">
                    Content / Details{" "}
                    <span className="text-form-required">*</span>
                  </label>
                  <FormikEditorField
                    name="content"
                    placeholder="Write your guide content here..."
                    required
                    minHeight={350}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 rounded-card border border-ink-100 bg-surface px-6 py-4 shadow-sm">
              <button
                type="button"
                onClick={() => navigate("/cms/period/health-guide")}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
              >
                Cancel
              </button>
              <FormButton
                type="submit"
                text={updateMutation.isPending ? "Updating..." : "Save Changes"}
                isLoading={isSubmitting || updateMutation.isPending}
                disabled={isSubmitting || updateMutation.isPending}
                className="!w-auto !px-6"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PeriodForm;
