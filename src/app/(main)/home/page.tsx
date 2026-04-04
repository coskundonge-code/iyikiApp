"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart, ArrowUpRight, ArrowDownLeft, Zap, Trophy, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { CATEGORIES, Gift, GiftAction } from "@/types";

const CARD_COLORS: Record<string, { bg: string; accent: string }> = {
  coffee: { bg: "from-amber-50 via-orange-50 to-yellow-50", accent: "from-amber-100 to-orange-100" },
  chocolate: { bg: "from-rose-50 via-pink-50 to-red-50", accent: "from-rose-100 to-pink-100" },
  book: { bg: "from-sky-50 via-blue-50 to-indigo-50", accent: "from-sky-100 to-blue-100" },
  flower: { bg: "from-pink-50 via-rose-50 to-fuchsia-50", accent: "from-pink-100 to-rose-100" },
  experience: { bg: "from-violet-50 via-purple-50 to-indigo-50", accent: "from-violet-100 to-purple-100" },
  food: { bg: "from-emerald-50 via-teal-50 to-cyan-50", accent: "from-emerald-100 to-teal-100" },
};

function GiftCard({ gift, onClick, index }: { gift: Gift; onClick: () => void; index: number }) {
  const colors = CARD_COLORS[gift.category] || CARD_COLORS.coffee;
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="gift-card-premium flex-shrink-0 w-[11rem] text-left"
    >
      <div className={cn("bg-gradient-to-br p-8 flex items-center justify-center min-h-[140px]", colors.bg)}>
        <span className="text-7xl drop-shadow-sm">{gift.image}</span>
      </div>
      <div className="p-4 pb-5">
        <h3 className="font-bold text-[15px] text-foreground leading-snug">{gift.name}</h3>
        <p className="text-[13px] text-muted mt-1 font-medium">{gift.partnerName}</p>
        {gift.sponsorName && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
            <p className="text-[11px] text-muted/70 font-medium truncate">
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
        if (!isSent && action.status === "pending") router.push(`/redeem/${action.id}`);
      }}
      className="w-full flex items-center gap-4 p-4 premium-card text-left group"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-surface to-border flex items-center justify-center text-2xl flex-shrink-0">
        {action.gift.image}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isSent ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          ) : (
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          )}
          <span className="text-[14px] font-semibold text-foreground truncate">
            {isSent
              ? `${action.receiverName || "Bilinmeyen"}'e ${action.gift.name}`
              : `${action.senderName}'den ${action.gift.name}`}
          </span>
        </div>
        {action.note && (
          <p className="text-[13px] text-muted mt-1 truncate italic">&ldquo;{action.note}&rdquo;</p>
        )}
        <div className="flex items-center gap-2.5 mt-2">
          <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-semibold", getStatusColor(action.status))}>
            {getStatusLabel(action.status)}
          </span>
          <span className="text-[11px] text-muted font-medium">{formatRelativeTime(action.createdAt)}</span>
        </div>
      </div>
      {!isSent && action.status === "pending" && (
        <ChevronRight className="w-5 h-5 text-muted/40 group-hover:text-primary transition-colors flex-shrink-0" />
      )}
    </motion.button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const giftActions = useAppStore((s) => s.giftActions);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const getFilteredGifts = useAppStore((s) => s.getFilteredGifts);
  const isInitialized = useAppStore((s) => s.isInitialized);
  const initializeData = useAppStore((s) => s.initializeData);

  useEffect(() => {
    if (!isInitialized) initializeData();
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
    <div className="px-5 pt-6 pb-8 space-y-10">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-muted font-medium uppercase tracking-widest mb-1">Hoş geldin</p>
            <h2 className="text-[28px] font-extrabold text-foreground tracking-tight leading-tight">
              {currentUser?.name || "Misafir"} 👋
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-2xl border border-amber-100/60">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700">{currentUser?.iyikiScore || 0}</span>
          </div>
        </div>
        {currentUser?.tier === "premium" && (
          <div className="mt-3">
            <span className="text-[11px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full font-bold tracking-wide">
              PREMIUM ÜYE
            </span>
          </div>
        )}
      </motion.div>

      {/* Weekly Drop */}
      <Link href="/drop">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="relative rounded-3xl p-6 text-white overflow-hidden cursor-pointer glow-primary"
          style={{ background: "linear-gradient(135deg, #E8364F 0%, #FF6B8A 50%, #F5A623 100%)" }}
        >
          <div className="absolute -top-6 -right-6 text-[140px] opacity-[0.06] rotate-12 select-none">⚡</div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-90">Haftalık Drop</span>
              </div>
              <h3 className="font-extrabold text-xl leading-tight">İYİ Kİ Perşembesi</h3>
              <p className="text-white/80 text-[13px] mt-1.5 font-medium">Sınırlı sayıda jest, acele et!</p>
            </div>
            <div className="bg-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm text-center min-w-[72px]">
              <p className="text-2xl font-extrabold leading-none">27</p>
              <p className="text-[10px] font-semibold opacity-80 mt-1">kaldı</p>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 py-1 mt-2"
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "flex-shrink-0 px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap",
            !selectedCategory
              ? "bg-foreground text-white shadow-lg"
              : "bg-white border border-border text-muted hover:text-foreground hover:border-foreground/20"
          )}
        >
          Tümü
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-foreground text-white shadow-lg"
                : "bg-white border border-border text-muted hover:text-foreground hover:border-foreground/20"
            )}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </motion.div>

      {/* Gift Cards */}
      <div>
        <h3 className="text-xl font-extrabold text-foreground mb-5 tracking-tight">
          Bugün Ne Ismarlayalım? ☕
        </h3>
        <div className="flex gap-5 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-4">
          <AnimatePresence mode="popLayout">
            {filteredGifts.map((gift, i) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                index={i}
                onClick={() => router.push(`/send/${gift.id}`)}
              />
            ))}
          </AnimatePresence>
          {filteredGifts.length === 0 && (
            <div className="flex items-center justify-center w-full py-16">
              <p className="text-[14px] text-muted font-medium">Bu kategoride şu an hediye yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Askida */}
      {askidaCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 border border-purple-100/60"
          style={{ background: "linear-gradient(135deg, #F5F0FF 0%, #FFF0F5 50%, #FFF5F5 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-purple-900">Askıda Jest</h4>
              <p className="text-[13px] text-purple-600 mt-0.5 font-medium">
                Topluluk olarak <span className="font-extrabold">{askidaCount}</span> jest askıya düştü
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/achievements">
          <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
            className="premium-card p-5 cursor-pointer h-full"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-[14px] font-bold text-foreground">Başarımlar</h4>
            <p className="text-[12px] text-muted mt-1 font-medium">
              {sentActions.length >= 1 ? "1" : "0"}/12 rozet
            </p>
          </motion.div>
        </Link>
        <Link href="/community">
          <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
            className="premium-card p-5 cursor-pointer h-full"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center mb-3">
              <UsersIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="text-[14px] font-bold text-foreground">Topluluklar</h4>
            <p className="text-[12px] text-muted mt-1 font-medium">4 aktif topluluk</p>
          </motion.div>
        </Link>
      </div>

      {/* Recent */}
      {myActions.length > 0 && (
        <div>
          <h3 className="text-xl font-extrabold text-foreground mb-5 tracking-tight">Son Jestlerin</h3>
          <div className="space-y-3">
            {[
              ...receivedActions.filter((a) => a.status === "pending"),
              ...sentActions,
              ...receivedActions.filter((a) => a.status !== "pending"),
            ].slice(0, 6).map((action) => (
              <ActionItem key={action.id} action={action} isSent={action.senderId === currentUser?.id} />
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {myActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 premium-card"
        >
          <div className="text-7xl mb-5 animate-float">🎁</div>
          <h3 className="text-xl font-extrabold text-foreground mb-2">Henüz bir jestin yok</h3>
          <p className="text-[14px] text-muted mb-8 font-medium">İlk jestini yaparak başla!</p>
          <button
            onClick={() => router.push("/send")}
            className="px-8 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-2xl shadow-lg transition-all hover:shadow-xl text-[15px]"
          >
            Hediye Gönder
          </button>
        </motion.div>
      )}
    </div>
  );
}
