"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Crown, Gift, Calendar, Mic, Sparkles, CreditCard } from "lucide-react";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";

const FEATURES = [
  { icon: Gift, label: "Günde 3 hediye gönder", free: "1", premium: "3" },
  { icon: Sparkles, label: "Özel hediyeler (restoran, deneyim)", free: false, premium: true },
  { icon: Calendar, label: "Planlı gönderim (doğum günü)", free: false, premium: true },
  { icon: Mic, label: "Sesli not gönder", free: false, premium: true },
  { icon: Crown, label: "Özel animasyonlar", free: false, premium: true },
];

export default function PremiumPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const upgradeToPremium = useAppStore((s) => s.upgradeToPremium);
  const [isProcessing, setIsProcessing] = useState(false);

  const isPremium = currentUser?.tier === "premium";

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeToPremium();
      toast.success("Premium aktif edildi!");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl p-6 text-white text-center"
      >
        <Crown className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold">Premium</h2>
        <p className="text-white/80 text-sm mt-1">Daha fazla jest, daha fazla mutluluk</p>
        <div className="mt-4">
          <span className="text-4xl font-bold">29</span>
          <span className="text-lg">₺/ay</span>
        </div>
      </motion.div>

      {/* Features */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-3 bg-gray-50 border-b border-border">
          <div className="p-3 text-xs font-medium text-muted">Özellik</div>
          <div className="p-3 text-xs font-medium text-muted text-center">Ücretsiz</div>
          <div className="p-3 text-xs font-medium text-amber-600 text-center">Premium</div>
        </div>
        {FEATURES.map((f, i) => (
          <div key={i} className="grid grid-cols-3 border-b border-border last:border-0">
            <div className="flex items-center gap-2 p-3">
              <f.icon className="w-4 h-4 text-muted flex-shrink-0" />
              <span className="text-xs text-foreground">{f.label}</span>
            </div>
            <div className="flex items-center justify-center p-3">
              {typeof f.free === "string" ? (
                <span className="text-xs text-muted">{f.free}</span>
              ) : f.free ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <span className="text-xs text-muted">—</span>
              )}
            </div>
            <div className="flex items-center justify-center p-3">
              {typeof f.premium === "string" ? (
                <span className="text-xs font-semibold text-amber-600">{f.premium}</span>
              ) : f.premium ? (
                <Check className="w-4 h-4 text-amber-500" />
              ) : (
                <span className="text-xs text-muted">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {isPremium ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800">Premium aktif</p>
          <p className="text-xs text-green-600 mt-1">Tüm özelliklerin açık</p>
        </div>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Premium'a Geç — 29₺/ay
            </>
          )}
        </button>
      )}

      <p className="text-center text-[10px] text-muted">
        İstediğin zaman iptal edebilirsin. Ödeme iyzico güvencesiyle yapılır.
      </p>
    </div>
  );
}
