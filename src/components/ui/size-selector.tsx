"use client";

import { cn } from "@/lib/cn";

interface SizeSelectorProps {
  label: string;
  values: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  unavailableValues?: string[];
}

export function SizeSelector({
  label,
  values,
  selected,
  onSelect,
  unavailableValues = [],
}: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500">{label}</span>
      <div className="grid grid-cols-4 gap-2">
        {values.map((value) => {
          const isUnavailable = unavailableValues.includes(value);
          const isSelected = selected === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => !isUnavailable && onSelect(value)}
              disabled={isUnavailable}
              className={cn(
                "rounded-xl border border-stone-200 py-3 text-center font-jakarta text-sm transition-all duration-200 active:scale-[0.97]",
                isSelected ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-900 border-stone-200 hover:border-stone-400",
                isUnavailable ? "opacity-30 line-through cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
