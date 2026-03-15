import Link from "next/link";
import { PrecisionButton } from "@/components/ui/precision-button";

export default function NotFound() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-grotesk text-6xl text-stone-300 font-bold mb-4">404</h1>
        <p className="text-sm text-stone-500 mb-8">Сторінку не знайдено</p>
        <Link href="/">
          <PrecisionButton>На головну</PrecisionButton>
        </Link>
      </div>
    </main>
  );
}
