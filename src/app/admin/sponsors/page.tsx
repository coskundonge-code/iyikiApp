"use client";

import { useEffect } from "react";
import { Heart, TrendingUp } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminSponsorsPage() {
  const { sponsors, isLoading, loadAdminData } = useAppStore();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sponsors.map((sponsor) => {
          const usedPct = sponsor.budget > 0 ? Math.round((sponsor.spent / sponsor.budget) * 100) : 0;

          return (
            <div key={sponsor.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{sponsor.name}</h3>
                  <p className="text-xs text-muted">
                    {new Date(sponsor.campaignStart).toLocaleDateString("tr-TR")} — {new Date(sponsor.campaignEnd).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <span className={cn(
                  "ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  sponsor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {sponsor.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted">Bütçe Kullanımı</span>
                  <span className="font-semibold text-foreground">
                    {sponsor.spent.toLocaleString("tr-TR")}₺ / {sponsor.budget.toLocaleString("tr-TR")}₺
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-amber-500" : "bg-green-500"
                    )}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted mt-1">%{usedPct} kullanıldı</p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-lg font-bold text-foreground">{sponsor.giftsSponsoredCount.toLocaleString("tr-TR")}</p>
                  <p className="text-[10px] text-muted">Sponsorlanan hediye</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
