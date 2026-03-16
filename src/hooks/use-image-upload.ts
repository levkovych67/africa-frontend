"use client";

import { useMutation } from "@tanstack/react-query";
import { getPresignedUrl, uploadToS3 } from "@/lib/api/admin-images";

export function useImageUpload() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const { uploadUrl, publicUrl } = await getPresignedUrl(
        file.name,
        file.type
      );
      await uploadToS3(uploadUrl, file);
      return publicUrl;
    },
  });
}
