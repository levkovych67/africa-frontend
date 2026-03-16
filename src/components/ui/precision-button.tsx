"use client";

import { ButtonHTMLAttributes } from "react";

interface PrecisionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function PrecisionButton({
  children,
  disabled,
  loading,
  className = "",
  ...props
}: PrecisionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        rounded-full py-3.5 px-8 font-jakarta font-bold text-xs uppercase tracking-wider
        bg-coral text-white
        hover:scale-[1.02] hover:shadow-glow active:scale-[0.97]
        transition-all duration-200 ease-out
        ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
}
