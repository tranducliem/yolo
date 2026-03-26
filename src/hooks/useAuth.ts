"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "tomoni_user";
const TRY_KEY = "tomoni_try_count";

export interface TomoniUser {
  name: string;
  petName: string;
  loggedIn: boolean;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<TomoniUser | null>(null);
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

  const login = useCallback((data: Partial<TomoniUser>) => {
    const u: TomoniUser = {
      name: data.name || "ユーザー",
      petName: data.petName || "モカ",
      loggedIn: true,
      createdAt: data.createdAt || new Date().toISOString(),
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

  const getTryCount = useCallback(() => {
    return parseInt(localStorage.getItem(TRY_KEY) || "0", 10);
  }, []);

  const incrementTry = useCallback(() => {
    const c = parseInt(localStorage.getItem(TRY_KEY) || "0", 10);
    localStorage.setItem(TRY_KEY, String(c + 1));
  }, []);

  return { user, isLoggedIn, loaded, login, logout, requireAuth, getTryCount, incrementTry };
}
