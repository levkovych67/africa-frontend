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
      <label className="font-mono text-xs tracking-wide uppercase">
        {label}
      </label>
      <input
        className={`
          w-full py-3 bg-transparent border-b border-black outline-none
          focus:border-b-2 placeholder:text-black/50 rounded-none
          ${error ? "border-alert" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="font-mono text-xs text-alert">{error}</span>
      )}
    </div>
  );
}
