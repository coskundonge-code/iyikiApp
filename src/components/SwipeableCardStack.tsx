"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import {
  Send,
  X,
  ChevronUp,
  ChevronDown,
  Heart,
  ArrowLeft,
  Store,
  Gift as GiftIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gift } from "@/types";

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */
const SWIPE_THRESHOLD = 80;
const VERTICAL_THRESHOLD = 50;
const MAX_VISIBLE = 4;
const CARD_OFFSET = 10;
const CARD_SCALE_STEP = 0.035;

/* ═══════════════════════════════════════════════
   BRAND TYPE — derived from gifts
   ═══════════════════════════════════════════════ */
export interface Brand {
  id: string;
  name: string;
  logo: string;
  emoji: string;
  giftCount: number;
  categories: string[];
  gradient: { bg: string; glow: string };
}

const BRAND_GRADIENTS: Record<string, { bg: string; glow: string }> = {
  Starbucks: { bg: "from-emerald-400 via-green-400 to-teal-500", glow: "shadow-emerald-300/40" },
  Migros: { bg: "from-orange-400 via-amber-400 to-yellow-500", glow: "shadow-orange-300/40" },
  "D&R": { bg: "from-sky-400 via-blue-400 to-indigo-500", glow: "shadow-sky-300/40" },
  "Çiçeksepeti": { bg: "from-pink-400 via-rose-400 to-fuchsia-500", glow: "shadow-pink-300/40" },
};

const BRAND_EMOJIS: Record<string, string> = {
  Starbucks: "☕",
  Migros: "🛒",
  "D&R": "📚",
  "Çiçeksepeti": "🌸",
};

const PRODUCT_GRADIENTS: Record<string, { bg: string; glow: string }> = {
  coffee: { bg: "from-amber-400 via-orange-400 to-yellow-500", glow: "shadow-amber-300/40" },
  chocolate: { bg: "from-rose-400 via-pink-400 to-red-500", glow: "shadow-rose-300/40" },
  book: { bg: "from-sky-400 via-blue-400 to-indigo-500", glow: "shadow-sky-300/40" },
  flower: { bg: "from-pink-400 via-rose-400 to-fuchsia-500", glow: "shadow-pink-300/40" },
  experience: { bg: "from-violet-400 via-purple-400 to-indigo-500", glow: "shadow-violet-300/40" },
  food: { bg: "from-emerald-400 via-teal-400 to-cyan-500", glow: "shadow-emerald-300/40" },
};

const DEFAULT_GRADIENT = { bg: "from-slate-400 via-gray-400 to-zinc-500", glow: "shadow-slate-300/40" };

/* ═══════════════════════════════════════════════
   SPRING CONFIGS
   ═══════════════════════════════════════════════ */
const SMOOTH_SPRING = { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.8 };
const FAST_SPRING = { type: "spring" as const, stiffness: 400, damping: 32 };
const ENTER_SPRING = { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.7 };

/* ═══════════════════════════════════════════════
   DRAGGABLE TOP CARD — shared for brand & product
   ═══════════════════════════════════════════════ */
