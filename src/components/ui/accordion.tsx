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
    <div className="border-b border-black">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-mono text-sm uppercase tracking-wide">
          {title}
        </span>
        <span className="font-mono text-lg">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="pb-4 text-sm leading-relaxed">{children}</div>}
    </div>
  );
}
