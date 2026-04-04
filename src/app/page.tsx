"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
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
  }, [isAuthenticated, currentUser, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🎁</div>
        <p className="text-muted text-sm">Yükleniyor...</p>
      </div>
    </div>
  );
}
