"use client";

import { useEffect } from "react";
import { Building2, MapPin } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminPartnersPage() {
  const { partners, isLoading, loadAdminData } = useAppStore();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {partners.map((partner) => {
          const redeemRate = partner.totalGifts > 0
            ? Math.round((partner.totalRedeemed / partner.totalGifts) * 100)
            : 0;

          return (
            <div key={partner.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{partner.name}</h3>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    partner.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {partner.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-foreground">{partner.totalGifts}</p>
                  <p className="text-[10px] text-muted">Toplam</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-600">{partner.totalRedeemed}</p>
                  <p className="text-[10px] text-muted">Kullanılan</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-amber-600">%{redeemRate}</p>
                  <p className="text-[10px] text-muted">Oran</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Şubeler ({partner.branches.length})
                </p>
                <div className="space-y-1">
                  {partner.branches.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 rounded-lg">
                      <span className="text-foreground">{b.name}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        b.stockStatus === "available" ? "bg-green-100 text-green-700" :
                        b.stockStatus === "low" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {b.stockStatus === "available" ? "Stok Var" : b.stockStatus === "low" ? "Azalıyor" : "Tükendi"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
