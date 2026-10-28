// src/features/patent/pages/cms/period/PeriodHealthGuide.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiArrowLeft } from "react-icons/fi";
import { PERIOD_CARDS_LIST } from "./periodData";

import imgKnowPeriod from "../../../../../assets/periodtracker/know-period.png";
import imgPainRelief from "../../../../../assets/periodtracker/pain-relief.png";
import imgHygiene from "../../../../../assets/periodtracker/hygiene.png";
import imgFood from "../../../../../assets/periodtracker/food.png";
import imgWarning from "../../../../../assets/periodtracker/warning.png";
import imgMyths from "../../../../../assets/periodtracker/myths.png";

// Map IDs to images (Assuming IDs are 1 to 6 based on standard flow)
// Agar tera ID alag hai (jaise 'know_period'), toh yahan keys change kar lena.
const IMAGE_MAP = {
  1: imgKnowPeriod,
  2: imgPainRelief,
  3: imgHygiene,
  4: imgFood,
  5: imgWarning,
  6: imgMyths,
};

const PeriodHealthGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/period")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              Period Health Guide
            </h1>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PERIOD_CARDS_LIST.map((card, index) => {
          // Fallback to index+1 if ID mismatch
          const imageSrc = IMAGE_MAP[card.id] || IMAGE_MAP[index + 1];

          return (
            <div
              key={card.id}
              className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
            >
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between">
                  {/* Image Container - Image Rule Applied */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50/30 flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={card.title}
                      className="h-full w-full object-contain p-1.5"
                      onError={(e) => {
                        // Fallback if image not found
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
                <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs text-ink-500">{card.subtitle}</p>
              </div>

              <div className="flex items-center justify-end border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                <button
                  onClick={() => navigate(`/cms/period/${card.id}`)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  title="Edit Details"
                >
                  <FiEdit2 className="h-4 w-4" /> Edit Content
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodHealthGuide;
