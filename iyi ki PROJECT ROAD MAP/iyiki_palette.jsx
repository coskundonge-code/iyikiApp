import { useState } from "react";

const groups = [
  {
    title: "ATES",
    desc: "Ana renk ailesi. Hepsi canli, hicbiri soluk degil.",
    colors: [
      { name: "Alev", hex: "#FF3300", role: "Ana renk" },
      { name: "Kor", hex: "#E62E00", role: "Koyu vurgu, pressed" },
      { name: "Yangin", hex: "#FF5722", role: "Sicak varyasyon" },
      { name: "Kivilcim", hex: "#FF8A50", role: "Acik ama canli" },
    ]
  },
  {
    title: "DERINLIK",
    desc: "Koyu zeminler. Soguk degil, derin. Atesin yaninda durabilecek karanlik.",
    colors: [
      { name: "Karbon", hex: "#0D0D0F", role: "En derin siyah" },
      { name: "Gece", hex: "#1A1A2E", role: "Koyu arka plan" },
      { name: "Lacivert", hex: "#2B2D42", role: "Kart, baslik zemini" },
      { name: "Mor Gece", hex: "#2D1B3D", role: "Premium derinlik" },
    ]
  },
  {
    title: "ENERJI",
    desc: "Ikincil canli renkler. Atesin yanlasslari. Hepsi ayni enerjiyi tasiyor.",
    colors: [
      { name: "Kehribar", hex: "#FFAB00", role: "Sicak altin, ozel an" },
      { name: "Portakal", hex: "#FF6D00", role: "Turuncu enerji, vurgu" },
      { name: "Mercan", hex: "#FF5252", role: "Sicak kirmizi, dikkat" },
      { name: "Magenta", hex: "#F50057", role: "Cesur pembe, surpriz" },
    ]
  },
  {
    title: "DENGE",
    desc: "Kontrast saglayan canli soguuk tonlar. Soluk degil, parlak.",
    colors: [
      { name: "Okyanus", hex: "#00BFA5", role: "Taze, canli teal" },
      { name: "Selvi", hex: "#00C853", role: "Canli onay yesili" },
      { name: "Gok", hex: "#2979FF", role: "Parlak mavi, link, bilgi" },
    ]
  },
  {
    title: "YUZEY",
    desc: "Arka planlar ve kartlar. Sicak ama net.",
    colors: [
      { name: "Fildisi", hex: "#FFFAF5", role: "Sicak beyaz zemin" },
      { name: "Kum", hex: "#FFF0E0", role: "Sicak kart arka plani" },
      { name: "Kagit", hex: "#FFFFFF", role: "Saf beyaz, temiz alan" },
      { name: "Bej", hex: "#FFE0CC", role: "Canli sicak yuzey" },
    ]
  },
  {
    title: "METIN",
    desc: "Okunabilirlik. Net, keskin, hiyerarsik.",
    colors: [
      { name: "Murekkep", hex: "#0D0D0F", role: "Birincil metin" },
      { name: "Graffit", hex: "#374151", role: "Govde metin" },
      { name: "Celik", hex: "#6B7280", role: "Ikincil metin" },
      { name: "Gumus", hex: "#9CA3AF", role: "Ipucu, placeholder" },
    ]
  },
];

