// In-memory store for photo data between pages (avoids sessionStorage size limit)
interface StoreData {
  petName: string;
  images: string[]; // Full data URLs for display (preview in analyzing/results)
}

interface ProcessedPhoto {
  name: string;
  base64: string; // base64 without data: prefix
  type: string;
}

let data: StoreData | null = null;
let processedPhotos: ProcessedPhoto[] | null = null;

export const setSessionData = (d: StoreData) => { data = d; };
export const getSessionData = () => data;
export const clearSessionData = () => { data = null; processedPhotos = null; };

export const setProcessedPhotos = (p: ProcessedPhoto[]) => { processedPhotos = p; };
export const getProcessedPhotos = () => processedPhotos;
