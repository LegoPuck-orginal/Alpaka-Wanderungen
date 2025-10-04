"use client";

import { useState, useEffect } from "react";
import { formatContent } from "@/lib/contentUtils";

export default function PersonsInput({
  slotId,
  tourCapacity,
  slotCapacity,
  label,
  alpacaWarningTemplate,
  tooManyTemplate,
}: {
  slotId: string;
  tourCapacity: number;
  slotCapacity: number;
  label: string;
  alpacaWarningTemplate: string;
  tooManyTemplate: string;
}) {
  const [persons, setPersons] = useState(1);
  const [available, setAvailable] = useState(slotCapacity);

  useEffect(() => {
    // Lade verfügbare Kapazität
    fetch(`/api/slots/${slotId}/availability`)
      .then((r) => r.json())
      .then((data) => setAvailable(data.available || 0))
      .catch(() => {});
  }, [slotId]);

  const showAlpakaWarning = persons > tourCapacity;
  const tooMany = persons > available;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/50" htmlFor={`persons-${slotId}`}>
        {label}
      </label>
      <input
        id={`persons-${slotId}`}
        name="persons"
        type="number"
        min={1}
        max={available}
        value={persons}
        onChange={(e) => setPersons(parseInt(e.target.value) || 1)}
        className={`min-w-[140px] bg-transparent text-sm font-medium tabular-nums ${
          tooMany ? 'border-red-400 bg-red-50/80 text-red-700' : 'border-[color:var(--border)]'
        }`}
      />
      {showAlpakaWarning && !tooMany && (
        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 shadow-sm">
          {formatContent(alpacaWarningTemplate, { alpacas: tourCapacity })}
        </div>
      )}
      {tooMany && (
        <div className="rounded-2xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm">
          {formatContent(tooManyTemplate, { available })}
        </div>
      )}
    </div>
  );
}
