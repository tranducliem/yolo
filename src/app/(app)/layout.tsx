"use client";

import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SideNav from "@/components/layout/SideNav";
import BottomNav from "@/components/layout/BottomNav";
import PushNotificationSetup from "@/components/features/notifications/PushNotificationSetup";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <SideNav />
      <Header />
      <main className={`${isLoggedIn ? "pb-24 md:pb-8 lg:pl-60" : "pb-20"}`}>{children}</main>
      <div className={isLoggedIn ? "lg:pl-60" : ""}>
        <Footer />
      </div>
      <BottomNav />
      <PushNotificationSetup />
    </div>
  );
}
