"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Artist } from "@/types/artist";
import {
  useCreateArtist,
  useUpdateArtist,
  useDeleteArtist,
} from "@/hooks/use-admin-artists";

const PLATFORM_OPTIONS = [
  "instagram",
  "spotify",
  "youtube",
  "tiktok",
  "soundcloud",
  "website",
];

interface SocialLinkRow {
  platform: string;
  url: string;
}

interface ArtistFormProps {
  artist?: Artist;
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const isEdit = !!artist;

  const [name, setName] = useState(artist?.name || "");
  const [bio, setBio] = useState(artist?.bio || "");
  const [image, setImage] = useState(artist?.image || "");
  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>(
    artist?.socialLinks
      ? Object.entries(artist.socialLinks).map(([platform, url]) => ({
          platform,
          url,
        }))
      : []
  );

  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();
  const deleteArtist = useDeleteArtist();

  const buildPayload = () => ({
    name,
    bio: bio || undefined,
    image: image || undefined,
    socialLinks: Object.fromEntries(
      socialLinks
        .filter((s) => s.platform && s.url)
        .map((s) => [s.platform, s.url])
    ),
  });

  const handleSave = async () => {
    if (!name.trim()) {
      window.alert("Введіть ім'я артиста");
      return;
    }

    try {
      if (isEdit) {
        await updateArtist.mutateAsync({ id: artist.id, data: buildPayload() });
      } else {
        await createArtist.mutateAsync(buildPayload());
      }
      router.push("/admin/artists");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Помилка збереження"
      );
    }
  };

  const handleDelete = async () => {
    if (!artist) return;
    if (!window.confirm("Видалити цього артиста? Цю дію не можна скасувати."))
      return;

    try {
      await deleteArtist.mutateAsync(artist.id);
      router.push("/admin/artists");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Помилка видалення"
      );
    }
  };

  const isSaving =
    createArtist.isPending ||
    updateArtist.isPending ||
    deleteArtist.isPending;

  return (
    <div className="max-w-xl space-y-6">
      {/* Basic fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-gray-900">Основна інформація</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ім&apos;я *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Біографія
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фото URL
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Social links */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">
          Соціальні мережі
        </h2>

        <div className="space-y-2">
          {socialLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-start">
              <select
                value={link.platform}
                onChange={(e) =>
                  setSocialLinks((prev) =>
                    prev.map((s, j) =>
                      j === i ? { ...s, platform: e.target.value } : s
                    )
                  )
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Платформа</option>
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) =>
                  setSocialLinks((prev) =>
                    prev.map((s, j) =>
                      j === i ? { ...s, url: e.target.value } : s
                    )
                  )
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setSocialLinks((prev) => prev.filter((_, j) => j !== i))
                }
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setSocialLinks((prev) => [...prev, { platform: "", url: "" }])
          }
          className="mt-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Додати
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Збереження..." : "Зберегти"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            Видалити
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push("/admin/artists")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Назад
        </button>
      </div>
    </div>
  );
}
