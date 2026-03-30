"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { YoloUser } from "@/types";
import { STORAGE_KEYS } from "@/config/storage-keys";
import { useCart } from "./useCart";
import { createClient } from "@/lib/supabase/client";

export type { YoloUser };

/**
 * Map Supabase DB row → YoloUser (with legacy compat fields)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToYoloUser(row: any): YoloUser {
  const pets = (row.pets || []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    type: p.type as "dog" | "cat" | "other",
    breed: (p.breed as string) || null,
    birthday: (p.birthday as string) || null,
    gender: (p.gender as string) || null,
    avatarUrl: (p.avatar_url as string) || null,
    isPublic: p.is_public !== false,
  }));

  return {
    id: row.id,
    authId: row.auth_id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    plan: row.plan || "free",
    ambassadorLevel: row.ambassador_level || 0,
    ambassadorRegion: row.ambassador_region || null,
    ambassadorCategory: row.ambassador_category || null,
    pawPoints: row.paw_points || 0,
    bestshotCountThisMonth: row.bestshot_count_this_month || 0,
    donationTotal: row.donation_total || 0,
    referralCode: row.referral_code || null,
    referralCount: row.referral_count || 0,
    battleVotesToday: row.battle_votes_today || 0,
    isBanned: row.is_banned || false,
    isAdmin: row.is_admin || false,
    lastLoginAt: row.last_login_at || null,
    createdAt: row.created_at,
    pets,
    // Legacy compat fields
    name: row.display_name || row.email?.split("@")[0] || "ユーザー",
    petName: pets[0]?.name || "ペット",
    loggedIn: true,
    donationCount: Math.floor((row.donation_total || 0) / 50),
  };
}

export function useAuth() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<YoloUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartCount } =
    useCart();

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    async function fetchProfile(authId: string) {
      try {
        const { data } = await supabase
          .from("users")
          .select("*, pets(*)")
          .eq("auth_id", authId)
          .single();
        if (mounted && data) {
          setUser(mapToYoloUser(data));
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    function loadMockUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.USER);
        if (raw && mounted) {
          setUser(JSON.parse(raw));
        }
      } catch {
        /* ignore */
      }
      if (mounted) setLoaded(true);
    }

    // Initial load — try Supabase Auth first, fallback to mock
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!mounted) return;
      initialized = true;
      if (authUser) {
        fetchProfile(authUser.id);
      } else {
        loadMockUser();
      }
    });

    // Listen for auth state changes (login/logout events AFTER initial load)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !initialized) return; // Skip events during initial load
      if (event === "SIGNED_IN" && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        const raw = localStorage.getItem(STORAGE_KEYS.USER);
        if (!raw) setUser(null);
        setLoaded(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoggedIn = !!user?.loggedIn;

  // Supabase Auth methods
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
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
    },
    [supabase],
  );

  const signup = useCallback(
    async (email: string, password: string, metadata: Record<string, string>) => {
      return supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
    },
    [supabase],
  );

  // Legacy mock login (kept for backward compat during migration)
  const login = useCallback((data: Partial<YoloUser>) => {
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
      // Legacy compat
      name: data.name || "ユーザー",
      petName: data.petName || "モカ",
      loggedIn: true,
      donationCount: data.donationCount ?? 47,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    // Clear both Supabase session and localStorage mock
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    router.push("/");
  }, [supabase, router]);

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
    // Auth methods
    login, // legacy mock
    loginWithEmail, // Supabase email
    loginWithOAuth, // Supabase OAuth
    signup, // Supabase signup
    logout,
    requireAuth,
    getTryCount,
    incrementTry,
    // Re-export cart methods
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
  };
}
