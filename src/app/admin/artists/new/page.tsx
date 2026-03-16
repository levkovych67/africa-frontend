"use client";

import { ArtistForm } from "@/components/admin/artists/artist-form";

export default function AdminNewArtistPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Новий артист
      </h1>
      <ArtistForm />
    </div>
  );
}
