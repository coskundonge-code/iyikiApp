"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "framer-motion";
import {
  Send,
  X,
  Heart,
  ArrowLeft,
  Store,
  Gift as GiftIcon,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gift } from "@/types";

/* ═══════════════════════════════════════════════════════════════
   TINDER + APPLE SMART STACK — PROFESSIONAL CARD STACK v4

   Navigasyon modeli:
   ─ MARKA seviyesi:
     • Dikey kayma → markalar arasi gecis (SADECE dikey ile marka degisir)
     • Saga kaydir → markanin urunlerine gir
     • Sola kaydir → snap-back (marka degistirmez)
   ─ URUN seviyesi:
     • Sola kaydir → SONRAKI urune gec (son urundeyse DUR)
     • Saga kaydir → ONCEKI urune gec (ilk urundeyse DUR)
     • Dikey kayma → markalara geri don
     • GONDER butonu → sadece tiklamayla (swipe degil)
   ─ Alt gosterge: sadece urun seviyesinde "1/3" formati
   ─ Sag noktalar: her zaman marka indexini gosterir
   ═══════════════════════════════════════════════════════════════ */

/* ── Constants ── */
const SWIPE_VELOCITY_THRESHOLD = 300;
const SWIPE_POSITION_THRESHOLD = 60;
const THROW_DISTANCE = 1500;
const ROTATION_RANGE = 15;            // Daha az rotasyon — daha temiz görünüm
const THROW_DURATION = 1.2;             // Cok yavas throw — net gorulebilir

const VERTICAL_DRAG_THRESHOLD = 35;
const VERTICAL_DEBOUNCE_MS = 1400;      // Cok yavas dikey gecis (animasyon + bekleme)
const VERTICAL_SLIDE_MS = 700;          // Dikey kayma animasyon suresi
const MAX_VISIBLE = 3;

/* ── Gradients ── */
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

/* ── Her ürüne farklı renk — index bazlı döngüsel palet ── */
const PRODUCT_COLOR_PALETTE = [
  { bg: "from-amber-400 via-orange-500 to-red-500", glow: "shadow-amber-400/30" },
  { bg: "from-violet-400 via-purple-500 to-fuchsia-600", glow: "shadow-violet-400/30" },
  { bg: "from-emerald-400 via-teal-500 to-cyan-600", glow: "shadow-emerald-400/30" },
  { bg: "from-sky-400 via-blue-500 to-indigo-600", glow: "shadow-sky-400/30" },
  { bg: "from-rose-400 via-pink-500 to-red-600", glow: "shadow-rose-400/30" },
  { bg: "from-lime-400 via-green-500 to-emerald-600", glow: "shadow-lime-400/30" },
];

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
   TINDER-STYLE TOP CARD
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
  noThrow = false,
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
  noThrow?: boolean;
}) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const rotate = useTransform(x, [-200, 0, 200], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const rightStampOpacity = useTransform(x, [0, 30, 80], [0, 0.3, 1]);
  const leftStampOpacity = useTransform(x, [-80, -30, 0], [1, 0.3, 0]);
  const rightTint = useTransform(x, [0, 120], ["rgba(16,185,129,0)", "rgba(16,185,129,0.1)"]);
  const leftTint = useTransform(x, [-120, 0], ["rgba(239,68,68,0.1)", "rgba(239,68,68,0)"]);

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    if (disabled) {
      await controls.start({ x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } });
      return;
    }

    const { offset, velocity } = info;
    const swipeRight =
      offset.x > SWIPE_POSITION_THRESHOLD ||
      (velocity.x > SWIPE_VELOCITY_THRESHOLD && offset.x > 15);
    const swipeLeft =
      offset.x < -SWIPE_POSITION_THRESHOLD ||
      (velocity.x < -SWIPE_VELOCITY_THRESHOLD && offset.x < -15);

    if (noThrow) {
      // Karusel modu: ONCE callback cagir (flash onlenir), SONRA snap-back
      if (swipeRight) onSwipeRight();
      else if (swipeLeft) onSwipeLeft();
      // Snap-back (eger kart hala mount ise gorulur)
      controls.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      });
      return;
    }

    if (swipeRight) {
      await controls.start({
        x: THROW_DISTANCE,
        rotate: ROTATION_RANGE + 10,
        opacity: 0,
        transition: { duration: THROW_DURATION, ease: [0.16, 1, 0.3, 1] },
      });
      onSwipeRight();
    } else if (swipeLeft) {
      await controls.start({
        x: -THROW_DISTANCE,
        rotate: -(ROTATION_RANGE + 10),
        opacity: 0,
        transition: { duration: THROW_DURATION, ease: [0.16, 1, 0.3, 1] },
      });
      onSwipeLeft();
    } else {
      // Snap back — very gentle
      await controls.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 150, damping: 18, mass: 1.5 },
      });
    }
  };

  const triggerSwipe = useCallback(
    async (direction: "left" | "right") => {
      if (disabled && direction === "right") return;
      const dir = direction === "right" ? 1 : -1;
      await controls.start({
        x: dir * THROW_DISTANCE,
        rotate: dir * (ROTATION_RANGE + 10),
        opacity: 0,
        transition: { duration: THROW_DURATION * 1.1, ease: [0.16, 1, 0.3, 1] },
      });
      if (direction === "right") onSwipeRight();
      else onSwipeLeft();
    },
    [controls, disabled, onSwipeRight, onSwipeLeft]
  );

  useEffect(() => {
    if (cardRef.current) {
      (cardRef.current as HTMLDivElement & { triggerSwipe?: typeof triggerSwipe }).triggerSwipe = triggerSwipe;
    }
  }, [triggerSwipe]);

  return (
    <motion.div
      ref={cardRef}
      data-tinder-card
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        zIndex: 50,
        touchAction: "none",
      }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={false}
    >
      <motion.div
        className="absolute inset-0 rounded-[28px] z-[5] pointer-events-none"
        style={{ backgroundColor: rightTint }}
      />
      <motion.div
        className="absolute inset-0 rounded-[28px] z-[5] pointer-events-none"
        style={{ backgroundColor: leftTint }}
      />

      {children}

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
   CARD SHELLS
   ═══════════════════════════════════════════════════════════════ */

