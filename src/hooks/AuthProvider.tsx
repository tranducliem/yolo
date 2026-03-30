"use client";

import { useState, useEffect, useMemo, createContext, type ReactNode } from "react";
import type { YoloUser } from "@/types";
import { STORAGE_KEYS } from "@/config/storage-keys";
import { createClient } from "@/lib/supabase/client";

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
    name: row.display_name || row.email?.split("@")[0] || "ユーザー",
    petName: pets[0]?.name || "ペット",
    loggedIn: true,
    donationCount: Math.floor((row.donation_total || 0) / 50),
  };
}

export interface AuthContextType {
  user: YoloUser | null;
  loaded: boolean;
  setUser: (u: YoloUser | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loaded: false,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<YoloUser | null>(null);
  const [loaded, setLoaded] = useState(false);

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
        if (raw && mounted) setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      if (mounted) setLoaded(true);
    }

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!mounted) return;
      initialized = true;
      if (authUser) fetchProfile(authUser.id);
      else loadMockUser();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !initialized) return;
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

  const value = useMemo(() => ({ user, loaded, setUser }), [user, loaded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
