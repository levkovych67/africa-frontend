"use client";

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
      <span className="font-mono text-xs uppercase tracking-wide">{label}</span>
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
              className={`
                py-3 text-center font-mono text-sm border
                ${isSelected ? "bg-black text-white border-black" : "bg-white text-black border-black"}
                ${isUnavailable ? "opacity-30 line-through cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
