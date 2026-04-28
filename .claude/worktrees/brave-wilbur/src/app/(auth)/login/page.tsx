"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, Phone, ArrowRight, Users, Shield, Building2, Heart } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const setPhone = useAppStore((s) => s.setPhone);
  const loginAsRole = useAppStore((s) => s.loginAsRole);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const [phone, setPhoneInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Giriş yapmış kullanıcıyı uygun sayfaya yönlendir
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
      toast.error("Geçerli bir telefon numarası giriniz");
      return;
    }
    const fullPhone = cleaned.startsWith("+90") ? cleaned : `+90${cleaned}`;
    setPhone(fullPhone);
    setIsLoading(true);
    setTimeout(() => {
      router.push("/verify");
    }, 500);
  };

  const handleQuickLogin = async (role: string) => {
    await loginAsRole(role);
    toast.success("Hoş geldiniz!");
    switch (role) {
      case "admin": router.push("/admin"); break;
      case "partner": router.push("/partner"); break;
      case "sponsor": router.push("/sponsor"); break;
      default: router.push("/home");
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ opacity: 1 }}
    >
      {/* Branding */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-[88px] h-[88px] rounded-[26px] mb-6 shadow-xl"
          style={{ background: "linear-gradient(135deg, #E8364F 0%, #FF6B8A 50%, #F5A623 100%)" }}
        >
          <Gift className="w-11 h-11 text-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[42px] font-extrabold text-foreground tracking-tight leading-none"
        >
          iyi ki
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted mt-4 text-[16px] leading-relaxed max-w-[280px] mx-auto font-medium"
        >
          Biri seni düşünsün. Söylemene gerek yok, düşünmen yeter.
        </motion.p>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="premium-card p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-3 tracking-wide uppercase">
              Telefon Numaranız
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center px-4 py-4 bg-surface rounded-2xl text-[14px] text-muted font-bold">
                <Phone className="w-4 h-4 mr-2 text-muted/60" />
                +90
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9\s]/g, ""))}
                placeholder="5XX XXX XX XX"
                className="flex-1 px-5 py-4 bg-surface rounded-2xl text-foreground placeholder:text-muted/50 focus:ring-2 focus:ring-primary/15 focus:bg-white transition-all text-[16px] font-medium"
                maxLength={13}
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.replace(/\s/g, "").length < 10}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-4 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl text-[16px] tracking-wide"
            style={{ background: "linear-gradient(135deg, #E8364F 0%, #FF6B8A 100%)" }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Devam Et
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-muted font-semibold uppercase tracking-wider">Demo Giriş</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Quick Login */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { role: "user", label: "Kullanıcı", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { role: "admin", label: "Admin", icon: Shield, color: "text-red-500", bg: "bg-red-50" },
            { role: "partner", label: "Partner", icon: Building2, color: "text-emerald-500", bg: "bg-emerald-50" },
            { role: "sponsor", label: "Sponsor", icon: Heart, color: "text-purple-500", bg: "bg-purple-50" },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => handleQuickLogin(item.role)}
              className="flex items-center gap-3 px-4 py-3.5 bg-surface hover:bg-border/50 rounded-2xl text-[13px] font-bold text-foreground transition-all group"
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", item.bg)}>
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <p className="text-center text-[12px] text-muted mt-8 font-medium leading-relaxed">
        Devam ederek{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Gizlilik Politikası</span>
        {" "}ve{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Kullanım Koşulları</span>
        &apos;nı kabul edersiniz.
      </p>
    </motion.div>
  );
}