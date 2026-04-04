"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, GraduationCap, MapPin, Calendar, Gift, Plus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const COMMUNITIES = [
  {
    id: 'comm-1',
    name: 'İTÜ Kampüs',
    emoji: '🎓',
    description: 'İTÜ öğrencileri arası jest havuzu',
    type: 'university',
    memberCount: 342,
    giftsShared: 89,
    isActive: true,
    requirement: '.itu.edu.tr e-posta',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
  },
  {
    id: 'comm-2',
    name: 'Boğaziçi Kahve Kulübü',
    emoji: '☕',
    description: 'Boğaziçi Üniversitesi sınav haftası kahve havuzu',
    type: 'university',
    memberCount: 218,
    giftsShared: 56,
    isActive: true,
    requirement: '.boun.edu.tr e-posta',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
  },
  {
    id: 'comm-3',
    name: 'Kadıköy Mahallesi',
    emoji: '🏘️',
    description: 'Kadıköy sakinleri arası ikramlar',
    type: 'neighborhood',
    memberCount: 156,
    giftsShared: 34,
    isActive: true,
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
  },
  {
    id: 'comm-4',
    name: 'Tech Meetup İstanbul',
    emoji: '💻',
    description: 'Yazılımcılar arası jest ağı',
    type: 'event',
    memberCount: 89,
    giftsShared: 22,
    isActive: true,
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
  },
  {
    id: 'comm-5',
    name: 'Galatasaray Taraftarı',
    emoji: '🦁',
    description: 'Maç günü stadyum jestleri',
    type: 'event',
    memberCount: 0,
    giftsShared: 0,
    isActive: false,
    color: 'from-red-500 to-yellow-500',
    bgLight: 'bg-red-50',
  },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  university: GraduationCap,
  neighborhood: MapPin,
  event: Calendar,
  workplace: Users,
};

export default function CommunityPage() {
  const router = useRouter();

  const handleJoin = (communityId: string, isActive: boolean) => {
    if (!isActive) {
      toast("Bu topluluk yakında açılıyor!", { icon: "🔜" });
      return;
    }
    toast.success("Topluluğa katıldın! Artık bu havuzdan hediye gönderebilirsin.");
  };

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl hover:bg-card-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Topluluklar</h2>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-bold text-indigo-900">Topluluk Jestleri</span>
        </div>
        <p className="text-xs text-indigo-700 leading-relaxed">
          Üniversiten, mahallenin veya etkinliğine özel jest havuzlarına katıl.
          Aynı topluluktaki insanlarla birbirine jestle mutluluk yay!
        </p>
      </div>

      {/* Communities */}
      <div className="space-y-3">
        {COMMUNITIES.map((community, i) => {
          const TypeIcon = TYPE_ICONS[community.type] || Users;

          return (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "bg-card rounded-xl border overflow-hidden",
                community.isActive ? "border-border" : "border-border opacity-60"
              )}
            >
              <div className={cn("h-1.5 bg-gradient-to-r", community.color)} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", community.bgLight)}>
                      {community.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{community.name}</h3>
                      <p className="text-xs text-muted mt-0.5">{community.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Users className="w-3 h-3" />
                    <span>{community.memberCount} üye</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Gift className="w-3 h-3" />
                    <span>{community.giftsShared} jest</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <TypeIcon className="w-3 h-3" />
                    <span>
                      {community.type === 'university' ? 'Üniversite' :
                       community.type === 'neighborhood' ? 'Mahalle' :
                       community.type === 'event' ? 'Etkinlik' : 'İş Yeri'}
                    </span>
                  </div>
                </div>

                {community.requirement && (
                  <p className="text-[10px] text-muted mt-2 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Katılım şartı: {community.requirement}
                  </p>
                )}

                <button
                  onClick={() => handleJoin(community.id, community.isActive)}
                  className={cn(
                    "mt-3 w-full py-2.5 rounded-xl text-sm font-medium transition-colors",
                    community.isActive
                      ? "bg-foreground text-background hover:opacity-90"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {community.isActive ? "Katıl" : "Yakında"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
