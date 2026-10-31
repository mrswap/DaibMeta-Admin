import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import ConfirmModal from "../../../common/ConfirmModal";
import ToggleSwitch from "../../../common/form/ToggleSwitch";

const INITIAL_DATA = [
  {
    id: 1,
    category: "Medicines",
    name: "Painkillers",
    description: "Headache and body pain",
    status: true,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    category: "Medicines",
    name: "Antibiotics",
    description: "Bacterial infections",
    status: false,
    image: null,
  },
  {
    id: 3,
    category: "Supplements",
    name: "Vitamins",
    description: "Daily multivitamins",
    status: true,
    image: null,
  },
];

const SubcategoryList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== deleteId));
    setDeleteId(null);
  };

  const toggleStatus = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: !item.status } : item,
      ),
    );
  };

  const filtered = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Subcategories
          </h1>
          <p className="text-sm text-ink-500">
            Manage subcategories under categories
          </p>
        </div>
        <button
          onClick={() => navigate("/store/subcategories/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer"
        >
          <FiPlus /> Add Subcategory
        </button>
      </div>

      <div className="rounded-xl border border-ink-100 bg-surface p-4">
        <div className="flex max-w-md items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="text-ink-400" />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* CARD GRID VIEW - Same as Category */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-ink-100 bg-surface p-16 text-center">
          <h3 className="font-jakarta text-lg font-semibold text-ink-900">
            No subcategories found
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            Try adding a new subcategory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-card border border-ink-100 bg-surface flex flex-col"
            >
              {/* Image Area */}
              <div className="h-40 w-full overflow-hidden bg-ink-50/30 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <FiImage className="h-10 w-10 text-ink-300" />
                )}
              </div>

              {/* Body Area */}
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600 uppercase">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-jakarta font-semibold text-ink-900">
                  {item.name}
                </h3>
                <p className="text-sm text-ink-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Footer Area */}
              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                <ToggleSwitch
                  isFormik={false}
                  variant="pill"
                  value={item.status}
                  onChange={() => toggleStatus(item.id)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/store/subcategories/${item.id}/edit`)
                    }
                    className="text-ink-500 hover:text-brand-600 p-2 cursor-pointer"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="text-ink-500 hover:text-danger-600 p-2 cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Subcategory"
        message="Are you sure you want to delete this subcategory? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default SubcategoryList;
