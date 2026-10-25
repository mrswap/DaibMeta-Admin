import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiArrowLeft, FiImage } from "react-icons/fi";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import { PERIOD_CARDS_LIST } from "./periodData";

const PeriodHealthGuide = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState(PERIOD_CARDS_LIST);

  const handleToggleStatus = (id) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: !c.status } : c)),
    );
  };

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
            {/* Subheading removed */}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
          >
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-danger-50 text-danger-500 border-danger-100">
                  <FiImage className="h-6 w-6" />
                </div>
                <ToggleSwitch
                  isFormik={false}
                  variant="pill"
                  value={card.status}
                  onChange={() => handleToggleStatus(card.id)}
                />
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
        ))}
      </div>
    </div>
  );
};

export default PeriodHealthGuide;
