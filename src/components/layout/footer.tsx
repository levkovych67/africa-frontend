"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ──────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────── */
const artistLinks = [
  { name: "POLAMAV", href: "https://www.instagram.com/polamav/" },
  { name: "POLAMAV SHMOT", href: "https://www.instagram.com/polamavshmot/" },
  { name: "PUNCH MAN GLAVA UA", href: "https://www.instagram.com/punchmanglavaua/" },
  { name: "ORIGINAL GONYA", href: "https://www.instagram.com/originalgonya/" },
  { name: "MERTVYI PIVEN", href: "https://www.instagram.com/mertvyipiven/" },
  { name: "PALINDROM", href: "https://www.instagram.com/palindrom.ed/" },
];

const shopLinks = [
  { name: "Каталог", href: "/" },
  { name: "Оформлення", href: "/checkout" },
];

const infoItems = [
  "Доставка — Нова Пошта",
  "Оплата при отриманні або онлайн",
];

/* ──────────────────────────────────────────────────────
   Starfield particles (canvas-based for performance)
   ────────────────────────────────────────────────────── */
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number; pulse: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      init();
    };

    const init = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = Math.floor((w * h) / 4000);
      particles = Array.from({ length: Math.min(count, 120) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.1 - 0.05,
        alpha: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.015;

        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 162, 158, ${a})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

/* ──────────────────────────────────────────────────────
   Floating element wrapper — adds individual drift
   ────────────────────────────────────────────────────── */
function FloatingElement({
  children,
  delay = 0,
  duration = 6,
  distance = 8,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) {
  return (
    <div
      className={`transition-all duration-500 ease-out ${className}`}
      style={{
        animation: `antigravity-float ${duration}s ease-in-out ${delay}s infinite`,
        ["--float-distance" as string]: `${distance}px`,
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Gravity-hover link — reacts to hover with pull effect
   ────────────────────────────────────────────────────── */
function GravityLink({
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
    const dx = (e.clientX - cx) * 0.15;
    const dy = (e.clientY - cy) * 0.15;
    setTransform(`translate(${dx}px, ${dy}px) scale(1.08)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("translate(0, 0) scale(1)");
  }, []);

  const props = {
    ref,
    className: `inline-block transition-transform duration-300 ease-out cursor-pointer ${className}`,
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
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

/* ──────────────────────────────────────────────────────
   Instagram SVG icon
   ────────────────────────────────────────────────────── */
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
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
    <footer className="relative overflow-hidden bg-stone-950 text-white select-none">
      {/* Starfield background */}
      <Starfield />

      {/* Radial gradient overlays for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-stone-800/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-stone-700/10 rounded-full blur-[100px]" />
      </div>

      {/* ───── Main content area ───── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">

        {/* ── Top: Logo floating in center ── */}
        <div className="flex justify-center mb-16">
          <FloatingElement delay={0} duration={7} distance={10}>
            <GravityLink href="/" className="group">
              <div className="relative">
                <Image
                  src="/images/new-logo.webp"
                  alt="AFRICA SHOP"
                  width={180}
                  height={60}
                  className="h-14 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                />
                {/* Glow ring behind logo */}
                <div className="absolute -inset-6 rounded-full bg-white/[0.02] blur-xl group-hover:bg-white/[0.05] transition-all duration-700" />
              </div>
            </GravityLink>
          </FloatingElement>
        </div>

        {/* ── Middle: Scattered constellation of links ── */}
        <div className="relative min-h-[420px] md:min-h-[360px]">

          {/* ▸ Shop links — upper left area */}
          <div className="md:absolute md:top-0 md:left-[5%] mb-10 md:mb-0">
            <FloatingElement delay={0.3} duration={5.5} distance={6}>
              <p className="font-jakarta font-bold text-[10px] uppercase tracking-[0.12em] text-stone-500 mb-3">
                Магазин
              </p>
              <div className="flex flex-col gap-2">
                {shopLinks.map((link) => (
                  <GravityLink key={link.href} href={link.href}>
                    <span className="text-sm text-stone-400 hover:text-white transition-colors duration-300">
                      {link.name}
                    </span>
                  </GravityLink>
                ))}
              </div>
            </FloatingElement>
          </div>

          {/* ▸ Info — upper right area */}
          <div className="md:absolute md:top-4 md:right-[5%] mb-10 md:mb-0">
            <FloatingElement delay={1} duration={6.5} distance={7}>
              <p className="font-jakarta font-bold text-[10px] uppercase tracking-[0.12em] text-stone-500 mb-3">
                Інформація
              </p>
              <div className="flex flex-col gap-2">
                {infoItems.map((text) => (
                  <span key={text} className="text-sm text-stone-500 block">
                    {text}
                  </span>
                ))}
              </div>
            </FloatingElement>
          </div>

          {/* ▸ Artists — scattered orbital ring in center */}
          <div className="md:absolute md:inset-0 md:flex md:items-center md:justify-center mb-10 md:mb-0">
            <div className="relative md:w-[480px] md:h-[280px]">
              {/* Orbital ring visual (desktop only) */}
              <div className="hidden md:block absolute inset-4 border border-stone-800/40 rounded-full" />
              <div className="hidden md:block absolute inset-8 border border-stone-800/20 rounded-full" />

              {/* Center label */}
              <div className="md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 mb-4 md:mb-0">
                <FloatingElement delay={0.5} duration={8} distance={4}>
                  <p className="font-jakarta font-bold text-[10px] uppercase tracking-[0.12em] text-stone-600 text-center">
                    Артисти
                  </p>
                </FloatingElement>
              </div>

              {/* Artist links positioned around the orbital */}
              <div className="flex flex-wrap gap-3 md:contents">
                {artistLinks.map((artist, i) => {
                  // Calculate orbital positions for desktop
                  const angle = (i / artistLinks.length) * Math.PI * 2 - Math.PI / 2;
                  const rx = 210;
                  const ry = 120;
                  const x = Math.cos(angle) * rx;
                  const y = Math.sin(angle) * ry;

                  return (
                    <div
                      key={artist.href}
                      className="md:absolute md:top-1/2 md:left-1/2"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                    >
                      <FloatingElement
                        delay={i * 0.4}
                        duration={5 + i * 0.5}
                        distance={5 + i * 1.5}
                      >
                        <GravityLink href={artist.href} external>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-800/50 bg-stone-900/60 backdrop-blur-sm text-xs text-stone-400 hover:text-white hover:border-stone-600 hover:bg-stone-800/80 transition-all duration-300 whitespace-nowrap">
                            <InstagramIcon className="w-3 h-3" />
                            {artist.name}
                          </span>
                        </GravityLink>
                      </FloatingElement>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ▸ Contacts — lower left */}
          <div className="md:absolute md:bottom-0 md:left-[8%] mb-10 md:mb-0">
            <FloatingElement delay={1.5} duration={6} distance={9}>
              <p className="font-jakarta font-bold text-[10px] uppercase tracking-[0.12em] text-stone-500 mb-3">
                Контакти
              </p>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-stone-500 leading-relaxed">
                  Львівська обл., с. Малечковичі,
                  <br />
                  вул. Широка 2
                </span>
                <GravityLink href="tel:+380939846591" external>
                  <span className="text-sm text-stone-400 hover:text-white transition-colors duration-300">
                    093 984 65 91
                  </span>
                </GravityLink>
                <GravityLink href="mailto:didipash@gmail.com" external>
                  <span className="text-sm text-stone-400 hover:text-white transition-colors duration-300">
                    didipash@gmail.com
                  </span>
                </GravityLink>
              </div>
            </FloatingElement>
          </div>

          {/* ▸ Social / Instagram — lower right */}
          <div className="md:absolute md:bottom-2 md:right-[8%]">
            <FloatingElement delay={2} duration={7.5} distance={12}>
              <GravityLink
                href="https://www.instagram.com/africa.records/"
                external
                className="group"
              >
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-stone-800/40 bg-stone-900/40 backdrop-blur-sm hover:border-stone-600 hover:bg-stone-800/60 transition-all duration-500">
                  <div className="relative">
                    <InstagramIcon className="w-5 h-5 text-stone-400 group-hover:text-white transition-colors duration-300" />
                    {/* Pulse ring on hover */}
                    <div className="absolute -inset-2 rounded-full border border-stone-600/0 group-hover:border-stone-600/30 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                  </div>
                  <span className="text-sm text-stone-400 group-hover:text-white transition-colors duration-300">
                    @africa.records
                  </span>
                </div>
              </GravityLink>
            </FloatingElement>
          </div>
        </div>
      </div>

      {/* ───── Bottom bar — thin gravity line ───── */}
      <div className="relative z-10 border-t border-stone-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <FloatingElement delay={2.5} duration={9} distance={3}>
            <p className="text-[11px] text-stone-600 tracking-wide">
              © 2026 AFRICA SHOP. Усі права захищені.
            </p>
          </FloatingElement>
          <FloatingElement delay={3} duration={10} distance={3}>
            <p className="text-[11px] text-stone-600 tracking-wide">
              Створено командою{" "}
              <GravityLink
                href="https://galychyna.online/"
                external
                className="text-stone-500 hover:text-stone-300 transition-colors duration-300"
              >
                Galychyna Technologies
              </GravityLink>
            </p>
          </FloatingElement>
        </div>
      </div>
    </footer>
  );
}
