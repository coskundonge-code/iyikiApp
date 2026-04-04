"use client";

import { useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PartnerBranchesPage() {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Şube Yönetimi</h3>
        <button
          onClick={() => toast("Şube ekleme yakında aktif olacak", { icon: "📍" })}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Şube
        </button>
      </div>

      <div className="space-y-3">
        {partner.branches.map((branch) => (
          <div key={branch.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{branch.name}</h4>
                  <p className="text-xs text-muted">{branch.address}</p>
                </div>
              </div>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                branch.stockStatus === "available" ? "bg-green-100 text-green-700" :
                branch.stockStatus === "low" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              )}>
                {branch.stockStatus === "available" ? "Stok Var" :
                 branch.stockStatus === "low" ? "Azalıyor" : "Tükendi"}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted">
              <span>Enlem: {branch.lat.toFixed(4)}</span>
              <span>Boylam: {branch.lng.toFixed(4)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
