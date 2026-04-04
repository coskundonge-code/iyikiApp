"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import {
  Send,
  X,
  Heart,
  ArrowLeft,
  Store,
  Gift as GiftIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gift } from "@/types";

/* ═══════════════════════════════════════════════════════════════
   TINDER + APPLE SMART STACK — PROFESSIONAL CARD STACK

   Research-based animation values:
   - Tinder: rotation -45°/+45°, scale 0.95→1.0 reveal,
     velocity threshold 400px/s, throw exit 1500px
   - Apple Smart Stack: 12px vertical offset per card,
     spring-based slide, depth parallax via scale
   ═══════════════════════════════════════════════════════════════ */

/* ── Constants ── */
const SWIPE_VELOCITY_THRESHOLD = 400;   // px/s — fast flick completes swipe
const SWIPE_POSITION_THRESHOLD = 80;    // px — drag distance completes swipe
const THROW_DISTANCE = 1500;            // px — how far card flies off
const ROTATION_RANGE = 35;              // degrees — max rotation on full drag
const THROW_DURATION = 0.8;             // seconds — slow throw for visibility
const SNAPBACK_STIFFNESS = 300;         // spring snap-back
const SNAPBACK_DAMPING = 22;            // spring snap-back damping

const VERTICAL_DRAG_THRESHOLD = 30;     // px — vertical swipe distance
const MAX_VISIBLE = 3;                  // visible cards in stack

/* ── Brand gradients ── */
const BRAND_GRADIENTS: Record<string, { bg: string; glow: string }> = {
  Starbucks: { bg: "from-emerald-400 via-green-500 to-teal-600", glow: "shadow-emerald-400/30" },
  Migros: { bg: "from-orange-400 via-amber-500 to-yellow-600", glow: "shadow-orange-400/30" },
  "D&R": { bg: "from-sky-400 via-blue-500 to-indigo-600", glow: "shadow-sky-400/30" },
  "Çiçeksepeti": { bg: "from-pink-400 via-rose-500 to-fuchsia-600", glow: "shadow-pink-400/30" },
};
const BRAND_EMOJIS: Record<string, string> = {
  Starbucks: "☕", Migros: "🛒", "D&R": "📚", "Çiçeksepeti": "🌸",
};
const PRODUCT_GRADIENTS: Record<string, { bg: string; glow: string }> = {
  coffee: { bg: "from-amber-400 via-orange-500 to-yellow-600", glow: "shadow-amber-400/30" },
  chocolate: { bg: "from-rose-400 via-pink-500 to-red-600", glow: "shadow-rose-400/30" },
  book: { bg: "from-sky-400 via-blue-500 to-indigo-600", glow: "shadow-sky-400/30" },
  flower: { bg: "from-pink-400 via-rose-500 to-fuchsia-600", glow: "shadow-pink-400/30" },
  experience: { bg: "from-violet-400 via-purple-500 to-indigo-600", glow: "shadow-violet-400/30" },
  food: { bg: "from-emerald-400 via-teal-500 to-cyan-600", glow: "shadow-emerald-400/30" },
};
const DEFAULT_GRADIENT = { bg: "from-slate-400 via-gray-500 to-zinc-600", glow: "shadow-slate-400/30" };

/* ── Brand type ── */
export interface Brand {
  id: string;
  name: string;
  logo: string;
  emoji: string;
  giftCount: number;
  categories: string[];
  gradient: { bg: string; glow: string };
}

/* ═══════════════════════════════════════════════════════════════
   TINDER-STYLE TOP CARD — Draggable with throw physics
   ═══════════════════════════════════════════════════════════════ */
