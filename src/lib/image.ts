import type { PhotoData } from "@/types";
import { LIMITS } from "@/config/site";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "image/gif",
];

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(result) ? result[0] : result;
  const newName = file.name.replace(/\.hei[cf]$/i, ".jpg");
  return new File([blob], newName, { type: "image/jpeg" });
}

function isHeicByTypeOrExt(file: File): boolean {
  const t = file.type.toLowerCase();
  if (t === "image/heic" || t === "image/heif") return true;
  return /\.hei[cf]$/i.test(file.name);
}

async function isHeicByBytes(file: File): Promise<boolean> {
  try {
    const buf = await file.slice(0, 12).arrayBuffer();
    const view = new Uint8Array(buf);
    if (view[4] === 0x66 && view[5] === 0x74 && view[6] === 0x79 && view[7] === 0x70) {
      const brand = String.fromCharCode(view[8], view[9], view[10], view[11]);
      return ["heic", "heix", "mif1", "hevc", "hevx", "heim", "heis"].includes(brand);
    }
  } catch {
    // ignore
  }
  return false;
}

export async function ensureBrowserCompatible(file: File): Promise<File> {
  const heic = isHeicByTypeOrExt(file) || (await isHeicByBytes(file));
  if (heic) {
    return convertHeicToJpeg(file);
  }
  return file;
}

/**
 * Validate ảnh upload (type + size)
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const type = file.type || "";
  const ext = file.name.toLowerCase();
  const isAllowedType = ALLOWED_TYPES.includes(type);
  const isAllowedExt = /\.(jpe?g|png|heic|heif|webp|gif)$/i.test(ext);

  if (!isAllowedType && !isAllowedExt) {
    return {
      valid: false,
      error: `${file.name}: 対応していない形式です。JPEG, PNG, HEIC, GIF, WebP をご利用ください。`,
    };
  }
  if (file.size > LIMITS.maxPhotoSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `${file.name}: ファイルサイズが大きすぎます。最大${LIMITS.maxPhotoSizeMB}MBです。`,
    };
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
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

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
