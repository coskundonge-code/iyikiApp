"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  panelName: string;
  accentColor: string;       // e.g., "rose", "emerald", "violet"
  accentGradient: string;    // e.g., "from-rose-500 to-pink-500"
}

export default function DashboardLayout({
  children,
  navItems,
  panelName,
  accentColor,
  accentGradient,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAppStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeColors: Record<string, string> = {
    rose: "bg-rose-500/8 text-rose-600 border-rose-200/50",
    emerald: "bg-emerald-500/8 text-emerald-600 border-emerald-200/50",
    violet: "bg-violet-500/8 text-violet-600 border-violet-200/50",
  };

  const activeIconBg: Record<string, string> = {
    rose: "bg-rose-500/10",
    emerald: "bg-emerald-500/10",
    violet: "bg-violet-500/10",
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[272px] bg-white/95 backdrop-blur-xl border-r border-border/50 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto shadow-xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm",
              accentGradient
            )}>
              <span className="text-white font-extrabold text-[14px]">iy</span>
            </div>
            <div>
              <h1 className="font-extrabold text-foreground text-[15px] tracking-tight gradient-text">iyi ki</h1>
              <p className="text-[10px] text-muted font-bold uppercase tracking-[0.1em]">{panelName}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative",
                  isActive
                    ? cn(activeColors[accentColor] || activeColors.rose, "border shadow-sm")
                    : "text-muted hover:text-foreground hover:bg-surface/80 border border-transparent"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? (activeIconBg[accentColor] || activeIconBg.rose) : "bg-transparent group-hover:bg-surface"
                )}>
                  <item.icon className={cn("w-[18px] h-[18px]", isActive && "stroke-[2.5px]")} />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: `var(--${accentColor === 'rose' ? 'primary' : accentColor === 'emerald' ? 'success' : 'accent'})` }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/50">
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold text-red-400 hover:text-red-500 hover:bg-red-50/80 w-full transition-all"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <LogOut className="w-[18px] h-[18px]" />
            </div>
            Cikis Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass border-b border-border/30">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-foreground text-[15px]">
                {navItems.find((n) => n.href === pathname)?.label || panelName}
              </h2>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-7 overflow-y-auto mesh-gradient">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
