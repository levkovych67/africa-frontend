"use client";

import { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stone-200/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-jakarta font-bold text-xs uppercase tracking-wider">
          {title}
        </span>
        <span className="text-stone-500 text-lg">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="pb-4 text-sm leading-relaxed text-stone-900">{children}</div>}
    </div>
  );
}
