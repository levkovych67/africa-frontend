"use client";

import { use } from "react";
import Link from "next/link";
import { useAdminArtist } from "@/hooks/use-admin-artists";
import { ArtistForm } from "@/components/admin/artists/artist-form";

export default function AdminEditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: artist, isLoading, error } = useAdminArtist(id);

  return (
    <div>
      <Link
        href="/admin/artists"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Назад до артистів
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Редагувати артиста
      </h1>

      {isLoading && <p className="text-gray-500 text-sm">Завантаження...</p>}
      {error && (
        <p className="text-red-600 text-sm">Помилка завантаження артиста</p>
      )}
      {artist && <ArtistForm artist={artist} />}
    </div>
  );
}
