"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
} from "framer-motion";
import { Send, X, ChevronUp, ChevronDown, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gift } from "@/types";

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */
const SWIPE_THRESHOLD = 100;       // px — horizontal swipe fires action
const VERTICAL_THRESHOLD = 60;     // px — vertical swipe switches card
const MAX_VISIBLE = 4;             // max visible cards in stack
const CARD_OFFSET = 12;            // px — vertical offset between cards
const CARD_SCALE_STEP = 0.04;      // scale decrease per stack level

const CARD_COLORS: Record<string, { bg: string; glow: string }> = {
  coffee: { bg: "from-amber-400 via-orange-400 to-yellow-500", glow: "shadow-amber-300/40" },
  chocolate: { bg: "from-rose-400 via-pink-400 to-red-500", glow: "shadow-rose-300/40" },
  book: { bg: "from-sky-400 via-blue-400 to-indigo-500", glow: "shadow-sky-300/40" },
  flower: { bg: "from-pink-400 via-rose-400 to-fuchsia-500", glow: "shadow-pink-300/40" },
  experience: { bg: "from-violet-400 via-purple-400 to-indigo-500", glow: "shadow-violet-300/40" },
  food: { bg: "from-emerald-400 via-teal-400 to-cyan-500", glow: "shadow-emerald-300/40" },
};

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface SwipeableCardStackProps {
  gifts: Gift[];
  onSwipeRight: (gift: Gift) => void;  // send / action
  onSwipeLeft?: (gift: Gift) => void;  // skip
  disabled?: boolean;
}

/* ═══════════════════════════════════════════════
   SINGLE CARD (Top — Draggable)
   ═══════════════════════════════════════════════ */
