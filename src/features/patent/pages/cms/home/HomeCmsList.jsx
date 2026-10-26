// src/features/patent/pages/cms/home/HomeCmsList.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiImage, FiArrowUp, FiArrowDown } from "react-icons/fi";
import Loader from "../../../common/Loader";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import {
  useFeatureCards,
  useToggleFeatureCardStatus,
  useReorderFeatureCards,
} from "../../../queries/homeCms";

const HomeCmsList = () => {
  const navigate = useNavigate();
  const [localCards, setLocalCards] = useState([]);

  const { data: fetchedCards = [], isLoading } = useFeatureCards();
  const toggleMutation = useToggleFeatureCardStatus();
  const reorderMutation = useReorderFeatureCards();

  // Use local state if we are reordering, otherwise use fetched data
  const cards = localCards.length > 0 ? localCards : fetchedCards;

  const handleMove = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === cards.length - 1) return;

    const newCards = [...cards];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap
    [newCards[index], newCards[targetIndex]] = [
      newCards[targetIndex],
      newCards[index],
    ];

    setLocalCards(newCards);

    // Prepare payload for backend API
    const payload = {
      cards: newCards.map((c, i) => ({ id: c.id, sort_order: i + 1 })),
    };

    // Call API
    reorderMutation.mutate(payload, {
      onError: () => setLocalCards([]), // Revert on failure
      onSuccess: () => setLocalCards([]), // Let query invalidation re-fetch
    });
  };

  if (isLoading) return <Loader text="Loading cards..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Feature Cards
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface hover:shadow-sm"
          >
            <div className="relative h-32 w-full bg-ink-50">
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.h2}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FiImage className="h-8 w-8 text-ink-300" />
                </div>
              )}
              <div className="absolute right-2 top-2">
                <ToggleSwitch
                  isFormik={false}
                  variant="pill"
                  value={card.is_active}
                  onChange={() =>
                    toggleMutation.mutate({
                      id: card.id,
                      is_active: !card.is_active,
                    })
                  }
                  loading={
                    toggleMutation.isPending &&
                    toggleMutation.variables?.id === card.id
                  }
                />
              </div>
            </div>

            <div className="flex-1 p-5">
              <span className="mb-1 inline-block rounded bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-600">
                {card.key}
              </span>
              <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
                {card.h2 || card.h1 || "Untitled"}
              </h3>
              <p className="mt-1 text-xs text-ink-500 line-clamp-2">
                {card.text || "No description"}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-3 py-2">
              {/* Reorder Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, "up")}
                  disabled={index === 0 || reorderMutation.isPending}
                  className="cursor-pointer rounded-lg p-1.5 text-ink-500 hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <FiArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleMove(index, "down")}
                  disabled={
                    index === cards.length - 1 || reorderMutation.isPending
                  }
                  className="cursor-pointer rounded-lg p-1.5 text-ink-500 hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <FiArrowDown className="h-4 w-4" />
                </button>
              </div>

              {/* Edit */}
              <button
                onClick={() => navigate(`/cms/feature-cards/${card.id}`)}
                className="cursor-pointer rounded-lg p-2 text-ink-500 hover:bg-surface hover:text-brand-600"
                title="Edit"
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

export default HomeCmsList;
