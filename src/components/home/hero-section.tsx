"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroSection() {
  const { scrollY } = useScroll();

  const blur = useTransform(scrollY, [0, 500], [0, 12]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.4]);
  const filterBlur = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <section className="fixed inset-0 z-0 h-screen w-full">
      <motion.div
        className="absolute inset-0"
        style={{ filter: filterBlur, opacity }}
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
    </section>
  );
}