function TopCard({
  gift,
  onSwipeRight,
  onSwipeLeft,
  disabled,
}: {
  gift: Gift;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  disabled?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Horizontal transforms
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const rightOpacity = useTransform(x, [0, 80, 150], [0, 0.6, 1]);
  const leftOpacity = useTransform(x, [-150, -80, 0], [1, 0.6, 0]);
  const cardOpacity = useTransform(
    x,
    [-300, -200, 0, 200, 300],
    [0, 1, 1, 1, 0]
  );

  const colors = CARD_COLORS[gift.category] || CARD_COLORS.coffee;

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (disabled) return;
    const { offset } = info;
    if (offset.x > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (offset.x < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, y, rotate, opacity: cardOpacity, zIndex: 50 }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Card */}
      <div
        className={cn(
          "relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl",
          colors.glow
        )}
      >
        {/* Background gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", colors.bg)} />

        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/8 blur-2xl" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-white/5" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-white">
          {/* Emoji */}
          <motion.div
            className="text-[100px] mb-4 drop-shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {gift.image}
          </motion.div>

          {/* Name */}
          <h2 className="text-[28px] font-extrabold text-center leading-tight drop-shadow-sm">
            {gift.name}
          </h2>

          {/* Partner */}
          <p className="text-white/70 text-[15px] font-semibold mt-2">
            {gift.partnerName}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-4">
            {gift.isPremium && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[12px] font-bold border border-white/20">
                PRO
              </span>
            )}
            {gift.sponsorName && (
              <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold border border-white/15">
                {gift.sponsorName}
              </span>
            )}
            <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold border border-white/15">
              {gift.stock > 10 ? "Stokta" : gift.stock > 0 ? `Son ${gift.stock}` : "Tukendi"}
            </span>
          </div>

          {/* Description hint */}
          <p className="text-white/50 text-[13px] mt-6 text-center max-w-[240px] leading-relaxed">
            {gift.description || "Saga kaydir \u2192 gonder"}
          </p>
        </div>

        {/* Swipe Indicators */}
        {/* Right — SEND */}
        <motion.div
          className="absolute top-8 left-6 z-20"
          style={{ opacity: rightOpacity }}
        >
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white/95 rounded-2xl shadow-xl">
            <Send className="w-5 h-5 text-emerald-500" />
            <span className="text-[15px] font-extrabold text-emerald-600">GONDER</span>
          </div>
        </motion.div>

        {/* Left — SKIP */}
        <motion.div
          className="absolute top-8 right-6 z-20"
          style={{ opacity: leftOpacity }}
        >
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white/95 rounded-2xl shadow-xl">
            <X className="w-5 h-5 text-red-400" />
            <span className="text-[15px] font-extrabold text-red-500">GEC</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   STACK CARD (Behind — Static)
   ═══════════════════════════════════════════════ */
function StackCard({
  gift,
  index,
}: {
  gift: Gift;
  index: number; // 0 = directly behind top, 1 = next, etc.
}) {
  const colors = CARD_COLORS[gift.category] || CARD_COLORS.coffee;
  const scale = 1 - (index + 1) * CARD_SCALE_STEP;
  const yOffset = (index + 1) * CARD_OFFSET;

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 40 - index }}
      animate={{
        scale,
        y: yOffset,
        opacity: index < 2 ? 1 - index * 0.2 : 0.4,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className={cn("w-full h-full rounded-[32px] overflow-hidden shadow-lg")}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", colors.bg)} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
          <span className="text-7xl opacity-60">{gift.image}</span>
          <p className="text-[16px] font-bold mt-3 opacity-60">{gift.name}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function SwipeableCardStack({
  gifts,
  onSwipeRight,
  onSwipeLeft,
  disabled = false,
}: SwipeableCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset index when gifts change
  useEffect(() => {
    setCurrentIndex(0);
  }, [gifts.length]);

  const visibleGifts = gifts.slice(currentIndex, currentIndex + MAX_VISIBLE);
  const topGift = visibleGifts[0];
  const stackGifts = visibleGifts.slice(1);

  const goNext = useCallback(() => {
    if (currentIndex < gifts.length - 1) {
      setDirection("up");
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, gifts.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("down");
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSwipeRight = useCallback(() => {
    if (topGift && !disabled) {
      onSwipeRight(topGift);
      // Move to next card after action
      setTimeout(goNext, 100);
    }
  }, [topGift, disabled, onSwipeRight, goNext]);

  const handleSwipeLeft = useCallback(() => {
    if (topGift) {
      onSwipeLeft?.(topGift);
      goNext();
    }
  }, [topGift, onSwipeLeft, goNext]);

  // Vertical touch/wheel navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > VERTICAL_THRESHOLD) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0) goNext();
        else goPrev();
      }
    },
    [goNext, goPrev]
  );

  if (!topGift) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">🎁</div>
          <p className="text-muted font-medium text-[15px]">Tum hediyeler goruldu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Navigation hint — top */}
      <motion.div
        className="flex items-center justify-center mb-3 h-6"
        animate={{ opacity: currentIndex > 0 ? 1 : 0.2 }}
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronUp className="w-5 h-5 text-muted/50" />
        </motion.div>
      </motion.div>

      {/* Card Stack Container */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: "420px", maxWidth: "340px", margin: "0 auto" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Stack cards (behind) */}
        {stackGifts.map((gift, i) => (
          <StackCard key={`stack-${gift.id}`} gift={gift} index={i} />
        ))}

        {/* Top card (draggable) */}
        <AnimatePresence mode="popLayout">
          <TopCard
            key={`top-${topGift.id}`}
            gift={topGift}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            disabled={disabled}
          />
        </AnimatePresence>
      </div>

      {/* Navigation hint — bottom */}
      <motion.div
        className="flex items-center justify-center mt-3 h-6"
        animate={{ opacity: currentIndex < gifts.length - 1 ? 1 : 0.2 }}
      >
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-muted/50" />
        </motion.div>
      </motion.div>

      {/* Counter */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex gap-1">
          {gifts.slice(
            Math.max(0, currentIndex - 2),
            Math.min(gifts.length, currentIndex + 3)
          ).map((g, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            return (
              <motion.div
                key={g.id}
                className={cn(
                  "rounded-full transition-all duration-300",
                  actualIndex === currentIndex
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-border"
                )}
                layout
              />
            );
          })}
        </div>
        <span className="text-[12px] text-muted font-bold ml-2">
          {currentIndex + 1}/{gifts.length}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSwipeLeft}
          className="w-14 h-14 rounded-full bg-white border-2 border-border flex items-center justify-center shadow-lg transition-all hover:border-red-200 hover:shadow-red-100"
        >
          <X className="w-6 h-6 text-red-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSwipeRight}
          disabled={disabled}
          className={cn(
            "w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-2xl transition-all",
            disabled
              ? "bg-muted/30 cursor-not-allowed"
              : "bg-gradient-to-br from-primary to-pink-500 shadow-primary/30 hover:shadow-primary/50"
          )}
        >
          <Send className="w-7 h-7 text-white" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full bg-white border-2 border-border flex items-center justify-center shadow-lg transition-all hover:border-purple-200 hover:shadow-purple-100 disabled:opacity-30"
        >
          <Heart className="w-6 h-6 text-purple-400" />
        </motion.button>
      </div>

      {/* Swipe hints */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <span className="text-[11px] text-muted/50 font-medium">Gec</span>
        <span className="text-[11px] text-muted/50 font-bold">Gonder</span>
        <span className="text-[11px] text-muted/50 font-medium">Favori</span>
      </div>
    </div>
  );
}
