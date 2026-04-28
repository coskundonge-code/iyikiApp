"use client";

import { useState, useEffect } from "react";

export default function KVKKBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.includes("kvkk_consent=true");
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    document.cookie = "kvkk_consent=true;path=/;max-age=31536000;SameSite=Lax";
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-white/95 backdrop-blur border-t border-border shadow-lg safe-bottom">
      <div className="max-w-lg mx-auto space-y-3">
        <p className="text-xs text-muted leading-relaxed">
          iyi ki, hizmet kalitesini artırmak için çerezler ve kişisel veri işleme teknolojileri kullanır.
          Devam ederek{" "}
          <a href="/kvkk" className="underline text-foreground font-medium">
            KVKK Aydınlatma Metni
          </a>
          'ni kabul etmiş olursunuz.
        </p>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl"
          >
            Kabul Et
          </button>
          <button
            onClick={accept}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl"
          >
            Sadece Zorunlu
          </button>
        </div>
      </div>
    </div>
  );
}
