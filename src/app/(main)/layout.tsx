"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Gift, User, Bell, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", icon: Home, label: "Anasayfa" },
  { href: "/send", icon: Gift, label: "Hediyeler" },
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

  useEffect(() => { setMounted(true); }, []);

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
    <div className="flex flex-col min-h-screen max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="flex items-center justify-between px-5 py-3.5">
          <Link href="/home" className="flex items-center gap-1.5">
            <h1 className="text-[26px] font-extrabold tracking-tight gradient-text-shine leading-none">
              iyi ki
            </h1>
            {currentUser?.tier === "premium" && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
              </motion.div>
            )}
          </Link>

          <Link
            href="/notifications"
            className="relative p-2.5 rounded-2xl hover:bg-surface/80 transition-all active:scale-95"
            aria-label="Bildirimler"
          >
            <Bell className="w-[22px] h-[22px] text-foreground" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm px-1"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      {/* Premium Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 pb-1">
          <div className="glass rounded-2xl mx-1 mb-2 shadow-lg shadow-black/[0.04] border border-white/60">
            <div className="flex items-center justify-around py-2 px-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const isSend = item.href === "/send";

                if (isSend) {
                  return (
                    <Link key={item.href} href={item.href} className="relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        className={cn(
                          "flex items-center justify-center w-14 h-14 -mt-5 rounded-2xl shadow-lg transition-all",
                          isActive
                            ? "shadow-primary/30"
                            : "shadow-black/10"
                        )}
                        style={{
                          background: isActive
                            ? "linear-gradient(135deg, #E8364F 0%, #FF6B8A 100%)"
                            : "linear-gradient(135deg, #1A1A1A 0%, #333 100%)"
                        }}
                      >
                        <Gift className="w-6 h-6 text-white" />
                      </motion.div>
                      <span className={cn(
                        "block text-center text-[10px] font-bold mt-1",
                        isActive ? "text-primary" : "text-muted"
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-col items-center px-5 py-2"
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="relative"
                    >
                      <item.icon className={cn(
                        "w-[22px] h-[22px] transition-colors duration-200",
                        isActive ? "text-primary stroke-[2.5px]" : "text-muted"
                      )} />
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.div>
                    <span className={cn(
                      "text-[10px] mt-1 transition-colors duration-200",
                      isActive ? "font-bold text-primary" : "font-semibold text-muted"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
