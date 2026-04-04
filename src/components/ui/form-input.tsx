"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

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
        className={cn("input-base", error && "border-coral", className)}
        {...props}
      />
      {error && (
        <span className="text-coral text-xs">{error}</span>
      )}
    </div>
  );
}
