"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ChevronRight, Heart, ArrowUpRight, ArrowDownLeft,
  Zap, Trophy, Users as UsersIcon, Send, Clock, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { CATEGORIES, Gift, GiftAction } from "@/types";
import SwipeableCardStack from "@/components/SwipeableCardStack";

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

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
  const limitReached = (currentUser?.dailySendCount ?? 0) >= (currentUser?.dailySendLimit ?? 1);

  const myActions = giftActions.filter(
    (a) => a.senderId === currentUser?.id || a.receiverPhone === currentUser?.phone || a.receiverId === currentUser?.id
  );
  const sentActions = myActions.filter((a) => a.senderId === currentUser?.id);
  const receivedActions = myActions.filter(
    (a) => a.receiverPhone === currentUser?.phone || a.receiverId === currentUser?.id
  );
  const askidaCount = giftActions.filter((a) => a.status === "social_pool" || a.status === "distributed").length;

  const handleSwipeSend = (gift: Gift) => {
    router.push(`/send/${gift.id}`);
  };

  return (
    <div className="px-5 pt-6 pb-8 space-y-8">
      {/* Welcome — Compact */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-[12px] text-muted font-bold uppercase tracking-[0.15em] mb-0.5">
            Hos geldin
          </p>
          <h2 className="text-[26px] font-extrabold text-foreground tracking-tight leading-none">
            {currentUser?.name || "Misafir"}
          </h2>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-amber-100/60 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-extrabold text-amber-700">{currentUser?.iyikiScore || 0}</span>
        </motion.div>
      </motion.div>

      {/* Categories — Horizontal pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-5 px-5"
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

      {/* ═══════════════════════════════════════════
          SWIPEABLE CARD STACK — The Hero
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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

      {/* Quick Actions — Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3"
      >
        {QUICK_ACTIONS.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              variants={staggerChild}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="premium-card p-4 cursor-pointer text-center group"
            >
              <div className={cn(
                "w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-2.5 shadow-lg",
                item.gradient,
                item.shadow
              )}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-[12px] font-bold text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </h4>
              <p className="text-[10px] text-muted mt-0.5 font-medium">{item.desc}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Weekly Drop Banner */}
      <Link href="/drop">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="relative rounded-[24px] p-5 text-white overflow-hidden cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #E8364F 0%, #FF6B8A 40%, #F5A623 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/90">Haftalik Drop</span>
              </div>
              <h3 className="font-extrabold text-[18px] leading-tight">IYI KI Persembesi</h3>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm text-center border border-white/10"
            >
              <p className="text-2xl font-extrabold leading-none">27</p>
              <p className="text-[9px] font-bold opacity-80 mt-0.5">kaldi</p>
            </motion.div>
          </div>
        </motion.div>
      </Link>

      {/* Askida */}
      {askidaCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[20px] p-5 border border-purple-100/60"
          style={{ background: "linear-gradient(135deg, #F5F0FF 0%, #FFF0F5 50%, #FFF5F5 100%)" }}
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-50 flex items-center justify-center shadow-sm"
            >
              <Heart className="w-5 h-5 text-purple-500" />
            </motion.div>
            <div>
              <h4 className="text-[15px] font-extrabold text-purple-900">Askida Jest</h4>
              <p className="text-[12px] text-purple-600/80 mt-0.5 font-medium">
                <span className="font-extrabold text-purple-700">{askidaCount}</span> jest askiya dustu
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Actions */}
      {myActions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-[18px]">Son Jestlerin</h3>
            <div className="flex items-center gap-1 text-muted/50">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">{sentActions.length}</span>
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
            ].slice(0, 4).map((action) => (
              <ActionItem key={action.id} action={action} isSent={action.senderId === currentUser?.id} />
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {myActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 premium-card overflow-hidden relative"
        >
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative z-10">
            <motion.div
              className="text-6xl mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🎁
            </motion.div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">Henuz bir jestin yok</h3>
            <p className="text-[13px] text-muted font-medium">Yukari kaydir ve gonder!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
