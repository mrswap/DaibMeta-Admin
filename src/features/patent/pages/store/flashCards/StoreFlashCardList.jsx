import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiLink } from "react-icons/fi";
import ConfirmModal from "../../../common/ConfirmModal";
import ToggleSwitch from "../../../common/form/ToggleSwitch";

// Static Data with Linked Product
const INITIAL_DATA = [
  {
    id: 1,
    title: "Monsoon Sale",
    image_url: "https://via.placeholder.com/600x300",
    status: true,
    sort_order: 1,
    linked_product: "Paracetamol 500mg",
  },
  {
    id: 2,
    title: "Free Delivery",
    image_url: null,
    status: true,
    sort_order: 2,
    linked_product: "Vitamin C 1000mg",
  },
  {
    id: 3,
    title: "Weekend Discount",
    image_url: "https://via.placeholder.com/600x300",
    status: false,
    sort_order: 3,
    linked_product: "Whey Protein 1kg",
  },
];

const StoreFlashCardList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(INITIAL_DATA);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Store Flash Cards
          </h1>
          <p className="text-sm text-ink-500">
            Manage banners shown on top of store categories
          </p>
        </div>
        <button
          onClick={() => navigate("/store/flash-cards/new")}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <FiPlus className="h-4 w-4" /> Add Flash Card
        </button>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-ink-100 bg-surface p-16 text-center">
          <h3 className="font-jakarta text-lg font-semibold text-ink-900">
            No flash cards found
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            Add a new flash card to display on the store.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface hover:shadow-sm transition-shadow"
            >
              {/* Image Area */}
              <div className="relative h-40 w-full overflow-hidden bg-ink-50 flex items-center justify-center border-b border-ink-100">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <FiImage className="h-10 w-10 text-ink-300" />
                )}
                <div className="absolute right-3 top-3">
                  <ToggleSwitch
                    isFormik={false}
                    variant="pill"
                    value={card.status}
                    onChange={() => toggleStatus(card.id)}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-5">
                <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
                  {card.title}
                </h3>

                {/* Linked Product Badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2 py-1 text-xs font-medium text-accent-800">
                  <FiLink className="h-3 w-3" />
                  <span className="line-clamp-1">{card.linked_product}</span>
                </div>

                <p className="mt-3 text-xs text-ink-500">
                  Sort Order: {card.sort_order}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end border-t border-ink-100 bg-ink-50/40 px-5 py-3 gap-1">
                <button
                  onClick={() => navigate(`/store/flash-cards/${card.id}/edit`)}
                  className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-surface hover:text-brand-600 transition-colors"
                  title="Edit"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteId(card.id)}
                  className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-surface hover:text-danger-600 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Flash Card"
        message="Are you sure you want to delete this flash card? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default StoreFlashCardList;
