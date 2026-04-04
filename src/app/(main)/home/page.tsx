"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ChevronRight, Heart, ArrowUpRight, ArrowDownLeft,
  Zap, Trophy, Users as UsersIcon, Gift as GiftIcon, Send, Star, Coffee,
  Clock, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { CATEGORIES, Gift, GiftAction } from "@/types";

const CARD_COLORS: Record<string, { bg: string; accent: string; emoji_bg: string }> = {
  coffee: { bg: "from-amber-50 via-orange-50/80 to-yellow-50/60", accent: "from-amber-100 to-orange-100", emoji_bg: "from-amber-100/80 to-orange-50" },
  chocolate: { bg: "from-rose-50 via-pink-50/80 to-red-50/60", accent: "from-rose-100 to-pink-100", emoji_bg: "from-rose-100/80 to-pink-50" },
  book: { bg: "from-sky-50 via-blue-50/80 to-indigo-50/60", accent: "from-sky-100 to-blue-100", emoji_bg: "from-sky-100/80 to-blue-50" },
  flower: { bg: "from-pink-50 via-rose-50/80 to-fuchsia-50/60", accent: "from-pink-100 to-rose-100", emoji_bg: "from-pink-100/80 to-rose-50" },
  experience: { bg: "from-violet-50 via-purple-50/80 to-indigo-50/60", accent: "from-violet-100 to-purple-100", emoji_bg: "from-violet-100/80 to-purple-50" },
  food: { bg: "from-emerald-50 via-teal-50/80 to-cyan-50/60", accent: "from-emerald-100 to-teal-100", emoji_bg: "from-emerald-100/80 to-teal-50" },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

function GiftCard({ gift, onClick, index }: { gift: Gift; onClick: () => void; index: number }) {
  const colors = CARD_COLORS[gift.category] || CARD_COLORS.coffee;
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -10, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="gift-card-premium flex-shrink-0 w-[12rem] text-left group"
    >
      <div className={cn("bg-gradient-to-br p-8 flex items-center justify-center min-h-[150px] relative overflow-hidden", colors.bg)}>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/20" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/15" />
        <motion.span
          className="text-7xl drop-shadow-sm relative z-10"
          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          {gift.image}
        </motion.span>
        {gift.isPremium && (
          <span className="badge-premium absolute top-3 right-3">PRO</span>
        )}
      </div>
      <div className="p-4 pb-5">
        <h3 className="font-bold text-[15px] text-foreground leading-snug group-hover:text-primary transition-colors">
          {gift.name}
        </h3>
        <p className="text-[12px] text-muted mt-1.5 font-medium">{gift.partnerName}</p>
        {gift.sponsorName && (
          <div className="mt-2.5">
            <span className="badge-sponsor">{gift.sponsorName}</span>
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
      variants={staggerChild}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (!isSent && action.status === "pending") router.push(`/redeem/${action.id}`);
      }}
      className="w-full flex items-center gap-4 p-4 premium-card text-left group"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-surface to-border/50 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
        {action.gift.image}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center",
            isSent ? "bg-blue-50" : "bg-emerald-50"
          )}>
            {isSent ? (
              <ArrowUpRight className="w-3 h-3 text-blue-500" />
            ) : (
              <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
            )}
          </div>
          <span className="text-[14px] font-bold text-foreground truncate">
            {isSent
              ? `${action.receiverName || "Bilinmeyen"}'e ${action.gift.name}`
              : `${action.senderName}'den ${action.gift.name}`}
          </span>
        </div>
        {action.note && (
          <p className="text-[13px] text-muted mt-1.5 truncate italic pl-7">
            &ldquo;{action.note}&rdquo;
          </p>
        )}
        <div className="flex items-center gap-2.5 mt-2 pl-7">
          <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-semibold", getStatusColor(action.status))}>
            {getStatusLabel(action.status)}
          </span>
          <div className="flex items-center gap-1 text-muted/60">
            <Clock className="w-3 h-3" />
            <span className="text-[11px] font-medium">{formatRelativeTime(action.createdAt)}</span>
          </div>
        </div>
      </div>
      {!isSent && action.status === "pending" && (
        <ChevronRight className="w-5 h-5 text-muted/30 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      )}
    </motion.button>
  );
}

