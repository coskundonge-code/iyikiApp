"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Trophy, Star } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn, formatRelativeTime } from "@/lib/utils";

// Achievement data inline (to avoid circular import issues)
const ALL_ACHIEVEMENTS = [
  { id: 'first-gift', name: 'İlk Jest', description: 'İlk hediyeni gönder', emoji: '🎁', requirement: 1, type: 'send' },
  { id: 'five-gifts', name: 'Jest Ustası', description: '5 hediye gönder', emoji: '⭐', requirement: 5, type: 'send' },
  { id: 'ten-gifts', name: 'Jest Kahramanı', description: '10 hediye gönder', emoji: '🏆', requirement: 10, type: 'send' },
  { id: 'twenty-five-gifts', name: 'Jest Efsanesi', description: '25 hediye gönder', emoji: '👑', requirement: 25, type: 'send' },
  { id: 'first-receive', name: 'Seviliyorsun', description: 'İlk hediyeni al', emoji: '💝', requirement: 1, type: 'receive' },
  { id: 'five-receive', name: 'Popüler', description: '5 hediye al', emoji: '🌟', requirement: 5, type: 'receive' },
  { id: 'streak-3', name: '3 Gün Üst Üste', description: '3 gün art arda hediye gönder', emoji: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak-7', name: 'Haftalık Seri', description: '7 gün art arda hediye gönder', emoji: '💫', requirement: 7, type: 'streak' },
  { id: 'askida-hero', name: 'Askıda Kahraman', description: 'Hediyenin askıda birine ulaşsın', emoji: '💛', requirement: 1, type: 'social' },
  { id: 'community-join', name: 'Topluluk Üyesi', description: 'Bir topluluğa katıl', emoji: '🤝', requirement: 1, type: 'community' },
  { id: 'drop-hunter', name: 'Drop Avcısı', description: "Haftalık Drop'tan hediye yakala", emoji: '⚡', requirement: 1, type: 'community' },
  { id: 'plus-one', name: 'Beraber Güzel', description: '1+1 İkram kullan', emoji: '👫', requirement: 1, type: 'social' },
];

export default function AchievementsPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const giftActions = useAppStore((s) => s.giftActions);

  const sentCount = giftActions.filter((a) => a.senderId === currentUser?.id).length;
  const receivedCount = giftActions.filter(
    (a) => a.receiverPhone === currentUser?.phone || a.receiverId === currentUser?.id
  ).length;
  const askidaCount = giftActions.filter(
    (a) => a.senderId === currentUser?.id && (a.status === "social_pool" || a.status === "distributed")
  ).length;

  const isUnlocked = (achievement: typeof ALL_ACHIEVEMENTS[0]) => {
    switch (achievement.type) {
      case 'send': return sentCount >= achievement.requirement;
      case 'receive': return receivedCount >= achievement.requirement;
      case 'social': return askidaCount >= achievement.requirement;
      default: return false;
    }
  };

  const getProgress = (achievement: typeof ALL_ACHIEVEMENTS[0]) => {
    let current = 0;
    switch (achievement.type) {
      case 'send': current = sentCount; break;
      case 'receive': current = receivedCount; break;
      case 'social': current = askidaCount; break;
      default: current = 0;
    }
    return Math.min(current / achievement.requirement, 1);
  };

  const unlockedCount = ALL_ACHIEVEMENTS.filter(isUnlocked).length;

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl hover:bg-card-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Başarımlar</h2>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-sm text-muted">Kazanılan Rozet</p>
            <p className="text-2xl font-bold text-foreground">
              {unlockedCount} <span className="text-sm font-normal text-muted">/ {ALL_ACHIEVEMENTS.length}</span>
            </p>
          </div>
        </div>
        <div className="w-full h-2 bg-amber-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            style={{ width: `${(unlockedCount / ALL_ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ALL_ACHIEVEMENTS.map((achievement, i) => {
          const unlocked = isUnlocked(achievement);
          const progress = getProgress(achievement);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "bg-card rounded-xl border p-4 text-center relative",
                unlocked ? "border-amber-200 bg-amber-50/30" : "border-border opacity-70"
              )}
            >
              {!unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-muted" />
                </div>
              )}
              <div className={cn("text-3xl mb-2", !unlocked && "grayscale opacity-50")}>
                {achievement.emoji}
              </div>
              <h4 className="text-xs font-bold text-foreground">{achievement.name}</h4>
              <p className="text-[10px] text-muted mt-0.5">{achievement.description}</p>

              {!unlocked && (
                <div className="mt-2">
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {unlocked && (
                <div className="mt-2">
                  <Star className="w-3 h-3 text-amber-500 mx-auto" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
