import { useState } from "react";

const COLORS = [
  { name: "Nar", hex: "#E63946", desc: "Nar tanesi. Canli, sicak, cesur." },
  { name: "Mandalina", hex: "#F77F00", desc: "Taze mandalina. Parlak, neset dolu." },
  { name: "Ahududu", hex: "#D81159", desc: "Taze ahududu. Cesur, dolgun." },
  { name: "Orange Peel", hex: "#F58233", desc: "Pantone 16-1364 TCX. Portakal kabugu. Sicak, enerjik." },
  { name: "Orange Tiger", hex: "#F27829", desc: "Pantone 16-1358 TCX. Kaplan turuncusu. Guclu, kararli." },
  { name: "Alev Kirmizisi", hex: "#FF3300", desc: "Saf alev. Kirmizi ile turuncunun en keskin bulusma noktasi." },
];

export default function ColorExplorerFinal() {
  const [selected, setSelected] = useState(0);
  const color = COLORS[selected];

  const lighten = (hex, amt) => {
    let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  };
  const darken = (hex, amt) => {
    let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    r = Math.max(0, r - amt); g = Math.max(0, g - amt); b = Math.max(0, b - amt);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  };

  const bg = lighten(color.hex, 95);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F0F14; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: color.hex, fontFamily: "'DM Sans', sans-serif", letterSpacing: 3, marginBottom: 4, transition: "color 0.4s" }}>MARKA RENGI</div>
      </div>

      {/* 6 colors */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
        {COLORS.map((c, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            width: 48, height: 48, borderRadius: 14,
            border: selected === i ? "3px solid #fff" : "2px solid rgba(255,255,255,0.12)",
            background: c.hex, cursor: "pointer", transition: "all 0.3s",
            boxShadow: selected === i ? `0 6px 20px ${c.hex}88` : `0 2px 6px ${c.hex}22`,
            transform: selected === i ? "scale(1.18)" : "scale(1)",
          }} title={c.name} />
        ))}
      </div>

      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${color.hex}, ${darken(color.hex, 28)})`,
        borderRadius: 20, padding: "20px 18px", marginBottom: 14, textAlign: "center",
        transition: "background 0.4s", boxShadow: `0 10px 28px ${color.hex}50`,
      }}>
        <div style={{ fontSize: 24, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#fff" }}>{color.name}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{color.desc}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{color.hex}</div>
      </div>

      {/* Logo dark + light */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div style={{
          background: "linear-gradient(135deg, #1A1A2E, #2D1B3D, #1A1A2E)",
          borderRadius: 22, padding: "40px 14px", textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 200, height: 200, background: `radial-gradient(circle, ${color.hex}22 0%, transparent 60%)`, borderRadius: "50%", transition: "background 0.4s" }} />
          <div style={{ fontSize: 40, fontFamily: "'Libre Baskerville', serif", fontWeight: 400, color: "#FFFFFF", fontStyle: "italic", position: "relative", textShadow: `0 0 30px ${color.hex}30` }}>iyi ki</div>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${bg}, #FFFFFF)`,
          borderRadius: 22, padding: "40px 14px", textAlign: "center", border: `1px solid ${color.hex}12`, transition: "all 0.4s",
        }}>
          <div style={{ fontSize: 40, fontFamily: "'Libre Baskerville', serif", fontWeight: 400, color: "#1A1A2E", fontStyle: "italic" }}>iyi ki</div>
        </div>
      </div>

      {/* Logo on color */}
      <div style={{
        background: `linear-gradient(135deg, ${color.hex}, ${darken(color.hex, 30)})`,
        borderRadius: 22, padding: "40px 18px", textAlign: "center", marginBottom: 14,
        transition: "background 0.4s", boxShadow: `0 8px 20px ${color.hex}40`,
      }}>
        <div style={{ fontSize: 44, fontFamily: "'Libre Baskerville', serif", fontWeight: 400, color: "#FFFFFF", fontStyle: "italic" }}>iyi ki</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 10, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic" }}>Soylemene gerek yok. Dusunmen yeter.</div>
      </div>

      {/* Elements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "#1A1A2E", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 8, color: "#8D99AE", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif" }}>ICON</div>
          <div style={{ width: 50, height: 50, borderRadius: 13, background: `linear-gradient(135deg, ${color.hex}, ${darken(color.hex, 18)})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 5px 16px ${color.hex}50`, transition: "all 0.4s" }}>
            <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: "#fff", fontStyle: "italic" }}>ik</span>
          </div>
        </div>
        <div style={{ background: "#1A1A2E", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 8, color: "#8D99AE", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif" }}>BUTON</div>
          <div style={{ padding: "9px 13px", borderRadius: 11, marginTop: 4, background: `linear-gradient(135deg, ${color.hex}, ${lighten(color.hex, 15)})`, color: "#fff", fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, boxShadow: `0 3px 10px ${color.hex}40`, transition: "all 0.4s" }}>Hediye Et</div>
        </div>
        <div style={{ background: "#1A1A2E", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 8, color: "#8D99AE", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif" }}>BADGE</div>
          <div style={{ padding: "5px 10px", borderRadius: 14, marginTop: 6, background: `${color.hex}18`, color: color.hex, fontSize: 9, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: "all 0.4s" }}>Starbucks</div>
        </div>
        <div style={{ background: "#1A1A2E", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 8, color: "#8D99AE", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif" }}>DOT</div>
          <div style={{ width: 7, height: 18, borderRadius: 4, marginTop: 8, background: color.hex, transition: "background 0.4s", boxShadow: `0 2px 8px ${color.hex}55` }} />
        </div>
      </div>

      {/* Notification */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", border: "1px solid rgba(0,0,0,0.06)", marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: `linear-gradient(135deg, ${color.hex}, ${darken(color.hex, 15)})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 10px ${color.hex}30`, transition: "all 0.4s" }}>
          <span style={{ fontSize: 12, fontFamily: "'Libre Baskerville', serif", color: "#fff", fontStyle: "italic" }}>ik</span>
        </div>
        <div>
          <div style={{ fontSize: 14, color: "#1A1A2E", fontFamily: "'Libre Baskerville', serif", fontStyle: "italic" }}>iyi ki</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>Biri seni dusundu.</div>
        </div>
      </div>

      {/* Gift cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#1A1A2E", borderRadius: 18, padding: "20px 14px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -18, right: -18, width: 80, height: 80, background: `radial-gradient(circle, ${color.hex}22 0%, transparent 70%)`, borderRadius: "50%", transition: "background 0.4s" }} />
          <div style={{ fontSize: 26, marginBottom: 6, position: "relative" }}>{"\u2615"}</div>
          <div style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#fff", marginBottom: 3, position: "relative" }}>Caffe Latte</div>
          <div style={{ fontSize: 10, color: "#8D99AE", fontFamily: "'DM Sans', sans-serif", marginBottom: 10, position: "relative" }}>Starbucks</div>
          <div style={{ padding: "7px 12px", borderRadius: 9, display: "inline-block", background: `linear-gradient(135deg, ${color.hex}, ${lighten(color.hex, 12)})`, color: "#fff", fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, boxShadow: `0 3px 8px ${color.hex}40`, transition: "all 0.4s" }}>Hediye Et</div>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${bg}, #fff)`, borderRadius: 18, padding: "20px 14px", border: `1px solid ${color.hex}10`, transition: "all 0.4s" }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>{"\ud83c\udf39"}</div>
          <div style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#1A1A2E", marginBottom: 3 }}>Kirmizi Guller</div>
          <div style={{ fontSize: 10, color: "#8D99AE", fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>Kahve Dunyasi</div>
          <div style={{ padding: "7px 12px", borderRadius: 9, display: "inline-block", background: `linear-gradient(135deg, ${color.hex}, ${lighten(color.hex, 12)})`, color: "#fff", fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, boxShadow: `0 3px 8px ${color.hex}40`, transition: "all 0.4s" }}>Hediye Et</div>
        </div>
      </div>

      {/* Stickers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "26px 12px", textAlign: "center", border: `2px solid ${color.hex}`, transition: "border-color 0.4s" }}>
          <div style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: color.hex, lineHeight: 1.7, transition: "color 0.4s" }}>
            En son kime{"\n"}kahve ismarladiniz?
          </div>
        </div>
        <div style={{ background: color.hex, borderRadius: 16, padding: "26px 12px", textAlign: "center", transition: "background 0.4s", boxShadow: `0 4px 14px ${color.hex}44` }}>
          <div style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff", lineHeight: 1.7 }}>
            Bugun birini{"\n"}dusundun mu?
          </div>
        </div>
      </div>

      {/* Social */}
      <div style={{
        background: `linear-gradient(135deg, ${color.hex}, ${darken(color.hex, 35)})`,
        borderRadius: 20, padding: "34px 18px", textAlign: "center", marginBottom: 18,
        transition: "background 0.4s", boxShadow: `0 8px 20px ${color.hex}40`,
      }}>
        <div style={{ fontSize: 30, fontFamily: "'Libre Baskerville', serif", fontWeight: 400, color: "#fff", fontStyle: "italic", marginBottom: 6 }}>iyi ki</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", lineHeight: 1.7 }}>
          En son kime{"\n"}kahve ismarladiniz?
        </div>
      </div>

      {/* Info */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: color.hex, transition: "background 0.4s", boxShadow: `0 4px 12px ${color.hex}44`, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 17, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{color.name}</div>
            <div style={{ fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{color.hex}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#999", marginTop: 10, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>{color.desc}</div>
      </div>
    </div>
  );
}
