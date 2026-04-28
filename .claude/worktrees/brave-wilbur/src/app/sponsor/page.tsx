"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, TrendingUp, DollarSign, Gift } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SponsorDashboard() {
  const { sponsors, isLoading, loadAdminData } = useAppStore();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  const sponsor = sponsors[0];

  if (!sponsor) {
    return <div className="p-8 text-center text-muted text-sm">Sponsor bulunamadı</div>;
  }

  const usedPct = Math.round((sponsor.spent / sponsor.budget) * 100);

  const stats = [
    { icon: DollarSign, label: "Toplam Bütçe", value: `${(sponsor.budget / 1000).toFixed(0)}K₺`, color: "text-green-500", bg: "bg-green-50" },
    { icon: TrendingUp, label: "Harcanan", value: `${(sponsor.spent / 1000).toFixed(1)}K₺`, color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Gift, label: "Sponsorlanan", value: sponsor.giftsSponsoredCount.toLocaleString(), color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Heart, label: "Mutlu Edilen", value: Math.round(sponsor.giftsSponsoredCount * 0.78).toLocaleString(), color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold">{sponsor.name}</h2>
        <p className="text-white/80 text-sm mt-1">Sponsor Dashboard</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/80">Bütçe Kullanımı</span>
            <span className="font-semibold">%{usedPct}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-white/60 text-xs mt-1">
            {sponsor.spent.toLocaleString("tr-TR")}₺ / {sponsor.budget.toLocaleString("tr-TR")}₺
          </p>
        </div>
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

      {/* Campaign Info */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground text-sm mb-3">Kampanya Detayları</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Kampanya Dönemi</span>
            <span className="text-foreground">
              {new Date(sponsor.campaignStart).toLocaleDateString("tr-TR")} — {new Date(sponsor.campaignEnd).toLocaleDateString("tr-TR")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Durum</span>
            <span className="text-green-600 font-medium">Aktif</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Hediye Başı Maliyet</span>
            <span className="text-foreground">{(sponsor.spent / Math.max(sponsor.giftsSponsoredCount, 1)).toFixed(2)}₺</span>
          </div>
        </div>
      </div>
    </div>
  );
}
