import { createClient } from "@/lib/supabase/client";

const BUCKETS = {
  PET_PHOTOS: "pet-photos",
  BESTSHOTS: "bestshots",
  SHARE_IMAGES: "share-images",
  AVATARS: "avatars",
} as const;

export { BUCKETS };

/**
 * Upload a File/Blob to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  userId: string,
  file: File | Blob,
  filename?: string,
): Promise<string> {
  const supabase = createClient();
  const name = filename || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `${userId}/${name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

/**
 * Upload base64 data to Supabase Storage
 */
export async function uploadBase64(
  bucket: string,
  userId: string,
  base64: string,
  filename: string,
  mimeType: string = "image/jpeg",
): Promise<string> {
  const blob = base64ToBlob(base64, mimeType);
  return uploadFile(bucket, userId, blob, filename);
}

/**
 * Get public URL for a file (for public buckets: avatars, share-images)
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get signed URL for a private file (for private buckets: pet-photos, bestshots)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600,
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

/**
 * Delete a file from Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Convert base64 data URL to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  // Handle data URL format (data:image/jpeg;base64,...)
  const raw = base64.includes(",") ? base64.split(",")[1] : base64;
  const byteString = atob(raw);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}
