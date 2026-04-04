"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart, ArrowUpRight, ArrowDownLeft, Zap, Trophy, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { CATEGORIES, GiftCategory, Gift, GiftAction } from "@/types";

const CARD_GRADIENTS: Record<string, string> = {
  coffee: "from-amber-50 to-orange-50",
  chocolate: "from-rose-50 to-pink-50",
  book: "from-blue-50 to-indigo-50",
  flower: "from-pink-50 to-rose-50",
  experience: "from-violet-50 to-purple-50",
  food: "from-emerald-50 to-teal-50",
};

function GiftCard({ gift, onClick }: { gift: Gift; onClick: () => void }) {
  const gradient = CARD_GRADIENTS[gift.category] || "from-gray-50 to-slate-50";

  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 w-44 bg-white rounded-3xl text-left overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)" }}
    >
      <div className={cn("bg-gradient-to-br p-6 flex items-center justify-center", gradient)}>
        <span className="text-6xl drop-shadow-sm">{gift.image}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[15px] text-foreground leading-tight">{gift.name}</h3>
        <p className="text-xs text-muted mt-1">{gift.partnerName}</p>
        {gift.sponsorName && (
          <div className="mt-2.5 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <p className="text-[10px] text-muted/70 truncate">
              {gift.sponsorName} sponsorluğunda
            </p>
          </div>
        )}
      </div>
    </motion.button>
  );
}

function ActionItem({ action, isSent }: { action: GiftAction; isSent: boolean }) {
  const router = useRouter();

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (!isSent && action.status === "pending") {
          router.push(`/redeem/${action.id}`);
        }
      }}
      className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl text-left transition-all hover:shadow-md"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
        {action.gift.image}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isSent ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          ) : (
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-foreground truncate">
            {isSent
              ? `${action.receiverName || "Bilinmeyen"}'e ${action.gift.name}`
              : `${action.senderName}'den ${action.gift.name}`}
          </span>
        </div>
        {action.note && (
          <p className="text-xs text-muted mt-0.5 truncate italic">&ldquo;{action.note}&rdquo;</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", getStatusColor(action.status))}>
            {getStatusLabel(action.status)}
          </span>
          <span className="text-[10px] text-muted">{formatRelativeTime(action.createdAt)}</span>
        </div>
      </div>
      {!isSent && action.status === "pending" && (
        <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
      )}
    </motion.button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const gifts = useAppStore((s) => s.gifts);
  const giftActions = useAppStore((s) => s.giftActions);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const getFilteredGifts = useAppStore((s) => s.getFilteredGifts);

  const isInitialized = useAppStore((s) => s.isInitialized);
  const initializeData = useAppStore((s) => s.initializeData);

  useEffect(() => {
    if (!isInitialized) {
      initializeData();
    }
  }, [isInitialized, initializeData]);

  const filteredGifts = getFilteredGifts();

  const myActions = giftActions.filter(
    (a) => a.senderId === currentUser?.id || a.receiverPhone === currentUser?.phone || a.receiverId === currentUser?.id
  );

  const sentActions = myActions.filter((a) => a.senderId === currentUser?.id);
  const receivedActions = myActions.filter(
    (a) => a.receiverPhone === currentUser?.phone || a.receiverId === currentUser?.id
  );

  const askidaCount = giftActions.filter((a) => a.status === "social_pool" || a.status === "distributed").length;

  return (
    <div className="px-5 py-6 space-y-8">
      {/* Greeting */}
      <div className="bg-gradient-to-br from-white to-rose-50/50 rounded-3xl p-6" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Merhaba, {currentUser?.name || "Misafir"} 👋
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">
              {currentUser?.iyikiScore || 0} puan
            </span>
          </div>
          {currentUser?.tier === "premium" && (
            <span className="text-[11px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-sm">
              PRO
            </span>
          )}
        </div>
      </div>

      {/* Weekly Drop Banner */}
      <Link href="/drop">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 rounded-3xl p-5 text-white relative overflow-hidden cursor-pointer"
          style={{ boxShadow: "0 8px 30px rgba(225, 29, 72, 0.25)" }}
        >
          <div className="absolute -top-4 -right-4 opacity-[0.08] text-[120px] rotate-12">⚡</div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Haftalik Drop</span>
              </div>
              <h3 className="font-extrabold text-lg">iyi ki Persembesi</h3>
              <p className="text-white/80 text-sm mt-1">Sinirli sayida jest, acele et!</p>
            </div>
            <div className="bg-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm text-center min-w-[64px]">
              <p className="text-lg font-extrabold">27</p>
              <p className="text-[10px] font-medium opacity-80">kaldi</p>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Categories */}
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-5 px-5 py-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
            !selectedCategory
              ? "bg-foreground text-background shadow-md"
              : "bg-white border border-gray-200 text-muted hover:text-foreground hover:border-gray-300"
          )}
        >
          Hepsi
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-foreground text-background shadow-md"
                : "bg-white border border-gray-200 text-muted hover:text-foreground hover:border-gray-300"
            )}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Gift Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Bugun Ne Ismarlayalim?</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2">
          <AnimatePresence mode="popLayout">
            {filteredGifts.map((gift, i) => (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06 }}
                layout
              >
                <GiftCard
                  gift={gift}
                  onClick={() => router.push(`/send/${gift.id}`)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredGifts.length === 0 && (
            <div className="flex items-center justify-center w-full py-12">
              <p className="text-sm text-muted">Bu kategoride su an hediye yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Askida Barometer */}
      {askidaCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-5 border border-purple-100/50"
          style={{ boxShadow: "0 2px 12px rgba(168, 85, 247, 0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <span className="text-sm font-bold text-purple-900">Askida Jest</span>
              <p className="text-xs text-purple-600 mt-0.5">
                Topluluk olarak <span className="font-bold">{askidaCount}</span> jest askiya dustu ve birilerini mutlu etti
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Access: Achievements + Community */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/achievements">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-100/60 p-5 cursor-pointer h-full"
            style={{ boxShadow: "0 2px 12px rgba(245, 158, 11, 0.08)" }}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Basarimlar</h4>
            <p className="text-xs text-muted mt-1">
              {sentActions.length >= 1 ? "1" : "0"}/12 rozet
            </p>
          </motion.div>
        </Link>
        <Link href="/community">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl border border-indigo-100/60 p-5 cursor-pointer h-full"
            style={{ boxShadow: "0 2px 12px rgba(99, 102, 241, 0.08)" }}
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
              <UsersIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Topluluklar</h4>
            <p className="text-xs text-muted mt-1">4 aktif topluluk</p>
          </motion.div>
        </Link>
      </div>

      {/* Recent Actions */}
      {myActions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Son Jestlerin</h3>
          <div className="space-y-3">
            {[
              ...receivedActions.filter((a) => a.status === "pending"),
              ...sentActions,
              ...receivedActions.filter((a) => a.status !== "pending"),
            ]
              .slice(0, 6)
              .map((action) => (
                <ActionItem
                  key={action.id}
                  action={action}
                  isSent={action.senderId === currentUser?.id}
                />
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {myActions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}>
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-lg font-bold text-foreground mb-1">Henuz bir jestin yok</h3>
          <p className="text-sm text-muted mb-6">
            Ilk jestini yaparak basla!
          </p>
          <button
            onClick={() => router.push("/send")}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
          >
            Hediye Gonder
          </button>
        </div>
      )}
    </div>
  );
}
