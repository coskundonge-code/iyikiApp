"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Megaphone, BarChart3, MapPin,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import DashboardLayout from "@/components/DashboardLayout";

const NAV_ITEMS = [
  { href: "/partner", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/partner/products", icon: Package, label: "Urunler" },
  { href: "/partner/campaigns", icon: Megaphone, label: "Kampanyalar" },
  { href: "/partner/branches", icon: MapPin, label: "Subeler" },
  { href: "/partner/reports", icon: BarChart3, label: "Raporlar" },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "partner") {
      router.replace("/login");
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || currentUser?.role !== "partner") return null;

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      panelName="Partner Panel"
      accentColor="emerald"
      accentGradient="from-emerald-500 to-teal-500"
    >
      {children}
    </DashboardLayout>
  );
}
