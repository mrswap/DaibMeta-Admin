// src/features/patent/pages/patientApp/cms/CmsAllCards.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiImage } from "react-icons/fi";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import { CMS_CARDS } from "./cmsData";

const CmsAllCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState(CMS_CARDS);
  const [loadingId, setLoadingId] = useState(null);

  // Status Toggle
  const handleToggle = (id, e) => {
    e.stopPropagation(); // Card click event ko rokne ke liye
    setLoadingId(id);
    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c)),
      );
      setLoadingId(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            All Main Cards
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage cards for patient app home screen
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(`/cms/all-cards/${card.id}/edit`)}
            className="group cursor-pointer flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
          >
            {/* Image */}
            <div className="relative h-32 w-full overflow-hidden bg-ink-50">
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.heading || "Card"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FiImage className="h-8 w-8 text-ink-300" />
                </div>
              )}

              {/* Toggle Switch (stopPropagation lagaya hai taaki card click na ho) */}
              <div
                className="absolute right-2 top-2"
                onClick={(e) => e.stopPropagation()}
              >
                <ToggleSwitch
                  isFormik={false}
                  variant="pill"
                  value={card.is_active}
                  onChange={(val) =>
                    handleToggle(card.id, { stopPropagation: () => {} })
                  } // Dummy event
                  loading={loadingId === card.id}
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-5">
              <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
                {card.heading || "Untitled Card"}
              </h3>

              {/* Button Text (if exists) */}
              {card.button_text && (
                <div className="mt-2 inline-block rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 border border-brand-100">
                  Button: {card.button_text}
                </div>
              )}
            </div>

            {/* Footer (Normal Edit Icon) */}
            <div className="flex items-center justify-end border-t border-ink-100 bg-ink-50/40 px-5 py-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/cms/all-cards/${card.id}/edit`);
                }}
                className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600"
                title="Edit Card"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CmsAllCards;
