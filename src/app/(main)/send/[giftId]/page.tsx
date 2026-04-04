"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Send, Check, User, MessageSquare, Users } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import { QUICK_NOTES } from "@/types";
import { MOCK_USERS } from "@/lib/mock-data";
import toast from "react-hot-toast";

type Step = "recipient" | "note" | "success";

export default function SendGiftPage() {
  const router = useRouter();
  const params = useParams();
  const giftId = params.giftId as string;

  const gifts = useAppStore((s) => s.gifts);
  const currentUser = useAppStore((s) => s.currentUser);
  const sendGift = useAppStore((s) => s.sendGift);

  const gift = gifts.find((g) => g.id === giftId);

  const [step, setStep] = useState<Step>("recipient");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [isSending, setIsSending] = useState(false);

  const contacts = MOCK_USERS.filter(
    (u) => u.role === "user" && u.id !== currentUser?.id
  ).filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const handleSelectContact = (user: typeof MOCK_USERS[0]) => {
    setRecipientPhone(user.phone);
    setRecipientName(user.name || "");
    setStep("note");
  };

  const handleManualPhone = () => {
    const cleaned = recipientPhone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      toast.error("Geçerli bir telefon numarası gir");
      return;
    }
    const fullPhone = cleaned.startsWith("+90") ? cleaned : `+90${cleaned}`;
    setRecipientPhone(fullPhone);
    if (!recipientName) setRecipientName("Arkadaşın");
    setStep("note");
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      const result = sendGift(giftId, recipientPhone, recipientName, note || undefined);
      if (result) {
        setStep("success");
        toast.success("Jestini yaptın!");
      } else {
        toast.error("Hediye gönderilemedi. Günlük limitini kontrol et.");
        setIsSending(false);
      }
    }, 1000);
  };

  if (!gift) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted">Hediye bulunamadı</p>
        <button onClick={() => router.back()} className="text-primary text-sm mt-2 underline">
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            if (step === "note") setStep("recipient");
            else router.back();
          }}
          className="p-2 -ml-2 rounded-xl hover:bg-card-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{gift.image}</span>
          <div>
            <h2 className="font-bold text-foreground">{gift.name}</h2>
            <p className="text-xs text-muted">{gift.partnerName}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Recipient */}
        {step === "recipient" && (
          <motion.div
            key="recipient"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-foreground">Kime Ismarlayacaksın?</h3>

            {/* Manual Phone */}
            <div className="flex gap-2">
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value.replace(/[^0-9+\s]/g, ""))}
                placeholder="+90 5XX XXX XX XX"
                className="flex-1 px-4 py-3 bg-card rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                onClick={handleManualPhone}
                disabled={recipientPhone.replace(/\s/g, "").length < 10}
                className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-primary-dark transition-colors"
              >
                Seç
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İsim veya numara ara"
                className="w-full pl-10 pr-4 py-2.5 bg-card rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Contact List */}
            <div className="space-y-1.5">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-card-hover transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{contact.name}</p>
                    <p className="text-xs text-muted">{contact.phone}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Note + Send */}
        {step === "note" && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {getInitials(recipientName)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{recipientName}</p>
                <p className="text-xs text-muted">{recipientPhone}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquare className="w-4 h-4 text-muted" />
                <h3 className="font-semibold text-foreground text-sm">Bir not eklemek ister misin?</h3>
              </div>
              <p className="text-xs text-muted mb-3">(İsteğe bağlı)</p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bir şeyler yaz..."
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 bg-card rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              <p className="text-right text-[10px] text-muted mt-1">{note.length}/200</p>
            </div>

            {/* Quick Notes */}
            <div className="flex flex-wrap gap-2">
              {QUICK_NOTES.map((qn) => (
                <button
                  key={qn}
                  onClick={() => setNote(qn)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    note === qn
                      ? "bg-primary text-white"
                      : "bg-card border border-border text-muted hover:text-foreground"
                  )}
                >
                  {qn}
                </button>
              ))}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-2xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg text-base"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  GÖNDER
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Jestini Yaptın!</h2>
            <p className="text-muted text-sm mb-1">
              {recipientName}'e {gift.name} {gift.image} gönderildi
            </p>
            {note && <p className="text-xs text-muted italic">"{note}"</p>}
            {/* 1+1 İkram Teklifi */}
            {(giftId === "gift-1" || giftId === "gift-5") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 text-left"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-900">1+1 İkram!</span>
                </div>
                <p className="text-xs text-indigo-700">
                  Beraber gidin, senin {gift.name.toLowerCase()}'n da{" "}
                  <span className="font-semibold">{gift.sponsorName || "sponsorun"}</span> hediyesi!
                </p>
                <button
                  onClick={() => toast.success("1+1 İkram aktif edildi! Beraber gidin, ikisi de bedava.")}
                  className="mt-2 w-full py-2 bg-indigo-500 text-white text-xs font-semibold rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  1+1 Aktif Et
                </button>
              </motion.div>
            )}

            <button
              onClick={() => router.push("/home")}
              className="mt-4 px-6 py-3 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Ana Sayfaya Dön
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
