import { useState } from "react";

const A = "#FF3300";
const BG = "#FFFAF5";

// ═══════════════════════════════════════════
// ONBOARDING SCREENS
// ═══════════════════════════════════════════

const senderScreens = [
  {
    id: "s1",
    title: "Hoş geldin",
    visual: "logo",
    headline: "iyi ki",
    body: "",
    sub: "Birini düşündüğünde\nona gerçek bir jest yapabildiğin yer.",
    cta: "Başla",
    bg: BG,
    color: "#0D0D0F",
    note: "Logo büyük, ortada. Slogan yok — sadece tek cümlelik açıklama. Minimum bilgi, maximum merak.",
  },
  {
    id: "s2",
    title: "Ne yapıyoruz?",
    visual: "cards",
    headline: "Gerçek hediyeler.\nParasız.",
    body: "Bir kahve, bir çikolata, bir kitap.\nGerçek markalardan, gerçek ürünler.\nSen para ödemiyorsun. Fiyat hiçbir yerde yok.",
    sub: "",
    cta: "Nasıl mı?",
    bg: "#0D0D0F",
    color: "#fff",
    note: "Karanlık zemin. Ürün kartları hafifçe görünüyor arka planda. 'Parasız' kelimesi #FF3300 ile vurgulanıyor.",
  },
  {
    id: "s3",
    title: "Nasıl çalışıyor?",
    visual: "steps",
    headline: "Üç adım. Otuz saniye.",
    body: "",
    sub: "",
    steps: [
      { num: "1", label: "Düşün", desc: "Aklına birisi geldi." },
      { num: "2", label: "Seç", desc: "Bir kahve, bir çikolata, bir kitap." },
      { num: "3", label: "Gönder", desc: "Sağa kaydır. Gitti." },
    ],
    cta: "Anladım",
    bg: BG,
    color: "#0D0D0F",
    note: "Adımlar dikey sıralı, minimal animasyonla beliriyor. Her adımın yanında çizgi ikon (kendi setimizden).",
  },
  {
    id: "s4",
    title: "Bildirim",
    visual: "notification",
    headline: "Alan kişi şunu görecek:",
    body: "",
    sub: "Gerçek bir kahve alacak.\nGerçek bir mağazadan.\nSenin ismini görecek — ya da görmeyecek.\nSen karar verirsin.",
    cta: "Harika",
    bg: "#1A1A2E",
    color: "#fff",
    note: "Bildirim mockup'ı ekranın ortasında süzülüyor. 'Biri seni düşündü.' yazısı. Anonim/isimli seçeneği kısaca ima ediliyor.",
  },
  {
    id: "s5",
    title: "İzin",
    visual: "permission",
    headline: "Kime göndereceğini bilmemiz lazım.",
    body: "Rehberini paylaş — sadece isim ve numara.\nMesaj okumuyoruz. Veri satmıyoruz.\nSadece: kime jest yapacağını bilmek için.",
    sub: "",
    cta: "Rehberimi Paylaş",
    ctaSecondary: "Şimdi değil",
    bg: BG,
    color: "#0D0D0F",
    note: "Şeffaflık. Neden istediğimizi açıkça söylüyoruz. 'Şimdi değil' seçeneği her zaman var — zorlama yok.",
  },
  {
    id: "s6",
    title: "Hazırsın",
    visual: "ready",
    headline: "Şimdi birini düşün.",
    body: "",
    sub: "Gerisini biz hallederiz.",
    cta: "İlk Jestimi Yapayım",
    bg: A,
    color: "#fff",
    note: "#FF3300 tam ekran. Beyaz metin. Tek CTA. Enerji dorukta. Kullanıcı heyecanla uygulamaya giriyor.",
  },
];

