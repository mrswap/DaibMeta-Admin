// src/features/patent/pages/cms/ClinicPrivileges/components/ClinicPrivilegeSectionsPanel.jsx

import {
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiEdit2, FiTrash2, FiX, FiImage, FiFileText } from "react-icons/fi";
import {
  useProfileSections,
  useCreateProfileSection,
  useUpdateProfileSection,
  useDeleteProfileSection,
  useToggleProfileSectionStatus,
} from "../../../../queries/staff";
import TextInput from "../../../../common/form/TextInput";
import TextareaField from "../../../../common/form/TextareaField";
import ToggleSwitch from "../../../../common/form/ToggleSwitch";
import ConfirmModal from "../../../../common/ConfirmModal";
import Loader from "../../../../common/Loader";

const MAX_SECTIONS = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Strip HTML tags for content preview
const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ClinicPrivilegeSectionsPanel = forwardRef(
  ({ providerId, onMaxReachedChange }, ref) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const { data, isLoading, isError, refetch } =
      useProfileSections(providerId);

    const createMutation = useCreateProfileSection();
    const updateMutation = useUpdateProfileSection();
    const deleteMutation = useDeleteProfileSection();
    const toggleMutation = useToggleProfileSectionStatus();

    const sections = useMemo(() => {
      const list = data?.list || [];
      return [...list].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
    }, [data]);

    const isMaxReached = sections.length >= MAX_SECTIONS;

    // Notify parent when isMaxReached changes
    useEffect(() => {
      if (typeof onMaxReachedChange === "function") {
        onMaxReachedChange(isMaxReached);
      }
    }, [isMaxReached, onMaxReachedChange]);

    // Expose openAddForm to parent (ProviderView)
    useImperativeHandle(
      ref,
      () => ({
        openAddForm: () => {
          if (isMaxReached) return;
          setEditData(null);
          setIsFormOpen(true);
        },
      }),
      [isMaxReached],
    );

    const handleEdit = (section) => {
      setEditData(section);
      setIsFormOpen(true);
    };

    const handleDelete = () => {
      if (!deleteId) return;
      deleteMutation.mutate(
        { providerId, sectionId: deleteId },
        {
          onSettled: () => setDeleteId(null),
        },
      );
    };

    const handleToggleStatus = (section) => {
      toggleMutation.mutate({ providerId, sectionId: section.id });
    };

    const handleSave = (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("heading", values.heading.trim());
      formData.append("content", values.content ?? "");
      formData.append("status", values.status ? "1" : "0");

      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      if (editData) {
        formData.append("_method", "PUT");
        if (values.remove_image) {
          formData.append("remove_image", "1");
        }
        updateMutation.mutate(
          { providerId, sectionId: editData.id, formData },
          {
            onSettled: () => {
              setSubmitting(false);
              setIsFormOpen(false);
              setEditData(null);
            },
          },
        );
      } else {
        createMutation.mutate(
          { providerId, formData },
          {
            onSettled: () => {
              setSubmitting(false);
              setIsFormOpen(false);
              setEditData(null);
            },
          },
        );
      }
    };

    if (isLoading) {
      return <Loader text="Loading profile sections..." />;
    }

    if (isError) {
      return (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-6 text-center">
          <p className="text-sm text-danger-900">
            Failed to load profile sections.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Counter only — Add button lives in ProviderView header */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
            {sections.length} / {MAX_SECTIONS}
          </span>
        </div>

        {isMaxReached && (
          <p className="rounded border border-warn-200 bg-warn-50 p-2 text-xs text-warn-800">
            A provider can have a maximum of {MAX_SECTIONS} profile sections.
          </p>
        )}

        {sections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-8 text-center">
            <FiFileText className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-2 text-sm font-medium text-ink-600">
              No sections yet
            </p>
            <p className="mt-0.5 text-xs text-ink-500">
              Click "Add Section" to create the first profile section.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sections.map((section) => (
              <div
                key={section.id}
                className="group flex items-start gap-3 rounded-xl border border-ink-100 bg-surface p-3 transition-all hover:border-brand-200 hover:shadow-sm"
              >
                {/* Image / Icon-like thumbnail */}
                <div className="shrink-0">
                  {section.image_url ? (
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-ink-100 bg-ink-50/30">
                      <img
                        src={section.image_url}
                        alt={section.heading}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-ink-100 bg-brand-50 text-brand-600">
                      <FiImage className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate font-semibold text-ink-900">
                      {section.heading}
                    </h4>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        section.status
                          ? "bg-brand-50 text-brand-700"
                          : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {section.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {section.content ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">
                      {stripHtml(section.content)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs italic text-ink-400">
                      No content provided.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <ToggleSwitch
                    isFormik={false}
                    variant="pill"
                    value={!!section.status}
                    onChange={() => handleToggleStatus(section)}
                  />
                  <button
                    type="button"
                    onClick={() => handleEdit(section)}
                    className="cursor-pointer rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    title="Edit"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(section.id)}
                    className="cursor-pointer rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
                    title="Delete"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <ClinicPrivilegeSectionFormModal
            initialData={editData}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onClose={() => {
              setIsFormOpen(false);
              setEditData(null);
            }}
            onSubmit={handleSave}
          />
        )}

        <ConfirmModal
          open={!!deleteId}
          title="Delete Section"
          message="Are you sure you want to delete this profile section? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          loading={deleteMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    );
  },
);

ClinicPrivilegeSectionsPanel.displayName = "ClinicPrivilegeSectionsPanel";

// ---------- Inner Modal ----------
const ClinicPrivilegeSectionFormModal = ({
  initialData,
  isSaving,
  onClose,
  onSubmit,
}) => {
  const [imagePreview, setImagePreview] = useState(
    initialData?.image_url || null,
  );
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const initialValues = {
    heading: initialData?.heading || "",
    content: initialData?.content || "",
    status: initialData?.status ?? true,
    image: null,
    remove_image: false,
  };

  const validationSchema = Yup.object({
    heading: Yup.string()
      .trim()
      .required("Heading is required")
      .max(150, "Max 150 characters"),
    content: Yup.string().max(500, "Max 500 characters"),
    image: Yup.mixed()
      .nullable()
      .test(
        "fileType",
        "Only JPG, JPEG, PNG or WEBP images are allowed",
        (file) => {
          if (!file) return true;
          return ACCEPTED_IMAGE_TYPES.includes(file.type);
        },
      )
      .test("fileSize", "Image must be 5 MB or smaller", (file) => {
        if (!file) return true;
        return file.size <= MAX_IMAGE_SIZE;
      }),
    status: Yup.boolean(),
  });

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFieldValue("image", null);
      setImagePreview(initialData?.image_url || null);
      setRemoveExistingImage(false);
      setFieldValue("remove_image", false);
      return;
    }
    setFieldValue("image", file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
    setFieldValue("remove_image", false);
  };

  const handleRemoveImage = (setFieldValue) => {
    setFieldValue("image", null);
    setImagePreview(null);
    if (initialData?.image_url) {
      setRemoveExistingImage(true);
      setFieldValue("remove_image", true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-ink-100 px-5 py-3">
          <h3 className="font-jakarta font-bold text-ink-900">
            {initialData ? "Edit Section" : "Add Section"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer text-ink-500 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <Formik
            key={initialData?.id || "new"}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-4">
                <TextInput
                  label="Heading"
                  name="heading"
                  required
                  placeholder="Enter heading"
                  maxLength={150}
                />

                {/* Image upload — compact icon-like preview + X remove */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-form-label">
                    Image
                  </label>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      {imagePreview ? (
                        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50/30">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-ink-300 bg-ink-50/40 text-ink-400">
                          <FiImage className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
                          <FiImage className="h-3.5 w-3.5" />
                          {imagePreview ? "Change Image" : "Select Image"}
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) =>
                              handleImageChange(e, setFieldValue)
                            }
                            className="hidden"
                          />
                        </label>

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(setFieldValue)}
                            disabled={isSaving}
                            title="Remove image"
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-danger-200 bg-danger-50 text-danger-600 transition-colors hover:bg-danger-100 hover:text-danger-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-form-help">
                        JPG, PNG or WEBP. Max 5 MB.
                      </p>
                    </div>
                  </div>

                  {values.image === null && removeExistingImage && (
                    <p className="mt-2 text-xs text-warn-800">
                      Existing image will be removed on save.
                    </p>
                  )}
                </div>

                <TextareaField
                  label="Content"
                  name="content"
                  placeholder="Enter content"
                  rows={4}
                  maxLength={500}
                />

                <ToggleSwitch
                  name="status"
                  label="Active Status"
                  description="Hide inactive sections from app"
                />

                <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving || isSubmitting}
                    className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isSubmitting}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-4 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {(isSaving || isSubmitting) && (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {initialData ? "Update" : "Create"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ClinicPrivilegeSectionsPanel;
