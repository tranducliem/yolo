"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { YoloUser } from "@/types";
import { STORAGE_KEYS } from "@/config/storage-keys";
import { useCart } from "./useCart";

export type { YoloUser };

export function useAuth() {
  const [user, setUser] = useState<YoloUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartCount } = useCart();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing from localStorage
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const isLoggedIn = !!user?.loggedIn;

  const login = useCallback((data: Partial<YoloUser>) => {
    const u: YoloUser = {
      name: data.name || "ユーザー",
      petName: data.petName || "モカ",
      loggedIn: true,
      createdAt: data.createdAt || new Date().toISOString(),
      plan: data.plan || "pro",
      ambassadorLevel: data.ambassadorLevel ?? 3,
      ambassadorRegion: data.ambassadorRegion || "福岡・犬",
      donationTotal: data.donationTotal ?? 2340,
      donationCount: data.donationCount ?? 47,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    router.push("/");
  }, [router]);

  const requireAuth = useCallback(() => {
    if (loaded && !user?.loggedIn) {
      sessionStorage.setItem("authRedirect", window.location.pathname);
      router.replace("/signup");
    }
  }, [loaded, user, router]);

  const getTryCount = useCallback(
    () => parseInt(localStorage.getItem(STORAGE_KEYS.TRY_COUNT) || "0", 10),
    [],
  );

  const incrementTry = useCallback(() => {
    const c = parseInt(localStorage.getItem(STORAGE_KEYS.TRY_COUNT) || "0", 10);
    localStorage.setItem(STORAGE_KEYS.TRY_COUNT, String(c + 1));
  }, []);

  return {
    user, isLoggedIn, loaded, login, logout, requireAuth,
    getTryCount, incrementTry,
    // Re-export cart methods for backward compatibility
    getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartCount,
  };
}
