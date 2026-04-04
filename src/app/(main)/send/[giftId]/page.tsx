"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Send, Check, User, MessageSquare, Users, Sparkles, Heart, PartyPopper } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import { QUICK_NOTES } from "@/types";
import toast from "react-hot-toast";

type Step = "recipient" | "note" | "success";

const CARD_COLORS: Record<string, string> = {
  coffee: "from-amber-50 to-orange-50",
  chocolate: "from-rose-50 to-pink-50",
  book: "from-sky-50 to-blue-50",
  flower: "from-pink-50 to-rose-50",
  experience: "from-violet-50 to-purple-50",
  food: "from-emerald-50 to-teal-50",
};

export default function SendGiftPage() {
  const router = useRouter();
  const params = useParams();
  const giftId = params.giftId as string;

  const gifts = useAppStore((s) => s.gifts);
  const currentUser = useAppStore((s) => s.currentUser);
  const sendGift = useAppStore((s) => s.sendGift);
  const allUsers = useAppStore((s) => s.allUsers);
  const loadAdminData = useAppStore((s) => s.loadAdminData);

  useEffect(() => {
    if (allUsers.length === 0) loadAdminData();
  }, [allUsers.length, loadAdminData]);

  const gift = gifts.find((g) => g.id === giftId);

  const [step, setStep] = useState<Step>("recipient");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [isSending, setIsSending] = useState(false);

  const contacts = allUsers.filter(
    (u) => u.role === "user" && u.id !== currentUser?.id
  ).filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const handleSelectContact = (user: typeof allUsers[0]) => {
    setRecipientPhone(user.phone);
    setRecipientName(user.name || "");
    setStep("note");
  };

  const handleManualPhone = () => {
    const cleaned = recipientPhone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      toast.error("Gecerli bir telefon numarasi gir");
      return;
    }
    const fullPhone = cleaned.startsWith("+90") ? cleaned : `+90${cleaned}`;
    setRecipientPhone(fullPhone);
    if (!recipientName) setRecipientName("Arkadasin");
    setStep("note");
  };

  const handleSend = async () => {
    setIsSending(true);
    const result = await sendGift(giftId, recipientPhone, recipientName, note || undefined);
    if (result) {
      setStep("success");
      toast.success("Jestini yaptin!");
    } else {
      toast.error("Hediye gonderilemedi. Gunluk limitini kontrol et.");
      setIsSending(false);
    }
  };

  if (!gift) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="text-5xl mb-4 opacity-40">😕</div>
        <p className="text-muted font-medium">Hediye bulunamadi</p>
        <button onClick={() => router.back()} className="text-primary text-sm mt-3 font-bold hover:underline">
          Geri Don
        </button>
      </div>
    );
  }

  const bgColor = CARD_COLORS[gift.category] || "from-gray-50 to-gray-100";

  return (
    <div className="px-5 py-5">
      {/* Header with gift preview */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-7"
      >
        <motion.button
          onClick={() => {
            if (step === "note") setStep("recipient");
            else router.back();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-2xl hover:bg-surface transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div className={cn(
          "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-sm",
          bgColor
        )}>
          <span className="text-3xl">{gift.image}</span>
        </div>
        <div>
          <h2 className="font-extrabold text-foreground text-[18px]">{gift.name}</h2>
          <p className="text-[13px] text-muted font-medium">{gift.partnerName}</p>
        </div>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mb-6"
      >
        {["recipient", "note", "success"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300",
              step === s
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : (["recipient", "note", "success"].indexOf(step) > i)
                  ? "bg-success/10 text-success"
                  : "bg-surface text-muted"
            )}>
              {["recipient", "note", "success"].indexOf(step) > i ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && (
              <div className={cn(
                "w-8 h-0.5 rounded-full transition-all duration-500",
                ["recipient", "note", "success"].indexOf(step) > i
                  ? "bg-success/30"
                  : "bg-border"
              )} />
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Recipient */}
        {step === "recipient" && (
          <motion.div
            key="recipient"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <h3 className="font-extrabold text-foreground text-[18px]">Kime Ismarlayacaksin?</h3>

            {/* Manual Phone */}
            <div className="flex gap-2.5">
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value.replace(/[^0-9+\s]/g, ""))}
                placeholder="+90 5XX XXX XX XX"
                className="input-premium flex-1"
              />
              <motion.button
                onClick={handleManualPhone}
                disabled={recipientPhone.replace(/\s/g, "").length < 10}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-3 bg-foreground text-white rounded-2xl text-[14px] font-bold disabled:opacity-30 transition-all shadow-sm"
              >
                Sec
              </motion.button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Isim veya numara ara..."
                className="input-premium pl-11"
              />
            </div>

            {/* Contact List */}
            <div className="space-y-2">
              {contacts.map((contact, i) => (
                <motion.button
                  key={contact.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelectContact(contact)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 premium-card text-left group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center text-[14px] font-extrabold text-primary">
                    {getInitials(contact.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{contact.name}</p>
                    <p className="text-[12px] text-muted font-medium">{contact.phone}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Send className="w-3.5 h-3.5 text-primary" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Note + Send */}
        {step === "note" && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Recipient card */}
            <div className="premium-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center text-[14px] font-extrabold text-primary">
                {getInitials(recipientName)}
              </div>
              <div>
                <p className="text-[15px] font-bold text-foreground">{recipientName}</p>
                <p className="text-[12px] text-muted font-medium">{recipientPhone}</p>
              </div>
              <div className="ml-auto">
                <Check className="w-5 h-5 text-success" />
              </div>
            </div>

            {/* Note */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-muted" />
                <h3 className="font-bold text-foreground text-[15px]">Bir not eklemek ister misin?</h3>
              </div>
              <p className="text-[12px] text-muted mb-3 font-medium ml-6">Istege bagli ama guzel olur :)</p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bir seyler yaz..."
                maxLength={200}
                rows={3}
                className="input-premium resize-none"
              />
              <p className="text-right text-[11px] text-muted mt-1.5 font-medium">{note.length}/200</p>
            </div>

            {/* Quick Notes */}
            <div className="flex flex-wrap gap-2">
              {QUICK_NOTES.map((qn) => (
                <motion.button
                  key={qn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setNote(qn)}
                  className={cn(
                    "chip",
                    note === qn ? "chip-active" : "chip-inactive"
                  )}
                >
                  {qn}
                </motion.button>
              ))}
            </div>

            {/* Send Button */}
            <motion.button
              onClick={handleSend}
              disabled={isSending}
              className="btn-premium w-full text-[16px] py-5"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSending ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  GONDER
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center py-10 relative"
          >
            {/* Decorative rings */}
            <div className="absolute inset-0 flex items-start justify-center pt-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2, opacity: [0, 0.15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-full border-2 border-success"
              />
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-success/20 to-emerald-50 rounded-[28px] mb-6 shadow-lg shadow-success/10 relative"
            >
              <Check className="w-12 h-12 text-success" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[26px] font-extrabold text-foreground mb-2"
            >
              Jestini Yaptin!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-muted text-[15px] font-medium mb-1">
                {recipientName}&apos;e {gift.name} {gift.image} gonderildi
              </p>
              {note && (
                <p className="text-[13px] text-muted/70 italic mt-2">&ldquo;{note}&rdquo;</p>
              )}
            </motion.div>

            {/* 1+1 Offer */}
            {(giftId === "gift-1" || giftId === "gift-5") && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 glass-card p-5 text-left mx-2"
                style={{ background: "linear-gradient(135deg, rgba(124,92,252,0.05), rgba(232,54,79,0.05))" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[13px] font-extrabold text-accent">1+1 Ikram!</span>
                </div>
                <p className="text-[13px] text-foreground/70 leading-relaxed">
                  Beraber gidin, senin {gift.name.toLowerCase()}&apos;n da{" "}
                  <span className="font-bold">{gift.sponsorName || "sponsorun"}</span> hediyesi!
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toast.success("1+1 Ikram aktif edildi!")}
                  className="mt-3 w-full py-3 bg-gradient-to-r from-accent to-purple-500 text-white text-[13px] font-bold rounded-xl shadow-lg shadow-accent/20 transition-all"
                >
                  1+1 Aktif Et
                </motion.button>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => router.push("/home")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 px-8 py-3.5 bg-foreground text-white rounded-2xl font-bold text-[14px] shadow-lg transition-all"
            >
              Ana Sayfaya Don
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
