import Link from "next/link";
import { PrecisionButton } from "@/components/ui/precision-button";

export default function NotFound() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-mono text-6xl mb-4">404</h1>
        <p className="text-sm mb-8">Сторінку не знайдено</p>
        <Link href="/">
          <PrecisionButton>На головну</PrecisionButton>
        </Link>
      </div>
    </main>
  );
}
