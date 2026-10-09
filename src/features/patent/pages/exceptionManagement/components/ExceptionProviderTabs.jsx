// src/features/patent/pages/exceptionManagement/components/ExceptionProviderTabs.jsx

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  FiUser,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  getProviderColor,
  hexToLightBg,
} from "../../../queries/bookingCalendar";

const ExceptionProviderTabs = ({
  providers,
  activeProviderId,
  onSelectProvider,
}) => {
  const [search, setSearch] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollRef = useRef(null);

  const allProviders = Array.isArray(providers) ? providers : [];

  // ==================== FRONTEND SEARCH FILTER ====================
  const filteredProviders = useMemo(() => {
    if (!search.trim()) return allProviders;
    const q = search.trim().toLowerCase();
    return allProviders.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const roleLabel = (
        p.role?.label ||
        p.role?.name ||
        p.role_label ||
        ""
      ).toLowerCase();
      return name.includes(q) || roleLabel.includes(q);
    });
  }, [allProviders, search]);

  // ==================== SCROLL STATE ====================
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setCanScrollLeft(!atStart);
    setCanScrollRight(!atEnd);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [filteredProviders.length, updateScrollState]);

  const scrollByAmount = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === "left" ? -200 : 200;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (allProviders.length === 0) return null;

  const hasSearch = search.trim().length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/40 px-3 py-2.5">
        <FiUser className="h-3.5 w-3.5 shrink-0 text-ink-500" />
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
          Providers
        </p>
        <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
          {hasSearch
            ? `${filteredProviders.length}/${allProviders.length}`
            : allProviders.length}
        </span>
      </div>

      {/* Search */}
      <div className="border-b border-ink-100 bg-ink-50/20 px-3 py-2">
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider by name..."
            maxLength={100}
            className="h-8 w-full rounded-md border border-ink-200 bg-surface pl-8 pr-8 text-xs text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearch("")}
              title="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            >
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs scroll area with arrows */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="absolute left-0 top-1/2 z-10 flex h-8 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-md bg-gradient-to-r from-surface via-surface to-transparent text-ink-600 transition hover:text-ink-900"
            title="Scroll left"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="absolute right-0 top-1/2 z-10 flex h-8 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-md bg-gradient-to-l from-surface via-surface to-transparent text-ink-600 transition hover:text-ink-900"
            title="Scroll right"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable tabs */}
        <div
          ref={scrollRef}
          className="flex flex-nowrap gap-1.5 overflow-x-auto px-2 py-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(203 213 225) transparent",
          }}
        >
          {filteredProviders.length === 0 ? (
            <div className="w-full px-3 py-4 text-center">
              <p className="text-xs text-ink-500">No providers found</p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-1.5 cursor-pointer text-[11px] font-semibold text-brand-700 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredProviders.map((p) => {
              const isActive = p.id === activeProviderId;
              const color = p.color || getProviderColor(p);

              const roleLabel =
                p.role?.label || p.role?.name || p.role_label || "";

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProvider(p.id)}
                  title={`${p.name}${roleLabel ? ` — ${roleLabel}` : ""}`}
                  className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-surface px-2.5 py-1.5 outline-none transition focus:outline-none focus-visible:outline-none"
                  style={{
                    outline: "none",
                    borderColor: isActive
                      ? color.hex
                      : hexToLightBg(color.hex, 0.4),
                    backgroundColor: isActive
                      ? hexToLightBg(color.hex, 0.08)
                      : undefined,
                  }}
                >
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex min-w-0 flex-col items-start leading-tight">
                    <span
                      className="truncate text-[11px] font-semibold"
                      style={{
                        color: isActive ? color.hex : undefined,
                      }}
                    >
                      {p.name}
                    </span>
                    {roleLabel && (
                      <span
                        className="truncate text-[9px] font-normal"
                        style={{
                          color: isActive ? color.hex : "rgb(100 116 139)",
                          opacity: isActive ? 0.75 : 1,
                        }}
                      >
                        {roleLabel}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ExceptionProviderTabs;
