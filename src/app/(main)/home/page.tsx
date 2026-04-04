"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart, ArrowUpRight, ArrowDownLeft, Zap, Trophy, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { CATEGORIES, GiftCategory, Gift, GiftAction } from "@/types";

function GiftCard({ gift, onClick }: { gift: Gift; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="gift-card-enhanced flex-shrink-0 w-36 bg-card rounded-2xl p-4 text-left card-shadow"
    >
      <div className="text-4xl mb-3">{gift.image}</div>
      <h3 className="font-semibold text-sm text-foreground truncate">{gift.name}</h3>
      <p className="text-xs text-muted mt-0.5 truncate">{gift.partnerName}</p>
      {gift.sponsorName && (
        <p className="text-[9px] text-muted/60 mt-2 truncate">
          {gift.sponsorName} sponsorluğundadır
        </p>
      )}
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
      className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-card-hover transition-colors text-left"
    >
      <div className="text-2xl flex-shrink-0">{action.gift.image}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isSent ? (
            <ArrowUpRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
          ) : (
            <ArrowDownLeft className="w-3 h-3 text-green-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-foreground truncate">
            {isSent
              ? `${action.receiverName || "Bilinmeyen"}'e ${action.gift.name}`
              : `${action.senderName}'den ${action.gift.name}`}
          </span>
        </div>
        {action.note && (
          <p className="text-xs text-muted mt-0.5 truncate">"{action.note}"</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", getStatusColor(action.status))}>
            {getStatusLabel(action.status)}
          </span>
          <span className="text-[10px] text-muted">{formatRelativeTime(action.createdAt)}</span>
        </div>
      </div>
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
    <div className="px-4 py-4 space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Merhaba, {currentUser?.name || "Misafir"}
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm text-muted">
            İyi Ki Puanın:{" "}
            <span className="font-semibold text-foreground">{currentUser?.iyikiScore || 0}</span>
          </span>
          {currentUser?.tier === "premium" && (
            <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold ml-1">
              PRO
            </span>
          )}
        </div>
      </div>

      {/* Weekly Drop Banner */}
      <Link href="/drop">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 rounded-2xl p-4 text-white relative overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 opacity-10 text-[80px] -mt-2 -mr-2">⚡</div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Haftalık Drop</span>
              </div>
              <h3 className="font-bold text-base">İYİ Kİ Perşembesi</h3>
              <p className="text-white/80 text-xs mt-0.5">Sınırlı sayıda jest, ilk gelen kapar!</p>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-2 backdrop-blur-sm text-center">
              <p className="text-xs font-bold">27/50</p>
              <p className="text-[9px] opacity-80">kaldı</p>
            </div>
          </div>
        </motion.div>
      </Link>

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

      {/* Gift Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Bugün Neler Ismarlayabilirsin?</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
          <AnimatePresence mode="popLayout">
            {filteredGifts.map((gift) => (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
            <p className="text-sm text-muted py-8 text-center w-full">
              Bu kategoride şu an hediye yok
            </p>
          )}
        </div>
      </div>

      {/* Askıda Barometer */}
      {askidaCount > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-900">Askıda Jest</span>
          </div>
          <p className="text-xs text-purple-700 mt-1">
            Topluluk olarak <span className="font-bold">{askidaCount}</span> jest askıya düştü ve birilerini mutlu etti
          </p>
        </div>
      )}

      {/* Quick Access: Achievements + Community */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/achievements">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-3.5 cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-500 mb-2" />
            <h4 className="text-sm font-semibold text-foreground">Başarımlar</h4>
            <p className="text-[10px] text-muted mt-0.5">
              {sentActions.length >= 1 ? "1" : "0"}/{12} rozet kazanıldı
            </p>
          </motion.div>
        </Link>
        <Link href="/community">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-3.5 cursor-pointer"
          >
            <UsersIcon className="w-5 h-5 text-indigo-500 mb-2" />
            <h4 className="text-sm font-semibold text-foreground">Topluluklar</h4>
            <p className="text-[10px] text-muted mt-0.5">4 aktif topluluk</p>
          </motion.div>
        </Link>
      </div>

      {/* Recent Actions */}
      {myActions.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Son Jestlerin</h3>
          <div className="space-y-2">
            {/* Show received first (pending ones), then sent, max 6 */}
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
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-sm text-muted">
            Henüz bir jestin yok. İlk jestini yap!
          </p>
          <button
            onClick={() => router.push("/send")}
            className="mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
          >
            Hediye Gönder
          </button>
        </div>
      )}
    </div>
  );
}
