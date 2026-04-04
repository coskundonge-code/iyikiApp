"use client";

import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function SponsorImpactPage() {
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

  const cityData = [
    { city: "Istanbul", count: 1200, pct: 52 },
    { city: "Ankara", count: 450, pct: 20 },
    { city: "Izmir", count: 350, pct: 15 },
    { city: "Bursa", count: 180, pct: 8 },
    { city: "Diğer", count: 120, pct: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
        <h3 className="font-bold text-foreground text-lg">Etki Raporu</h3>
        <p className="text-sm text-muted mt-1">{sponsor.name} sponsorluğunda</p>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{sponsor.giftsSponsoredCount.toLocaleString()}</p>
            <p className="text-[10px] text-muted">Toplam Jest</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{Math.round(sponsor.giftsSponsoredCount * 0.78).toLocaleString()}</p>
            <p className="text-[10px] text-muted">Kullanılan</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{Math.round(sponsor.giftsSponsoredCount * 0.15).toLocaleString()}</p>
            <p className="text-[10px] text-muted">Askıda</p>
          </div>
        </div>
      </div>

      {/* City Distribution */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Şehir Dağılımı
        </h3>
        <div className="space-y-3">
          {cityData.map((d) => (
            <div key={d.city}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{d.city}</span>
                <span className="text-muted">{d.count.toLocaleString()} jest (%{d.pct})</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground text-sm mb-3">Marka Etkisi</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Hediye Başı Maliyet</span>
            <span className="text-foreground font-medium">
              {(sponsor.spent / Math.max(sponsor.giftsSponsoredCount, 1)).toFixed(2)}₺
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">CPM Karşılaştırması</span>
            <span className="text-green-600 font-medium">3.5x daha etkili</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Duygusal Hatırlanırlık</span>
            <span className="text-foreground font-medium">%89</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Marka Algısı Artışı</span>
            <span className="text-green-600 font-medium">+24 puan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
