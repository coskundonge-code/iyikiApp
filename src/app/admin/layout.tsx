"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Gift, Building2, Heart, ShieldAlert,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import DashboardLayout from "@/components/DashboardLayout";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Kullanicilar" },
  { href: "/admin/gifts", icon: Gift, label: "Hediyeler" },
  { href: "/admin/partners", icon: Building2, label: "Partnerler" },
  { href: "/admin/sponsors", icon: Heart, label: "Sponsorlar" },
  { href: "/admin/fraud", icon: ShieldAlert, label: "Fraud Merkezi" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const loadAdminData = useAppStore((s) => s.loadAdminData);

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "admin") {
      router.replace("/login");
    } else {
      loadAdminData();
    }
  }, [isAuthenticated, currentUser, router, loadAdminData]);

  if (!isAuthenticated || currentUser?.role !== "admin") return null;

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      panelName="Admin Panel"
      accentColor="rose"
      accentGradient="from-rose-500 to-pink-500"
    >
      {children}
    </DashboardLayout>
  );
}
