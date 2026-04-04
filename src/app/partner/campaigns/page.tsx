"use client";

import { Calendar, Gift, Plus } from "lucide-react";
import toast from "react-hot-toast";

const CAMPAIGNS = [
  {
    id: "c1",
    name: "Anneler Günü Özel",
    product: "Latte",
    emoji: "☕",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    status: "upcoming",
    totalBudget: 500,
    used: 0,
  },
  {
    id: "c2",
    name: "Bahar Kampanyası",
    product: "Frappuccino",
    emoji: "🧋",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "active",
    totalBudget: 300,
    used: 180,
  },
];

export default function PartnerCampaignsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Kampanyalar</h3>
        <button
          onClick={() => toast("Kampanya oluşturma yakında aktif olacak", { icon: "📢" })}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Kampanya
        </button>
      </div>

      <div className="space-y-3">
        {CAMPAIGNS.map((campaign) => (
          <div key={campaign.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{campaign.emoji}</span>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{campaign.name}</h4>
                  <p className="text-xs text-muted">{campaign.product}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                campaign.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                {campaign.status === "active" ? "Aktif" : "Yaklaşan"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              <Calendar className="w-3 h-3" />
              <span>{new Date(campaign.startDate).toLocaleDateString("tr-TR")} — {new Date(campaign.endDate).toLocaleDateString("tr-TR")}</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Kullanım</span>
                <span className="font-medium text-foreground">{campaign.used} / {campaign.totalBudget}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(campaign.used / campaign.totalBudget) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
