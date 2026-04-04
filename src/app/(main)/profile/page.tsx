"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User, Settings, Bell, Star, LogOut, ChevronRight, ArrowUpRight,
  ArrowDownLeft, Heart, Shield, Edit3, Trash2, Trophy, Users as UsersIcon, Scale,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn, getInitials, getStatusLabel, getStatusColor, formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const giftActions = useAppStore((s) => s.giftActions);
  const logout = useAppStore((s) => s.logout);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || "");
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  if (!currentUser) return null;

  const sentGifts = giftActions.filter((a) => a.senderId === currentUser.id);
  const receivedGifts = giftActions.filter(
    (a) => a.receiverPhone === currentUser.phone || a.receiverId === currentUser.id
  );
  const askidaCount = sentGifts.filter(
    (a) => a.status === "social_pool" || a.status === "distributed"
  ).length;

  const handleSaveName = () => {
    updateProfile({ name: nameInput });
    setEditingName(false);
    toast.success("İsim güncellendi");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.success("Çıkış yapıldı");
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm">
            {getInitials(currentUser.name)}
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-primary text-sm font-medium">
                  Kaydet
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {currentUser.name || "İsimsiz"}
                </h2>
                <button onClick={() => setEditingName(true)}>
                  <Edit3 className="w-3.5 h-3.5 text-muted" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <Star className="w-3.5 h-3.5 text-secondary" />
              <span className="text-sm text-muted">
                İyi Ki Puanı: <span className="font-semibold text-foreground">{currentUser.iyikiScore}</span>
              </span>
              {currentUser.tier === "premium" && (
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  PRO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <ArrowUpRight className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{sentGifts.length}</p>
            <p className="text-[10px] text-muted">Gönderilen</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <ArrowDownLeft className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{receivedGifts.length}</p>
            <p className="text-[10px] text-muted">Alınan</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <Heart className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{askidaCount}</p>
            <p className="text-[10px] text-muted">Askıda</p>
          </div>
        </div>

        {/* Give-to-Get Ratio */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted flex items-center gap-1">
              <Scale className="w-3 h-3" />
              Al-Ver Dengesi
            </span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              sentGifts.length >= receivedGifts.length
                ? "bg-green-100 text-green-700"
                : sentGifts.length >= receivedGifts.length * 0.5
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            )}>
              {sentGifts.length >= receivedGifts.length ? "Cömert" :
               sentGifts.length >= receivedGifts.length * 0.5 ? "Dengeli" : "Alıcı"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(100, sentGifts.length > 0 || receivedGifts.length > 0 ? (sentGifts.length / Math.max(sentGifts.length + receivedGifts.length, 1)) * 100 : 50)}%` }}
              />
            </div>
            <span className="text-[10px] text-muted whitespace-nowrap">
              {sentGifts.length}G / {receivedGifts.length}A
            </span>
          </div>
          <p className="text-[10px] text-muted mt-1">
            {sentGifts.length >= receivedGifts.length
              ? "Harika! Bol bol jest yapıyorsun."
              : "Birine jest yapmaya ne dersin? Dengeyi koru!"}
          </p>
        </div>
      </div>

      {/* Gift History */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("sent")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              activeTab === "sent" ? "text-primary border-b-2 border-primary" : "text-muted"
            )}
          >
            Gönderilenler ({sentGifts.length})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              activeTab === "received" ? "text-primary border-b-2 border-primary" : "text-muted"
            )}
          >
            Alınanlar ({receivedGifts.length})
          </button>
        </div>
        <div className="divide-y divide-border max-h-60 overflow-y-auto">
          {(activeTab === "sent" ? sentGifts : receivedGifts).map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (activeTab === "received" && action.status === "pending") {
                  router.push(`/redeem/${action.id}`);
                }
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-card-hover transition-colors text-left"
            >
              <span className="text-2xl">{action.gift.image}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {action.gift.name}
                  {activeTab === "sent" ? ` → ${action.receiverName}` : ` ← ${action.senderName}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", getStatusColor(action.status))}>
                    {getStatusLabel(action.status)}
                  </span>
                  <span className="text-[10px] text-muted">{formatRelativeTime(action.createdAt)}</span>
                </div>
              </div>
            </button>
          ))}
          {(activeTab === "sent" ? sentGifts : receivedGifts).length === 0 && (
            <p className="p-4 text-sm text-muted text-center">Henüz bir jestin yok</p>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        <Link href="/achievements"
          className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Başarımlarım</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </Link>
        <Link href="/community"
          className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <UsersIcon className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-foreground">Topluluklar</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </Link>
        <button
          onClick={() => router.push("/premium")}
          className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Premium Üyelik</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
        <button
          onClick={() => router.push("/notifications")}
          className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Bildirim Tercihleri</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
        <button
          onClick={() => toast("Gizlilik Politikası sayfası yakında", { icon: "📋" })}
          className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-foreground">Gizlilik Politikası</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-red-600">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}
