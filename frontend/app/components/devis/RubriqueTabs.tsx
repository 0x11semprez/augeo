"use client";

import { RUBRIQUE_LABELS } from "../../lib/constants";

export function RubriqueTabs({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="rubrique-tabs" role="tablist">
      {RUBRIQUE_LABELS.map((label, index) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={active === index}
          className={`rubrique-tab ${active === index ? "active" : ""}`}
          onClick={() => onSelect(index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
