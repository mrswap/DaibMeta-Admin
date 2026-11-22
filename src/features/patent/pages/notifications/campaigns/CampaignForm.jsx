// src/features/patent/pages/notifications/campaigns/CampaignForm.jsx

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiX,
  FiClock,
  FiSend,
  FiCalendar,
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import { TextInput, FormButton } from "../../../common/form";
import {
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
} from "../../../queries/campaigns";
import { usePermission } from "../../../hooks/usePermission";
import Loader from "../../../common/Loader";

const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const CampaignForm = () => {
  const { uuid } = useParams();
  const isEdit = !!uuid;
  const navigate = useNavigate();

  const { can, isLoading: permLoading } = usePermission();
  const canManage = can("notifications", "manage");

  const { data: initialData, isLoading: detailLoading } = useCampaign(uuid);

  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryType, setDeliveryType] = useState("immediate");
  const [scheduledAt, setScheduledAt] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setMessage(initialData.message || "");
      setScheduledAt(
        initialData.scheduled_at ? new Date(initialData.scheduled_at) : null,
      );
      setDeliveryType(initialData.scheduled_at ? "scheduled" : "immediate");
      setImagePreview(initialData.image || null);
    }
  }, [isEdit, initialData]);

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((p) => ({
        ...p,
        image: "Only JPG, JPEG, PNG or WEBP allowed",
      }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({
        ...p,
        image: `Image must be under ${MAX_IMAGE_MB} MB`,
      }));
      return;
    }

    setErrors((p) => ({ ...p, image: "" }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Real-time validation check
  const isFormValid = () => {
    if (!title.trim() || !message.trim()) return false;
    if (title.trim().length > 255 || message.trim().length > 5000) return false;
    if (deliveryType === "scheduled") {
      if (!scheduledAt) return false;
      if (new Date(scheduledAt) <= new Date()) return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    let formattedDate = null;
    if (deliveryType === "scheduled" && scheduledAt) {
      const d = new Date(scheduledAt);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      formattedDate = d.toISOString().slice(0, 19).replace("T", " ");
    }

    const hasImage = !!imageFile;
    let payload;

    if (hasImage) {
      payload = new FormData();
      payload.append("title", title.trim());
      payload.append("message", message.trim());
      payload.append("audience", "all_patients");
      if (formattedDate) payload.append("scheduled_at", formattedDate);
      payload.append("data[screen]", "notifications");
      payload.append("image", imageFile);
    } else {
      payload = {
        title: title.trim(),
        message: message.trim(),
        audience: "all_patients",
        scheduled_at: formattedDate,
        data: { screen: "notifications" },
      };
    }

    const opts = { onSuccess: () => navigate("/notifications/campaigns") };

    if (isEdit) {
      updateMutation.mutate(
        { uuid: initialData?.campaign_uuid || uuid, payload },
        opts,
      );
    } else {
      createMutation.mutate(payload, opts);
    }
  };

  if (permLoading) return <Loader text="Checking permissions..." />;
  if (!canManage)
    return <div className="p-10 text-center text-ink-900">Access Denied</div>;

  const status = (
    initialData?.status ||
    initialData?.push_status ||
    ""
  ).toLowerCase();
  const isScheduled = !!initialData?.scheduled_at;
  const future = initialData?.scheduled_at
    ? new Date(initialData.scheduled_at) > new Date()
    : false;
  const isPending = status === "pending" || status === "scheduled";
  const isEditable = isScheduled && future && isPending;
  const isPendingSubmit = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-10">
      <button
        onClick={() => navigate("/notifications/campaigns")}
        className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
      >
        <FiArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
        Back to Campaigns
      </button>

      <div>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900 md:text-3xl">
          {isEdit ? "Edit Campaign" : "Create New Campaign"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {isEdit
            ? "Update the details of your scheduled campaign."
            : "Send a broadcast notification to all registered patients."}
        </p>
      </div>

      {isEdit && detailLoading ? (
        <Loader text="Loading campaign..." />
      ) : isEdit && !isEditable ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm">
          <p className="font-semibold">Campaign cannot be edited</p>
          <p className="mt-1">
            This campaign has already started processing or was already sent to
            patients.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-5 rounded-xl border border-ink-200 bg-surface p-6 shadow-sm">
                <div>
                  <TextInput
                    label="Notification Title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    isFormik={false}
                    placeholder="e.g. Important Health Update"
                    maxLength={255}
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-rose-500">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-form-label">
                    Message Body <span className="text-form-required">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={5000}
                    placeholder="Write the notification message here..."
                    className="w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2.5 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                  />
                  <div className="mt-1.5 flex justify-between">
                    {errors.message ? (
                      <p className="text-xs text-rose-500">{errors.message}</p>
                    ) : (
                      <span />
                    )}
                    <span className="text-[11px] font-medium text-ink-400">
                      {message.length}/5000 chars
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-ink-200 bg-surface p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <FiSend className="h-4 w-4 text-brand-500" />
                  <h3 className="text-sm font-semibold text-ink-900">
                    Delivery Setup
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg bg-ink-50 p-1.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("immediate")}
                    className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                      deliveryType === "immediate"
                        ? "bg-surface text-brand-700 shadow-sm ring-1 ring-ink-200"
                        : "text-ink-500 hover:text-ink-700"
                    }`}
                  >
                    <FiSend className="h-4 w-4" /> Send Immediately
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("scheduled")}
                    className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                      deliveryType === "scheduled"
                        ? "bg-surface text-brand-700 shadow-sm ring-1 ring-ink-200"
                        : "text-ink-500 hover:text-ink-700"
                    }`}
                  >
                    <FiClock className="h-4 w-4" /> Schedule for Later
                  </button>
                </div>

                {deliveryType === "scheduled" && (
                  <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50/50 p-5">
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-800">
                      <FiCalendar className="h-4 w-4" />
                      Select Date & Time
                    </label>

                    <div className="relative">
                      <DatePicker
                        selected={scheduledAt}
                        onChange={(date) => {
                          setScheduledAt(date);
                          if (errors.scheduled_at)
                            setErrors((p) => ({ ...p, scheduled_at: "" }));
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="dd MMM yyyy, h:mm aa"
                        minDate={new Date()}
                        placeholderText="Select date and time..."
                        className="h-11 w-full cursor-pointer rounded-lg border border-brand-200 bg-surface pl-10 pr-3 text-sm font-medium text-ink-800 outline-none transition hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        wrapperClassName="w-full"
                        popperClassName="z-[9999]"
                      />
                      <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
                    </div>

                    <p className="mt-2.5 text-[11px] text-brand-600/80">
                      The notification will be hidden from patients until this
                      exact time.
                    </p>
                    {errors.scheduled_at && (
                      <p className="mt-2 text-xs font-medium text-rose-500">
                        {errors.scheduled_at}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-ink-200 bg-surface p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-ink-900">
                  Audience
                </h3>
                <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
                  <span className="text-sm font-medium text-ink-800">
                    All Patients
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-ink-400">
                  Broadcast campaigns are currently sent to all registered
                  patients in the system.
                </p>
              </div>

              <div className="rounded-xl border border-ink-200 bg-surface p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink-900">
                    Attach Image
                  </h3>
                  <span className="rounded bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                    Optional
                  </span>
                </div>

                {imagePreview ? (
                  <div className="group relative overflow-hidden rounded-lg border border-ink-200">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={clearImage}
                        className="cursor-pointer rounded-full bg-rose-500 p-2 text-white shadow-lg transition hover:bg-rose-600"
                        title="Remove image"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/50 text-ink-500 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600"
                  >
                    <div className="rounded-full bg-surface p-3 shadow-sm ring-1 ring-ink-100">
                      <FiUploadCloud className="h-6 w-6" />
                    </div>
                    <span className="mt-1 text-sm font-medium">
                      Click to upload
                    </span>
                    <span className="text-[10px] font-medium text-ink-400">
                      JPG, PNG, WEBP (max 5 MB)
                    </span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImagePick}
                  className="hidden"
                />
                {errors.image && (
                  <p className="mt-2 text-xs text-rose-500">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-ink-100 pt-6">
            <button
              type="button"
              onClick={() => navigate("/notifications/campaigns")}
              disabled={isPendingSubmit}
              className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-6 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <div
              className={`w-48 ${!isFormValid() || isPendingSubmit ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
            >
              <FormButton
                type="submit"
                text={
                  isPendingSubmit
                    ? isEdit
                      ? "Updating..."
                      : "Processing..."
                    : isEdit
                      ? "Update Campaign"
                      : deliveryType === "scheduled"
                        ? "Schedule Campaign"
                        : "Send Now"
                }
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CampaignForm;
