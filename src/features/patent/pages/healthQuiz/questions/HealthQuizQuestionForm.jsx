// src/features/patent/pages/healthQuiz/questions/HealthQuizQuestionForm.jsx

import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiHelpCircle } from "react-icons/fi";

import {
  useHealthQuizQuestion,
  useCreateHealthQuizQuestion,
  useUpdateHealthQuizQuestion,
} from "../../../queries/healthQuiz";
import {
  TextInput,
  TextareaField,
  SelectField,
  ToggleSwitch,
} from "../../../common/form";
import Loader from "../../../common/Loader";

const CORRECT_ANSWER_OPTIONS = [
  { value: "A", label: "Option A" },
  { value: "B", label: "Option B" },
  { value: "C", label: "Option C" },
  { value: "D", label: "Option D" },
];

const HealthQuizQuestionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const createMutation = useCreateHealthQuizQuestion();
  const updateMutation = useUpdateHealthQuizQuestion();

  // Fetch existing question for edit
  const { data: questionData, isLoading: isQuestionLoading } =
    useHealthQuizQuestion(isEdit ? id : null);

  // Initial Values
  const initialValues = {
    question: questionData?.question || "",
    option_a: questionData?.option_a || "",
    option_b: questionData?.option_b || "",
    option_c: questionData?.option_c || "",
    option_d: questionData?.option_d || "",
    correct_answer: questionData?.correct_answer
      ? {
          value: questionData.correct_answer,
          label: `Option ${questionData.correct_answer}`,
        }
      : null,
    status: questionData?.status ?? true,
    sort_order: questionData?.sort_order || 0,
  };

  // Validation Schema
  const validationSchema = Yup.object({
    question: Yup.string()
      .trim()
      .required("Question is required")
      .max(500, "Max 500 characters"),
    option_a: Yup.string()
      .trim()
      .required("Option A is required")
      .max(255, "Max 255 characters"),
    option_b: Yup.string()
      .trim()
      .required("Option B is required")
      .max(255, "Max 255 characters"),
    option_c: Yup.string()
      .trim()
      .required("Option C is required")
      .max(255, "Max 255 characters"),
    option_d: Yup.string()
      .trim()
      .required("Option D is required")
      .max(255, "Max 255 characters"),
    correct_answer: Yup.object()
      .nullable()
      .required("Correct answer is required"),
    status: Yup.boolean(),
    sort_order: Yup.number()
      .typeError("Must be a number")
      .min(0, "Cannot be negative")
      .nullable(),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      question: values.question.trim(),
      option_a: values.option_a.trim(),
      option_b: values.option_b.trim(),
      option_c: values.option_c.trim(),
      option_d: values.option_d.trim(),
      correct_answer: values.correct_answer?.value,
      status: values.status,
      sort_order: values.sort_order || 0,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => navigate("/health-quiz/questions"),
          onSettled: () => setSubmitting(false),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate("/health-quiz/questions"),
        onSettled: () => setSubmitting(false),
      });
    }
  };

  if (isEdit && isQuestionLoading) {
    return <Loader text="Loading question details..." />;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/health-quiz/questions")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            {isEdit ? "Edit Question" : "Add Question"}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {isEdit
              ? "Update the health quiz question"
              : "Create a new multiple-choice question for the health quiz"}
          </p>
        </div>
      </div>

      <Formik
        key={id || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values }) => (
          <Form className="rounded-card border border-ink-100 bg-surface shadow-sm p-5 sm:p-6 space-y-6">
            {/* Question */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500 flex items-center gap-2">
                <FiHelpCircle className="text-brand-600" /> Question Details
              </p>
              <TextareaField
                label="Question"
                name="question"
                placeholder="Enter the question"
                rows={3}
                maxLength={500}
                required
              />
            </div>

            {/* Options */}
            <div className="border-t border-ink-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Options
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  label="Option A"
                  name="option_a"
                  placeholder="Enter option A"
                  maxLength={255}
                  required
                />
                <TextInput
                  label="Option B"
                  name="option_b"
                  placeholder="Enter option B"
                  maxLength={255}
                  required
                />
                <TextInput
                  label="Option C"
                  name="option_c"
                  placeholder="Enter option C"
                  maxLength={255}
                  required
                />
                <TextInput
                  label="Option D"
                  name="option_d"
                  placeholder="Enter option D"
                  maxLength={255}
                  required
                />
              </div>
            </div>

            {/* Correct Answer & Sort Order */}
            <div className="border-t border-ink-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Configuration
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label="Correct Answer"
                  name="correct_answer"
                  options={CORRECT_ANSWER_OPTIONS}
                  placeholder="Select the correct option"
                  required
                />
                <TextInput
                  label="Sort Order"
                  name="sort_order"
                  type="number"
                  placeholder="Enter sort order (e.g. 0, 1, 2...)"
                />
              </div>
            </div>

            {/* Status */}
            <div className="border-t border-ink-100 pt-5">
              <ToggleSwitch
                name="status"
                label="Active Status"
                description="Inactive questions will not be shown in the quiz"
              />
            </div>

            {/* Form Actions Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 mt-6">
              <button
                type="button"
                onClick={() => navigate("/health-quiz/questions")}
                disabled={isPending || isSubmitting}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isSubmitting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-5 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isPending || isSubmitting) && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isEdit ? "Update Question" : "Create Question"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default HealthQuizQuestionForm;
