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
        py-4 px-8 font-mono uppercase tracking-widest text-sm
        border border-black
        bg-black text-white
        hover:bg-white hover:text-black
        transition-colors duration-0
        ${isDisabled ? "opacity-30 cursor-not-allowed line-through hover:bg-black hover:text-white" : ""}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
}
