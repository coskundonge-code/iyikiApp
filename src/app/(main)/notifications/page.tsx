"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Gift, Check, Clock, Heart, AlertCircle, CheckCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  gift_received: Gift,
  gift_redeemed: Check,
  gift_expiring: Clock,
  gift_expired: AlertCircle,
  gift_to_pool: Heart,
  system: Bell,
  premium: Check,
};

const COLOR_MAP: Record<string, string> = {
  gift_received: "bg-blue-100 text-blue-600",
  gift_redeemed: "bg-green-100 text-green-600",
  gift_expiring: "bg-amber-100 text-amber-600",
  gift_expired: "bg-red-100 text-red-600",
  gift_to_pool: "bg-purple-100 text-purple-600",
  system: "bg-gray-100 text-gray-600",
  premium: "bg-amber-100 text-amber-600",
};

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllRead);
  const unreadCount = useAppStore((s) => s.unreadCount);

  const handleClick = (notifId: string, actionId?: string) => {
    markNotificationRead(notifId);
    if (actionId) {
      router.push(`/redeem/${actionId}`);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-card-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Bildirimler</h2>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-primary font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tümünü Oku
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notif, i) => {
          const Icon = ICON_MAP[notif.type] || Bell;
          const colorClass = COLOR_MAP[notif.type] || "bg-gray-100 text-gray-600";

          return (
            <motion.button
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleClick(notif.id, notif.actionId)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-xl border transition-colors text-left",
                notif.isRead
                  ? "bg-card border-border"
                  : "bg-blue-50/50 border-blue-100"
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-medium text-foreground", !notif.isRead && "font-semibold")}>
                    {notif.title}
                  </p>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">{notif.message}</p>
                <p className="text-[10px] text-muted mt-1">{formatRelativeTime(notif.createdAt)}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-border mx-auto mb-3" />
          <p className="text-muted text-sm">Henüz bildirimin yok</p>
        </div>
      )}
    </div>
  );
}
