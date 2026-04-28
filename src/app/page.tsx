"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated && currentUser) {
      switch (currentUser.role) {
        case "admin":
          router.replace("/admin");
          break;
        case "partner":
          router.replace("/partner");
          break;
        case "sponsor":
          router.replace("/sponsor");
          break;
        default:
          router.replace("/home");
      }
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, currentUser, router, mounted]);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center min-h-screen aurora-bg text-foreground">
      <div className="text-center glass-dark p-10 rounded-[32px] flex flex-col items-center shadow-2xl">
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 animate-pulse-dot shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          <span className="text-3xl text-white">🎁</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2 gradient-text-shine">iyi ki</h1>
        <p className="text-muted text-[13px] font-bold tracking-wide uppercase">Başlatılıyor...</p>
      </div>
    </div>
  );
}