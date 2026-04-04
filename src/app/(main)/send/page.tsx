"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import { Crown, Sparkles, Gift } from "lucide-react";

const CARD_COLORS: Record<string, string> = {
  coffee: "from-amber-50 via-orange-50/80 to-yellow-50/60",
  chocolate: "from-rose-50 via-pink-50/80 to-red-50/60",
  book: "from-sky-50 via-blue-50/80 to-indigo-50/60",
  flower: "from-pink-50 via-rose-50/80 to-fuchsia-50/60",
  experience: "from-violet-50 via-purple-50/80 to-indigo-50/60",
  food: "from-emerald-50 via-teal-50/80 to-cyan-50/60",
};

export default function SendPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const getFilteredGifts = useAppStore((s) => s.getFilteredGifts);

  const filteredGifts = getFilteredGifts();
  const limitReached = (currentUser?.dailySendCount ?? 0) >= (currentUser?.dailySendLimit ?? 1);
  const remaining = Math.max(0, (currentUser?.dailySendLimit ?? 1) - (currentUser?.dailySendCount ?? 0));

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-[28px] font-extrabold text-foreground tracking-tight">Hediye Gonder</h2>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1">
            <div className="progress-bar">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((currentUser?.dailySendCount ?? 0) / (currentUser?.dailySendLimit ?? 1)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <span className="text-[13px] font-bold text-foreground tabular-nums">
            {remaining}/{currentUser?.dailySendLimit ?? 1}
          </span>
          <span className="text-[12px] text-muted font-medium">hak</span>
        </div>
      </motion.div>

      {/* Limit Warning */}
      <AnimatePresence>
        {limitReached && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden rounded-2xl p-5 border border-amber-200/60"
            style={{ background: "linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 100%)" }}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber-200/20 blur-lg" />
            <div className="relative z-10">
              <p className="text-[14px] text-amber-900 font-bold">
                Bugunku jestini yaptin!
              </p>
              <p className="text-[13px] text-amber-700/80 mt-1 font-medium">
                Yarin yeni bir jest seni bekliyor
              </p>
              {currentUser?.tier === "free" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/premium")}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[12px] font-bold shadow-lg shadow-amber-200/40"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Premium ile gunde 3 hediye gonder
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-5 px-5"
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn("chip flex-shrink-0", !selectedCategory ? "chip-active" : "chip-inactive")}
        >
          Hepsi
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn("chip flex-shrink-0", selectedCategory === cat.id ? "chip-active" : "chip-inactive")}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </motion.div>

      {/* Gift Grid */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredGifts.map((gift, i) => {
            const bgColor = CARD_COLORS[gift.category] || CARD_COLORS.coffee;
            return (
              <motion.button
                key={gift.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                whileHover={!limitReached ? { y: -6, scale: 1.03 } : undefined}
                whileTap={!limitReached ? { scale: 0.96 } : undefined}
                onClick={() => !limitReached && router.push(`/send/${gift.id}`)}
                disabled={limitReached}
                className={cn(
                  "gift-card-premium text-left group",
                  limitReached && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Image area */}
                <div className={cn(
                  "bg-gradient-to-br p-6 flex items-center justify-center min-h-[120px] relative overflow-hidden",
                  bgColor
                )}>
                  <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white/20" />
                  <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/15" />
                  <motion.span
                    className="text-6xl relative z-10 drop-shadow-sm"
                    whileHover={!limitReached ? { scale: 1.15, rotate: [-3, 3, 0] } : undefined}
                  >
                    {gift.image}
                  </motion.span>
                  {gift.isPremium && (
                    <span className="badge-premium absolute top-2.5 right-2.5 text-[9px]">
                      <Sparkles className="w-3 h-3" /> PRO
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-[14px] text-foreground leading-snug group-hover:text-primary transition-colors">
                    {gift.name}
                  </h3>
                  <p className="text-[12px] text-muted mt-1 font-medium">{gift.partnerName}</p>
                  {gift.sponsorName && (
                    <div className="mt-2">
                      <span className="badge-sponsor text-[9px]">{gift.sponsorName}</span>
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      gift.stock > 10 ? "bg-success" : gift.stock > 0 ? "bg-warning" : "bg-danger"
                    )} />
                    <p className="text-[11px] text-muted font-medium">
                      {gift.stock > 10 ? "Stokta" : gift.stock > 0 ? `Son ${gift.stock} adet` : "Tukendi"}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredGifts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-5xl mb-4 opacity-40">🔍</div>
          <p className="text-muted text-[14px] font-medium">Bu kategoride hediye bulunamadi</p>
        </motion.div>
      )}
    </div>
  );
}
