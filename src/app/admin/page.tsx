"use client";

import { motion } from "framer-motion";
import { Users, Gift, ShieldAlert, Heart, TrendingUp, ArrowUpRight } from "lucide-react";
import { MOCK_USERS, MOCK_GIFT_ACTIONS, MOCK_FRAUD_FLAGS, MOCK_GIFTS } from "@/lib/mock-data";
import { formatRelativeTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const totalUsers = MOCK_USERS.filter((u) => u.role === "user").length;
  const totalGifts = MOCK_GIFT_ACTIONS.length;
  const redeemedGifts = MOCK_GIFT_ACTIONS.filter((a) => a.status === "claimed").length;
  const askidaGifts = MOCK_GIFT_ACTIONS.filter((a) => a.status === "social_pool" || a.status === "distributed").length;
  const openFraud = MOCK_FRAUD_FLAGS.filter((f) => !f.resolved).length;
  const redeemRate = totalGifts > 0 ? Math.round((redeemedGifts / totalGifts) * 100) : 0;

  const stats = [
    { icon: Users, label: "Toplam Kullanıcı", value: totalUsers, color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Gift, label: "Toplam Hediye", value: totalGifts, color: "text-green-500", bg: "bg-green-50" },
    { icon: TrendingUp, label: "Redeem Oranı", value: `%${redeemRate}`, color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Heart, label: "Askıda Jest", value: askidaGifts, color: "text-purple-500", bg: "bg-purple-50" },
    { icon: ShieldAlert, label: "Açık Fraud", value: openFraud, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Gift Actions */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Son Hediye İşlemleri</h3>
        </div>
        <div className="divide-y divide-border">
          {MOCK_GIFT_ACTIONS.slice(0, 10).map((action) => (
            <div key={action.id} className="flex items-center gap-3 p-3 hover:bg-card-hover transition-colors">
              <span className="text-xl">{action.gift.image}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  {action.senderName} → {action.receiverName || action.receiverPhone}
                </p>
                <p className="text-xs text-muted">{action.gift.name}</p>
              </div>
              <div className="text-right">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", getStatusColor(action.status))}>
                  {getStatusLabel(action.status)}
                </span>
                <p className="text-[10px] text-muted mt-0.5">{formatRelativeTime(action.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fraud Flags */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Son Fraud Bayrakları</h3>
          <span className="text-xs text-red-500 font-medium">{openFraud} açık</span>
        </div>
        <div className="divide-y divide-border">
          {MOCK_FRAUD_FLAGS.map((flag) => (
            <div key={flag.id} className="flex items-center gap-3 p-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                flag.severity === "high" ? "bg-red-100" : flag.severity === "medium" ? "bg-amber-100" : "bg-yellow-100"
              )}>
                <ShieldAlert className={cn(
                  "w-4 h-4",
                  flag.severity === "high" ? "text-red-600" : flag.severity === "medium" ? "text-amber-600" : "text-yellow-600"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{flag.type.toUpperCase()}</p>
                <p className="text-xs text-muted truncate">{flag.description}</p>
              </div>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                flag.resolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {flag.resolved ? "Çözüldü" : "Açık"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