function CardShell({ gradient, glow, children }: { gradient: string; glow: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative w-full h-full rounded-[28px] overflow-hidden shadow-2xl", glow)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full bg-white/8 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
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
      <div className="text-[64px] mb-1 drop-shadow-lg">{brand.emoji}</div>
      <h2 className="text-[26px] font-black text-center leading-tight drop-shadow-sm">{brand.name}</h2>
      <div className="flex items-center gap-2 mt-3">
        <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-[12px] font-bold border border-white/20 flex items-center gap-1.5">
          <GiftIcon className="w-3 h-3" />
          {brand.giftCount} hediye
        </span>
      </div>
      <div className="flex items-center gap-1 mt-6 text-white/40 text-[13px]">
        <span>← Kaydir →</span>
        <span>urunleri kesfet</span>
      </div>
    </CardShell>
  );
}

function ProductContent({ gift, colorIndex, onSend }: { gift: Gift; colorIndex: number; onSend?: () => void }) {
  const colors = PRODUCT_COLOR_PALETTE[colorIndex % PRODUCT_COLOR_PALETTE.length];
  return (
    <CardShell gradient={colors.bg} glow={colors.glow}>
      <div className="text-[56px] mb-1 drop-shadow-lg">{gift.image}</div>
      <h2 className="text-[22px] font-black text-center leading-tight drop-shadow-sm">{gift.name}</h2>
      <p className="text-white/60 text-[13px] font-semibold mt-0.5">{gift.partnerName}</p>
      <p className="text-white/40 text-[11px] mt-1 text-center max-w-[220px]">
        {gift.description || ""}
      </p>
      {/* Yeşil Gönder butonu — kart içinde */}
      {onSend && (
        <button
          onClick={(e) => { e.stopPropagation(); onSend(); }}
          className="mt-3 px-8 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[14px] font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Gönder
        </button>
      )}
    </CardShell>
  );
}

