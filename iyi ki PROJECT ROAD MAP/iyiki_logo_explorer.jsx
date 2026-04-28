import { useState } from "react";

const FONTS = [
  { name: "Playfair Display", family: "'Playfair Display', Georgia, serif", import: "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800", weights: [400, 500, 600, 700, 800], category: "Serif — Klasik, kitap, entelektuel", vibe: "Edebiyat. Bir romanin ilk cumlesi gibi." },
  { name: "Cormorant Garamond", family: "'Cormorant Garamond', Georgia, serif", import: "Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700", weights: [300, 400, 500, 600, 700], category: "Serif — Zarif, ince, derin", vibe: "Mektup. El yazisinin dijitale en yakin hali." },
  { name: "Lora", family: "'Lora', Georgia, serif", import: "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700", weights: [400, 500, 600, 700], category: "Serif — Sicak, dengeli, modern", vibe: "Kahve fincaninin yanindaki kitap." },
  { name: "DM Serif Display", family: "'DM Serif Display', Georgia, serif", import: "DM+Serif+Display:ital@0;1", weights: [400], category: "Serif — Kalin, guclu, sicak", vibe: "Manifesto. Duvara yazilacak kadar kararli." },
  { name: "Libre Baskerville", family: "'Libre Baskerville', Georgia, serif", import: "Libre+Baskerville:ital,wght@0,400;0,700;1,400", weights: [400, 700], category: "Serif — Klasik, guvenilir, kalici", vibe: "Gazete basligi. Guvenle okunan yazi." },
  { name: "Quicksand", family: "'Quicksand', sans-serif", import: "Quicksand:wght@300;400;500;600;700", weights: [300, 400, 500, 600, 700], category: "Sans — Yuvarlak, sicak, samimi", vibe: "Arkadasinin sana soyledigi sey.", noItalic: true },
  { name: "Nunito", family: "'Nunito', sans-serif", import: "Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800", weights: [300, 400, 500, 600, 700, 800], category: "Sans — Yuvarlak, enerjik, modern", vibe: "Gulumseyen biri. Sicak ama hafif." },
  { name: "Josefin Sans", family: "'Josefin Sans', sans-serif", import: "Josefin+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700", weights: [100, 200, 300, 400, 500, 600, 700], category: "Sans — Geometrik, elegant, farkli", vibe: "Galeri duvari. Karakterli minimalizm." },
  { name: "Outfit", family: "'Outfit', sans-serif", import: "Outfit:wght@100;200;300;400;500;600;700;800;900", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: "Sans — Modern, temiz, insani", vibe: "Yeni nesil. Teknoloji degil ama cagdas.", noItalic: true },
  { name: "Fraunces", family: "'Fraunces', Georgia, serif", import: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900", weights: [300, 400, 500, 600, 700, 800], category: "Serif — Organik, kisilikli, sicak", vibe: "El yapimi. Kusursuz degil ama gercek." },
];

export default function LogoExplorer() {
  const [selectedFont, setSelectedFont] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(600);
  const [letterSpacing, setLetterSpacing] = useState(3);
  const [showItalic, setShowItalic] = useState(false);
  const [compareMode, setCompareMode] = useState(true);

  const font = FONTS[selectedFont];
  const importUrl = FONTS.map(f => `family=${f.import}`).join("&");

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?${importUrl}&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F0F14; }
        input[type=range] { -webkit-appearance: none; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; outline: none; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #E85D3A; cursor: pointer; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: "#F7A072", fontFamily: "'DM Sans', sans-serif", letterSpacing: 3, marginBottom: 6 }}>LOGO FONT SECIMI</div>
        <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Kucuk harf \u2022 Normal + Italik \u2022 Cizgi yok</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
        <button onClick={() => setCompareMode(true)} style={{ ...S.toggleBtn, background: compareMode ? "linear-gradient(135deg, #E85D3A, #F4845F)" : "rgba(255,255,255,0.06)", color: compareMode ? "#fff" : "#888" }}>Hepsini Karsilastir</button>
        <button onClick={() => setCompareMode(false)} style={{ ...S.toggleBtn, background: !compareMode ? "linear-gradient(135deg, #E85D3A, #F4845F)" : "rgba(255,255,255,0.06)", color: !compareMode ? "#fff" : "#888" }}>Detayli Incele</button>
      </div>

      {compareMode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FONTS.map((f, i) => (
            <div key={i} onClick={() => { setSelectedFont(i); setSelectedWeight(f.weights[Math.min(f.weights.length - 1, 3)]); setCompareMode(false); }} style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: "16px 20px", cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s",
            }}>
              {/* Two previews: normal + italic */}
              <div style={{ display: "grid", gridTemplateColumns: f.noItalic ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {/* Normal */}
                <div style={{
                  background: "#1A1A2E", borderRadius: 14, padding: "24px 16px", textAlign: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: 180, height: 180, background: "radial-gradient(circle, rgba(232,93,58,0.1) 0%, transparent 70%)", borderRadius: "50%",
                  }} />
                  <div style={{ fontSize: 10, color: "#8D99AE", marginBottom: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2 }}>NORMAL</div>
                  <div style={{
                    fontSize: 34, fontFamily: f.family, fontWeight: f.weights[Math.min(f.weights.length - 1, 3)],
                    color: "#FFFFFF", letterSpacing: 3, position: "relative",
                  }}>iyi ki</div>
                </div>

                {/* Italic */}
                {!f.noItalic && (
                  <div style={{
                    background: "linear-gradient(135deg, #FBF0E4, #FFF5EE)", borderRadius: 14, padding: "24px 16px", textAlign: "center",
                    border: "1px solid rgba(232,93,58,0.08)",
                  }}>
                    <div style={{ fontSize: 10, color: "#E85D3A", marginBottom: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2 }}>ITALIK</div>
                    <div style={{
                      fontSize: 34, fontFamily: f.family, fontWeight: f.weights[Math.min(f.weights.length - 1, 3)],
                      color: "#1A1A2E", letterSpacing: 3, fontStyle: "italic",
                    }}>iyi ki</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{f.category}</div>
                </div>
                <div style={{ fontSize: 11, color: "#F7A072", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", maxWidth: 180, textAlign: "right" }}>{f.vibe}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Font selector pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            {FONTS.map((f, i) => (
              <button key={i} onClick={() => { setSelectedFont(i); setSelectedWeight(f.weights[Math.min(f.weights.length - 1, 3)]); }} style={{
                padding: "6px 12px", borderRadius: 14, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                background: selectedFont === i ? "linear-gradient(135deg, #E85D3A, #F4845F)" : "rgba(255,255,255,0.06)",
                color: selectedFont === i ? "#fff" : "#888",
                boxShadow: selectedFont === i ? "0 4px 12px rgba(232,93,58,0.3)" : "none",
              }}>{f.name}</button>
            ))}
          </div>

          {/* Normal + Italic hero side by side */}
          <div style={{ display: "grid", gridTemplateColumns: font.noItalic ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{
              background: "linear-gradient(135deg, #1A1A2E 0%, #2D1B3D 40%, #1A1A2E 100%)",
              borderRadius: 24, padding: "52px 20px", textAlign: "center", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 260, height: 260, background: "radial-gradient(circle, rgba(232,93,58,0.15) 0%, transparent 60%)", borderRadius: "50%" }} />
              <div style={{ fontSize: 10, color: "#8D99AE", letterSpacing: 3, marginBottom: 14, position: "relative", fontFamily: "'DM Sans', sans-serif" }}>NORMAL</div>
              <div style={{
                fontSize: 52, fontFamily: font.family, fontWeight: selectedWeight,
                color: "#FFFFFF", letterSpacing: letterSpacing, position: "relative",
                textShadow: "0 0 40px rgba(232,93,58,0.2)",
              }}>iyi ki</div>
            </div>

            {!font.noItalic && (
              <div style={{
                background: "linear-gradient(135deg, #1A1A2E 0%, #2D1B3D 40%, #1A1A2E 100%)",
                borderRadius: 24, padding: "52px 20px", textAlign: "center", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 260, height: 260, background: "radial-gradient(circle, rgba(247,160,114,0.12) 0%, transparent 60%)", borderRadius: "50%" }} />
                <div style={{ fontSize: 10, color: "#F7A072", letterSpacing: 3, marginBottom: 14, position: "relative", fontFamily: "'DM Sans', sans-serif" }}>ITALIK</div>
                <div style={{
                  fontSize: 52, fontFamily: font.family, fontWeight: selectedWeight,
                  color: "#FFFFFF", letterSpacing: letterSpacing, position: "relative",
                  fontStyle: "italic", textShadow: "0 0 40px rgba(247,160,114,0.2)",
                }}>iyi ki</div>
              </div>
            )}
          </div>

          {/* Light bg versions */}
          <div style={{ display: "grid", gridTemplateColumns: font.noItalic ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{
              background: "linear-gradient(135deg, #FBF0E4, #FFF5EE)",
              borderRadius: 24, padding: "52px 20px", textAlign: "center",
              border: "1px solid rgba(232,93,58,0.08)",
            }}>
              <div style={{
                fontSize: 52, fontFamily: font.family, fontWeight: selectedWeight,
                color: "#1A1A2E", letterSpacing: letterSpacing,
              }}>iyi ki</div>
            </div>

            {!font.noItalic && (
              <div style={{
                background: "linear-gradient(135deg, #FBF0E4, #FFF5EE)",
                borderRadius: 24, padding: "52px 20px", textAlign: "center",
                border: "1px solid rgba(232,93,58,0.08)",
              }}>
                <div style={{
                  fontSize: 52, fontFamily: font.family, fontWeight: selectedWeight,
                  color: "#1A1A2E", letterSpacing: letterSpacing, fontStyle: "italic",
                }}>iyi ki</div>
              </div>
            )}
          </div>

          {/* App icon + notification */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ background: "#1A1A2E", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 9, color: "#8D99AE", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif" }}>APP ICON</div>
              <div style={{
                width: 60, height: 60, borderRadius: 15,
                background: "linear-gradient(135deg, #E85D3A, #F4845F)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(232,93,58,0.5)",
              }}>
                <span style={{ fontSize: 17, fontFamily: font.family, fontWeight: selectedWeight, color: "#fff", letterSpacing: 1 }}>ik</span>
              </div>
            </div>
            <div style={{ background: "#1A1A2E", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 9, color: "#8D99AE", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif" }}>ICON ITALIK</div>
              <div style={{
                width: 60, height: 60, borderRadius: 15,
                background: "linear-gradient(135deg, #E85D3A, #F4845F)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(232,93,58,0.5)",
              }}>
                <span style={{ fontSize: 17, fontFamily: font.family, fontWeight: selectedWeight, color: "#fff", letterSpacing: 1, fontStyle: "italic" }}>ik</span>
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #E85D3A, #D44A2A)", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <div style={{ fontSize: 22, fontFamily: font.family, fontWeight: selectedWeight, color: "#fff", letterSpacing: 2 }}>iyi ki</div>
            </div>
          </div>

          {/* Notification mockup */}
          <div style={{ fontSize: 12, color: "#F7A072", fontWeight: 700, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>BILDIRIM ONIZLEME</div>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "14px 16px",
            display: "flex", gap: 12, alignItems: "flex-start",
            border: "1px solid rgba(0,0,0,0.06)", marginBottom: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #E85D3A, #F4845F)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(232,93,58,0.3)",
            }}>
              <span style={{ fontSize: 12, fontFamily: font.family, fontWeight: selectedWeight, color: "#fff" }}>ik</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", fontFamily: font.family }}>iyi ki</div>
              <div style={{ fontSize: 13, color: "#444", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>Biri seni dusundu.</div>
            </div>
          </div>

          {/* Uygulama ici header */}
          <div style={{ fontSize: 12, color: "#F7A072", fontWeight: 700, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>UYGULAMA ICI HEADER</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#1A1A2E", borderRadius: 16, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontFamily: font.family, fontWeight: selectedWeight, color: "#fff", letterSpacing: letterSpacing * 0.6 }}>iyi ki</div>
              <div style={{ fontSize: 11, color: "#8D99AE", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>Marka sec</div>
            </div>
            <div style={{ background: "#1A1A2E", borderRadius: 16, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontFamily: font.family, fontWeight: selectedWeight, color: "#fff", letterSpacing: letterSpacing * 0.6, fontStyle: "italic" }}>iyi ki</div>
              <div style={{ fontSize: 11, color: "#8D99AE", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>Marka sec (italik)</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "20px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 13, color: "#F7A072", fontWeight: 700, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>AYARLAR</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Kalinlik: {selectedWeight}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {font.weights.map(w => (
                  <button key={w} onClick={() => setSelectedWeight(w)} style={{
                    padding: "5px 10px", borderRadius: 10, border: "none", cursor: "pointer",
                    fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                    background: selectedWeight === w ? "#E85D3A" : "rgba(255,255,255,0.08)",
                    color: selectedWeight === w ? "#fff" : "#888",
                  }}>{w}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Harf araligi: {letterSpacing}px</div>
              <input type="range" min={0} max={12} step={0.5} value={letterSpacing} onChange={e => setLetterSpacing(Number(e.target.value))} />
            </div>
          </div>

          {/* Font info */}
          <div style={{ background: "#1A1A2E", borderRadius: 20, padding: "20px 24px", marginTop: 8 }}>
            <div style={{ fontSize: 16, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 6 }}>{font.name}</div>
            <div style={{ fontSize: 12, color: "#F7A072", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{font.category}</div>
            <div style={{ fontSize: 13, color: "#B0B8C4", fontStyle: "italic", fontFamily: "'Playfair Display', serif", lineHeight: 1.6 }}>"{font.vibe}"</div>
          </div>
        </>
      )}
    </div>
  );
}

const S = {
  page: { maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" },
  toggleBtn: { padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
};
