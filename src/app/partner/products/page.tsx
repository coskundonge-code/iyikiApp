"use client";

import { useEffect } from "react";
import { Plus, Edit3 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PartnerProductsPage() {
  const { gifts, partners, isLoading, loadAdminData } = useAppStore();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  const partner = partners[0];
  const partnerGifts = partner ? gifts.filter((g) => g.partnerId === partner.id) : gifts;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Ürün Yönetimi</h3>
        <button
          onClick={() => toast("Ürün ekleme yakında aktif olacak", { icon: "📦" })}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {partnerGifts.map((gift) => (
            <div key={gift.id} className="flex items-center gap-3 p-4 hover:bg-card-hover transition-colors">
              <span className="text-3xl">{gift.image}</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">{gift.name}</h4>
                <p className="text-xs text-muted mt-0.5">{gift.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                    {gift.category}
                  </span>
                  {gift.isPremium && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                      PRO
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-lg font-bold",
                  gift.stock > 50 ? "text-green-600" : gift.stock > 10 ? "text-amber-600" : "text-red-600"
                )}>
                  {gift.stock}
                </p>
                <p className="text-[10px] text-muted">stok</p>
              </div>
              <button
                onClick={() => toast("Düzenleme yakında aktif olacak", { icon: "✏️" })}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-muted" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
