"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !isLoggedIn) {
      sessionStorage.setItem("authRedirect", window.location.pathname);
      router.replace("/signup");
    }
  }, [loaded, isLoggedIn, router]);

  if (!loaded) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">読み込み中...</div></div>;
  if (!isLoggedIn) return null;
  return <>{children}</>;
}
