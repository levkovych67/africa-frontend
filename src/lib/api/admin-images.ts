import { adminClient } from "./admin-client";
import { PresignResponse } from "@/types/admin";

export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<PresignResponse> {
  return adminClient<PresignResponse>(
    "/api/v1/admin/products/images/presign",
    {
      method: "POST",
      body: JSON.stringify({ fileName, contentType }),
    }
  );
}

export async function uploadToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Помилка завантаження зображення");
  }
}
