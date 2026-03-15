"use client";

import { PrecisionButton } from "@/components/ui/precision-button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-jakarta text-2xl font-bold mb-4">
          Помилка
        </h1>
        <p className="text-sm text-stone-500 mb-8">Щось пішло не так</p>
        <PrecisionButton onClick={reset}>Спробувати ще раз</PrecisionButton>
      </div>
    </main>
  );
}