export default function PaletteWide() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const allColors = groups.flatMap(g => g.colors);

  const darken = (hex, amt) => {
    let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    r = Math.max(0, r - amt); g = Math.max(0, g - amt); b = Math.max(0, b - amt);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  };

  const isLight = (hex) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0C; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 36, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 4 }}>iyi ki</div>
        <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: 3 }}>GENIS KARTELA \u2022 CANLI \u2022 KONTRAST</div>
      </div>

      {/* ═══ COLOR GROUPS ═══ */}
      {groups.map((g, gi) => (
        <div key={gi} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#FF3300", letterSpacing: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{g.title}</div>
            <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>{g.desc}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {g.colors.map((c, ci) => {
              const light = isLight(c.hex);
              const isSel = selectedColor?.hex === c.hex;
              return (
                <div key={ci} onClick={() => setSelectedColor(c)} style={{
                  flex: 1, background: c.hex, borderRadius: 16, padding: "16px 12px",
                  minHeight: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  cursor: "pointer", transition: "all 0.3s",
                  border: isSel ? "3px solid #fff" : light ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)",
                  transform: isSel ? "scale(1.04)" : "scale(1)",
                  boxShadow: isSel ? `0 6px 20px ${c.hex}66` : "none",
                }}>
                  <div style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: light ? "#0D0D0F" : "#fff" }}>{c.name}</div>
                  <div style={{ fontSize: 9, color: light ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{c.hex}</div>
                  <div style={{ fontSize: 9, color: light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{c.role}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ═══ COMBINATION PREVIEW ═══ */}
      <div style={{ fontSize: 11, color: "#FF3300", letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>KOMBINASYONLAR</div>

      {/* Row 1: Logo on different backgrounds */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { bg: "#0D0D0F", fg: "#FF3300", label: "Karbon" },
          { bg: "#1A1A2E", fg: "#FFAB00", label: "Gece+Kehribar" },
          { bg: "#FF3300", fg: "#FFFFFF", label: "Alev" },
          { bg: "#FFFAF5", fg: "#FF3300", label: "Fildisi" },
        ].map((combo, i) => (
          <div key={i} style={{
            background: combo.bg, borderRadius: 16, padding: "24px 10px", textAlign: "center",
            border: isLight(combo.bg) ? "1px solid rgba(0,0,0,0.06)" : "none",
          }}>
            <div style={{ fontSize: 24, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: combo.fg }}>iyi ki</div>
            <div style={{ fontSize: 8, color: isLight(combo.bg) ? "#9CA3AF" : "rgba(255,255,255,0.4)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{combo.label}</div>
          </div>
        ))}
      </div>

      {/* Row 2: More combos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { bg: "#2D1B3D", fg: "#FF5722", label: "MorGece+Yangin" },
          { bg: "#FFF0E0", fg: "#E62E00", label: "Kum+Kor" },
          { bg: "#0D0D0F", fg: "#FFFFFF", label: "Karbon+Beyaz" },
          { bg: "#00BFA5", fg: "#FFFFFF", label: "Okyanus" },
        ].map((combo, i) => (
          <div key={i} style={{
            background: combo.bg, borderRadius: 16, padding: "24px 10px", textAlign: "center",
            border: isLight(combo.bg) ? "1px solid rgba(0,0,0,0.06)" : "none",
          }}>
            <div style={{ fontSize: 24, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: combo.fg }}>iyi ki</div>
            <div style={{ fontSize: 8, color: isLight(combo.bg) ? "#9CA3AF" : "rgba(255,255,255,0.4)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{combo.label}</div>
          </div>
        ))}
      </div>

      {/* ═══ GRADIENT COMBOS ═══ */}
      <div style={{ fontSize: 11, color: "#FF3300", letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>GRADIENT</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { grad: "linear-gradient(135deg, #FF3300, #FF6D00)", label: "Alev → Portakal", fg: "#fff" },
          { grad: "linear-gradient(135deg, #FF3300, #FFAB00)", label: "Alev → Kehribar", fg: "#fff" },
          { grad: "linear-gradient(135deg, #FF3300, #F50057)", label: "Alev → Magenta", fg: "#fff" },
          { grad: "linear-gradient(135deg, #0D0D0F, #2D1B3D)", label: "Karbon → Mor Gece", fg: "#FF3300" },
          { grad: "linear-gradient(135deg, #FF3300, #E62E00)", label: "Alev → Kor", fg: "#fff" },
          { grad: "linear-gradient(135deg, #00BFA5, #00C853)", label: "Okyanus → Selvi", fg: "#fff" },
        ].map((g, i) => (
          <div key={i} style={{
            background: g.grad, borderRadius: 16, padding: "20px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 22, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: g.fg }}>iyi ki</div>
            <div style={{ fontSize: 9, color: g.fg, opacity: 0.7, fontFamily: "'DM Sans', sans-serif", textAlign: "right" }}>{g.label}</div>
          </div>
        ))}
      </div>

      {/* ═══ APP PREVIEW ═══ */}
      <div style={{ fontSize: 11, color: "#FF3300", letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>UYGULAMA ICINDE</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Dark phone */}
        <div style={{ borderRadius: 28, overflow: "hidden", border: "2px solid #333", boxShadow: "0 12px 36px rgba(0,0,0,0.4)" }}>
          <div style={{ background: "#0D0D0F", padding: "12px 16px 0", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: "#6B7280" }}>21:30</span>
            <span style={{ fontSize: 9, color: "#6B7280" }}>{"\u25cf\u25cf"}</span>
          </div>
          <div style={{ background: "#0D0D0F", padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontFamily: "'Libre Baskerville', serif", color: "#fff", fontStyle: "italic" }}>iyi ki</div>
          </div>
          <div style={{ background: "#0D0D0F", padding: "0 14px 12px" }}>
            <div style={{ background: "#1A1A2E", borderRadius: 16, padding: "18px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{"\u2615"}</div>
              <div style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#fff", marginBottom: 2 }}>Starbucks</div>
              <div style={{ fontSize: 9, color: "#6B7280", marginBottom: 10 }}>3 urun</div>
              <div style={{ padding: "7px 14px", borderRadius: 10, display: "inline-block", background: "linear-gradient(135deg, #FF3300, #FF6D00)", color: "#fff", fontSize: 10, fontWeight: 600, boxShadow: "0 3px 10px rgba(255,51,0,0.4)" }}>Kesfet</div>
            </div>
          </div>
          <div style={{ background: "#0D0D0F", padding: "4px 16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontFamily: "'Libre Baskerville', serif", color: "#FF3300", fontStyle: "italic", opacity: 0.6 }}>Dusunmen yeter.</div>
          </div>
        </div>

        {/* Light phone */}
        <div style={{ borderRadius: 28, overflow: "hidden", border: "2px solid #E5E7EB", boxShadow: "0 12px 36px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#FFFAF5", padding: "12px 16px 0", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: "#9CA3AF" }}>21:30</span>
            <span style={{ fontSize: 9, color: "#9CA3AF" }}>{"\u25cf\u25cf"}</span>
          </div>
          <div style={{ background: "#FFFAF5", padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontFamily: "'Libre Baskerville', serif", color: "#0D0D0F", fontStyle: "italic" }}>iyi ki</div>
          </div>
          <div style={{ background: "#FFFAF5", padding: "0 14px 12px" }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 12px", textAlign: "center", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{"\u2615"}</div>
              <div style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#0D0D0F", marginBottom: 2 }}>Starbucks</div>
              <div style={{ fontSize: 9, color: "#9CA3AF", marginBottom: 10 }}>3 urun</div>
              <div style={{ padding: "7px 14px", borderRadius: 10, display: "inline-block", background: "linear-gradient(135deg, #FF3300, #FF5722)", color: "#fff", fontSize: 10, fontWeight: 600, boxShadow: "0 3px 10px rgba(255,51,0,0.25)" }}>Kesfet</div>
            </div>
          </div>
          <div style={{ background: "#FFFAF5", padding: "4px 16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontFamily: "'Libre Baskerville', serif", color: "#FF3300", fontStyle: "italic", opacity: 0.6 }}>Dusunmen yeter.</div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", border: "1px solid #E5E7EB", marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: "linear-gradient(135deg, #FF3300, #E62E00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(255,51,0,0.3)" }}>
          <span style={{ fontSize: 12, fontFamily: "'Libre Baskerville', serif", color: "#fff", fontStyle: "italic" }}>ik</span>
        </div>
        <div>
          <div style={{ fontSize: 14, color: "#0D0D0F", fontFamily: "'Libre Baskerville', serif", fontStyle: "italic" }}>iyi ki</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>Biri seni dusundu.</div>
        </div>
      </div>

      {/* Success + Error states */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "#0D0D0F", borderRadius: 18, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{"\u2615"}</div>
          <div style={{ fontSize: 15, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#00C853" }}>Gonderildi!</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Iyi ki dusundun.</div>
        </div>
        <div style={{ background: "#0D0D0F", borderRadius: 18, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{"\u23F0"}</div>
          <div style={{ fontSize: 15, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#FFAB00" }}>72 saat kaldi</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Kahven seni bekliyor.</div>
        </div>
      </div>

      {/* Buttons all states */}
      <div style={{ fontSize: 11, color: "#FF3300", letterSpacing: 3, marginBottom: 10, marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>BUTONLAR</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: "#0D0D0F", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #FF3300, #FF6D00)", color: "#fff", fontSize: 11, fontWeight: 600, boxShadow: "0 4px 12px rgba(255,51,0,0.4)" }}>Hediye Et</div>
          <div style={{ fontSize: 8, color: "#6B7280" }}>Primary</div>
        </div>
        <div style={{ background: "#0D0D0F", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "10px 18px", borderRadius: 12, background: "transparent", color: "#FF3300", fontSize: 11, fontWeight: 600, border: "2px solid #FF3300" }}>Geri Don</div>
          <div style={{ fontSize: 8, color: "#6B7280" }}>Outline</div>
        </div>
        <div style={{ background: "#0D0D0F", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "10px 18px", borderRadius: 12, background: "#1A1A2E", color: "#fff", fontSize: 11, fontWeight: 600 }}>Kapat</div>
          <div style={{ fontSize: 8, color: "#6B7280" }}>Secondary</div>
        </div>
      </div>

      {/* Badges all colors */}
      <div style={{ fontSize: 11, color: "#FF3300", letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>BADGE & ETIKET</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", background: "#0D0D0F", borderRadius: 16, padding: 16 }}>
        {[
          { bg: "#FF33001A", fg: "#FF3300", text: "Hediye" },
          { bg: "#FFAB001A", fg: "#FFAB00", text: "72 saat" },
          { bg: "#00C8531A", fg: "#00C853", text: "Alindi" },
          { bg: "#00BFA51A", fg: "#00BFA5", text: "Yeni" },
          { bg: "#F500571A", fg: "#F50057", text: "Premium" },
          { bg: "#2979FF1A", fg: "#2979FF", text: "Bilgi" },
          { bg: "#FFFFFF15", fg: "#FFFFFF", text: "Starbucks" },
          { bg: "#FF6D001A", fg: "#FF6D00", text: "Populer" },
        ].map((b, i) => (
          <div key={i} style={{ padding: "5px 12px", borderRadius: 16, background: b.bg, color: b.fg, fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{b.text}</div>
        ))}
      </div>

      {/* Social media post */}
      <div style={{ fontSize: 11, color: "#FF3300", letterSpacing: 3, marginBottom: 10, marginTop: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>SOSYAL MEDYA</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "linear-gradient(135deg, #FF3300, #FF6D00)", borderRadius: 18, padding: "28px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff", marginBottom: 6 }}>iyi ki</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", lineHeight: 1.6 }}>En son kime{"\n"}kahve ismarladiniz?</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #0D0D0F, #2D1B3D)", borderRadius: 18, padding: "28px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 6 }}>iyi ki</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", lineHeight: 1.6 }}>Bugun birini{"\n"}dusundun mu?</div>
        </div>
      </div>
    </div>
  );
}
