import { useState } from "react";

const treatments = [
  {
    name: "Duz (Varsayilan)",
    desc: "Standart kullanim. Uygulama ici, bildirim, kucuk boyutlar.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FFFFFF" }),
    darkBg: true,
  },
  {
    name: "Yumusak Golge",
    desc: "Sosyal medya, landing page, orta vurgu.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FFFFFF", textShadow: "0 4px 12px rgba(255,51,0,0.5)" }),
    darkBg: true,
  },
  {
    name: "Derin Golge",
    desc: "Poster, basili materyal, guclu vurgu.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FFFFFF", textShadow: "0 6px 20px rgba(255,51,0,0.6), 0 2px 4px rgba(0,0,0,0.3)" }),
    darkBg: true,
  },
  {
    name: "Glow (Isiltili)",
    desc: "Video, animasyon, dijital reklam, premium an.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FFFFFF", textShadow: "0 0 20px rgba(255,51,0,0.7), 0 0 40px rgba(255,51,0,0.4), 0 0 60px rgba(255,51,0,0.2)" }),
    darkBg: true,
  },
  {
    name: "3D Extrude",
    desc: "Merch, sticker, fiziksel materyal, poster.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FF3300", textShadow: "1px 1px 0 #CC2900, 2px 2px 0 #B32400, 3px 3px 0 #991F00, 4px 4px 0 #801A00, 5px 5px 10px rgba(0,0,0,0.3)" }),
    darkBg: true,
  },
  {
    name: "3D Beyaz",
    desc: "Acik zeminde 3D. Billboard, vitrin, basili.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FF3300", textShadow: "1px 1px 0 #E62E00, 2px 2px 0 #CC2900, 3px 3px 0 #B32400, 4px 4px 8px rgba(0,0,0,0.15)" }),
    darkBg: false,
  },
  {
    name: "Uzun Golge",
    desc: "Retro his, sosyal medya, ozel icerik.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FF3300", textShadow: Array.from({length: 20}, (_, i) => `${i+1}px ${i+1}px 0 rgba(204,41,0,${0.4 - i*0.02})`).join(', ') }),
    darkBg: true,
  },
  {
    name: "Outline (Cerceve)",
    desc: "Minimal vurgu, overlay, video ustune yazi.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "transparent", WebkitTextStroke: "2px #FF3300" }),
    darkBg: true,
  },
  {
    name: "Outline Beyaz",
    desc: "Renkli zemin ustune, fotograf ustune.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "transparent", WebkitTextStroke: "2px #FFFFFF" }),
    darkBg: true,
    colorBg: true,
  },
  {
    name: "Kabartma (Emboss)",
    desc: "Premium his, incelikli derinlik.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#1A1A2E", textShadow: "1px 1px 1px rgba(255,255,255,0.8), -1px -1px 1px rgba(0,0,0,0.15)" }),
    darkBg: false,
  },
  {
    name: "Neon",
    desc: "Gece temasi, ozel etkinlik, parti hissi.",
    styles: (size) => ({ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FF5722", textShadow: "0 0 7px #FF3300, 0 0 10px #FF3300, 0 0 21px #FF3300, 0 0 42px #FF3300, 0 0 82px rgba(255,51,0,0.3)" }),
    darkBg: true,
  },
  {
    name: "Cift Katman",
    desc: "Baslik + alt golge. Hero alanlari, splash ekrani.",
    render: (size) => (
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "rgba(255,51,0,0.2)", position: "absolute", top: 4, left: 4 }}>iyi ki</div>
        <div style={{ fontSize: size, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", fontWeight: 400, color: "#FFFFFF", position: "relative" }}>iyi ki</div>
      </div>
    ),
    darkBg: true,
  },
];

export default function LogoTreatments() {
  const [size, setSize] = useState(48);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0C; }
        input[type=range] { -webkit-appearance: none; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; outline: none; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #FF3300; cursor: pointer; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 32, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 6 }}>iyi ki</div>
        <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: 3 }}>LOGO ISLEMLERI \u2022 GOLGE \u2022 3D \u2022 EFEKT</div>
      </div>

      {/* Size control */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "14px 18px", marginBottom: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#FF3300", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2 }}>BOYUT</span>
          <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>{size}px</span>
        </div>
        <input type="range" min={28} max={72} value={size} onChange={e => setSize(Number(e.target.value))} />
      </div>

      {/* All treatments */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {treatments.map((t, i) => {
          const bgColor = t.colorBg
            ? "linear-gradient(135deg, #FF3300, #E62E00)"
            : t.darkBg
              ? "linear-gradient(135deg, #0D0D0F, #1A1A2E)"
              : "linear-gradient(135deg, #FFFAF5, #FFF0E0)";

          return (
            <div key={i} style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Preview */}
              <div style={{
                background: bgColor, padding: "36px 24px", textAlign: "center",
                borderBottom: t.darkBg ? "none" : "1px solid rgba(0,0,0,0.06)",
                minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {t.render ? t.render(size) : <div style={t.styles(size)}>iyi ki</div>}
              </div>

              {/* Info */}
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{t.desc}</div>
                </div>
                <div style={{ fontSize: 9, color: "#FF3300", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: 1, flexShrink: 0, marginLeft: 12 }}>
                  {i === 0 ? "VARSAYILAN" : "OPSIYONEL"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage rules */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "20px", marginTop: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", fontWeight: 700, marginBottom: 12 }}>Kullanim Kurallari</div>
        <div style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif" }}>
          {"\u2022"} Uygulama icinde her zaman Duz (varsayilan) kullanilir{"\n"}
          {"\u2022"} Sosyal medyada Yumusak Golge veya Derin Golge tercih edilir{"\n"}
          {"\u2022"} Video ve animasyonda Glow veya Neon kullanilabilir{"\n"}
          {"\u2022"} Fiziksel materyalde (merch, sticker, poster) 3D Extrude veya Uzun Golge{"\n"}
          {"\u2022"} Fotograf ustune Outline Beyaz veya Cift Katman{"\n"}
          {"\u2022"} Acik zemin ustune 3D Beyaz veya Kabartma{"\n"}
          {"\u2022"} Neon sadece ozel etkinlik ve gece temasi icin{"\n"}
          {"\u2022"} Ayni gorselde birden fazla efekt karistirilmaz{"\n"}
          {"\u2022"} Efekt logo okunurlugunu bozmamali — okunmuyorsa kullanilmaz
        </div>
      </div>
    </div>
  );
}
