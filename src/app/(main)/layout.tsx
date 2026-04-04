"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!isInitialized) {
      initializeData();
    }
  }, [isAuthenticated, router, isInitialized, initializeData]);

  if (!isAuthenticated || !currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gradient-text">iyi ki</h1>
          </div>
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-2xl hover:bg-gray-50 transition-all"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-dot">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-[22px] h-[22px]", isActive && "stroke-[2.5px]")} />
                <span className="text-[11px] font-semibold mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
