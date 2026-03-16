"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroSection() {
  const { scrollY } = useScroll();

  // First background: blurs and fades as user scrolls
  const blur = useTransform(scrollY, [0, 500], [0, 12]);
  const firstOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const filterBlur = useTransform(blur, (v) => `blur(${v}px)`);

  // Second background: fades in as first fades out, stays blurred
  const secondOpacity = useTransform(scrollY, [300, 600], [0, 1]);

  return (
    <section className="fixed inset-0 z-0 h-screen w-full">
      {/* First background — hero images + logo */}
      <motion.div
        className="absolute inset-0"
        style={{ filter: filterBlur, opacity: firstOpacity }}
      >
        <Image
          src="/images/pc hero.png"
          alt="КОЛЕКЦІЯ 2026"
          fill
          priority
          sizes="(max-width: 768px) 0vw, 100vw"
          className="hidden md:block object-cover"
        />
        <Image
          src="/images/phone.png"
          alt="КОЛЕКЦІЯ 2026"
          fill
          loading="eager"
          sizes="(max-width: 768px) 100vw, 0vw"
          className="block md:hidden object-cover"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Image
            src="/images/new logo.PNG"
            alt="AFRICA"
            width={500}
            height={500}
            priority
            className="w-[60vw] md:w-[50vw] h-auto brightness-0 invert"
          />
        </div>
      </motion.div>

      {/* Second background — crossfades in, always blurred */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: secondOpacity }}
      >
        <Image
          src="/images/second background.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
    </section>
  );
}
