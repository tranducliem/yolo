// In-memory store for photo data between pages (avoids sessionStorage size limit)
interface StoreData {
  petName: string;
  images: string[];
}

let data: StoreData | null = null;

export const setSessionData = (d: StoreData) => { data = d; };
export const getSessionData = () => data;
export const clearSessionData = () => { data = null; };
