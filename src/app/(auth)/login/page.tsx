"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, Sparkles, Phone, ArrowRight, Users, Shield, Building2, Heart } from "lucide-react";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const setPhone = useAppStore((s) => s.setPhone);
  const loginAsRole = useAppStore((s) => s.loginAsRole);
  const [phone, setPhoneInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      toast.error("Geçerli bir telefon numarası gir");
      return;
    }
    const fullPhone = cleaned.startsWith("+90") ? cleaned : `+90${cleaned}`;
    setPhone(fullPhone);
    setIsLoading(true);
    setTimeout(() => {
      router.push("/verify");
    }, 500);
  };

  const handleQuickLogin = (role: string) => {
    loginAsRole(role);
    toast.success("Hoş geldin!");
    switch (role) {
      case "admin":
        router.push("/admin");
        break;
      case "partner":
        router.push("/partner");
        break;
      case "sponsor":
        router.push("/sponsor");
        break;
      default:
        router.push("/home");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Branding */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-[28px] mb-5 shadow-xl shadow-rose-200/50"
        >
          <Gift className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          iyi ki
        </h1>
        <p className="text-muted mt-3 text-base leading-relaxed max-w-xs mx-auto">
          Biri seni düşünsün. Söylemene gerek yok, düşünmen yeter.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Telefon Numaran
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-muted font-semibold">
                <Phone className="w-4 h-4 mr-1.5" />
                +90
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9\s]/g, ""))}
                placeholder="5XX XXX XX XX"
                className="flex-1 px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                maxLength={13}
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.replace(/\s/g, "").length < 10}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-2xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200/40 text-base"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Devam Et
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">veya hızlı giriş</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Quick Login */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickLogin("user")}
            className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm font-semibold text-foreground transition-all hover:shadow-sm"
          >
            <Users className="w-4 h-4 text-blue-500" />
            Kullanıcı
          </button>
          <button
            onClick={() => handleQuickLogin("admin")}
            className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm font-semibold text-foreground transition-all hover:shadow-sm"
          >
            <Shield className="w-4 h-4 text-red-500" />
            Admin
          </button>
          <button
            onClick={() => handleQuickLogin("partner")}
            className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm font-semibold text-foreground transition-all hover:shadow-sm"
          >
            <Building2 className="w-4 h-4 text-green-500" />
            Partner
          </button>
          <button
            onClick={() => handleQuickLogin("sponsor")}
            className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm font-semibold text-foreground transition-all hover:shadow-sm"
          >
            <Heart className="w-4 h-4 text-purple-500" />
            Sponsor
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted mt-6">
        Devam ederek <span className="underline cursor-pointer">Gizlilik Politikası</span> ve{" "}
        <span className="underline cursor-pointer">Kullanım Koşulları</span>&apos;nı kabul edersiniz.
      </p>
    </motion.div>
  );
}
