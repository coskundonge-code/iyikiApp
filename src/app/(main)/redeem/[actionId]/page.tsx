"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, QrCode, Check, Navigation, Copy } from "lucide-react";
import QRCode from "qrcode";
import { useAppStore } from "@/lib/store";
import { cn, formatTimeRemaining, getExpiryPercentage } from "@/lib/utils";
import toast from "react-hot-toast";

export default function RedeemPage() {
  const router = useRouter();
  const params = useParams();
  const actionId = params.actionId as string;

  const giftActions = useAppStore((s) => s.giftActions);
  const redeemGift = useAppStore((s) => s.redeemGift);
  const partners = useAppStore((s) => s.partners);
  const loadAdminData = useAppStore((s) => s.loadAdminData);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const action = giftActions.find((a) => a.id === actionId);

  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [expiryPct, setExpiryPct] = useState(100);

  useEffect(() => {
    if (!action) return;
    const update = () => {
      setTimeLeft(formatTimeRemaining(action.expiresAt));
      setExpiryPct(getExpiryPercentage(action.createdAt, action.expiresAt));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [action]);

  useEffect(() => {
    if (action?.redeemCode) {
      QRCode.toDataURL(action.redeemCode, {
        width: 200,
        margin: 2,
        color: { dark: "#1c1917", light: "#ffffff" },
      }).then(setQrDataUrl);
    }
  }, [action?.redeemCode]);

  if (!action) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted">Hediye bulunamadı</p>
        <button onClick={() => router.push("/home")} className="text-primary text-sm mt-2 underline">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const partner = partners.find((p) => p.id === action.gift.partnerId);
  const branches = partner?.branches || [];
  const branch = branches.find((b) => b.id === selectedBranch);

  const handleShowQR = (branchId: string) => {
    setSelectedBranch(branchId);
    setShowQR(true);
  };

  const handleRedeem = async () => {
    if (!branch) return;
    setIsRedeeming(true);
    const success = await redeemGift(actionId, branch.id, branch.name);
    if (success) {
      setRedeemed(true);
      toast.success("Hediye kullanıldı! Afiyet olsun!");
    } else {
      toast.error("Bir hata oluştu");
    }
    setIsRedeeming(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(action.redeemCode);
    toast.success("Kod kopyalandı!");
  };

  if (redeemed) {
    return (
      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4"
          >
            <Check className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Afiyet Olsun!</h2>
          <p className="text-muted text-sm">
            {action.gift.name} {action.gift.image} {branch?.name}'de kullanıldı
          </p>
          <button
            onClick={() => router.push("/home")}
            className="mt-6 px-6 py-3 bg-foreground text-background rounded-xl font-medium text-sm"
          >
            Ana Sayfaya Dön
          </button>
        </motion.div>
      </div>
    );
  }

  if (action.status !== "pending") {
    return (
      <div className="px-4 py-8 text-center">
        <div className="text-4xl mb-3">{action.gift.image}</div>
        <p className="text-muted text-sm">Bu hediye artık kullanılamaz ({action.status})</p>
        <button onClick={() => router.push("/home")} className="text-primary text-sm mt-2 underline">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <button
        onClick={() => {
          if (showQR) setShowQR(false);
          else router.back();
        }}
        className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {showQR ? "Şubelere Dön" : "Geri"}
      </button>

      {!showQR ? (
        <>
          {/* Gift Detail */}
          <div className="bg-card rounded-2xl border border-border p-5 text-center">
            <div className="text-5xl mb-3">{action.gift.image}</div>
            <h2 className="text-xl font-bold text-foreground">{action.gift.name}</h2>
            <p className="text-sm text-muted mt-1">{action.gift.partnerName}</p>

            <div className="mt-4 p-3 bg-rose-50 rounded-xl">
              <p className="text-sm text-foreground font-medium">
                {action.senderName} sana ısmarladı
              </p>
              {action.note && (
                <p className="text-sm text-muted mt-1 italic">"{action.note}"</p>
              )}
            </div>

            {/* Timer */}
            <div className="mt-4">
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted mb-2">
                <Clock className="w-4 h-4" />
                <span>{timeLeft} kaldı</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all progress-animated",
                    expiryPct > 50 ? "bg-green-500" : expiryPct > 20 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${expiryPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Branches */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">En Yakın Şubeler</h3>
            </div>
            <div className="space-y-2">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleShowQR(b.id)}
                  className="w-full flex items-center justify-between p-3 bg-card rounded-xl border border-border hover:bg-card-hover transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted">{b.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      b.stockStatus === "available" ? "bg-green-100 text-green-700" :
                      b.stockStatus === "low" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {b.stockStatus === "available" ? "Var" : b.stockStatus === "low" ? "Az" : "Yok"}
                    </span>
                    <Navigation className="w-4 h-4 text-muted" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* QR Code Display */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 text-center space-y-4"
        >
          <div>
            <h3 className="font-bold text-foreground">Kasada Göster</h3>
            <p className="text-xs text-muted mt-1">{branch?.name}</p>
          </div>

          {qrDataUrl && (
            <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-border">
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-muted">veya bu kodu kasiyere söyle:</p>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-border"
            >
              <span className="font-mono font-bold text-lg tracking-wider text-foreground">
                {action.redeemCode}
              </span>
              <Copy className="w-4 h-4 text-muted" />
            </button>
          </div>

          <button
            onClick={handleRedeem}
            disabled={isRedeeming}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl disabled:opacity-50 transition-all shadow-lg"
          >
            {isRedeeming ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Kullanıldı
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
