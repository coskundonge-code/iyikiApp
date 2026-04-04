"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Phone, ArrowRight, Users, Shield, Building2, Heart, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const DEMO_ROLES = [
  { role: "user", label: "Kullanici", icon: Users, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", ring: "ring-blue-100" },
  { role: "admin", label: "Admin", icon: Shield, gradient: "from-rose-500 to-red-500", bg: "bg-rose-50", ring: "ring-rose-100" },
  { role: "partner", label: "Partner", icon: Building2, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  { role: "sponsor", label: "Sponsor", icon: Heart, gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50", ring: "ring-violet-100" },
];

export default function LoginPage() {
  const router = useRouter();
  const setPhone = useAppStore((s) => s.setPhone);
  const loginAsRole = useAppStore((s) => s.loginAsRole);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const [phone, setPhoneInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedRole, setFocusedRole] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated && currentUser) {
      switch (currentUser.role) {
        case "admin": router.replace("/admin"); break;
        case "partner": router.replace("/partner"); break;
        case "sponsor": router.replace("/sponsor"); break;
        default: router.replace("/home");
      }
    }
  }, [isAuthenticated, currentUser, router, mounted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      toast.error("Gecerli bir telefon numarasi giriniz");
      return;
    }
    const fullPhone = cleaned.startsWith("+90") ? cleaned : `+90${cleaned}`;
    setPhone(fullPhone);
    setIsLoading(true);
    setTimeout(() => { router.push("/verify"); }, 500);
  };

  const handleQuickLogin = async (role: string) => {
    setFocusedRole(role);
    await loginAsRole(role);
    toast.success("Hos geldiniz!");
    switch (role) {
      case "admin": router.push("/admin"); break;
      case "partner": router.push("/partner"); break;
      case "sponsor": router.push("/sponsor"); break;
      default: router.push("/home");
    }
  };

  if (!mounted) return null;

  return (
    <div>
      {/* Branding */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
          className="relative inline-flex items-center justify-center w-24 h-24 rounded-[28px] mb-7"
          style={{ background: "linear-gradient(135deg, #E8364F 0%, #FF6B8A 40%, #F5A623 100%)" }}
        >
          <Gift className="w-12 h-12 text-white drop-shadow-lg" />
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-[28px]"
            style={{ background: "linear-gradient(135deg, #E8364F 0%, #FF6B8A 40%, #F5A623 100%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Sparkle */}
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-amber-400 drop-shadow-lg" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-[46px] font-extrabold tracking-tight leading-none"
        >
          <span className="gradient-text-shine">iyi ki</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-muted mt-4 text-[15px] leading-relaxed max-w-[300px] mx-auto font-medium"
        >
          Biri seni dusinsun. Soylemene gerek yok, dusunmen yeter.
        </motion.p>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="glass-card p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[12px] font-bold text-muted mb-3 tracking-[0.1em] uppercase">
              Telefon Numaraniz
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center px-4 py-4 bg-white/80 rounded-2xl text-[14px] text-muted font-bold border border-border/50">
                <Phone className="w-4 h-4 mr-2 text-muted/60" />
                +90
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9\s]/g, ""))}
                placeholder="5XX XXX XX XX"
                className="input-premium flex-1"
                maxLength={13}
                autoFocus
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || phone.replace(/\s/g, "").length < 10}
            className="btn-premium w-full text-[15px] tracking-wide"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Devam Et
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="divider my-8">
          <span className="text-[11px] text-muted font-bold uppercase tracking-[0.15em]">Demo Giris</span>
        </div>

        {/* Quick Login */}
        <div className="grid grid-cols-2 gap-3">
          {DEMO_ROLES.map((item, i) => (
            <motion.button
              key={item.role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              onClick={() => handleQuickLogin(item.role)}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold text-foreground transition-all overflow-hidden border",
                focusedRole === item.role
                  ? `${item.bg} ${item.ring} ring-2 border-transparent`
                  : "bg-white/60 border-border/50 hover:bg-white hover:border-border"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-sm",
                item.gradient
              )}>
                <item.icon className="w-4 h-4" />
              </div>
              {item.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-[11px] text-muted/70 mt-8 font-medium leading-relaxed"
      >
        Devam ederek{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Gizlilik Politikasi</span>
        {" "}ve{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Kullanim Kosullari</span>
        &apos;ni kabul edersiniz.
      </motion.p>
    </div>
  );
}