const QUICK_ACTIONS = [
  { href: "/send", icon: Send, label: "Hediye Gonder", desc: "Bir jest yap", gradient: "from-rose-500 to-pink-500", shadow: "shadow-rose-200/50" },
  { href: "/drop", icon: Zap, label: "Haftalik Drop", desc: "Sinirli firsatlar", gradient: "from-violet-500 to-purple-500", shadow: "shadow-violet-200/50" },
  { href: "/community", icon: UsersIcon, label: "Topluluklar", desc: "Askida jest", gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-200/50" },
  { href: "/achievements", icon: Trophy, label: "Basarimlar", desc: "Rozetlerini topla", gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-200/50" },
];

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
    <div className="px-5 pt-6 pb-8 space-y-8">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[28px] p-7"
        style={{
          background: "linear-gradient(135deg, rgba(232,54,79,0.04) 0%, rgba(245,166,35,0.04) 50%, rgba(124,92,252,0.03) 100%)"
        }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-gradient-to-br from-accent/5 to-primary/5 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[12px] text-muted font-bold uppercase tracking-[0.15em] mb-1.5"
              >
                Hos geldin
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[30px] font-extrabold text-foreground tracking-tight leading-none"
              >
                {currentUser?.name || "Misafir"}
              </motion.h2>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-amber-100/60 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-extrabold text-amber-700">{currentUser?.iyikiScore || 0}</span>
            </motion.div>
          </div>

          {currentUser?.tier === "premium" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <span className="badge-premium">PREMIUM UYE</span>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[14px] text-muted/80 leading-relaxed font-medium max-w-[90%]"
          >
            Arkadasina bir kahve ismarla, sevdiklerine cicek gonder — tek bir dokunusla sevindir.
          </motion.p>
        </div>
      </motion.div>

      {/* Quick Actions — Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {QUICK_ACTIONS.map((item, i) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              variants={staggerChild}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="premium-card p-5 cursor-pointer h-full group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3.5 shadow-lg transition-shadow group-hover:shadow-xl",
                item.gradient,
                item.shadow
              )}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </h4>
              <p className="text-[12px] text-muted mt-0.5 font-medium">{item.desc}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Weekly Drop — Premium Banner */}
      <Link href="/drop">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative rounded-[28px] p-7 text-white overflow-hidden cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #E8364F 0%, #FF6B8A 40%, #F5A623 100%)"
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/90">Haftalik Drop</span>
              </div>
              <h3 className="font-extrabold text-[22px] leading-tight">IYI KI Persembesi</h3>
              <p className="text-white/70 text-[13px] mt-2 font-medium">Sinirli sayida jest, acele et!</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/15 rounded-2xl px-5 py-3.5 backdrop-blur-sm text-center min-w-[76px] border border-white/10"
            >
              <p className="text-3xl font-extrabold leading-none">27</p>
              <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-wider">kaldi</p>
            </motion.div>
          </div>
        </motion.div>
      </Link>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-5 px-5 py-1"
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn("chip flex-shrink-0", !selectedCategory ? "chip-active" : "chip-inactive")}
        >
          Tumu
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

      {/* Gift Cards */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">Bugun Ne Ismarlayalim?</h3>
          <Link href="/send" className="text-[13px] font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
            Tumunu Gor <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-4">
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
              <p className="text-[14px] text-muted font-medium">Bu kategoride su an hediye yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Askida */}
      {askidaCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[24px] p-6 border border-purple-100/60"
          style={{ background: "linear-gradient(135deg, #F5F0FF 0%, #FFF0F5 50%, #FFF5F5 100%)" }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-purple-100/30 blur-xl" />
          <div className="flex items-center gap-4 relative z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-50 flex items-center justify-center shadow-sm"
            >
              <Heart className="w-6 h-6 text-purple-500" />
            </motion.div>
            <div>
              <h4 className="text-[16px] font-extrabold text-purple-900">Askida Jest</h4>
              <p className="text-[13px] text-purple-600/80 mt-0.5 font-medium">
                Topluluk olarak <span className="font-extrabold text-purple-700">{askidaCount}</span> jest askiya dustu
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Actions */}
      {myActions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Son Jestlerin</h3>
            <div className="flex items-center gap-1 text-muted/50">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[12px] font-bold">{sentActions.length} gonderildi</span>
            </div>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {[
              ...receivedActions.filter((a) => a.status === "pending"),
              ...sentActions,
              ...receivedActions.filter((a) => a.status !== "pending"),
            ].slice(0, 6).map((action) => (
              <ActionItem key={action.id} action={action} isSent={action.senderId === currentUser?.id} />
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {myActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 premium-card overflow-hidden relative"
        >
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative z-10">
            <motion.div
              className="text-8xl mb-6"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🎁
            </motion.div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Henuz bir jestin yok</h3>
            <p className="text-[14px] text-muted mb-8 font-medium">Ilk jestini yaparak basla!</p>
            <motion.button
              onClick={() => router.push("/send")}
              className="btn-premium text-[15px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="w-5 h-5" />
              Hediye Gonder
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
