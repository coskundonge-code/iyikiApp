"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminGiftsPage() {
  const { gifts, isLoading, loadAdminData } = useAppStore();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 p-3 bg-gray-50 border-b border-border text-xs font-medium text-muted">
          <span></span>
          <span>Hediye</span>
          <span>Kategori</span>
          <span>Stok</span>
          <span>Sponsor</span>
          <span>Durum</span>
        </div>
        <div className="divide-y divide-border">
          {gifts.map((gift) => (
            <div key={gift.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center p-3 hover:bg-card-hover transition-colors">
              <span className="text-2xl">{gift.image}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{gift.name}</p>
                <p className="text-[10px] text-muted">{gift.partnerName}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                {gift.category}
              </span>
              <span className={cn(
                "text-sm font-semibold",
                gift.stock > 50 ? "text-green-600" : gift.stock > 10 ? "text-amber-600" : "text-red-600"
              )}>
                {gift.stock}
              </span>
              <span className="text-[10px] text-muted truncate max-w-[80px]">
                {gift.sponsorName || "—"}
              </span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                gift.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {gift.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
