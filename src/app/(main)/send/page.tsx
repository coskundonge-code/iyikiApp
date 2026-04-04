"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CATEGORIES, Gift } from "@/types";
import { Crown, LayoutGrid, Layers } from "lucide-react";
import SwipeableCardStack from "@/components/SwipeableCardStack";

const CARD_COLORS: Record<string, string> = {
  coffee: "from-amber-50 via-orange-50/80 to-yellow-50/60",
  chocolate: "from-rose-50 via-pink-50/80 to-red-50/60",
  book: "from-sky-50 via-blue-50/80 to-indigo-50/60",
  flower: "from-pink-50 via-rose-50/80 to-fuchsia-50/60",
  experience: "from-violet-50 via-purple-50/80 to-indigo-50/60",
  food: "from-emerald-50 via-teal-50/80 to-cyan-50/60",
};

type ViewMode = "stack" | "grid";

export default function SendPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const getFilteredGifts = useAppStore((s) => s.getFilteredGifts);

  const [viewMode, setViewMode] = useState<ViewMode>("stack");

  const filteredGifts = getFilteredGifts();
  const limitReached = (currentUser?.dailySendCount ?? 0) >= (currentUser?.dailySendLimit ?? 1);
  const remaining = Math.max(0, (currentUser?.dailySendLimit ?? 1) - (currentUser?.dailySendCount ?? 0));

  const handleSwipeSend = (gift: Gift) => {
    router.push(`/send/${gift.id}`);
  };

  return (
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-[26px] font-extrabold text-foreground tracking-tight">Hediye Gonder</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="progress-bar flex-1 max-w-[120px]">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((currentUser?.dailySendCount ?? 0) / (currentUser?.dailySendLimit ?? 1)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-[12px] font-bold text-foreground tabular-nums">{remaining}</span>
            <span className="text-[11px] text-muted font-medium">hak kaldi</span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-surface rounded-xl p-1">
          <button
            onClick={() => setViewMode("stack")}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === "stack" ? "bg-white shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === "grid" ? "bg-white shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Limit Warning */}
      {limitReached && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="relative overflow-hidden rounded-2xl p-4 border border-amber-200/60"
          style={{ background: "linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 100%)" }}
        >
          <p className="text-[13px] text-amber-900 font-bold">Bugunku jestini yaptin!</p>
          {currentUser?.tier === "free" && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/premium")}
              className="mt-2 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[11px] font-bold shadow-sm"
            >
              <Crown className="w-3 h-3" />
              Premium ile gunde 3 hediye
            </motion.button>
          )}
        </motion.div>
      )}

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

      {/* Content — Stack or Grid */}
      {viewMode === "stack" ? (
        /* ═══ CARD STACK VIEW ═══ */
        <motion.div
          key="stack"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredGifts.length > 0 ? (
            <SwipeableCardStack
              gifts={filteredGifts}
              onSwipeRight={handleSwipeSend}
              disabled={limitReached}
            />
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-5xl mb-4 opacity-40">🔍</div>
                <p className="text-muted font-medium">Bu kategoride hediye yok</p>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* ═══ GRID VIEW ═══ */
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-4"
        >
          {filteredGifts.map((gift, i) => {
            const bgColor = CARD_COLORS[gift.category] || CARD_COLORS.coffee;
            return (
              <motion.button
                key={gift.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
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
                <div className={cn(
                  "bg-gradient-to-br p-6 flex items-center justify-center min-h-[110px] relative overflow-hidden",
                  bgColor
                )}>
                  <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white/20" />
                  <motion.span className="text-5xl relative z-10 drop-shadow-sm">
                    {gift.image}
                  </motion.span>
                  {gift.isPremium && (
                    <span className="badge-premium absolute top-2 right-2 text-[8px]">PRO</span>
                  )}
                </div>
                <div className="p-3.5">
                  <h3 className="font-bold text-[13px] text-foreground leading-snug group-hover:text-primary transition-colors">
                    {gift.name}
                  </h3>
                  <p className="text-[11px] text-muted mt-0.5 font-medium">{gift.partnerName}</p>
                  {gift.sponsorName && (
                    <div className="mt-1.5">
                      <span className="badge-sponsor text-[8px]">{gift.sponsorName}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      gift.stock > 10 ? "bg-success" : gift.stock > 0 ? "bg-warning" : "bg-danger"
                    )} />
                    <p className="text-[10px] text-muted font-medium">
                      {gift.stock > 10 ? "Stokta" : gift.stock > 0 ? `Son ${gift.stock}` : "Tukendi"}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
          {filteredGifts.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <div className="text-5xl mb-4 opacity-40">🔍</div>
              <p className="text-muted text-[14px] font-medium">Bu kategoride hediye yok</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
