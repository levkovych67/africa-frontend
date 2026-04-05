import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative bg-black/80 backdrop-blur-xl text-white py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Logo + description */}
          <div className="max-w-xs">
            <Image
              src="/images/new-logo.webp"
              alt="AFRICA SHOP"
              width={140}
              height={48}
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm text-stone-400 leading-relaxed">
              Офіційний магазин мерчу AFRICA. Колекція 2026 — обмежений тираж.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="font-jakarta font-bold text-xs uppercase tracking-wider mb-4">
                Магазин
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-stone-400 hover:text-white transition-colors">
                    Каталог
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="text-sm text-stone-400 hover:text-white transition-colors">
                    Оформлення
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-jakarta font-bold text-xs uppercase tracking-wider mb-4">
                Інформація
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-stone-400">Доставка — Нова Пошта</span>
                </li>
                <li>
                  <span className="text-sm text-stone-400">Оплата при отриманні або онлайн</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-500">
            © 2026 AFRICA SHOP. Усі права захищені.
          </p>
          <p className="text-xs text-stone-500">
            Створено командою{" "}
            <a
              href="https://galychyna.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-white transition-colors"
            >
              Galychyna Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
