"use client";

import { useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminFraudPage() {
  const { fraudFlags, isLoading, loadAdminData } = useAppStore();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  const openFlags = fraudFlags.filter((f) => !f.resolved);
  const resolvedFlags = fraudFlags.filter((f) => f.resolved);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{fraudFlags.length}</p>
          <p className="text-xs text-muted">Toplam Bayrak</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{openFlags.length}</p>
          <p className="text-xs text-red-600">Açık</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{resolvedFlags.length}</p>
          <p className="text-xs text-green-600">Çözülen</p>
        </div>
      </div>

      {/* Open Flags */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Açık Fraud Bayrakları
          </h3>
        </div>
        <div className="divide-y divide-border">
          {openFlags.map((flag) => (
            <div key={flag.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-bold uppercase",
                    flag.severity === "high" ? "bg-red-100 text-red-700" :
                    flag.severity === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-yellow-100 text-yellow-700"
                  )}>
                    {flag.severity}
                  </span>
                  <span className="text-sm font-medium text-foreground uppercase">{flag.type}</span>
                </div>
                <span className="text-[10px] text-muted">{formatRelativeTime(flag.createdAt)}</span>
              </div>
              <p className="text-xs text-muted">{flag.description}</p>
              <p className="text-[10px] text-muted">Kullanıcı: {flag.userId}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.success("Bayrak çözüldü olarak işaretlendi")}
                  className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors"
                >
                  Çözüldü İşaretle
                </button>
                <button
                  onClick={() => toast("Kullanıcı askıya alındı", { icon: "🚫" })}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  Kullanıcıyı Askıya Al
                </button>
              </div>
            </div>
          ))}
          {openFlags.length === 0 && (
            <div className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted">Tüm bayraklar çözüldü!</p>
            </div>
          )}
        </div>
      </div>

      {/* Resolved */}
      {resolvedFlags.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Çözülen Bayraklar
            </h3>
          </div>
          <div className="divide-y divide-border">
            {resolvedFlags.map((flag) => (
              <div key={flag.id} className="p-3 flex items-center gap-3 opacity-60">
                <AlertTriangle className="w-4 h-4 text-muted" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{flag.type.toUpperCase()} — {flag.userId}</p>
                  <p className="text-xs text-muted">{flag.description}</p>
                </div>
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  Çözüldü
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
