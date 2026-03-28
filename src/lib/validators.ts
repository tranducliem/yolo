import { LIMITS } from "@/config/site";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp"];

/**
 * Validate file ảnh (type + size)
 */
export function isValidImage(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type)
    && file.size <= LIMITS.maxPhotoSizeMB * 1024 * 1024;
}

/**
 * Validate số lượng ảnh cho analysis
 */
export function isValidPhotoCount(count: number): boolean {
  return count >= LIMITS.minPhotosPerAnalysis && count <= LIMITS.maxPhotosPerAnalysis;
}
