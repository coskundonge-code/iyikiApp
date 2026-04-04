"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";

export default function SendPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const getFilteredGifts = useAppStore((s) => s.getFilteredGifts);

  const filteredGifts = getFilteredGifts();
  const limitReached = (currentUser?.dailySendCount ?? 0) >= (currentUser?.dailySendLimit ?? 1);

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">Hediye Gonder</h2>
        <p className="text-sm text-muted mt-2">
          Bugün kalan hakkın:{" "}
          <span className="font-semibold text-foreground">
            {Math.max(0, (currentUser?.dailySendLimit ?? 1) - (currentUser?.dailySendCount ?? 0))}
          </span>
          /{currentUser?.dailySendLimit ?? 1}
        </p>
      </div>

      {limitReached && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm text-amber-800 font-medium">
            Bugünkü jestini yaptın! Yarın yeni bir jest bekliyor ✨
          </p>
          {currentUser?.tier === "free" && (
            <button
              onClick={() => router.push("/premium")}
              className="text-xs text-amber-600 underline mt-1"
            >
              Premium ile günde 3 hediye gönder
            </button>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
            !selectedCategory
              ? "bg-foreground text-background"
              : "bg-card border border-border text-muted hover:text-foreground"
          )}
        >
          Hepsi
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted hover:text-foreground"
            )}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Gift Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredGifts.map((gift, i) => (
          <motion.button
            key={gift.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !limitReached && router.push(`/send/${gift.id}`)}
            disabled={limitReached}
            className={cn(
              "bg-white rounded-3xl p-5 text-left transition-all",
              limitReached ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
            )}
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
          >
            <div className="text-5xl mb-4">{gift.image}</div>
            <h3 className="font-bold text-base text-foreground">{gift.name}</h3>
            <p className="text-xs text-muted mt-0.5">{gift.partnerName}</p>
            {gift.isPremium && (
              <span className="inline-block mt-2 text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                PRO
              </span>
            )}
            {gift.sponsorName && (
              <p className="text-[9px] text-muted/60 mt-1.5 truncate">
                {gift.sponsorName} sponsorluğundadır
              </p>
            )}
            <p className="text-[10px] text-muted mt-1">
              {gift.stock > 10 ? "Stokta" : gift.stock > 0 ? `Son ${gift.stock} adet` : "Tükendi"}
            </p>
          </motion.button>
        ))}
      </div>

      {filteredGifts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted text-sm">Bu kategoride hediye bulunamadı</p>
        </div>
      )}
    </div>
  );
}
