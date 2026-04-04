"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function SponsorCampaignsPage() {
  const { sponsors, gifts, isLoading, loadAdminData } = useAppStore();

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

  const sponsoredGifts = gifts.filter((g) => g.sponsorId === sponsor.id);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Sponsorlanan Hediyeler</h3>

      <div className="space-y-3">
        {sponsoredGifts.map((gift) => (
          <div key={gift.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{gift.image}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{gift.name}</h4>
                <p className="text-xs text-muted">{gift.partnerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{gift.stock} adet</p>
                <p className="text-[10px] text-muted">kalan stok</p>
              </div>
            </div>
            <div className="mt-3 p-2.5 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700">
                Her hediye gönderiminde: "<span className="font-medium">Bu {gift.name.toLowerCase()} {sponsor.name} sponsorluğundadır</span>" gösterilir.
              </p>
            </div>
          </div>
        ))}
        {sponsoredGifts.length === 0 && (
          <div className="p-8 text-center text-muted text-sm">Sponsorlanan hediye bulunamadı</div>
        )}
      </div>
    </div>
  );
}
