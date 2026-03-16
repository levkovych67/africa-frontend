"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminArtists,
  getAdminArtist,
  createArtist,
  updateArtist,
  deleteArtist,
  CreateArtistPayload,
} from "@/lib/api/admin-artists";

export function useAdminArtists(params?: {
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin-artists", params],
    queryFn: () => getAdminArtists(params),
  });
}

export function useAdminArtist(id: string) {
  return useQuery({
    queryKey: ["admin-artist", id],
    queryFn: () => getAdminArtist(id),
    enabled: !!id,
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArtistPayload) => createArtist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-artists"] });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateArtistPayload> }) =>
      updateArtist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-artists"] });
      queryClient.invalidateQueries({ queryKey: ["admin-artist"] });
    },
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteArtist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-artists"] });
    },
  });
}