function TinderCard({
  children,
  onSwipeRight,
  onSwipeLeft,
  disabled,
  rightLabel,
  leftLabel,
  rightIcon: RightIcon,
  leftIcon: LeftIcon,
  rightColor = "emerald",
  leftColor = "red",
}: {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  disabled?: boolean;
  rightLabel: string;
  leftLabel: string;
  rightIcon: React.ComponentType<{ className?: string }>;
  leftIcon: React.ComponentType<{ className?: string }>;
  rightColor?: string;
  leftColor?: string;
}) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Tinder transforms ──
  const rotate = useTransform(x, [-200, 0, 200], [-ROTATION_RANGE, 0, ROTATION_RANGE]);

  // Stamp opacity: fade in as you drag
  const rightStampOpacity = useTransform(x, [0, 30, 80], [0, 0.3, 1]);
  const leftStampOpacity = useTransform(x, [-80, -30, 0], [1, 0.3, 0]);

  // Background tint
  const rightTint = useTransform(x, [0, 120], ["rgba(16,185,129,0)", "rgba(16,185,129,0.1)"]);
  const leftTint = useTransform(x, [-120, 0], ["rgba(239,68,68,0.1)", "rgba(239,68,68,0)"]);

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    if (disabled) {
      await controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 28 } });
      return;
    }

    const { offset, velocity } = info;
    // Check both position AND velocity for swipe detection
    const swipeRight =
      offset.x > SWIPE_POSITION_THRESHOLD ||
      (velocity.x > SWIPE_VELOCITY_THRESHOLD && offset.x > 20);
    const swipeLeft =
      offset.x < -SWIPE_POSITION_THRESHOLD ||
      (velocity.x < -SWIPE_VELOCITY_THRESHOLD && offset.x < -20);

    if (swipeRight) {
      // Throw card to the right — SLOW for visibility
      await controls.start({
        x: THROW_DISTANCE,
        rotate: ROTATION_RANGE + 15,
        opacity: 0,
        transition: { duration: THROW_DURATION, ease: [0.25, 0.46, 0.45, 0.94] },
      });
      onSwipeRight();
    } else if (swipeLeft) {
      // Throw card to the left — SLOW for visibility
      await controls.start({
        x: -THROW_DISTANCE,
        rotate: -(ROTATION_RANGE + 15),
        opacity: 0,
        transition: { duration: THROW_DURATION, ease: [0.25, 0.46, 0.45, 0.94] },
      });
      onSwipeLeft();
    } else {
      // Snap back with elastic spring — gentle
      await controls.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: SNAPBACK_STIFFNESS, damping: SNAPBACK_DAMPING, mass: 1 },
      });
    }
  };

  // Programmatic swipe (button click)
  const triggerSwipe = useCallback(
    async (direction: "left" | "right") => {
      if (disabled && direction === "right") return;
      const dir = direction === "right" ? 1 : -1;
      await controls.start({
        x: dir * THROW_DISTANCE,
        rotate: dir * (ROTATION_RANGE + 15),
        opacity: 0,
        transition: { duration: THROW_DURATION * 1.1, ease: [0.25, 0.46, 0.45, 0.94] },
      });
      if (direction === "right") onSwipeRight();
      else onSwipeLeft();
    },
    [controls, disabled, onSwipeRight, onSwipeLeft]
  );

  // Expose triggerSwipe via ref-like pattern
  useEffect(() => {
    if (cardRef.current) {
      (cardRef.current as HTMLDivElement & { triggerSwipe?: typeof triggerSwipe }).triggerSwipe = triggerSwipe;
    }
  }, [triggerSwipe]);

  return (
    <motion.div
      ref={cardRef}
      data-tinder-card
      className="absolute inset-0 cursor-grab active:cursor-grabbing will-change-transform"
      style={{
        x,
        rotate,
        zIndex: 50,
        touchAction: "none",           // ← CRITICAL: prevent browser scroll
      }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.85}               // ← More elastic = easier to drag far
      dragMomentum={false}             // ← We handle momentum in onDragEnd
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ scale: 1, opacity: 1 }}
    >
      {/* Direction tint overlays */}
      <motion.div
        className="absolute inset-0 rounded-[28px] z-[5] pointer-events-none"
        style={{ backgroundColor: rightTint }}
      />
      <motion.div
        className="absolute inset-0 rounded-[28px] z-[5] pointer-events-none"
        style={{ backgroundColor: leftTint }}
      />

      {children}

      {/* ── STAMPS (Tinder-style verdict labels) ── */}
      {/* Right stamp */}
      <motion.div
        className="absolute top-8 left-6 z-20 pointer-events-none"
        style={{ opacity: rightStampOpacity }}
      >
        <div className={cn(
          "flex items-center gap-2.5 px-5 py-3 rounded-2xl border-[3px] shadow-xl backdrop-blur-md",
          rightColor === "emerald"
            ? "border-emerald-500 bg-emerald-50/90 shadow-emerald-200/40"
            : "border-teal-500 bg-teal-50/90 shadow-teal-200/40"
        )}>
          <RightIcon className={cn("w-5 h-5", rightColor === "emerald" ? "text-emerald-600" : "text-teal-600")} />
          <span className={cn("text-[16px] font-black tracking-wide", rightColor === "emerald" ? "text-emerald-700" : "text-teal-700")}>
            {rightLabel}
          </span>
        </div>
      </motion.div>

      {/* Left stamp */}
      <motion.div
        className="absolute top-8 right-6 z-20 pointer-events-none"
        style={{ opacity: leftStampOpacity }}
      >
        <div className={cn(
          "flex items-center gap-2.5 px-5 py-3 rounded-2xl border-[3px] shadow-xl backdrop-blur-md",
          leftColor === "red"
            ? "border-red-400 bg-red-50/90 shadow-red-200/40"
            : "border-orange-400 bg-orange-50/90 shadow-orange-200/40"
        )}>
          <LeftIcon className={cn("w-5 h-5", leftColor === "red" ? "text-red-500" : "text-orange-500")} />
          <span className={cn("text-[16px] font-black tracking-wide", leftColor === "red" ? "text-red-600" : "text-orange-600")}>
            {leftLabel}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STACK CARD — Behind the top card, scales up as top is dragged
   ═══════════════════════════════════════════════════════════════ */
function StackCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number; // 0 = directly behind top, 1 = next, ...
  total?: number;
}) {
  const scale = 1 - (index + 1) * 0.05;
  const yOffset = (index + 1) * 12;
  const opacity = index === 0 ? 0.95 : index === 1 ? 0.7 : 0.4;

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ zIndex: 40 - index }}
      initial={false}
      animate={{ scale, y: yOffset, opacity }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 22,
        mass: 1,
        duration: 0.6,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CARD CONTENT RENDERERS
   ═══════════════════════════════════════════════════════════════ */

function CardShell({
  gradient,
  glow,
  children,
}: {
  gradient: string;
  glow: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative w-full h-full rounded-[28px] overflow-hidden shadow-2xl", glow)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute top-1/4 right-1/3 w-20 h-20 rounded-full bg-white/[0.04]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-white">
        {children}
      </div>
    </div>
  );
}

function BrandContent({ brand }: { brand: Brand }) {
  return (
    <CardShell gradient={brand.gradient.bg} glow={brand.gradient.glow}>
      <motion.div
        className="text-[88px] mb-2 drop-shadow-lg"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {brand.emoji}
      </motion.div>
      <h2 className="text-[30px] font-black text-center leading-tight drop-shadow-sm">
        {brand.name}
      </h2>
      <div className="flex items-center gap-2 mt-3">
        <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-[12px] font-bold border border-white/20 flex items-center gap-1.5">
          <GiftIcon className="w-3 h-3" />
          {brand.giftCount} hediye
        </span>
      </div>
      <p className="text-white/40 text-[13px] mt-6 text-center">
        Saga kaydir → urunleri kesfet
      </p>
    </CardShell>
  );
}

function ProductContent({ gift }: { gift: Gift }) {
  const colors = PRODUCT_GRADIENTS[gift.category] || DEFAULT_GRADIENT;
  return (
    <CardShell gradient={colors.bg} glow={colors.glow}>
      <motion.div
        className="text-[88px] mb-2 drop-shadow-lg"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {gift.image}
      </motion.div>
      <h2 className="text-[26px] font-black text-center leading-tight drop-shadow-sm">
        {gift.name}
      </h2>
      <p className="text-white/70 text-[14px] font-semibold mt-1">
        {gift.partnerName}
      </p>
      <div className="flex items-center gap-2 mt-3">
        {gift.isPremium && (
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-bold border border-white/20">
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
      <p className="text-white/40 text-[13px] mt-5 text-center max-w-[240px]">
        {gift.description || "Saga kaydir → gonder"}
      </p>
    </CardShell>
  );
}

/* Mini card content for stack behind */
function MiniCardContent({
  gradient,
  emoji,
  label,
}: {
  gradient: string;
  emoji: string;
  label: string;
}) {
  return (
    <div className="relative w-full h-full rounded-[28px] overflow-hidden shadow-lg">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", gradient)} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
        <span className="text-6xl opacity-50">{emoji}</span>
        <p className="text-[15px] font-bold mt-3 opacity-50">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOT INDICATORS
   ═══════════════════════════════════════════════════════════════ */

function HorizontalDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  const maxDots = 7;
  const halfWindow = Math.floor(maxDots / 2);
  let start = Math.max(0, current - halfWindow);
  const end = Math.min(total, start + maxDots);
  if (end - start < maxDots) start = Math.max(0, end - maxDots);

  return (
    <div className="flex items-center gap-[6px]">
      {Array.from({ length: end - start }, (_, i) => {
        const idx = start + i;
        const isActive = idx === current;
        const distance = Math.abs(idx - current);
        return (
          <motion.div
            key={idx}
            layout
            className="rounded-full"
            animate={{
              width: isActive ? 24 : 8,
              height: 8,
              backgroundColor: isActive ? "var(--color-primary, #E8364F)" : distance <= 1 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)",
              scale: isActive ? 1 : distance <= 1 ? 0.9 : 0.7,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.5 }}
          />
        );
      })}
    </div>
  );
}

function VerticalDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  const maxDots = 7;
  const halfWindow = Math.floor(maxDots / 2);
  let start = Math.max(0, current - halfWindow);
  const end = Math.min(total, start + maxDots);
  if (end - start < maxDots) start = Math.max(0, end - maxDots);

  return (
    <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-[5px] z-[60]">
      {Array.from({ length: end - start }, (_, i) => {
        const idx = start + i;
        const isActive = idx === current;
        const distance = Math.abs(idx - current);
        return (
          <motion.div
            key={idx}
            layout
            className="rounded-full"
            animate={{
              width: 6,
              height: isActive ? 20 : 6,
              backgroundColor: isActive
                ? "var(--color-primary, #E8364F)"
                : distance <= 1
                  ? "rgba(0,0,0,0.25)"
                  : "rgba(0,0,0,0.1)",
              scale: isActive ? 1 : distance <= 1 ? 0.9 : 0.7,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.5 }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEVEL BREADCRUMB
   ═══════════════════════════════════════════════════════════════ */
function LevelBreadcrumb({
  level,
  brandName,
  onBack,
}: {
  level: "brands" | "products";
  brandName?: string;
  onBack: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={level}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-2 mb-4 h-8"
      >
        {level === "products" ? (
          <>
            <motion.button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-sm text-[12px] font-bold text-muted hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Markalar
            </motion.button>
            <span className="text-[12px] font-bold text-foreground">› {brandName}</span>
          </>
        ) : (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 text-[12px] font-bold text-primary">
            <Store className="w-3.5 h-3.5" />
            Markalari Kesfet
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
interface SwipeableCardStackProps {
  gifts: Gift[];
  onSwipeRight: (gift: Gift) => void;
  onSwipeLeft?: (gift: Gift) => void;
  disabled?: boolean;
}

export default function SwipeableCardStack({
  gifts,
  onSwipeRight,
  onSwipeLeft,
  disabled = false,
}: SwipeableCardStackProps) {
  const [level, setLevel] = useState<"brands" | "products">("brands");
  const [brandIndex, setBrandIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [verticalAnimating, setVerticalAnimating] = useState(false);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchHandled = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Derive brands ── */
  const brands = useMemo<Brand[]>(() => {
    const map = new Map<string, { gifts: Gift[]; categories: Set<string> }>();
    gifts.forEach((g) => {
      const entry = map.get(g.partnerId) || { gifts: [], categories: new Set<string>() };
      entry.gifts.push(g);
      entry.categories.add(g.category);
      map.set(g.partnerId, entry);
    });
    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      name: data.gifts[0].partnerName,
      logo: data.gifts[0].partnerLogo,
      emoji: BRAND_EMOJIS[data.gifts[0].partnerName] || "🏪",
      giftCount: data.gifts.length,
      categories: Array.from(data.categories),
      gradient: BRAND_GRADIENTS[data.gifts[0].partnerName] || DEFAULT_GRADIENT,
    }));
  }, [gifts]);

  /* ── Products for brand ── */
  const brandProducts = useMemo(() => {
    if (!selectedBrandId) return [];
    return gifts.filter((g) => g.partnerId === selectedBrandId);
  }, [gifts, selectedBrandId]);

  const currentItems = level === "brands" ? brands : brandProducts;
  const currentIndex = level === "brands" ? brandIndex : productIndex;
  const setCurrentIndex = level === "brands" ? setBrandIndex : setProductIndex;

  /* ── Apple Smart Stack: Vertical navigation with animation lock ── */
  const goVertical = useCallback(
    (direction: "up" | "down") => {
      if (isAnimating || verticalAnimating) return;
      const maxIdx = currentItems.length - 1;
      if (direction === "up" && currentIndex < maxIdx) {
        setVerticalAnimating(true);
        setCurrentIndex((i) => i + 1);
        setTimeout(() => setVerticalAnimating(false), 500);
      } else if (direction === "down" && currentIndex > 0) {
        setVerticalAnimating(true);
        setCurrentIndex((i) => i - 1);
        setTimeout(() => setVerticalAnimating(false), 500);
      }
    },
    [isAnimating, verticalAnimating, currentItems.length, currentIndex, setCurrentIndex]
  );

  /* ═══════════════════════════════════════════════════════════════
     TOUCH HANDLING — Unified gesture detection

     Key fix: We use touchStart to record origin, touchMove to detect
     direction intent (vertical vs horizontal), and preventDefault to
     stop page scrolling. Only vertical gestures are handled here;
     horizontal ones are left to framer-motion's drag system.
     ═══════════════════════════════════════════════════════════════ */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchHandled.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Always prevent default to stop page scrolling in the card area
    e.preventDefault();

    if (touchHandled.current) return;

    const dy = touchStartY.current - e.touches[0].clientY;
    const dx = touchStartX.current - e.touches[0].clientX;
    const absDy = Math.abs(dy);
    const absDx = Math.abs(dx);

    // Only handle vertical if clearly vertical intent (more Y than X by 1.5x)
    if (absDy > VERTICAL_DRAG_THRESHOLD && absDy > absDx * 1.5) {
      touchHandled.current = true;
      goVertical(dy > 0 ? "up" : "down");
    }
    // Horizontal gestures are handled by framer-motion drag — do nothing
  }, [goVertical]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 25) {
        goVertical(e.deltaY > 0 ? "up" : "down");
      }
    },
    [goVertical]
  );

  /* ── Prevent default on the container for touchmove (native) ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };
    el.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      el.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  /* ── Level transitions ── */
  const enterBrand = useCallback((brand: Brand) => {
    setIsAnimating(true);
    setSelectedBrandId(brand.id);
    setProductIndex(0);
    setTimeout(() => {
      setLevel("products");
      setTimeout(() => setIsAnimating(false), 400);
    }, 50);
  }, []);

  const backToBrands = useCallback(() => {
    setIsAnimating(true);
    setLevel("brands");
    setSelectedBrandId(null);
    setTimeout(() => setIsAnimating(false), 500);
  }, []);

  /* ── Swipe handlers ── */
  const handleBrandSwipeRight = useCallback(
    (idx: number) => {
      const brand = brands[idx];
      if (brand) enterBrand(brand);
    },
    [brands, enterBrand]
  );

  const handleBrandSwipeLeft = useCallback(() => {
    if (brandIndex < brands.length - 1) {
      setBrandIndex((i) => i + 1);
    }
  }, [brandIndex, brands.length]);

  const handleProductSwipeRight = useCallback(
    (idx: number) => {
      const gift = brandProducts[idx];
      if (gift && !disabled) onSwipeRight(gift);
    },
    [brandProducts, disabled, onSwipeRight]
  );

  const handleProductSwipeLeft = useCallback(() => {
    backToBrands();
  }, [backToBrands]);

  /* ── Button swipe triggers ── */
  const triggerButtonSwipe = useCallback((direction: "left" | "right") => {
    const topCard = containerRef.current?.querySelector("[data-tinder-card]") as HTMLDivElement & { triggerSwipe?: (d: "left" | "right") => void } | null;
    if (topCard?.triggerSwipe) {
      topCard.triggerSwipe(direction);
    }
  }, []);

  /* ── Visible items ── */
  const visibleItems = currentItems.slice(currentIndex, currentIndex + MAX_VISIBLE);
  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  /* ── Empty state ── */
  if (brands.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">🎁</div>
          <p className="text-muted font-medium text-[15px]">Henuz marka yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Breadcrumb */}
      <LevelBreadcrumb level={level} brandName={selectedBrand?.name} onBack={backToBrands} />

      {/* ── CARD STACK AREA ── */}
      <div className="relative w-full" style={{ maxWidth: "340px", margin: "0 auto" }}>
        {/* Vertical dots — Apple Smart Stack style (right side) */}
        <div className="relative" style={{ height: "420px" }}>
          <VerticalDots total={currentItems.length} current={currentIndex} />

          <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            style={{ touchAction: "none" }}      /* ← CRITICAL: stops ALL browser scroll/zoom */
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onWheel={handleWheel}
          >
            <AnimatePresence mode="popLayout">
              {level === "brands" ? (
                <motion.div
                  key="brands-layer"
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.92, x: -40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.92, x: -40 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24, mass: 1, duration: 0.6 }}
                >
                  {/* Stack cards behind */}
                  {visibleItems.slice(1).map((item, i) => {
                    const brand = item as Brand;
                    return (
                      <StackCard key={`bs-${brand.id}`} index={i} total={visibleItems.length}>
                        <MiniCardContent
                          gradient={brand.gradient.bg}
                          emoji={brand.emoji}
                          label={brand.name}
                        />
                      </StackCard>
                    );
                  })}
                  {/* Top card — Tinder draggable */}
                  {visibleItems[0] && (
                    <TinderCard
                      key={`bt-${(visibleItems[0] as Brand).id}-${brandIndex}`}
                      onSwipeRight={() => handleBrandSwipeRight(brandIndex)}
                      onSwipeLeft={handleBrandSwipeLeft}
                      rightLabel="KESFET"
                      leftLabel="GEC"
                      rightIcon={Store}
                      leftIcon={X}
                      rightColor="teal"
                      leftColor="red"
                    >
                      <BrandContent brand={visibleItems[0] as Brand} />
                    </TinderCard>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="products-layer"
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.92, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.92, x: 40 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24, mass: 1, duration: 0.6 }}
                >
                  {/* Stack cards behind */}
                  {visibleItems.slice(1).map((item, i) => {
                    const gift = item as Gift;
                    const colors = PRODUCT_GRADIENTS[gift.category] || DEFAULT_GRADIENT;
                    return (
                      <StackCard key={`ps-${gift.id}`} index={i} total={visibleItems.length}>
                        <MiniCardContent
                          gradient={colors.bg}
                          emoji={gift.image}
                          label={gift.name}
                        />
                      </StackCard>
                    );
                  })}
                  {/* Top card */}
                  {visibleItems[0] && (
                    <TinderCard
                      key={`pt-${(visibleItems[0] as Gift).id}-${productIndex}`}
                      onSwipeRight={() => handleProductSwipeRight(productIndex)}
                      onSwipeLeft={handleProductSwipeLeft}
                      disabled={disabled}
                      rightLabel="GONDER"
                      leftLabel="GERI"
                      rightIcon={Send}
                      leftIcon={ArrowLeft}
                      rightColor="emerald"
                      leftColor="orange"
                    >
                      <ProductContent gift={visibleItems[0] as Gift} />
                    </TinderCard>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL DOTS — Bottom ── */}
      <div className="mt-4">
        <HorizontalDots total={currentItems.length} current={currentIndex} />
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex items-center justify-center gap-5 mt-5">
        {level === "products" ? (
          <>
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => triggerButtonSwipe("left")}
              className="w-14 h-14 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center shadow-lg shadow-orange-100/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-orange-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => triggerButtonSwipe("right")}
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
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              className="w-14 h-14 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center shadow-lg shadow-purple-100/50 transition-all"
            >
              <Heart className="w-5 h-5 text-purple-400" />
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => triggerButtonSwipe("left")}
              className="w-14 h-14 rounded-full bg-white border-2 border-red-200 flex items-center justify-center shadow-lg shadow-red-100/50 transition-all"
            >
              <X className="w-5 h-5 text-red-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => triggerButtonSwipe("right")}
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-emerald-300/30 hover:shadow-emerald-300/50 transition-all"
            >
              <Store className="w-7 h-7 text-white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              className="w-14 h-14 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center shadow-lg shadow-purple-100/50 transition-all"
            >
              <Heart className="w-5 h-5 text-purple-400" />
            </motion.button>
          </>
        )}
      </div>

      {/* Button labels */}
      <div className="flex items-center justify-center gap-8 mt-2.5">
        {level === "products" ? (
          <>
            <span className="text-[11px] text-muted/40 font-semibold w-14 text-center">Geri</span>
            <span className="text-[11px] text-muted/50 font-bold w-[72px] text-center">Gonder</span>
            <span className="text-[11px] text-muted/40 font-semibold w-14 text-center">Favori</span>
          </>
        ) : (
          <>
            <span className="text-[11px] text-muted/40 font-semibold w-14 text-center">Gec</span>
            <span className="text-[11px] text-muted/50 font-bold w-[72px] text-center">Kesfet</span>
            <span className="text-[11px] text-muted/40 font-semibold w-14 text-center">Favori</span>
          </>
        )}
      </div>
    </div>
  );
}
