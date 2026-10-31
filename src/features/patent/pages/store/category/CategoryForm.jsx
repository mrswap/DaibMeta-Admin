import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import TextareaField from "../../../common/form/TextareaField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const initialValues = {
    name: "",
    description: "",
    status: true,
    image: null,
  };

  const validation = Yup.object({
    name: Yup.string().required("Name is required").max(150),
    description: Yup.string().max(500),
  });

  const handleSubmit = (values) => {
    console.log("Saving Category:", values);
    navigate("/store/categories");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/categories")}
          className="p-2 border rounded-lg bg-surface cursor-pointer"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-jakarta">
          {isEdit ? "Edit Category" : "Add Category"}
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validation}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-5">
            <TextInput
              label="Category Name"
              name="name"
              required
              placeholder="Enter name"
            />
            <TextareaField
              label="Description"
              name="description"
              rows={3}
              placeholder="Enter description"
            />
            <div>
              <label className="block mb-2 text-sm font-medium text-form-label">
                Category Image
              </label>
              <div className="h-40 w-40 flex items-center justify-center border-2 border-dashed rounded-xl bg-ink-50 cursor-pointer hover:border-brand-400">
                <FiUpload className="text-ink-500" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFieldValue("image", e.target.files[0])}
                />
              </div>
            </div>
            <ToggleSwitch
              label="Status"
              name="status"
              description="Active or inactive"
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => navigate("/store/categories")}
                className="px-4 py-2 border rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CategoryForm;
