import { useState } from "react";

const data = [
  {
    phase: "Faz 0 — Soru",
    week: "Hafta 1-2",
    rule: "Logo yok. Marka yok. Sadece soru. Kim yazdı? Neden? Kimse bilmiyor.",
    color: "#6B7280",
    texts: [
      "En son kime kahve ısmarladın?",
      "Bugün birini düşündün mü?",
      "Aklına geldi ama yapmadın, değil mi?",
      "Sana en son kim bir şey ısmarladi?",
      "Bir kahve kadar uzağındasın.",
      "Söylemedin. Ama düşündün. O da bir şey.",
      "Birini düşünmek için sebep mi lazım?",
      "Son mesajın kime attın? Peki son jestini?",
    ],
  },
  {
    phase: "Faz 1 — İpucu",
    week: "Hafta 3-4",
    rule: "Sorular + küçük 'iyi ki' beliriyor sağ altta. #FF3300 accent rengi giriyor.",
    color: "#FF6D00",
    texts: [
      "Düşünmek de bir hediyedir.",
      "Bir fincan kahve bir cümleden fazlasını söyler.",
      "Seni düşündüm demek zor. Göstermek kolay.",
      "Hediye pahalı olmak zorunda değil. Samimi olmak zorunda.",
      "Belki bir çikolata. Belki bir kahve. Belki sadece 'aklıma geldin'.",
      "Jest yapmak için sebep aramayı bırak.",
      "Bir jest bir gün değiştirebilir.",
      "Bazı şeyler söylenmez. Gösterilir.",
    ],
  },
  {
    phase: "Faz 2 — Açılış",
    week: "Hafta 5-6",
    rule: "iyi ki tam görünür. Logo büyük. Marka ortada. Merak cevaba dönüyor.",
    color: "#FF3300",
    texts: [
      "iyi ki varsın.",
      "iyi ki düşündün.",
      "iyi ki sen.",
      "Söylemene gerek yok. Düşünmen yeter.",
      "Birini düşün. Gerisini biz hallederiz.",
      "iyi ki. Yakında.",
      "Düşünce jest olsun. Jest hediye olsun.",
      "iyi ki düşünenler var.",
    ],
  },
];

export default function StickerTexts() {
  const [editingIdx, setEditingIdx] = useState(null);
  const [texts, setTexts] = useState(data.map(d => [...d.texts]));

  const updateText = (phaseIdx, textIdx, value) => {
    const n = texts.map(t => [...t]);
    n[phaseIdx][textIdx] = value;
    setTexts(n);
  };

  const addText = (phaseIdx) => {
    const n = texts.map(t => [...t]);
    n[phaseIdx].push("Yeni metin...");
    setTexts(n);
  };

  const removeText = (phaseIdx, textIdx) => {
    const n = texts.map(t => [...t]);
    n[phaseIdx].splice(textIdx, 1);
    setTexts(n);
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0C; }
        textarea { font-family: 'Libre Baskerville', serif; font-style: italic; resize: none; border: none; outline: none; width: 100%; background: transparent; }
        textarea::placeholder { color: #9CA3AF; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 32, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 6 }}>iyi ki</div>
        <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: 3 }}>STICKER METINLERI — TASLAK</div>
        <div style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Metinlere dokunarak duzenleyebilirsin</div>
      </div>

      {data.map((phase, pi) => (
        <div key={pi} style={{ marginBottom: 28 }}>
          {/* Phase header */}
          <div style={{
            background: `linear-gradient(135deg, ${phase.color}18, ${phase.color}08)`,
            borderRadius: 16, padding: "16px 18px", marginBottom: 12,
            borderLeft: `4px solid ${phase.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#fff", fontStyle: "italic" }}>{phase.phase}</div>
              <div style={{ fontSize: 11, color: phase.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{phase.week}</div>
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", marginTop: 6, lineHeight: 1.5 }}>{phase.rule}</div>
          </div>

          {/* Texts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {texts[pi].map((text, ti) => {
              const isEditing = editingIdx === `${pi}-${ti}`;
              return (
                <div key={ti} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: isEditing ? "rgba(255,51,0,0.06)" : "rgba(255,255,255,0.03)",
                  borderRadius: 12, padding: "12px 14px",
                  border: isEditing ? "1px solid rgba(255,51,0,0.2)" : "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                    background: phase.color, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                    marginTop: 2,
                  }}>{ti + 1}</div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <textarea
                        autoFocus
                        value={text}
                        onChange={e => updateText(pi, ti, e.target.value)}
                        onBlur={() => setEditingIdx(null)}
                        rows={3}
                        style={{
                          fontSize: 16, color: "#fff", lineHeight: 1.5,
                          padding: 0,
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingIdx(`${pi}-${ti}`)}
                        style={{
                          fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic",
                          color: "#fff", lineHeight: 1.5, cursor: "text",
                          minHeight: 24,
                        }}
                      >{text}</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeText(pi, ti)}
                    style={{
                      width: 24, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: "rgba(255,255,255,0.06)", color: "#6B7280", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}
                  >{"\u00d7"}</button>
                </div>
              );
            })}

            {/* Add button */}
            <button
              onClick={() => addText(pi)}
              style={{
                padding: "10px 16px", borderRadius: 12, border: `1px dashed ${phase.color}44`,
                background: "transparent", color: phase.color, cursor: "pointer",
                fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 16 }}>+</span> Yeni metin ekle
            </button>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "16px 18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 8,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>OZET</div>
        <div style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
          Faz 0: {texts[0].length} metin (soru fazı){"\n"}
          Faz 1: {texts[1].length} metin (ipucu fazı){"\n"}
          Faz 2: {texts[2].length} metin (açılış fazı){"\n"}
          Toplam: {texts[0].length + texts[1].length + texts[2].length} sticker metni
        </div>
      </div>

      <div style={{
        background: "rgba(255,51,0,0.08)", borderRadius: 16, padding: "14px 18px",
        border: "1px solid rgba(255,51,0,0.12)", marginTop: 12,
      }}>
        <div style={{ fontSize: 12, color: "#FF3300", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 4 }}>Gorsel Yon — Kilitli</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
          Sicak krem/seftali tonlari {"\u2022"} Nazik ince cizgi illustrasyonlar {"\u2022"} Libre Baskerville italic {"\u2022"} #FF3300 accent {"\u2022"} Editoryal dergi hissi {"\u2022"} Canva tasarimlari klasorde
        </div>
      </div>
    </div>
  );
}
