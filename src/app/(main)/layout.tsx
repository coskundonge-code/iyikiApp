"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Gift, User, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", icon: Home, label: "Ana Sayfa" },
  { href: "/send", icon: Gift, label: "Gönder" },
  { href: "/profile", icon: User, label: "Profil" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const unreadCount = useAppStore((s) => s.unreadCount);
  const initializeData = useAppStore((s) => s.initializeData);
  const isInitialized = useAppStore((s) => s.isInitialized);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!isInitialized) {
      initializeData();
    }
  }, [isAuthenticated, router, isInitialized, initializeData, mounted]);

  if (!mounted || !isAuthenticated || !currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">iyi ki</h1>
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-2xl hover:bg-surface transition-all"
          >
            <Bell className="w-[22px] h-[22px] text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse-dot shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-3 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all",
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-[22px] h-[22px]", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-[11px] font-semibold", isActive && "font-bold")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
