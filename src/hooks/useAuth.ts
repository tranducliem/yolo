"use client";

import { useCallback, useMemo, useContext } from "react";
import { useRouter } from "next/navigation";
import type { YoloUser } from "@/types";
import { STORAGE_KEYS } from "@/config/storage-keys";
import { useCart } from "./useCart";
import { createClient } from "@/lib/supabase/client";
import { AuthContext } from "./AuthProvider";

export type { YoloUser };
export { AuthProvider } from "./AuthProvider";

export function useAuth() {
  const supabase = useMemo(() => createClient(), []);
  const { user, loaded, setUser } = useContext(AuthContext);
  const router = useRouter();
  const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartCount } =
    useCart();

  const isLoggedIn = !!user?.loggedIn;

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      return supabase.auth.signInWithPassword({ email, password });
    },
    [supabase],
  );

  const loginWithOAuth = useCallback(
    async (provider: "google" | "apple") => {
      return supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      });
    },
    [supabase],
  );

  const signup = useCallback(
    async (email: string, password: string, metadata: Record<string, string>) => {
      return supabase.auth.signUp({ email, password, options: { data: metadata } });
    },
    [supabase],
  );

  const login = useCallback(
    (data: Partial<YoloUser>) => {
      const u: YoloUser = {
        id: "mock-" + Date.now(),
        authId: "mock",
        email: "mock@yolo.jp",
        displayName: data.name || data.displayName || "ユーザー",
        avatarUrl: data.avatarUrl || null,
        plan: data.plan || "pro",
        ambassadorLevel: data.ambassadorLevel ?? 3,
        ambassadorRegion: data.ambassadorRegion || "福岡・犬",
        ambassadorCategory: null,
        pawPoints: 0,
        bestshotCountThisMonth: 0,
        donationTotal: data.donationTotal ?? 2340,
        referralCode: null,
        referralCount: 0,
        battleVotesToday: 0,
        isBanned: false,
        isAdmin: false,
        lastLoginAt: null,
        createdAt: data.createdAt || new Date().toISOString(),
        pets: [],
        name: data.name || "ユーザー",
        petName: data.petName || "モカ",
        loggedIn: true,
        donationCount: data.donationCount ?? 47,
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
      setUser(u);
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    router.push("/");
  }, [supabase, router, setUser]);

  const requireAuth = useCallback(() => {
    if (loaded && !isLoggedIn) {
      sessionStorage.setItem("authRedirect", window.location.pathname);
      router.replace("/signup");
    }
  }, [loaded, isLoggedIn, router]);

  const getTryCount = useCallback(
    () => parseInt(localStorage.getItem(STORAGE_KEYS.TRY_COUNT) || "0", 10),
    [],
  );

  const incrementTry = useCallback(() => {
    const c = parseInt(localStorage.getItem(STORAGE_KEYS.TRY_COUNT) || "0", 10);
    localStorage.setItem(STORAGE_KEYS.TRY_COUNT, String(c + 1));
  }, []);

  return {
    user,
    isLoggedIn,
    loaded,
    login,
    loginWithEmail,
    loginWithOAuth,
    signup,
    logout,
    requireAuth,
    getTryCount,
    incrementTry,
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
  };
}
