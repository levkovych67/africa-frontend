"use client";

import { useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* ──────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────── */
const shopLinks = [
  { name: "Каталог", href: "/" },
  { name: "Оформлення", href: "/checkout" },
];

const infoItems = [
  "Доставка — Нова Пошта",
  "Оплата при отриманні або онлайн",
];

/* ──────────────────────────────────────────────────────
   Magnetic link — subtle pull toward cursor on hover
   ────────────────────────────────────────────────────── */
function MagneticLink({
  children,
  href,
  external = false,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  external?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.12;
    const dy = (e.clientY - cy) * 0.12;
    setTransform(`translate(${dx}px, ${dy}px)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("translate(0, 0)");
  }, []);

  const props = {
    ref,
    className: `inline-block transition-transform duration-300 ease-out ${className}`,
    style: { transform },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return <Link href={href} {...props}>{children}</Link>;
}

/* ──────────────────────────────────────────────────────
   Instagram SVG icon
   ────────────────────────────────────────────────────── */
function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────
   Main Footer
   ────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-pearl text-stone-900">

      {/* ── Top decorative line ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />

      {/* ── Hero area with large Africa graphic ── */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-16">

        {/* Background Africa continent — large, off-center, editorial */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[15%] md:translate-x-[5%] opacity-[0.04] pointer-events-none select-none">
          <Image
            src="/images/logov2.webp"
            alt=""
            width={700}
            height={700}
            className="w-[400px] md:w-[600px] h-auto"
          />
        </div>

        {/* ── Content grid ── */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Left: brand block */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <MagneticLink href="/" className="group mb-8 block">
                <Image
                  src="/images/new-logo.webp"
                  alt="AFRICA SHOP"
                  width={160}
                  height={50}
                  className="h-10 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </MagneticLink>

              <p className="text-sm text-stone-500 leading-relaxed max-w-[280px] mb-10">
                Український мерч від музичного лейблу Africa.
                Кожна річ — це історія артиста.
              </p>

              {/* Instagram */}
              <MagneticLink
                href="https://www.instagram.com/africa.records/"
                external
                className="group"
              >
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-stone-200 bg-white/60 backdrop-blur-sm hover:border-stone-400 hover:shadow-soft transition-all duration-300">
                  <InstagramIcon className="w-[18px] h-[18px] text-stone-500 group-hover:text-stone-900 transition-colors duration-300" />
                  <span className="text-sm font-jakarta font-semibold text-stone-600 group-hover:text-stone-900 transition-colors duration-300">
                    @africa.records
                  </span>
                </div>
              </MagneticLink>
            </div>
          </div>

          {/* Middle: nav + info */}
          <div className="md:col-span-3 flex flex-col gap-10">
            <div>
              <p className="label-section mb-4">Магазин</p>
              <ul className="flex flex-col gap-2.5">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-600 hover:text-stone-900 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label-section mb-4">Інформація</p>
              <ul className="flex flex-col gap-2.5">
                {infoItems.map((text) => (
                  <li key={text} className="text-sm text-stone-500 leading-relaxed">
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: contacts */}
          <div className="md:col-span-4">
            <p className="label-section mb-4">Контакти</p>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-stone-500 leading-relaxed">
                Львівська обл., с. Малечковичі,<br />
                вул. Широка 2
              </p>
              <div className="flex flex-col gap-1.5">
                <MagneticLink href="tel:+380939846591" external>
                  <span className="text-sm font-grotesk font-semibold text-stone-800 hover:text-coral transition-colors duration-200">
                    093 984 65 91
                  </span>
                </MagneticLink>
                <MagneticLink href="mailto:didipash@gmail.com" external>
                  <span className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-200">
                    didipash@gmail.com
                  </span>
                </MagneticLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar — glass style matching header ── */}
      <div className="border-t border-stone-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] font-jakarta tracking-wider text-stone-400">
            © 2026 AFRICA SHOP
          </p>
          <p className="text-[11px] font-jakarta tracking-wider text-stone-400">
            Створено командою{" "}
            <MagneticLink
              href="https://galychyna.online/"
              external
              className="text-stone-500 hover:text-stone-900 font-semibold transition-colors duration-200"
            >
              Galychyna Technologies
            </MagneticLink>
          </p>
        </div>
      </div>
    </footer>
  );
}
