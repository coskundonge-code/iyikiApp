"use client";

import { Heart, Calendar, TrendingUp } from "lucide-react";
import { MOCK_SPONSORS, MOCK_GIFTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function SponsorCampaignsPage() {
  const sponsor = MOCK_SPONSORS[0];
  const sponsoredGifts = MOCK_GIFTS.filter((g) => g.sponsorId === sponsor.id);

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
      </div>
    </div>
  );
}