const receiverScreens = [
  {
    id: "r1",
    title: "Sürpriz",
    visual: "gift",
    headline: "Biri seni düşündü.",
    body: "",
    sub: "Sana bir kahve ısmarladı.",
    cta: "Göster bana",
    bg: "#1A1A2E",
    color: "#fff",
    note: "Bildirimden gelen kullanıcı bu ekranı görüyor. Duygusal karşılama. Kim gönderdiği henüz söylenmiyor — merak.",
  },
  {
    id: "r2",
    title: "Hediye",
    visual: "reveal",
    headline: "",
    body: "",
    sub: "",
    giftCard: {
      product: "Caffè Latte",
      brand: "Starbucks",
      from: "Ayşe",
      note: "Aklıma geldin. İyi ki sen.",
      expire: "72 saat",
    },
    cta: "Nasıl Alırım?",
    bg: BG,
    color: "#0D0D0F",
    note: "Hediye kartı büyük, ortada. Ürün illüstrasyonu (kendi setimizden). Gönderen ismi ve notu görünüyor. Fiyat yok.",
  },
  {
    id: "r3",
    title: "Alma",
    visual: "redeem",
    headline: "Kahveni al.",
    body: "En yakın Starbucks'a git.\nKasada bu ekranı göster.\nKahven hazır.",
    sub: "72 saat içinde alabilirsin.",
    cta: "En Yakın Mağaza",
    bg: BG,
    color: "#0D0D0F",
    note: "QR kod veya barkod görünüyor. Harita butonu var. Basit, net, stressiz.",
  },
  {
    id: "r4",
    title: "Sen de",
    visual: "payforward",
    headline: "Sen de birine\nbir jest yapabilirsin.",
    body: "Parasız. Hesapsız.\nSadece düşünmek yeterli.",
    sub: "",
    cta: "Ben de Birine Göndereyim",
    ctaSecondary: "Şimdi değil",
    bg: "#0D0D0F",
    color: "#fff",
    note: "Çarpan etkisinin başladığı an. Ama zorlama yok — 'şimdi değil' her zaman var. Doğal dönüşüm.",
  },
];

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export default function OnboardingFlow() {
  const [path, setPath] = useState("sender");
  const [screen, setScreen] = useState(0);
  const [showNotes, setShowNotes] = useState(true);

  const screens = path === "sender" ? senderScreens : receiverScreens;
  const s = screens[screen];

  const next = () => screen < screens.length - 1 && setScreen(screen + 1);
  const prev = () => screen > 0 && setScreen(screen - 1);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0C; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: A, marginBottom: 4 }}>iyi ki</div>
        <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: 3 }}>ONBOARDING AKIŞI</div>
      </div>

      {/* Path selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { id: "sender", label: "Kendisi İndirdi", desc: "Birincil kullanıcı" },
          { id: "receiver", label: "Hediye Aldı", desc: "İkincil kullanıcı" },
        ].map(p => (
          <button key={p.id} onClick={() => { setPath(p.id); setScreen(0); }} style={{
            flex: 1, padding: "12px 16px", borderRadius: 14, border: "none", cursor: "pointer",
            background: path === p.id ? `linear-gradient(135deg, ${A}, ${A}CC)` : "rgba(255,255,255,0.04)",
            color: path === p.id ? "#fff" : "#666",
            textAlign: "left", transition: "all 0.3s",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{p.label}</div>
            <div style={{ fontSize: 10, opacity: 0.7, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Screen dots */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 16 }}>
        {screens.map((_, i) => (
          <button key={i} onClick={() => setScreen(i)} style={{
            width: screen === i ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
            background: screen === i ? A : "rgba(255,255,255,0.15)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Phone mockup */}
      <div style={{
        width: 300, margin: "0 auto", borderRadius: 36,
        border: "3px solid rgba(255,255,255,0.1)",
        overflow: "hidden", position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Status bar */}
        <div style={{
          padding: "8px 20px", display: "flex", justifyContent: "space-between",
          fontSize: 10, color: s.bg === BG ? "#0D0D0F" : "#fff",
          background: s.bg, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>|||</span>
        </div>

        {/* Screen content */}
        <div style={{
          background: s.bg, padding: "32px 24px 28px",
          minHeight: 500, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center", textAlign: "center",
          transition: "background 0.4s",
        }}>
          {/* Logo on first screen */}
          {s.visual === "logo" && (
            <div style={{ fontSize: 48, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: A, marginBottom: 24 }}>iyi ki</div>
          )}

          {/* Gift reveal for receiver */}
          {s.visual === "gift" && (
            <div style={{ marginBottom: 24 }}>
              <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="20" width="32" height="22" rx="3" stroke="#FF3300" strokeWidth="2" fill="rgba(255,51,0,0.08)" />
                <path d="M8 26H40" stroke="#FF3300" strokeWidth="1" opacity="0.3" />
                <rect x="22" y="20" width="4" height="22" fill="rgba(255,51,0,0.1)" />
                <path d="M24 20C24 20 18 14 14 14C10 14 10 18 12 19C14 20 24 20 24 20Z" stroke="#FF3300" strokeWidth="2" fill="rgba(255,51,0,0.05)" />
                <path d="M24 20C24 20 30 14 34 14C38 14 38 18 36 19C34 20 24 20 24 20Z" stroke="#FF3300" strokeWidth="2" fill="rgba(255,51,0,0.05)" />
              </svg>
            </div>
          )}

          {/* Gift card reveal */}
          {s.giftCard && (
            <div style={{
              background: "#fff", borderRadius: 20, padding: "24px 20px",
              width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)", marginBottom: 20,
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 12 }}>
                <path d="M14 18C14 16 16 14 18 14H30C32 14 34 16 34 18V30C34 34 30 38 24 38C18 38 14 34 14 30V18Z" stroke={A} strokeWidth="2" fill="rgba(255,51,0,0.06)" />
                <path d="M34 20C36 20 38 22 38 24C38 26 36 28 34 28" stroke={A} strokeWidth="2" strokeLinecap="round" />
                <path d="M20 12C20 10 21 8 22 7" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                <path d="M24 12C24 9 25 7 26 5" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
              </svg>
              <div style={{ fontSize: 18, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#0D0D0F" }}>{s.giftCard.product}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{s.giftCard.brand}</div>
              <div style={{ width: 40, height: 2, background: A, margin: "14px auto", borderRadius: 1, opacity: 0.3 }} />
              <div style={{ fontSize: 13, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>{s.giftCard.from}'den</div>
              <div style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: A, marginTop: 8 }}>"{s.giftCard.note}"</div>
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>{s.giftCard.expire} icinde alabilirsin</div>
            </div>
          )}

          {/* Notification mockup */}
          {s.visual === "notification" && (
            <div style={{
              background: "rgba(255,255,255,0.95)", borderRadius: 16, padding: "14px 16px",
              display: "flex", gap: 12, alignItems: "center", marginBottom: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)", width: "100%",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${A}, #E62E00)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 11, fontFamily: "'Libre Baskerville', serif", color: "#fff", fontStyle: "italic" }}>ik</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0F", fontFamily: "'DM Sans', sans-serif" }}>iyi ki</div>
                <div style={{ fontSize: 12, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>Biri seni düşündü.</div>
              </div>
            </div>
          )}

          {/* Ready screen - full accent */}
          {s.visual === "ready" && (
            <div style={{ fontSize: 40, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff", opacity: 0.15, marginBottom: 20 }}>iyi ki</div>
          )}

          {/* Headline */}
          {s.headline && (
            <div style={{
              fontSize: s.visual === "logo" ? 16 : s.visual === "gift" ? 26 : 22,
              fontFamily: "'Libre Baskerville', serif", fontStyle: "italic",
              color: s.visual === "ready" ? "#fff" : (s.bg === "#0D0D0F" || s.bg === "#1A1A2E" ? "#fff" : "#0D0D0F"),
              lineHeight: 1.5, marginBottom: s.body || s.sub ? 16 : 8,
              whiteSpace: "pre-line",
            }}>{s.headline}</div>
          )}

          {/* Body */}
          {s.body && (
            <div style={{
              fontSize: 13, color: s.bg === BG ? "#6B7280" : "#9CA3AF",
              fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7,
              marginBottom: 16, whiteSpace: "pre-line",
            }}>{s.body}</div>
          )}

          {/* Steps */}
          {s.steps && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {s.steps.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", textAlign: "left" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                    background: A, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif",
                  }}>{st.num}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0D0D0F", fontFamily: "'DM Sans', sans-serif" }}>{st.label}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>{st.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub */}
          {s.sub && (
            <div style={{
              fontSize: s.visual === "ready" ? 16 : 13,
              color: s.bg === BG ? "#9CA3AF" : "rgba(255,255,255,0.6)",
              fontFamily: s.visual === "ready" ? "'Libre Baskerville', serif" : "'DM Sans', sans-serif",
              fontStyle: s.visual === "ready" ? "italic" : "normal",
              lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-line",
            }}>{s.sub}</div>
          )}

          {/* CTA */}
          <button style={{
            padding: "14px 32px", borderRadius: 14, border: "none",
            background: s.bg === A ? "#fff" : `linear-gradient(135deg, ${A}, #FF6D00)`,
            color: s.bg === A ? A : "#fff",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: s.bg === A ? "none" : `0 4px 16px rgba(255,51,0,0.3)`,
            width: "100%", marginTop: 8,
          }} onClick={next}>{s.cta}</button>

          {/* Secondary CTA */}
          {s.ctaSecondary && (
            <button style={{
              padding: "10px 24px", borderRadius: 12, border: "none",
              background: "transparent", color: "#9CA3AF",
              fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              marginTop: 8,
            }} onClick={next}>{s.ctaSecondary}</button>
          )}
        </div>

        {/* Home indicator */}
        <div style={{ background: s.bg, padding: "8px 0 12px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 100, height: 4, borderRadius: 2, background: s.bg === BG ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)" }} />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 300, margin: "16px auto 0" }}>
        <button onClick={prev} style={{
          padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
          background: screen > 0 ? "rgba(255,255,255,0.08)" : "transparent",
          color: screen > 0 ? "#9CA3AF" : "transparent", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
        }}>Geri</button>
        <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", alignSelf: "center" }}>
          {screen + 1} / {screens.length}
        </span>
        <button onClick={next} style={{
          padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
          background: screen < screens.length - 1 ? "rgba(255,255,255,0.08)" : "transparent",
          color: screen < screens.length - 1 ? "#9CA3AF" : "transparent", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
        }}>İleri</button>
      </div>

      {/* Designer notes */}
      <button onClick={() => setShowNotes(!showNotes)} style={{
        display: "block", margin: "20px auto 0", padding: "8px 16px", borderRadius: 10,
        border: "none", cursor: "pointer", background: "rgba(255,51,0,0.08)",
        color: A, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
      }}>{showNotes ? "Notları Gizle" : "Tasarımcı Notları"}</button>

      {showNotes && (
        <div style={{
          maxWidth: 300, margin: "12px auto 0",
          background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "14px 16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 9, color: A, letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
            EKRAN {screen + 1}: {s.title.toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{s.note}</div>
        </div>
      )}

      {/* Flow overview */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 24,
      }}>
        <div style={{ fontSize: 10, color: A, letterSpacing: 3, marginBottom: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
          ONBOARDING KURALLARI
        </div>
        {[
          "Zorlama yok — 'Şimdi değil' her ekranda mevcut.",
          "Para kelimesi hiçbir yerde geçmiyor.",
          "Rehber izni neden istendiği açıkça söyleniyor.",
          "Hediye alan kişi farklı yoldan giriyor — duygusal karşılama.",
          "Çarpan etkisi doğal — 'sen de gönder' teklifi var ama baskı yok.",
          "Onboarding 30 saniyede bitiyor — uzatma yok.",
          "Son ekran her zaman harekete geçirici — 'Şimdi birini düşün.'",
        ].map((rule, i) => (
          <div key={i} style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 6 }}>
            {"→ "}{rule}
          </div>
        ))}
      </div>
    </div>
  );
}
