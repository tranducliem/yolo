"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/mockData";

const USER_KEY = "yolo_user";
const TRY_KEY = "yolo_try_count";
const CART_KEY = "yolo_cart";

export interface YoloUser {
  name: string;
  petName: string;
  loggedIn: boolean;
  createdAt: string;
  plan: "free" | "plus" | "pro" | "family";
  ambassadorLevel: number;
  ambassadorRegion?: string;
  donationTotal: number;
  donationCount: number; // animals saved
}

export function useAuth() {
  const [user, setUser] = useState<YoloUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
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
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    router.push("/");
  }, [router]);

  const requireAuth = useCallback(() => {
    if (loaded && !user?.loggedIn) {
      sessionStorage.setItem("authRedirect", window.location.pathname);
      router.replace("/signup");
    }
  }, [loaded, user, router]);

  const getTryCount = useCallback(() => parseInt(localStorage.getItem(TRY_KEY) || "0", 10), []);
  const incrementTry = useCallback(() => {
    const c = parseInt(localStorage.getItem(TRY_KEY) || "0", 10);
    localStorage.setItem(TRY_KEY, String(c + 1));
  }, []);

  // Cart
  const getCart = useCallback((): CartItem[] => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "id">) => {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
    const existing = cart.find((c) => c.goodsId === item.goodsId && c.variant === item.variant);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push({ ...item, id: `cart-${Date.now()}` });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, []);

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
    const item = cart.find((c) => c.id === id);
    if (item) { item.quantity = Math.max(1, quantity); }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const cart = (JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[]).filter((c) => c.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, []);

  const clearCart = useCallback(() => { localStorage.removeItem(CART_KEY); }, []);

  const cartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
    return cart.reduce((sum, c) => sum + c.quantity, 0);
  }, []);

  return {
    user, isLoggedIn, loaded, login, logout, requireAuth,
    getTryCount, incrementTry,
    getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartCount,
  };
}
