"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AdminSideNav from "@/components/layout/AdminSideNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loaded } = useAuth();
  const router = useRouter();

  const isAdmin = useMemo(() => loaded && !!user?.isAdmin, [loaded, user]);

  useEffect(() => {
    if (loaded && !user?.isAdmin) {
      router.replace("/home");
    }
  }, [loaded, user, router]);

  if (!loaded || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSideNav />
      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
