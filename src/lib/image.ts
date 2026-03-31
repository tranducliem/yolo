import type { PhotoData } from "@/types";
import { LIMITS } from "@/config/site";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp"];

/**
 * Validate ảnh upload (type + size)
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `${file.name}: Unsupported format. Use JPEG, PNG, HEIC, or WebP.` };
  }
  if (file.size > LIMITS.maxPhotoSizeMB * 1024 * 1024) {
    return { valid: false, error: `${file.name}: File too large. Max ${LIMITS.maxPhotoSizeMB}MB.` };
  }
  return { valid: true };
}

/**
 * Resize ảnh theo maxWidth, trả về base64 data URL
 */
export function resizeImage(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Convert data URL to PhotoData (strip base64 prefix)
 */
export function dataUrlToPhotoData(dataUrl: string, fileName: string): PhotoData {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error("Invalid data URL");

  return {
    name: fileName,
    base64: match[2],
    type: match[1],
  };
}

/**
 * Process files cho API: resize + convert to PhotoData
 */
export async function processPhotosForApi(files: File[]): Promise<{
  apiPhotos: PhotoData[];
  previews: string[];
}> {
  const apiPhotos: PhotoData[] = [];
  const previews: string[] = [];

  for (const file of files) {
    const [apiDataUrl, previewDataUrl] = await Promise.all([
      resizeImage(file, LIMITS.apiImageMaxWidth),
      resizeImage(file, LIMITS.previewImageMaxWidth),
    ]);

    apiPhotos.push(dataUrlToPhotoData(apiDataUrl, file.name));
    previews.push(previewDataUrl);
  }

  return { apiPhotos, previews };
}
