"use client";

import { useEffect } from "react";
import { BarChart3, TrendingUp, Gift, Users } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function PartnerReportsPage() {
  const { partners, isLoading, loadAdminData } = useAppStore();

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

  const redeemRate = Math.round((partner.totalRedeemed / partner.totalGifts) * 100);

  const weeklyData = [
    { day: "Pzt", gifts: 45, redeems: 38 },
    { day: "Sal", gifts: 52, redeems: 41 },
    { day: "Çar", gifts: 38, redeems: 30 },
    { day: "Per", gifts: 65, redeems: 55 },
    { day: "Cum", gifts: 78, redeems: 62 },
    { day: "Cmt", gifts: 92, redeems: 75 },
    { day: "Paz", gifts: 85, redeems: 70 },
  ];

  const maxGifts = Math.max(...weeklyData.map((d) => d.gifts));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <Gift className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{partner.totalGifts.toLocaleString()}</p>
          <p className="text-xs text-muted">Toplam Gönderim</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{partner.totalRedeemed.toLocaleString()}</p>
          <p className="text-xs text-muted">Kullanılan</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <BarChart3 className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">%{redeemRate}</p>
          <p className="text-xs text-muted">Redeem Oranı</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <Users className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{partner.branches.length}</p>
          <p className="text-xs text-muted">Aktif Şube</p>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground text-sm mb-4">Haftalık Gönderim & Kullanım</h3>
        <div className="flex items-end gap-2 h-40">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                <div
                  className="flex-1 bg-blue-200 rounded-t"
                  style={{ height: `${(d.gifts / maxGifts) * 100}%` }}
                />
                <div
                  className="flex-1 bg-green-400 rounded-t"
                  style={{ height: `${(d.redeems / maxGifts) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-blue-200 rounded" />
            <span className="text-[10px] text-muted">Gönderim</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-green-400 rounded" />
            <span className="text-[10px] text-muted">Kullanım</span>
          </div>
        </div>
      </div>
    </div>
  );
}
