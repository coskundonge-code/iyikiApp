"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Gift, TrendingUp, MapPin } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatRelativeTime, getStatusLabel, getStatusColor, cn } from "@/lib/utils";

export default function PartnerDashboard() {
  const { partners, gifts, giftActions, isLoading, loadAdminData } = useAppStore();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  const partner = partners[0];

  if (!partner) {
    return <div className="p-8 text-center text-muted text-sm">Partner bulunamadı</div>;
  }

  const partnerGifts = gifts.filter((g) => g.partnerId === partner.id);
  const partnerActions = giftActions.filter((a) => partnerGifts.some((g) => g.id === a.giftId));
  const redeemRate = partner.totalGifts > 0 ? Math.round((partner.totalRedeemed / partner.totalGifts) * 100) : 0;

  const stats = [
    { icon: Package, label: "Aktif Ürün", value: partnerGifts.length, color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Gift, label: "Toplam Gönderim", value: partner.totalGifts, color: "text-green-500", bg: "bg-green-50" },
    { icon: TrendingUp, label: "Redeem Oranı", value: `%${redeemRate}`, color: "text-amber-500", bg: "bg-amber-50" },
    { icon: MapPin, label: "Aktif Şube", value: partner.branches.length, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold">{partner.name}</h2>
        <p className="text-white/80 text-sm mt-1">Partner Dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Products */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Ürünlerim</h3>
        </div>
        <div className="divide-y divide-border">
          {partnerGifts.map((gift) => (
            <div key={gift.id} className="flex items-center gap-3 p-3 hover:bg-card-hover transition-colors">
              <span className="text-2xl">{gift.image}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{gift.name}</p>
                <p className="text-xs text-muted">{gift.category}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold", gift.stock > 50 ? "text-green-600" : gift.stock > 10 ? "text-amber-600" : "text-red-600")}>
                  {gift.stock} adet
                </p>
                <p className="text-[10px] text-muted">stokta</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Redeems */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Son Kullanımlar</h3>
        </div>
        <div className="divide-y divide-border">
          {partnerActions.length > 0 ? partnerActions.map((action) => (
            <div key={action.id} className="flex items-center gap-3 p-3">
              <span className="text-xl">{action.gift.image}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{action.gift.name}</p>
                <p className="text-xs text-muted">{action.receiverName || action.receiverPhone}</p>
              </div>
              <div className="text-right">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", getStatusColor(action.status))}>
                  {getStatusLabel(action.status)}
                </span>
                <p className="text-[10px] text-muted mt-0.5">{formatRelativeTime(action.createdAt)}</p>
              </div>
            </div>
          )) : (
            <p className="p-4 text-sm text-muted text-center">Henüz kullanım yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