function MiniCardContent({ gradient, emoji, label }: { gradient: string; emoji: string; label: string }) {
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
   DOT INDICATORS — pure CSS, no framer-motion layout
   ═══════════════════════════════════════════════════════════════ */

function ProductCounter({ total, current }: { total: number; current: number }) {
  return (
    <span className="text-[13px] font-bold text-muted/50 tabular-nums">
      {current + 1}/{total}
    </span>
  );
}

function VerticalDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  return (
    <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-[5px] z-[60]">
      {Array.from({ length: total }, (_, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={idx}
            style={{
              width: 6,
              height: isActive ? 20 : 6,
              borderRadius: 3,
              backgroundColor: isActive ? "var(--color-primary, #E8364F)" : "rgba(0,0,0,0.15)",
              transition: "all 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BREADCRUMB
   ═══════════════════════════════════════════════════════════════ */
function LevelBreadcrumb({ level, brandName, onBack }: { level: "brands" | "products"; brandName?: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-2 h-8">
      {level === "products" ? (
        <>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-sm text-[12px] font-bold text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Markalar
          </button>
          <span className="text-[12px] font-bold text-foreground">› {brandName}</span>
        </>
      ) : (
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 text-[12px] font-bold text-primary">
          <Store className="w-3.5 h-3.5" />
          Markalari Kesfet
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STACK CARD WRAPPER — pure CSS, only Y transform (no X shift)
   ═══════════════════════════════════════════════════════════════ */
function StackCardCSS({ index, children }: { index: number; children: React.ReactNode }) {
  const scale = 1 - (index + 1) * 0.05;
  const yOffset = (index + 1) * 12;
  const opacity = index === 0 ? 0.85 : index === 1 ? 0.55 : 0.3;

  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translateY(${yOffset}px) scale(${scale})`,
        opacity,
        zIndex: 40 - index,
        transition: "transform 0.9s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.9s cubic-bezier(0.25, 1, 0.5, 1)",
        transformOrigin: "center top",
      }}
    >
      {children}
    </div>
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
  const [slideOut, setSlideOut] = useState<"up" | "down" | null>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchHandled = useRef(false);
  const verticalLock = useRef(false);
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

  /* ── Products for selected brand ── */
  const brandProducts = useMemo(() => {
    if (!selectedBrandId) return [];
    return gifts.filter((g) => g.partnerId === selectedBrandId);
  }, [gifts, selectedBrandId]);

  /* ═══════════════════════════════════════════════════════════════
     LEVEL TRANSITIONS (tanimlar goVertical'dan ONCE olmali)
     ═══════════════════════════════════════════════════════════════ */
  const enterBrand = useCallback((brand: Brand) => {
    setIsAnimating(true);
    setSelectedBrandId(brand.id);
    setProductIndex(0);
    setTimeout(() => {
      setLevel("products");
      setTimeout(() => setIsAnimating(false), 600);
    }, 50);
  }, []);

  const backToBrands = useCallback(() => {
    setIsAnimating(true);
    setLevel("brands");
    setSelectedBrandId(null);
    setProductIndex(0);
    setTimeout(() => setIsAnimating(false), 600);
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     VERTICAL NAVIGATION — ALWAYS changes BRAND, never product

     Marka seviyesinde: markalar arasi gec
     Urun seviyesinde: markalara geri don
     ═══════════════════════════════════════════════════════════════ */
  const goVertical = useCallback(
    (direction: "up" | "down") => {
      if (isAnimating || verticalLock.current) return;

      if (level === "brands") {
        // Markalar arasi gecis — ANIMASYONLU
        const maxIdx = brands.length - 1;
        const canGo =
          (direction === "up" && brandIndex < maxIdx) ||
          (direction === "down" && brandIndex > 0);

        if (!canGo) return;

        verticalLock.current = true;

        // 1) Slide-out animasyonu baslat
        setSlideOut(direction);

        // 2) Animasyon ortasinda index degistir (kart gozden kaybolunca)
        setTimeout(() => {
          setBrandIndex((i) => direction === "up" ? i + 1 : i - 1);
          setSlideOut(null); // yeni kart pozisyonunda gorunur
        }, VERTICAL_SLIDE_MS);

        // 3) Debounce kilidi
        setTimeout(() => { verticalLock.current = false; }, VERTICAL_DEBOUNCE_MS);
      } else {
        // Urun seviyesinde dikey = markalara geri don
        verticalLock.current = true;
        setSlideOut(direction);
        setTimeout(() => {
          backToBrands();
          setSlideOut(null);
        }, VERTICAL_SLIDE_MS);
        setTimeout(() => { verticalLock.current = false; }, VERTICAL_DEBOUNCE_MS);
      }
    },
    [isAnimating, level, brands.length, brandIndex, backToBrands]
  );

  /* ═══════════════════════════════════════════════════════════════
     POINTER EVENT CAPTURE — direction lock BEFORE framer-motion

     Sorun: Parmak yukarı kaydırırken doğal olarak 1-3px yatay hareket
     oluyor. Framer-motion drag="x" bunu alıp kartı sağa/sola kaydırıyor.

     Çözüm: Pointer event capture phase'de yönü tespit et. Dikey algılanırsa
     stopPropagation ile framer-motion'a olayın ulaşmasını engelle.
     ═══════════════════════════════════════════════════════════════ */
  const gestureDir = useRef<"none" | "vertical" | "horizontal">("none");

  const handlePointerDownCapture = useCallback((e: React.PointerEvent) => {
    gestureDir.current = "none";
    touchStartY.current = e.clientY;
    touchStartX.current = e.clientX;
    touchHandled.current = false;
  }, []);

  const handlePointerMoveCapture = useCallback(
    (e: React.PointerEvent) => {
      const dy = touchStartY.current - e.clientY;
      const dx = touchStartX.current - e.clientX;
      const absDy = Math.abs(dy);
      const absDx = Math.abs(dx);

      // Yön kilitlenmedi ise: 8px sonra karar ver
      if (gestureDir.current === "none" && (absDy > 8 || absDx > 8)) {
        gestureDir.current = absDy >= absDx ? "vertical" : "horizontal";
      }

      // Dikey kilitlendiyse: framer-motion'a ULAŞMASIN
      if (gestureDir.current === "vertical") {
        e.stopPropagation(); // capture phase — framer-motion asla görmez

        if (!touchHandled.current && absDy > VERTICAL_DRAG_THRESHOLD) {
          touchHandled.current = true;
          goVertical(dy > 0 ? "up" : "down");
        }
      }
      // "horizontal" ise: hiçbir şey yapma, framer-motion halleder
    },
    [goVertical]
  );

  const handlePointerUpCapture = useCallback(() => {
    gestureDir.current = "none";
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 30) {
        goVertical(e.deltaY > 0 ? "up" : "down");
      }
    },
    [goVertical]
  );

  /* ── Native touchmove preventDefault — sayfa scroll engelle ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventScroll = (e: TouchEvent) => { e.preventDefault(); };
    el.addEventListener("touchmove", preventScroll, { passive: false });
    return () => { el.removeEventListener("touchmove", preventScroll); };
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     SWIPE HANDLERS
     ═══════════════════════════════════════════════════════════════ */

  // -- BRANDS --
  // Saga veya sola kaydir = o markanin urunlerine gir
  const handleBrandSwipeRight = useCallback(
    (idx: number) => {
      const brand = brands[idx];
      if (brand) enterBrand(brand);
    },
    [brands, enterBrand]
  );

  const handleBrandSwipeLeft = useCallback(() => {
    // Sola kaydir = ayni marka, urunlere gir
    const brand = brands[brandIndex];
    if (brand) enterBrand(brand);
  }, [brands, brandIndex, enterBrand]);

  // -- PRODUCTS (karusel: sola = sonraki, saga = onceki) --
  const handleProductNext = useCallback(() => {
    // SONRAKI urun (sola kaydir). Son urundeyse DUR.
    if (productIndex < brandProducts.length - 1) {
      setProductIndex((i) => i + 1);
    }
  }, [productIndex, brandProducts.length]);

  const handleProductPrev = useCallback(() => {
    // ONCEKI urun (saga kaydir). Ilk urundeyse DUR.
    if (productIndex > 0) {
      setProductIndex((i) => i - 1);
    }
  }, [productIndex]);

  // -- GONDER butonu (sadece tiklamayla) --
  const handleSendGift = useCallback(() => {
    const gift = brandProducts[productIndex];
    if (gift && !disabled) onSwipeRight(gift);
  }, [brandProducts, productIndex, disabled, onSwipeRight]);

  /* ── Button swipe triggers ── */
  const triggerButtonSwipe = useCallback((direction: "left" | "right") => {
    const topCard = containerRef.current?.querySelector("[data-tinder-card]") as HTMLDivElement & { triggerSwipe?: (d: "left" | "right") => void } | null;
    if (topCard?.triggerSwipe) {
      topCard.triggerSwipe(direction);
    }
  }, []);

  /* ── Visible stacks ── */
  const visibleBrands = brands.slice(brandIndex, brandIndex + MAX_VISIBLE);
  const visibleProducts = brandProducts.slice(productIndex, productIndex + MAX_VISIBLE);
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
        <div className="relative" style={{ height: "min(400px, 56dvh)" }}>
          {/* Vertical dots — always shows BRANDS */}
          <VerticalDots total={brands.length} current={brandIndex} />

          <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            style={{ touchAction: "none" }}
            onPointerDownCapture={handlePointerDownCapture}
            onPointerMoveCapture={handlePointerMoveCapture}
            onPointerUpCapture={handlePointerUpCapture}
            onWheel={handleWheel}
          >
            {level === "brands" ? (
              /* ═══════ BRANDS LAYER ═══════ */
              <div
                className="absolute inset-0"
                style={{
                  transform: slideOut
                    ? `translateY(${slideOut === "up" ? "-110%" : "110%"})`
                    : "translateY(0)",
                  opacity: slideOut ? 0 : 1,
                  transition: slideOut
                    ? `transform ${VERTICAL_SLIDE_MS}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${VERTICAL_SLIDE_MS}ms ease-out`
                    : "none",
                }}
              >
                {visibleBrands.slice(1).map((brand, i) => (
                  <StackCardCSS key={`bs-${brand.id}`} index={i}>
                    <MiniCardContent gradient={brand.gradient.bg} emoji={brand.emoji} label={brand.name} />
                  </StackCardCSS>
                ))}
                {visibleBrands[0] && (
                  <TinderCard
                    key={`bt-${visibleBrands[0].id}-${brandIndex}`}
                    onSwipeRight={() => handleBrandSwipeRight(brandIndex)}
                    onSwipeLeft={handleBrandSwipeLeft}
                    noThrow
                    rightLabel="URUNLER"
                    leftLabel="URUNLER"
                    rightIcon={GiftIcon}
                    leftIcon={GiftIcon}
                    rightColor="teal"
                    leftColor="teal"
                  >
                    <BrandContent brand={visibleBrands[0]} />
                  </TinderCard>
                )}
              </div>
            ) : (
              /* ═══════ PRODUCTS LAYER ═══════ */
              <div
                className="absolute inset-0"
                style={{
                  transform: slideOut
                    ? `translateY(${slideOut === "up" ? "-110%" : "110%"})`
                    : "translateY(0)",
                  opacity: slideOut ? 0 : 1,
                  transition: slideOut
                    ? `transform ${VERTICAL_SLIDE_MS}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${VERTICAL_SLIDE_MS}ms ease-out`
                    : "none",
                }}
              >
                {brandProducts[productIndex] && (
                  <TinderCard
                    key={`pt-${selectedBrandId}`}
                    onSwipeRight={handleProductPrev}
                    onSwipeLeft={handleProductNext}
                    noThrow
                    rightLabel="ONCEKI"
                    leftLabel="SONRAKI"
                    rightIcon={ChevronRight}
                    leftIcon={ChevronRight}
                    rightColor="orange"
                    leftColor="teal"
                  >
                    <ProductContent gift={brandProducts[productIndex]} colorIndex={productIndex} onSend={handleSendGift} />
                  </TinderCard>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL DOTS — sadece urun seviyesinde goster ── */}
      <div className="mt-2 flex items-center justify-center" style={{ minHeight: 12 }}>
        {level === "products" && (
          <ProductCounter total={brandProducts.length} current={productIndex} />
        )}
      </div>

    </div>
  );
}