function DraggableCard({
  children,
  onSwipeRight,
  onSwipeLeft,
  disabled,
  rightLabel,
  leftLabel,
  rightIcon: RightIcon,
  leftIcon: LeftIcon,
}: {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  disabled?: boolean;
  rightLabel: string;
  leftLabel: string;
  rightIcon: React.ComponentType<{ className?: string }>;
  leftIcon: React.ComponentType<{ className?: string }>;
}) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);
  const rightOpacity = useTransform(x, [0, 60, 120], [0, 0.5, 1]);
  const leftOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0]);
  const cardOpacity = useTransform(x, [-320, -220, 0, 220, 320], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (disabled) return;
    if (info.offset.x > SWIPE_THRESHOLD && info.velocity.x > -50) {
      onSwipeRight();
    } else if (info.offset.x < -SWIPE_THRESHOLD && info.velocity.x < 50) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, opacity: cardOpacity, scale, zIndex: 50 }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.92, opacity: 0, y: 24 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      transition={ENTER_SPRING}
    >
      {children}

      {/* Right swipe indicator */}
      <motion.div className="absolute top-6 left-5 z-20" style={{ opacity: rightOpacity }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/95 rounded-2xl shadow-xl backdrop-blur-sm">
          <RightIcon className="w-4.5 h-4.5 text-emerald-500" />
          <span className="text-[14px] font-extrabold text-emerald-600">{rightLabel}</span>
        </div>
      </motion.div>

      {/* Left swipe indicator */}
      <motion.div className="absolute top-6 right-5 z-20" style={{ opacity: leftOpacity }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/95 rounded-2xl shadow-xl backdrop-blur-sm">
          <LeftIcon className="w-4.5 h-4.5 text-red-400" />
          <span className="text-[14px] font-extrabold text-red-500">{leftLabel}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   CARD CONTENT — Brand
   ═══════════════════════════════════════════════ */
function BrandCardContent({ brand }: { brand: Brand }) {
  return (
    <div className={cn("relative w-full h-full rounded-[28px] overflow-hidden shadow-2xl", brand.gradient.glow)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", brand.gradient.bg)} />
      {/* Decorative */}
      <div className="absolute inset-0">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute top-1/4 right-1/3 w-24 h-24 rounded-full bg-white/5" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-white">
        <motion.div
          className="text-[90px] mb-3 drop-shadow-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {brand.emoji}
        </motion.div>
        <h2 className="text-[30px] font-extrabold text-center leading-tight drop-shadow-sm">
          {brand.name}
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[12px] font-bold border border-white/20">
            <GiftIcon className="w-3 h-3 inline mr-1" />
            {brand.giftCount} hediye
          </span>
          {brand.categories.length > 0 && (
            <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold border border-white/15">
              {brand.categories.length} kategori
            </span>
          )}
        </div>
        <p className="text-white/50 text-[13px] mt-6 text-center max-w-[240px] leading-relaxed">
          Saga kaydir → urunleri gor
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CARD CONTENT — Product
   ═══════════════════════════════════════════════ */
function ProductCardContent({ gift }: { gift: Gift }) {
  const colors = PRODUCT_GRADIENTS[gift.category] || DEFAULT_GRADIENT;
  return (
    <div className={cn("relative w-full h-full rounded-[28px] overflow-hidden shadow-2xl", colors.glow)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", colors.bg)} />
      {/* Decorative */}
      <div className="absolute inset-0">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/8 blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-white">
        <motion.div
          className="text-[90px] mb-3 drop-shadow-lg"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {gift.image}
        </motion.div>
        <h2 className="text-[26px] font-extrabold text-center leading-tight drop-shadow-sm">
          {gift.name}
        </h2>
        <p className="text-white/70 text-[14px] font-semibold mt-1.5">
          {gift.partnerName}
        </p>
        <div className="flex items-center gap-2 mt-3">
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
        <p className="text-white/50 text-[13px] mt-5 text-center max-w-[240px] leading-relaxed">
          {gift.description || "Saga kaydir → gonder"}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STACK CARD (Behind — Static)
   ═══════════════════════════════════════════════ */
function StackCard({
  gradient,
  emoji,
  label,
  index,
}: {
  gradient: { bg: string; glow: string };
  emoji: string;
  label: string;
  index: number;
}) {
  const s = 1 - (index + 1) * CARD_SCALE_STEP;
  const yOff = (index + 1) * CARD_OFFSET;

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 40 - index }}
      initial={false}
      animate={{ scale: s, y: yOff, opacity: index < 2 ? 1 - index * 0.25 : 0.3 }}
      transition={SMOOTH_SPRING}
    >
      <div className="w-full h-full rounded-[28px] overflow-hidden shadow-lg">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-75", gradient.bg)} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
          <span className="text-6xl opacity-50">{emoji}</span>
          <p className="text-[15px] font-bold mt-3 opacity-50">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   NAVIGATION ARROWS
   ═══════════════════════════════════════════════ */
function NavHint({ direction, active }: { direction: "up" | "down"; active: boolean }) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  return (
    <motion.div
      className={cn("flex items-center justify-center h-6", direction === "up" ? "mb-2" : "mt-2")}
      animate={{ opacity: active ? 0.7 : 0.15 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div animate={{ y: direction === "up" ? [0, -3, 0] : [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
        <Icon className="w-5 h-5 text-muted/60" />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   DOT PAGINATION
   ═══════════════════════════════════════════════ */
function DotPagination({ total, current }: { total: number; current: number }) {
  const windowSize = 5;
  const start = Math.max(0, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize);

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="flex gap-1">
        {Array.from({ length: end - start }, (_, i) => {
          const idx = start + i;
          return (
            <motion.div
              key={idx}
              className={cn(
                "rounded-full",
                idx === current ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"
              )}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          );
        })}
      </div>
      <span className="text-[12px] text-muted font-bold ml-2">
        {current + 1}/{total}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LEVEL INDICATOR
   ═══════════════════════════════════════════════ */
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
        initial={{ opacity: 0, x: level === "products" ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: level === "products" ? -20 : 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center gap-2 mb-3 h-8"
      >
        {level === "products" ? (
          <motion.button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-sm text-[12px] font-bold text-muted hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Markalar
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-[12px] font-bold text-primary">
            <Store className="w-3.5 h-3.5" />
            Markalar
          </div>
        )}
        {level === "products" && brandName && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[12px] font-bold text-foreground"
          >
            › {brandName}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT — Two-Level Card Stack
   ═══════════════════════════════════════════════ */
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
  const touchStartY = useRef(0);

  /* ── Derive brands from gifts ── */
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

  /* ── Products for selected brand ── */
  const brandProducts = useMemo(() => {
    if (!selectedBrandId) return [];
    return gifts.filter((g) => g.partnerId === selectedBrandId);
  }, [gifts, selectedBrandId]);

  /* ── Current items based on level ── */
  const currentIndex = level === "brands" ? brandIndex : productIndex;
  const totalItems = level === "brands" ? brands.length : brandProducts.length;

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    if (level === "brands") {
      setBrandIndex((i) => Math.min(i + 1, brands.length - 1));
    } else {
      setProductIndex((i) => Math.min(i + 1, brandProducts.length - 1));
    }
  }, [level, brands.length, brandProducts.length]);

  const goPrev = useCallback(() => {
    if (level === "brands") {
      setBrandIndex((i) => Math.max(i - 1, 0));
    } else {
      setProductIndex((i) => Math.max(i - 1, 0));
    }
  }, [level]);

  /* ── Vertical touch ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > VERTICAL_THRESHOLD) {
      diff > 0 ? goNext() : goPrev();
    }
  };
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (Math.abs(e.deltaY) > 25) {
        e.deltaY > 0 ? goNext() : goPrev();
      }
    },
    [goNext, goPrev]
  );

  /* ── Enter brand (swipe right on brand) ── */
  const enterBrand = useCallback(
    (brand: Brand) => {
      setSelectedBrandId(brand.id);
      setProductIndex(0);
      setLevel("products");
    },
    []
  );

  /* ── Back to brands (swipe left on product) ── */
  const backToBrands = useCallback(() => {
    setLevel("brands");
    setSelectedBrandId(null);
  }, []);

  /* ── Swipe right on product → send ── */
  const handleProductSwipeRight = useCallback(
    (gift: Gift) => {
      if (!disabled) onSwipeRight(gift);
    },
    [disabled, onSwipeRight]
  );

  /* ── Empty state ── */
  if (brands.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">🎁</div>
          <p className="text-muted font-medium text-[15px]">Henuz marka yok</p>
        </div>
      </div>
    );
  }

  /* ── Determine visible items ── */
  const brandVisible = brands.slice(brandIndex, brandIndex + MAX_VISIBLE);
  const productVisible = brandProducts.slice(productIndex, productIndex + MAX_VISIBLE);
  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Level breadcrumb */}
      <LevelBreadcrumb level={level} brandName={selectedBrand?.name} onBack={backToBrands} />

      {/* Navigation hint — top */}
      <NavHint direction="up" active={currentIndex > 0} />

      {/* Card Stack Container */}
      <div
        className="relative w-full"
        style={{ height: "400px", maxWidth: "330px", margin: "0 auto" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="wait">
          {level === "brands" ? (
            <motion.div
              key="brands-level"
              className="absolute inset-0"
              initial={{ opacity: 0, x: -60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Stack cards behind */}
              {brandVisible.slice(1).map((brand, i) => (
                <StackCard
                  key={`bs-${brand.id}`}
                  gradient={brand.gradient}
                  emoji={brand.emoji}
                  label={brand.name}
                  index={i}
                />
              ))}
              {/* Top brand card */}
              {brandVisible[0] && (
                <AnimatePresence mode="popLayout">
                  <DraggableCard
                    key={`bt-${brandVisible[0].id}`}
                    onSwipeRight={() => enterBrand(brandVisible[0])}
                    onSwipeLeft={() => goNext()}
                    rightLabel="KESFET"
                    leftLabel="GEC"
                    rightIcon={Store}
                    leftIcon={X}
                  >
                    <BrandCardContent brand={brandVisible[0]} />
                  </DraggableCard>
                </AnimatePresence>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="products-level"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Stack cards behind */}
              {productVisible.slice(1).map((gift, i) => (
                <StackCard
                  key={`ps-${gift.id}`}
                  gradient={PRODUCT_GRADIENTS[gift.category] || DEFAULT_GRADIENT}
                  emoji={gift.image}
                  label={gift.name}
                  index={i}
                />
              ))}
              {/* Top product card */}
              {productVisible[0] && (
                <AnimatePresence mode="popLayout">
                  <DraggableCard
                    key={`pt-${productVisible[0].id}`}
                    onSwipeRight={() => handleProductSwipeRight(productVisible[0])}
                    onSwipeLeft={backToBrands}
                    disabled={disabled}
                    rightLabel="GONDER"
                    leftLabel="GERI"
                    rightIcon={Send}
                    leftIcon={ArrowLeft}
                  >
                    <ProductCardContent gift={productVisible[0]} />
                  </DraggableCard>
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation hint — bottom */}
      <NavHint direction="down" active={currentIndex < totalItems - 1} />

      {/* Dot pagination */}
      <DotPagination total={totalItems} current={currentIndex} />

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-5">
        {level === "products" ? (
          <>
            {/* Back to brands */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={backToBrands}
              className="w-14 h-14 rounded-full bg-white border-2 border-border flex items-center justify-center shadow-lg hover:border-orange-200 hover:shadow-orange-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-orange-400" />
            </motion.button>

            {/* Send gift */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => productVisible[0] && handleProductSwipeRight(productVisible[0])}
              disabled={disabled}
              className={cn(
                "w-[68px] h-[68px] rounded-full flex items-center justify-center shadow-2xl transition-all",
                disabled
                  ? "bg-muted/30 cursor-not-allowed"
                  : "bg-gradient-to-br from-primary to-pink-500 shadow-primary/30 hover:shadow-primary/50"
              )}
            >
              <Send className="w-6 h-6 text-white" />
            </motion.button>

            {/* Favorite */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-white border-2 border-border flex items-center justify-center shadow-lg hover:border-purple-200 hover:shadow-purple-100 transition-all"
            >
              <Heart className="w-5 h-5 text-purple-400" />
            </motion.button>
          </>
        ) : (
          <>
            {/* Skip brand */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="w-14 h-14 rounded-full bg-white border-2 border-border flex items-center justify-center shadow-lg hover:border-red-200 hover:shadow-red-100 transition-all"
            >
              <X className="w-5 h-5 text-red-400" />
            </motion.button>

            {/* Explore brand */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => brandVisible[0] && enterBrand(brandVisible[0])}
              className="w-[68px] h-[68px] rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-300/30 hover:shadow-emerald-300/50 transition-all"
            >
              <Store className="w-6 h-6 text-white" />
            </motion.button>

            {/* Favorite */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-white border-2 border-border flex items-center justify-center shadow-lg hover:border-purple-200 hover:shadow-purple-100 transition-all"
            >
              <Heart className="w-5 h-5 text-purple-400" />
            </motion.button>
          </>
        )}
      </div>

      {/* Hint labels */}
      <div className="flex items-center justify-center gap-6 mt-3">
        {level === "products" ? (
          <>
            <span className="text-[11px] text-muted/50 font-medium">Geri</span>
            <span className="text-[11px] text-muted/50 font-bold">Gonder</span>
            <span className="text-[11px] text-muted/50 font-medium">Favori</span>
          </>
        ) : (
          <>
            <span className="text-[11px] text-muted/50 font-medium">Gec</span>
            <span className="text-[11px] text-muted/50 font-bold">Kesfet</span>
            <span className="text-[11px] text-muted/50 font-medium">Favori</span>
          </>
        )}
      </div>
    </div>
  );
}
