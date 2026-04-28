import { useState } from "react";

// ═══════════════════════════════════════════
// CUSTOM SVG ILLUSTRATIONS - iyi ki brand
// Three styles: line (UI), filled (cards), spot (hero/large)
// ═══════════════════════════════════════════

const A = "#FF3300"; // accent
const D = "#0D0D0F"; // dark
const W = "#FFFAF5"; // warm white

const Icon = ({ children, size = 48, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {children}
  </svg>
);

// ── SPOT ILLUSTRATIONS (large, warm, organic) ──

const CoffeeSpot = ({ size = 64 }) => (
  <Icon size={size}>
    <ellipse cx="24" cy="40" rx="10" ry="2" fill={A} opacity="0.08" />
    <path d="M14 18C14 16 16 14 18 14H30C32 14 34 16 34 18V30C34 34 30 38 24 38C18 38 14 34 14 30V18Z" stroke={A} strokeWidth="2" fill={`${A}10`} strokeLinecap="round" />
    <path d="M34 20C36 20 38 22 38 24C38 26 36 28 34 28" stroke={A} strokeWidth="2" strokeLinecap="round" />
    <path d="M20 12C20 10 21 8 22 7" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M24 12C24 9 25 7 26 5" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M28 12C28 10 29 8 29 7" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <circle cx="20" cy="26" r="1" fill={A} opacity="0.15" />
    <circle cx="28" cy="24" r="1.5" fill={A} opacity="0.1" />
  </Icon>
);

const GrocerySpot = ({ size = 64 }) => (
  <Icon size={size}>
    <ellipse cx="24" cy="42" rx="10" ry="1.5" fill={A} opacity="0.08" />
    <path d="M12 18H36L32 36H16L12 18Z" stroke={A} strokeWidth="2" fill={`${A}08`} strokeLinejoin="round" />
    <path d="M12 18L10 12H8" stroke={A} strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="40" r="2" stroke={A} strokeWidth="1.5" fill={`${A}15`} />
    <circle cx="30" cy="40" r="2" stroke={A} strokeWidth="1.5" fill={`${A}15`} />
    <rect x="18" y="24" width="12" height="3" rx="1" fill={A} opacity="0.15" />
    <rect x="20" y="29" width="8" height="3" rx="1" fill={A} opacity="0.1" />
  </Icon>
);

const BookSpot = ({ size = 64 }) => (
  <Icon size={size}>
    <ellipse cx="24" cy="40" rx="12" ry="2" fill={A} opacity="0.06" />
    <path d="M10 10C10 8 12 8 14 8H22C23 8 24 9 24 10V38C24 38 22 36 18 36H14C12 36 10 34 10 32V10Z" stroke={A} strokeWidth="2" fill={`${A}08`} strokeLinejoin="round" />
    <path d="M38 10C38 8 36 8 34 8H26C25 8 24 9 24 10V38C24 38 26 36 30 36H34C36 36 38 34 38 32V10Z" stroke={A} strokeWidth="2" fill={`${A}05`} strokeLinejoin="round" />
    <path d="M14 14H20" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <path d="M14 18H19" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    <path d="M28 14H34" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <path d="M28 18H33" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    <rect x="36" y="6" width="2" height="20" rx="1" fill={A} opacity="0.2" />
  </Icon>
);

const ChocolateSpot = ({ size = 64 }) => (
  <Icon size={size}>
    <ellipse cx="24" cy="40" rx="10" ry="2" fill={A} opacity="0.06" />
    <rect x="10" y="12" width="28" height="24" rx="3" stroke={A} strokeWidth="2" fill={`${A}08`} />
    <path d="M10 18H38" stroke={A} strokeWidth="1" opacity="0.2" />
    <path d="M10 24H38" stroke={A} strokeWidth="1" opacity="0.2" />
    <path d="M10 30H38" stroke={A} strokeWidth="1" opacity="0.2" />
    <path d="M19 12V36" stroke={A} strokeWidth="1" opacity="0.2" />
    <path d="M29 12V36" stroke={A} strokeWidth="1" opacity="0.2" />
    <path d="M10 12L16 8H32L38 12" stroke={A} strokeWidth="2" fill={`${A}12`} strokeLinejoin="round" />
    <circle cx="14" cy="15" r="1" fill={A} opacity="0.15" />
  </Icon>
);

// ── ACTION ILLUSTRATIONS (medium, for steps) ──

const ThinkIcon = ({ size = 56 }) => (
  <Icon size={size}>
    <circle cx="24" cy="28" r="10" stroke={A} strokeWidth="2" fill={`${A}08`} />
    <circle cx="24" cy="28" r="4" fill={A} opacity="0.15" />
    <circle cx="24" cy="28" r="1.5" fill={A} opacity="0.4" />
    <path d="M24 18V14" stroke={A} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 22L15 19" stroke={A} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M30 22L33 19" stroke={A} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 28H12" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M36 28H32" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <circle cx="18" cy="12" r="2" stroke={A} strokeWidth="1" fill="none" opacity="0.3" />
    <circle cx="14" cy="8" r="1.5" stroke={A} strokeWidth="1" fill="none" opacity="0.2" />
  </Icon>
);

const SelectIcon = ({ size = 56 }) => (
  <Icon size={size}>
    <rect x="8" y="14" width="14" height="20" rx="3" stroke={A} strokeWidth="2" fill={`${A}08`} />
    <rect x="26" y="14" width="14" height="20" rx="3" stroke={A} strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="3 2" />
    <path d="M12 20H18" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <path d="M12 24H16" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    <circle cx="15" cy="30" r="2" fill={A} opacity="0.2" />
    <path d="M22 24L26 24" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M23 22L26 24L23 26" stroke={A} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <path d="M15 10C15 8 17 7 19 8" stroke={A} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
  </Icon>
);

const SendIcon = ({ size = 56 }) => (
  <Icon size={size}>
    <path d="M8 24L36 12L28 38L22 26L8 24Z" stroke={A} strokeWidth="2" fill={`${A}08`} strokeLinejoin="round" />
    <path d="M22 26L36 12" stroke={A} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="40" cy="10" r="2" fill={A} opacity="0.15" />
    <circle cx="42" cy="14" r="1" fill={A} opacity="0.1" />
    <circle cx="38" cy="8" r="1" fill={A} opacity="0.1" />
    <path d="M10 32C12 30 14 31 14 33" stroke={A} strokeWidth="1" strokeLinecap="round" opacity="0.15" />
  </Icon>
);

// ── NOTIFICATION ILLUSTRATION ──

const BellIcon = ({ size = 48 }) => (
  <Icon size={size}>
    <path d="M24 6C24 6 18 8 18 16V24L14 28H34L30 24V16C30 8 24 6 24 6Z" stroke={A} strokeWidth="2" fill={`${A}10`} strokeLinejoin="round" />
    <path d="M20 28C20 30 22 32 24 32C26 32 28 30 28 28" stroke={A} strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="6" r="1.5" fill={A} opacity="0.4" />
    <path d="M32 12C34 12 36 14 36 16" stroke={A} strokeWidth="1" strokeLinecap="round" opacity="0.2" />
    <path d="M34 10C36 10 38 12 38 14" stroke={A} strokeWidth="1" strokeLinecap="round" opacity="0.15" />
  </Icon>
);

// ── SECTION DIVIDER ──
const WaveDivider = ({ flip, color = A }) => (
  <svg width="100%" height="32" viewBox="0 0 1200 32" preserveAspectRatio="none" style={{ display: "block", transform: flip ? "scaleY(-1)" : "none" }}>
    <path d="M0 32C200 0 400 24 600 16C800 8 1000 28 1200 4V32H0Z" fill={color} opacity="0.04" />
  </svg>
);

// ═══════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════

export default function LandingPage() {
  const [version, setVersion] = useState("pre");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.includes("@")) { setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFFAF5", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #FFFAF5; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        @keyframes steam { 0%,100% { transform: translateY(0) scaleX(1); opacity: 0.3; } 50% { transform: translateY(-4px) scaleX(1.1); opacity: 0.5; } }
        ::placeholder { color: #9CA3AF; }
        input:focus { outline: none; border-color: #FF3300; }
      `}</style>

      {/* Version toggle */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100, display: "flex", gap: 4, background: "#0D0D0F", borderRadius: 20, padding: 4 }}>
        {["pre", "post"].map(v => (
          <button key={v} onClick={() => setVersion(v)} style={{
            padding: "6px 12px", borderRadius: 16, border: "none", cursor: "pointer",
            fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            background: version === v ? "#FF3300" : "transparent",
            color: version === v ? "#fff" : "#6B7280",
          }}>{v === "pre" ? "Lansman Oncesi" : "Lansman Sonrasi"}</button>
        ))}
      </div>

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 60px", position: "relative", overflow: "hidden", textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(255,51,0,0.06) 0%, transparent 70%)",
          borderRadius: "50%", animation: "pulse 4s ease-in-out infinite",
        }} />

        <div style={{ fontSize: 64, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 20, position: "relative", animation: "fadeUp 0.8s ease forwards" }}>iyi ki</div>

        <div style={{ fontSize: 20, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#0D0D0F", maxWidth: 400, lineHeight: 1.6, marginBottom: 12, animation: "fadeUp 0.8s ease 0.2s forwards", opacity: 0 }}>
          Söylemene gerek yok.{"\n"}Düşünmen yeter.
        </div>

        <div style={{ fontSize: 15, color: "#6B7280", maxWidth: 440, lineHeight: 1.7, marginBottom: 40, animation: "fadeUp 0.8s ease 0.4s forwards", opacity: 0 }}>
          {version === "pre"
            ? "Birini düşündüğünde ona gerçek bir jest yapabildiğin yer. Kahve, çikolata, kitap — parasız, hesapsız, sadece düşünce."
            : "Birini düşün. Bir kahve, bir çikolata, bir kitap gönder. Parasız, hesapsız. Sadece jest."}
        </div>

        <div style={{ animation: "fadeUp 0.8s ease 0.6s forwards", opacity: 0 }}>
          {version === "pre" ? (
            submitted ? (
              <div style={{ fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#2D9B5A", padding: "16px 32px" }}>İyi ki sen de burada olacaksın.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, maxWidth: 400 }}>
                <input type="email" placeholder="E-posta adresin" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, padding: "14px 18px", borderRadius: 14, border: "2px solid #E5E7EB", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", transition: "border-color 0.3s" }} />
                <button onClick={handleSubmit} style={{
                  padding: "14px 28px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #FF3300, #FF6D00)",
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(255,51,0,0.3)",
                }}>Haberdar Ol</button>
              </div>
            )
          ) : (
            <div style={{ display: "flex", gap: 12, flexDirection: "column", alignItems: "center" }}>
              <button style={{ padding: "16px 40px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #FF3300, #FF6D00)", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 6px 24px rgba(255,51,0,0.35)" }}>App Store'dan Indir</button>
              <button style={{ padding: "16px 40px", borderRadius: 16, border: "2px solid #0D0D0F", background: "transparent", color: "#0D0D0F", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Google Play'den Indir</button>
            </div>
          )}
        </div>

        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#9CA3AF", animation: "float 3s ease-in-out infinite", textAlign: "center" }}>
          <div>Asagi kaydir</div>
          <div style={{ marginTop: 4, fontSize: 16 }}>↓</div>
        </div>
      </section>

      {/* ═══ NASIL CALISIYOR ═══ */}
      <WaveDivider color="#0D0D0F" />
      <section style={{ padding: "60px 24px 80px", background: "#0D0D0F", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 28, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", marginBottom: 12, color: "#FF3300" }}>Nasıl çalışıyor?</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 48 }}>Üç adım. Otuz saniye. Sıfır lira.</div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: <ThinkIcon size={56} />, step: "1", title: "Düşün", desc: "Aklına birisi geldi. Bir arkadaş, bir anne, bir sevgili. Uygulamayı aç." },
              { icon: <SelectIcon size={56} />, step: "2", title: "Seç", desc: "Bir kahve, bir çikolata, bir kitap. Markalar arasında gez, ürünü seç, sağa kaydır." },
              { icon: <SendIcon size={56} />, step: "3", title: "Gönder", desc: "Kime göndereceğini seç. Gitti. O kişi bir bildirim alacak: 'Biri seni düşündü.'" },
            ].map((s, i) => (
              <div key={i} style={{
                flex: "1 1 160px", maxWidth: 200,
                background: "rgba(255,255,255,0.04)", borderRadius: 20,
                padding: "28px 20px", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>{s.icon}</div>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: "#FF3300", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, margin: "0 auto 12px" }}>{s.step}</div>
                <div style={{ fontSize: 18, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider flip color="#0D0D0F" />

      {/* ═══ NE DEGIL ═══ */}
      <section style={{ padding: "60px 24px 80px", background: "#FFFAF5", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 28, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", marginBottom: 12, color: "#0D0D0F" }}>Bu ne değil?</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 40 }}>iyi ki'nin ne olmadığını bilmek, ne olduğunu anlamak kadar önemli.</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
            {[
              { no: "Hediye kartı platformu değil.", yes: "Gerçek ürünler. Kahve, çikolata, kitap, çikolata." },
              { no: "Para transferi değil.", yes: "Fiyat hiçbir yerde görünmüyor. Parasız, hesapsız." },
              { no: "Sosyal medya değil.", yes: "Beğeni yok, yorum yok, skor yok. Sadece jest." },
              { no: "Kupon/indirim uygulaması değil.", yes: "İndirim aramıyorsun. Birini düşünüyorsun." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "18px 20px", background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#9CA3AF", textDecoration: "line-through", marginBottom: 4 }}>{item.no}</div>
                  <div style={{ fontSize: 15, color: "#0D0D0F", fontWeight: 500 }}>{item.yes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BILDIRIM MOCKUP ═══ */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, #0D0D0F, #1A1A2E)", textAlign: "center", color: "#fff" }}>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ fontSize: 24, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", marginBottom: 8 }}>Şöyle bir bildirim hayal et.</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 40 }}>Telefonuna bakıyorsun ve görüyorsun:</div>

          <div style={{
            background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "18px 20px",
            display: "flex", gap: 14, alignItems: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)", animation: "float 4s ease-in-out infinite",
            maxWidth: 340, margin: "0 auto 24px",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: "linear-gradient(135deg, #FF3300, #E62E00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(255,51,0,0.3)" }}>
              <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: "#fff", fontStyle: "italic" }}>ik</span>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 400, color: "#0D0D0F", fontFamily: "'Libre Baskerville', serif", fontStyle: "italic" }}>iyi ki</div>
              <div style={{ fontSize: 14, color: "#374151", marginTop: 2 }}>Biri seni düşündü.</div>
            </div>
          </div>

          <div style={{ fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginTop: 24 }}>O "biri" sen olabilirsin.</div>
        </div>
      </section>

      {/* ═══ MARKALAR ═══ */}
      <section style={{ padding: "80px 24px", background: "#FFFAF5", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ fontSize: 24, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", marginBottom: 8, color: "#0D0D0F" }}>Neler gönderebilirsin?</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 36 }}>Gerçek markalardan gerçek ürünler. Dijital sticker değil.</div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: <CoffeeSpot size={52} />, name: "Kahve", brand: "Starbucks, Kahve Dünyası" },
              { icon: <GrocerySpot size={52} />, name: "Market", brand: "Migros" },
              { icon: <BookSpot size={52} />, name: "Kitap", brand: "D&R" },
              { icon: <ChocolateSpot size={52} />, name: "Çikolata", brand: "Tadelle" },
            ].map((p, i) => (
              <div key={i} style={{
                flex: "1 1 100px", background: "#fff", borderRadius: 18,
                padding: "24px 16px", border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}>
                <div style={{ marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0D0D0F", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.brand}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 20, fontStyle: "italic" }}>Ve daha fazlası yakında...</div>
        </div>
      </section>

      {/* ═══ MANIFESTO ═══ */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, #FF3300, #E62E00)", textAlign: "center", color: "#fff" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 28, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", lineHeight: 1.6, marginBottom: 24 }}>
            Türkçede çok güzel bir şey var.{"\n"}"İyi ki" diyorsun ve cümle tamamlanıyor.
          </div>
          <div style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.8, marginBottom: 24 }}>
            İyi ki varsın. İyi ki düşündün. İyi ki sen.{"\n"}Bu iki kelime her şeyi söylüyor.{"\n"}Biz sadece ona bir yer açtık.
          </div>
          <div style={{ fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", opacity: 0.8 }}>
            Söylemene gerek yok. Düşünmen yeter.
          </div>
        </div>
      </section>

      {/* ═══ FOOTER CTA ═══ */}
      <section style={{ padding: "80px 24px 60px", background: "#0D0D0F", textAlign: "center", color: "#fff" }}>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ fontSize: 36, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 16 }}>iyi ki</div>

          {version === "pre" ? (
            <>
              <div style={{ fontSize: 16, color: "#9CA3AF", marginBottom: 24 }}>Bekleme listesine katıl.{"\n"}İlk senden haberdar olacağız.</div>
              <div style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto" }}>
                <input type="email" placeholder="E-posta adresin" style={{ flex: 1, padding: "14px 18px", borderRadius: 14, border: "2px solid #374151", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#1A1A2E", color: "#fff" }} />
                <button style={{ padding: "14px 24px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #FF3300, #FF6D00)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,51,0,0.3)" }}>Katıl</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 18, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff", marginBottom: 24 }}>Birini düşün.{"\n"}Gerisini biz hallederiz.</div>
              <button style={{ padding: "16px 40px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #FF3300, #FF6D00)", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 6px 24px rgba(255,51,0,0.35)" }}>Şimdi İndir</button>
            </>
          )}

          <div style={{ marginTop: 48, fontSize: 11, color: "#374151", display: "flex", gap: 20, justifyContent: "center" }}>
            <span>Hakkımızda</span><span>Gizlilik</span><span>Kullanım Koşulları</span><span>İletişim</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 10, color: "#374151" }}>© 2026 iyi ki. Tüm hakları saklıdır.</div>
        </div>
      </section>
    </div>
  );
}
