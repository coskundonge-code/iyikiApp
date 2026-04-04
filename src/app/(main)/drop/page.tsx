"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Clock, Users, Gift, Flame, Timer } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// Inline mock data for the drop (to avoid import issues)
const DROP_DATA = {
  title: "İYİ Kİ Perşembesi",
  description: "Bu haftanın sınırlı sayıda jestleri! Acele et, kaçırma.",
  totalStock: 50,
  claimedCount: 23,
};

export default function DropPage() {
  const router = useRouter();
  const gifts = useAppStore((s) => s.gifts);
  const currentUser = useAppStore((s) => s.currentUser);
  const sendGift = useAppStore((s) => s.sendGift);

  const today = new Date();
  const isDropDay = today.getDay() === 4; // Thursday
  const daysUntilThursday = isDropDay ? 0 : ((4 - today.getDay() + 7) % 7) || 7;

  const dropGifts = gifts.filter((g) => g.isActive && g.stock > 0).slice(0, 3);
  const [timeLeft, setTimeLeft] = useState("");
  const [daysLeft, setDaysLeft] = useState(daysUntilThursday);
  const [claimed, setClaimed] = useState(DROP_DATA.claimedCount);

  useEffect(() => {
    const update = () => {
      if (isDropDay) {
        const now = new Date();
        const end = new Date();
        end.setHours(22, 0, 0, 0);
        if (now > end) {
          setTimeLeft("Bugünkü Drop sona erdi");
          return;
        }
        const diff = end.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${hours}s ${String(minutes).padStart(2, "0")}dk ${String(seconds).padStart(2, "0")}sn`);
      } else {
        const now = new Date();
        const nextThursday = new Date();
        const daysToAdd = (4 - now.getDay() + 7) % 7 || 7;
        nextThursday.setDate(now.getDate() + daysToAdd);
        nextThursday.setHours(10, 0, 0, 0);

        const diff = nextThursday.getTime() - now.getTime();
        const days = Math.ceil(diff / 86400000);
        setDaysLeft(days);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isDropDay]);

  const handleClaim = (giftId: string) => {
    toast.success("Hediye seçildi! Şimdi birine ısmarla.");
    setClaimed((c) => c + 1);
    router.push(`/send/${giftId}`);
  };

  const remaining = DROP_DATA.totalStock - claimed;
  const progressPct = Math.round((claimed / DROP_DATA.totalStock) * 100);

  if (!isDropDay) {
    return (
      <div className="px-4 py-4 space-y-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-2xl p-6 text-white relative overflow-hidden opacity-75"
        >
          <div className="absolute top-0 right-0 opacity-10 text-[120px] -mt-4 -mr-4">⏰</div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Haftalık Drop</span>
            </div>
            <h2 className="text-2xl font-bold">Bir sonraki İYİ Kİ Perşembesi'ne</h2>
            <p className="text-white/80 text-sm mt-1 text-2xl font-bold">{daysLeft} gün</p>
          </div>
        </motion.div>

        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-muted text-sm">Drop yalnızca Perşembe günleri sabah 10:00'da açılır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-5">
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
        className="bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-10 text-[120px] -mt-4 -mr-4">⚡</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Haftalık Drop</span>
          </div>
          <h2 className="text-2xl font-bold">{DROP_DATA.title}</h2>
          <p className="text-white/80 text-sm mt-1">{DROP_DATA.description}</p>

          {/* Countdown */}
          <div className="flex items-center gap-2 mt-4 bg-white/15 rounded-xl px-3 py-2 backdrop-blur-sm w-fit">
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold text-sm">{timeLeft}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            Kalanlar
          </span>
          <span className="font-bold text-foreground">
            {remaining} / {DROP_DATA.totalStock}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
          />
        </div>
        <p className="text-[10px] text-muted mt-1.5">
          {claimed} kişi bu haftanın Drop'ından faydalandı
        </p>
      </div>

      {/* Drop Gifts */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          Bu Haftanın Jestleri
        </h3>
        <div className="space-y-3">
          {dropGifts.map((gift, i) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
            >
              <div className="text-4xl">{gift.image}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{gift.name}</h4>
                <p className="text-xs text-muted">{gift.partnerName}</p>
                {gift.sponsorName && (
                  <p className="text-[9px] text-muted/60 mt-0.5">
                    {gift.sponsorName} sponsorluğundadır
                  </p>
                )}
              </div>
              <button
                onClick={() => handleClaim(gift.id)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all shadow-sm whitespace-nowrap"
              >
                Hemen Al
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-semibold text-foreground text-sm">Nasıl Çalışır?</h4>
        <div className="space-y-2">
          {[
            { emoji: "📅", text: "Her Perşembe sabah 10:00'da yeni Drop açılır" },
            { emoji: "⏰", text: "Sınırlı sayıda hediye, gece 22:00'ye kadar geçerli" },
            { emoji: "🏃", text: "Sınırlı sayıda! Acele et, kaçırma" },
            { emoji: "🎁", text: "Yakaladığın hediyeyi istediğin birine ısmarla" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-lg">{item.emoji}</span>
              <p className="text-xs text-muted leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
