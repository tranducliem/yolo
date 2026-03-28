import { SESSION_KEYS } from "@/config/storage-keys";
import type { AnalyzeResult } from "@/types";

/**
 * Centralized session storage management
 * Quản lý dữ liệu tạm giữa các pages (try → analyzing → results)
 */
export const sessionStore = {
  // Pet name
  getPetName: () => sessionStorage.getItem(SESSION_KEYS.PET_NAME),
  setPetName: (name: string) => sessionStorage.setItem(SESSION_KEYS.PET_NAME, name),

  // Photos for API
  getPhotos: (): string | null => sessionStorage.getItem(SESSION_KEYS.PHOTOS),
  setPhotos: (photos: string) => sessionStorage.setItem(SESSION_KEYS.PHOTOS, photos),

  // Photo previews for display
  getPreviews: (): string | null => sessionStorage.getItem(SESSION_KEYS.PHOTO_PREVIEWS),
  setPreviews: (previews: string) => sessionStorage.setItem(SESSION_KEYS.PHOTO_PREVIEWS, previews),

  // Analysis results
  getResults: (): AnalyzeResult[] | null => {
    const raw = sessionStorage.getItem(SESSION_KEYS.RESULTS);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setResults: (results: AnalyzeResult[]) =>
    sessionStorage.setItem(SESSION_KEYS.RESULTS, JSON.stringify(results)),

  // Analysis mode
  getAnalysisMode: () => sessionStorage.getItem(SESSION_KEYS.ANALYSIS_MODE) as "live" | "mock" | null,
  setAnalysisMode: (mode: "live" | "mock") =>
    sessionStorage.setItem(SESSION_KEYS.ANALYSIS_MODE, mode),

  // Auth redirect
  getAuthRedirect: () => sessionStorage.getItem(SESSION_KEYS.AUTH_REDIRECT),
  setAuthRedirect: (path: string) => sessionStorage.setItem(SESSION_KEYS.AUTH_REDIRECT, path),
  clearAuthRedirect: () => sessionStorage.removeItem(SESSION_KEYS.AUTH_REDIRECT),

  // Clear all analysis data
  clearAnalysis: () => {
    sessionStorage.removeItem(SESSION_KEYS.RESULTS);
    sessionStorage.removeItem(SESSION_KEYS.ANALYSIS_MODE);
    sessionStorage.removeItem(SESSION_KEYS.PHOTOS);
    sessionStorage.removeItem(SESSION_KEYS.PHOTO_PREVIEWS);
    sessionStorage.removeItem(SESSION_KEYS.PET_NAME);
  },
};
