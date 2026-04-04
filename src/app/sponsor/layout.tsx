"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Heart, BarChart3,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import DashboardLayout from "@/components/DashboardLayout";

const NAV_ITEMS = [
  { href: "/sponsor", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/sponsor/campaigns", icon: Heart, label: "Kampanyalarim" },
  { href: "/sponsor/impact", icon: BarChart3, label: "Etki Raporu" },
];

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "sponsor") {
      router.replace("/login");
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || currentUser?.role !== "sponsor") return null;

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      panelName="Sponsor Panel"
      accentColor="violet"
      accentGradient="from-violet-500 to-purple-500"
    >
      {children}
    </DashboardLayout>
  );
}
