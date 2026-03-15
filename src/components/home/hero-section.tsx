import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative h-screen w-full">
      <Image
        src="/images/pc hero.png"
        alt="КОЛЕКЦІЯ 2026"
        fill
        priority
        className="hidden md:block object-cover"
      />
      <Image
        src="/images/phone.png"
        alt="КОЛЕКЦІЯ 2026"
        fill
        priority
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
    </section>
  );
}
