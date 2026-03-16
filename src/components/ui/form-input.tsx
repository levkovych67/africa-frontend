"use client";

import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({
  label,
  error,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-sans text-sm text-stone-500">
        {label}
      </label>
      <input
        className={`
          w-full py-3 px-4 bg-white border border-stone-200 rounded-xl outline-none
          focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10
          placeholder:text-stone-400
          transition-all duration-200
          ${error ? "border-coral" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-coral text-xs">{error}</span>
      )}
    </div>
  );
}
