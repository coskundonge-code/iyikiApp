import { useState, useEffect } from "react";

export default function BrandIdentityFinal() {
  const [activeSection, setActiveSection] = useState(0);
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 2000); return () => clearInterval(t); }, []);

  const sections = ["Marka Ruhu", "Logo", "Logo Efekt", "Renkler", "Tipografi", "Gorsel Dil", "Ses & Ton", "Bildirimler"];

  return (
    <div style={S.page}>
      <div style={S.nav}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(i)} style={{
            ...S.navBtn,
            background: activeSection === i ? "linear-gradient(135deg, #FF3300, #FF6D00)" : "rgba(255,255,255,0.06)",
            color: activeSection === i ? "#fff" : "#888",
            boxShadow: activeSection === i ? "0 4px 14px rgba(255,51,0,0.4)" : "none",
          }}>{s}</button>
        ))}
      </div>

      {/* ═══ MARKA RUHU ═══ */}
      {activeSection === 0 && (
        <div style={S.section}>
          <div style={{
            background: "linear-gradient(135deg, #0D0D0F 0%, #2D1B3D 50%, #0D0D0F 100%)",
            borderRadius: 28, padding: "52px 28px", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: pulse ? 280 : 220, height: pulse ? 280 : 220,
              background: "radial-gradient(circle, rgba(255,51,0,0.18) 0%, transparent 70%)",
              borderRadius: "50%", transition: "all 2s ease-in-out",
            }} />
            <div style={{
              fontSize: 52, fontFamily: F.logo, fontWeight: 400, fontStyle: "italic",
              color: "#FFFFFF", position: "relative", zIndex: 1,
              textShadow: "0 0 40px rgba(255,51,0,0.3)",
            }}>iyi ki</div>
            <div style={{
              fontSize: 15, fontFamily: F.logo, color: "#FF3300",
              marginTop: 14, position: "relative", zIndex: 1, fontStyle: "italic",
            }}>Soylemene gerek yok. Dusunmen yeter.</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #FFF5F0, #FFF)",
            borderRadius: 20, padding: "24px", borderLeft: "4px solid #FF3300",
          }}>
            <div style={{ fontSize: 20, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 12, fontStyle: "italic" }}>
              Bu marka sessiz degil.
            </div>
            <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, fontFamily: F.body }}>
              IYI KI, birini dusundugunde karninda hissettigin o sicak dalganin markasi.
              O his donuk degil. O his canli. Gulmsetiyor. Icinde bir sey kipirdıyor.
              "Simdi bir sey yapacagim" diyorsun. O an enerjik bir an.
              {"\n\n"}
              Biz o anin enerjisini tasiyoruz. Bagirmadan. Ama fısıldamadan da degil.
              Normal sesle, gozune bakarak, samimi bir gulumseemeyle konusuyoruz.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "linear-gradient(135deg, #FF3300, #E62E00)", borderRadius: 20, padding: "24px 20px", color: "#fff" }}>
              <div style={{ fontSize: 16, fontFamily: F.logo, fontWeight: 700, marginBottom: 12, fontStyle: "italic" }}>Bizim Enerjimiz</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.95 }}>
                Sicak ama canli{"\n"}Samimi ama kararli{"\n"}Yumusak ama guclu{"\n"}Sade ama zengin{"\n"}Sessiz degil — icten
              </div>
            </div>
            <div style={{ background: "#0D0D0F", borderRadius: 20, padding: "24px 20px" }}>
              <div style={{ fontSize: 16, fontFamily: F.logo, fontWeight: 700, marginBottom: 12, color: "#FF3300", fontStyle: "italic" }}>Bu Degiliz</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: "#6B7280" }}>
                Donuk, soluk, uykulu{"\n"}Klinik, steril, soguk{"\n"}Bagiran, itan, zorlayan{"\n"}Civis civis, emoji dolu{"\n"}Kurumsal, plastik, sahte
              </div>
            </div>
          </div>

          <div style={{ background: "#0D0D0F", borderRadius: 20, padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#FF3300", fontFamily: F.logo, fontStyle: "italic", lineHeight: 1.8 }}>
              "IYI KI bir mum gibi. Sessizce yanar ama odayi isitir.{"\n"}Ama sonenin yaninda durur — asla sonmez."
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 14, fontFamily: F.logo, fontWeight: 700, color: "#FF3300", marginBottom: 10, fontStyle: "italic" }}>Marka Arketipi</div>
            <div style={{ fontSize: 14, color: "#9CA3AF", lineHeight: 1.7, fontFamily: F.body }}>
              <strong style={{ color: "#fff" }}>Bakici (The Caregiver)</strong> — modernize edilmis hali.
              "Seni dusundum" demenin utanilacak bir sey degil, gosterilecek bir sey oldugunu bilen biri.
              Elinde bir kahve tutuyor ve karsi tarafin gozune bakiyor.
            </div>
          </div>
        </div>
      )}

      {/* ═══ LOGO ═══ */}
      {activeSection === 1 && (
        <div style={S.section}>
          <div style={{
            background: "linear-gradient(135deg, #FFF5F0, #FFF)",
            borderRadius: 20, padding: "24px", borderLeft: "4px solid #FF3300",
          }}>
            <div style={{ fontSize: 18, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 10, fontStyle: "italic" }}>Logo = Cumle</div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: F.body }}>
              Kucuk harf. Italic. Libre Baskerville. Harf araligi sifir.
              Harfler birbirine yakin duruyor — tipki birbirine yakin insanlar gibi.
              Italik yazi hareketi tasiyor, sanki biri az once yazmis gibi.
            </div>
          </div>

          {/* Kilitli karar */}
          <div style={{ background: "#FF3300", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>{"\u2705"}</span>
            <span style={{ fontSize: 12, color: "#fff", fontFamily: F.body, fontWeight: 700 }}>KILITLI: Libre Baskerville \u2022 Italic \u2022 Letter-spacing: 0 \u2022 Kucuk harf</span>
          </div>

          {/* Dark bg */}
          <div style={{
            background: "linear-gradient(135deg, #0D0D0F 0%, #2D1B3D 50%, #0D0D0F 100%)",
            borderRadius: 24, padding: "52px 28px", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 260, height: 260, background: "radial-gradient(circle, rgba(255,51,0,0.15) 0%, transparent 60%)", borderRadius: "50%" }} />
            <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 3, marginBottom: 16, position: "relative", fontFamily: F.body }}>KOYU ZEMIN</div>
            <div style={{ fontSize: 56, fontFamily: F.logo, fontWeight: 400, color: "#FFFFFF", fontStyle: "italic", position: "relative", textShadow: "0 0 40px rgba(255,51,0,0.2)" }}>iyi ki</div>
          </div>

          {/* Light bg */}
          <div style={{
            background: "linear-gradient(135deg, #FFFAF5, #FFFFFF)",
            borderRadius: 24, padding: "52px 28px", textAlign: "center",
            border: "1px solid rgba(255,51,0,0.08)",
          }}>
            <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 16, fontFamily: F.body }}>ACIK ZEMIN</div>
            <div style={{ fontSize: 56, fontFamily: F.logo, fontWeight: 400, color: "#0D0D0F", fontStyle: "italic" }}>iyi ki</div>
          </div>

          {/* On color */}
          <div style={{
            background: "linear-gradient(135deg, #FF3300, #E62E00)",
            borderRadius: 24, padding: "52px 28px", textAlign: "center",
            boxShadow: "0 8px 24px rgba(255,51,0,0.4)",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 3, marginBottom: 16, fontFamily: F.body }}>RENK UZERINDE</div>
            <div style={{ fontSize: 56, fontFamily: F.logo, fontWeight: 400, color: "#FFFFFF", fontStyle: "italic" }}>iyi ki</div>
          </div>

          {/* App icons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ background: "#0D0D0F", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 9, color: "#6B7280", letterSpacing: 2, fontFamily: F.body }}>APP ICON</div>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: "linear-gradient(135deg, #FF3300, #E62E00)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(255,51,0,0.5)",
              }}>
                <span style={{ fontSize: 18, fontFamily: F.logo, color: "#fff", fontStyle: "italic" }}>ik</span>
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #FF3300, #FF6D00)", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 28, fontFamily: F.logo, color: "#fff", fontStyle: "italic" }}>iyi ki</div>
            </div>
            <div style={{ background: "#FFFAF5", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 28, fontFamily: F.logo, color: "#0D0D0F", fontStyle: "italic" }}>iyi ki</div>
            </div>
          </div>

          {/* Rules */}
          <div style={{ background: "#0D0D0F", borderRadius: 20, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontFamily: F.logo, color: "#FF3300", fontWeight: 700, marginBottom: 10, fontStyle: "italic" }}>Logo Kurallari</div>
            <div style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.8, fontFamily: F.body }}>
              {"\u2022"} Her zaman kucuk harf: iyi ki (asla IYI KI degil){"\n"}
              {"\u2022"} Her zaman italic{"\n"}
              {"\u2022"} Font: Libre Baskerville Italic{"\n"}
              {"\u2022"} Harf araligi: 0 (sifir){"\n"}
              {"\u2022"} Sembol, ikon, alt cizgi eklenmez{"\n"}
              {"\u2022"} App icon'da "ik" kisaltmasi kullanilir{"\n"}
              {"\u2022"} Minimum boyut: 20px yukseklik{"\n"}
              {"\u2022"} Logo etrafinda minimum logo yuksekligi kadar bosluk
            </div>
          </div>
        </div>
      )}

      {/* ═══ LOGO EFEKT ═══ */}
      {activeSection === 2 && (
        <div style={S.section}>
          <div style={{ background: "linear-gradient(135deg, #FFF5F0, #FFF)", borderRadius: 20, padding: "24px", borderLeft: "4px solid #FF3300" }}>
            <div style={{ fontSize: 18, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 10, fontStyle: "italic" }}>Logo Islemleri</div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: F.body }}>
              Logonun farkli mecralarda kullanilabilecek golge, 3D ve efekt varyasyonlari.
              Her islemin nerede kullanilacagi tanimli. Ayni gorselde birden fazla efekt karistirilmaz.
            </div>
          </div>

          {[
            { name: "Duz (Varsayilan)", desc: "Uygulama ici, bildirim, kucuk boyutlar.", style: { color: "#FFFFFF" }, dark: true },
            { name: "Yumusak Golge", desc: "Sosyal medya, landing page.", style: { color: "#FFFFFF", textShadow: "0 4px 12px rgba(255,51,0,0.5)" }, dark: true },
            { name: "Derin Golge", desc: "Poster, basili materyal.", style: { color: "#FFFFFF", textShadow: "0 6px 20px rgba(255,51,0,0.6), 0 2px 4px rgba(0,0,0,0.3)" }, dark: true },
            { name: "Glow", desc: "Video, animasyon, dijital reklam.", style: { color: "#FFFFFF", textShadow: "0 0 20px rgba(255,51,0,0.7), 0 0 40px rgba(255,51,0,0.4), 0 0 60px rgba(255,51,0,0.2)" }, dark: true },
            { name: "3D Extrude", desc: "Merch, sticker, poster.", style: { color: "#FF3300", textShadow: "1px 1px 0 #CC2900, 2px 2px 0 #B32400, 3px 3px 0 #991F00, 4px 4px 0 #801A00, 5px 5px 10px rgba(0,0,0,0.3)" }, dark: true },
            { name: "3D Acik Zemin", desc: "Billboard, vitrin, basili.", style: { color: "#FF3300", textShadow: "1px 1px 0 #E62E00, 2px 2px 0 #CC2900, 3px 3px 0 #B32400, 4px 4px 8px rgba(0,0,0,0.15)" }, dark: false },
            { name: "Uzun Golge", desc: "Retro his, ozel icerik.", style: { color: "#FF3300", textShadow: "1px 1px 0 rgba(204,41,0,0.4), 2px 2px 0 rgba(204,41,0,0.38), 3px 3px 0 rgba(204,41,0,0.36), 4px 4px 0 rgba(204,41,0,0.34), 5px 5px 0 rgba(204,41,0,0.32), 6px 6px 0 rgba(204,41,0,0.30), 7px 7px 0 rgba(204,41,0,0.28), 8px 8px 0 rgba(204,41,0,0.26), 9px 9px 0 rgba(204,41,0,0.24), 10px 10px 0 rgba(204,41,0,0.22)" }, dark: true },
            { name: "Outline", desc: "Minimal vurgu, video ustune.", style: { color: "transparent", WebkitTextStroke: "2px #FF3300" }, dark: true },
            { name: "Outline Beyaz", desc: "Renkli/fotograf zemininde.", style: { color: "transparent", WebkitTextStroke: "2px #FFFFFF" }, dark: true, colorBg: true },
            { name: "Kabartma", desc: "Premium, incelikli derinlik.", style: { color: "#1A1A2E", textShadow: "1px 1px 1px rgba(255,255,255,0.8), -1px -1px 1px rgba(0,0,0,0.15)" }, dark: false },
            { name: "Neon", desc: "Gece temasi, ozel etkinlik.", style: { color: "#FF5722", textShadow: "0 0 7px #FF3300, 0 0 10px #FF3300, 0 0 21px #FF3300, 0 0 42px #FF3300" }, dark: true },
          ].map((t, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{
                background: t.colorBg ? "linear-gradient(135deg, #FF3300, #E62E00)" : t.dark ? "linear-gradient(135deg, #0D0D0F, #1A1A2E)" : "linear-gradient(135deg, #FFFAF5, #FFF0E0)",
                padding: "32px 20px", textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center", minHeight: 90,
              }}>
                <div style={{ fontSize: 42, fontFamily: F.logo, fontWeight: 400, fontStyle: "italic", ...t.style }}>iyi ki</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#fff", fontFamily: F.body, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: "#6B7280", fontFamily: F.body, marginTop: 2 }}>{t.desc}</div>
                </div>
                <div style={{ fontSize: 8, color: "#FF3300", fontFamily: F.body, fontWeight: 700, letterSpacing: 1 }}>{i === 0 ? "VARSAYILAN" : "OPSIYONEL"}</div>
              </div>
            </div>
          ))}

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 13, fontFamily: F.logo, fontStyle: "italic", color: "#FF3300", fontWeight: 700, marginBottom: 8 }}>Kurallar</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.8, fontFamily: F.body }}>
              {"\u2022"} Uygulama icinde her zaman Duz kullanilir{"\n"}
              {"\u2022"} Sosyal medyada Yumusak/Derin Golge{"\n"}
              {"\u2022"} Video/animasyonda Glow veya Neon{"\n"}
              {"\u2022"} Fiziksel materyalde 3D Extrude veya Uzun Golge{"\n"}
              {"\u2022"} Fotograf ustune Outline Beyaz{"\n"}
              {"\u2022"} Ayni gorselde birden fazla efekt karistirilmaz{"\n"}
              {"\u2022"} Efekt okunurlugu bozmamali
            </div>
          </div>
        </div>
      )}

      {/* ═══ RENKLER ═══ */}
      {activeSection === 3 && (
        <div style={S.section}>
          <div style={{ background: "#FF3300", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{"\u2705"}</span>
            <span style={{ fontSize: 12, color: "#fff", fontFamily: F.body, fontWeight: 700 }}>KILITLI: #FF3300 Ana Renk \u2022 23 Renk \u2022 6 Grup</span>
          </div>

          {[
            { title: "ATES", colors: [
              { n: "Alev", h: "#FF3300", r: "Ana renk" },
              { n: "Kor", h: "#E62E00", r: "Pressed, hover" },
              { n: "Yangin", h: "#FF5722", r: "Sicak varyasyon" },
              { n: "Kivilcim", h: "#FF8A50", r: "Acik ama canli" },
            ]},
            { title: "DERINLIK", colors: [
              { n: "Karbon", h: "#0D0D0F", r: "En derin siyah" },
              { n: "Gece", h: "#1A1A2E", r: "Koyu arka plan" },
              { n: "Lacivert", h: "#2B2D42", r: "Kart zemini" },
              { n: "Mor Gece", h: "#2D1B3D", r: "Premium derinlik" },
            ]},
            { title: "ENERJI", colors: [
              { n: "Kehribar", h: "#FFAB00", r: "Sicak altin" },
              { n: "Portakal", h: "#FF6D00", r: "Turuncu enerji" },
              { n: "Mercan", h: "#FF5252", r: "Sicak kirmizi" },
              { n: "Magenta", h: "#F50057", r: "Cesur pembe" },
            ]},
            { title: "DENGE", colors: [
              { n: "Okyanus", h: "#00BFA5", r: "Canli teal" },
              { n: "Selvi", h: "#00C853", r: "Onay yesili" },
              { n: "Gok", h: "#2979FF", r: "Bilgi mavisi" },
            ]},
            { title: "YUZEY", colors: [
              { n: "Fildisi", h: "#FFFAF5", r: "Sicak beyaz" },
              { n: "Kum", h: "#FFF0E0", r: "Sicak kart" },
              { n: "Kagit", h: "#FFFFFF", r: "Saf beyaz" },
              { n: "Bej", h: "#FFE0CC", r: "Canli yuzey" },
            ]},
            { title: "METIN", colors: [
              { n: "Murekkep", h: "#0D0D0F", r: "Birincil" },
              { n: "Grafit", h: "#374151", r: "Govde" },
              { n: "Celik", h: "#6B7280", r: "Ikincil" },
              { n: "Gumus", h: "#9CA3AF", r: "Ipucu" },
            ]},
          ].map((g, gi) => {
            const isLight = (hex) => { const r = parseInt(hex.slice(1,3),16), gr = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16); return (r*299+gr*587+b*114)/1000 > 150; };
            return (
              <div key={gi}>
                <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 8, fontFamily: F.body, fontWeight: 700 }}>{g.title}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {g.colors.map((c, ci) => (
                    <div key={ci} style={{
                      flex: 1, background: c.h, borderRadius: 14, padding: "14px 10px",
                      minHeight: 88, display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      border: isLight(c.h) ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <div style={{ fontSize: 11, fontFamily: F.body, fontWeight: 700, color: isLight(c.h) ? "#0D0D0F" : "#fff" }}>{c.n}</div>
                      <div style={{ fontSize: 8, color: isLight(c.h) ? "#6B7280" : "rgba(255,255,255,0.5)", marginTop: 1, fontFamily: F.body }}>{c.h}</div>
                      <div style={{ fontSize: 8, color: isLight(c.h) ? "#9CA3AF" : "rgba(255,255,255,0.35)", marginTop: 2, fontFamily: F.body }}>{c.r}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ TIPOGRAFI ═══ */}
      {activeSection === 4 && (
        <div style={S.section}>
          <div style={{ background: "#FF3300", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{"\u2705"}</span>
            <span style={{ fontSize: 12, color: "#fff", fontFamily: F.body, fontWeight: 700 }}>KILITLI: Libre Baskerville (logo/baslik) + DM Sans (govde)</span>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0D0D0F, #2D1B3D)", borderRadius: 24, padding: "36px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, background: "radial-gradient(circle, rgba(255,51,0,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 4, marginBottom: 20, fontFamily: F.body, fontWeight: 700 }}>LOGO & BASLIK</div>
            <div style={{ fontFamily: F.logo, color: "#fff" }}>
              <div style={{ fontSize: 32, fontStyle: "italic", marginBottom: 10 }}>Libre Baskerville</div>
              <div style={{ fontSize: 22, fontStyle: "italic", color: "#FF3300", marginBottom: 6 }}>Bugun birini dusundun.</div>
              <div style={{ fontSize: 22, fontStyle: "italic", color: "#FFAB00" }}>Ve icinde bir sey kipirdadi.</div>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #FFF0E0, #FFFAF5)", borderRadius: 24, padding: "36px 24px", border: "1px solid rgba(255,51,0,0.08)" }}>
            <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 4, marginBottom: 20, fontFamily: F.body, fontWeight: 700 }}>GOVDE METIN</div>
            <div style={{ fontFamily: F.body }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#0D0D0F", marginBottom: 10 }}>DM Sans</div>
              <div style={{ fontSize: 16, color: "#374151", marginBottom: 6 }}>Biri sana bir kahve ismarladi.</div>
              <div style={{ fontSize: 14, color: "#6B7280" }}>Temiz, sicak, okunakli. Insan hissi veriyor.</div>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 14, fontFamily: F.logo, fontWeight: 700, color: "#FF3300", marginBottom: 14, fontStyle: "italic" }}>Boyut Skalasi</div>
            {[
              { label: "Hero", size: 36, font: F.logo, w: 400, ex: "iyi ki", c: "#fff", it: true },
              { label: "Baslik", size: 24, font: F.logo, w: 400, ex: "Bugun birini dusundun.", c: "#fff", it: true },
              { label: "Vurgu", size: 18, font: F.logo, w: 400, ex: "Iyi ki dusundun.", c: "#FF3300", it: true },
              { label: "Govde", size: 15, font: F.body, w: 400, ex: "Espresso ve buharla isitilmis sut", c: "#9CA3AF", it: false },
              { label: "Kucuk", size: 13, font: F.body, w: 500, ex: "Starbucks  \u2022  30-40 dk", c: "#6B7280", it: false },
              { label: "Etiket", size: 11, font: F.body, w: 700, ex: "HEDIYE EDILEBILIR", c: "#FF3300", it: false, ls: 3 },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, fontSize: 9, color: "#FF3300", fontWeight: 700, flexShrink: 0, fontFamily: F.body }}>{t.label}</div>
                <div style={{ fontSize: t.size, fontFamily: t.font, fontWeight: t.w, color: t.c, fontStyle: t.it ? "italic" : "normal", letterSpacing: t.ls || 0 }}>{t.ex}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ GORSEL DIL ═══ */}
      {activeSection === 5 && (
        <div style={S.section}>
          <div style={{ background: "linear-gradient(135deg, #FFF5F0, #FFF)", borderRadius: 20, padding: "24px", borderLeft: "4px solid #FF3300" }}>
            <div style={{ fontSize: 18, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 10, fontStyle: "italic" }}>Sicak Canlilik</div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: F.body }}>
              Her gorsel insani isitiyor. Bosluk var ama bosluk soguk degil — "nefes al, dusun" diyor.
              Renkler canli, golgler yumusak, isik her zaman sicak tarafta.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "linear-gradient(135deg, #FFF0E0, #FFFAF5)", borderRadius: 20, padding: "22px 18px", border: "1px solid rgba(255,51,0,0.08)" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{"\ud83d\udcf7"}</div>
              <div style={{ fontSize: 15, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 8, fontStyle: "italic" }}>Fotograf</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8, fontFamily: F.body }}>
                Eller: fincan tutuyor, hediye sariyor.{"\n"}Sicak isik, golden hour tonu.{"\n"}Gercek anlar, poz degil.{"\n"}Temas var: el ele, omuz omuza.
              </div>
            </div>
            <div style={{ background: "#0D0D0F", borderRadius: 20, padding: "22px 18px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{"\u270d\ufe0f"}</div>
              <div style={{ fontSize: 15, fontFamily: F.logo, fontWeight: 700, color: "#FF3300", marginBottom: 8, fontStyle: "italic" }}>Illustrasyon</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.8, fontFamily: F.body }}>
                Elle cizilmis his — organik.{"\n"}Sicak tonlar baskin.{"\n"}Obje odakli: fincan, cikolata, kitap.{"\n"}Karakter yok ama insanlik var.
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 20, padding: "22px 18px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{"\ud83d\udd25"}</div>
              <div style={{ fontSize: 15, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 8, fontStyle: "italic" }}>Hareket</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8, fontFamily: F.body }}>
                Akici, organik, canli.{"\n"}ease-out, 250-400ms.{"\n"}"Gonderildi": sicak pulse + glow.{"\n"}Idle'da bile nefes aliyor.
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #FF3300, #E62E00)", borderRadius: 20, padding: "22px 18px", color: "#fff" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{"\u26a0\ufe0f"}</div>
              <div style={{ fontSize: 15, fontFamily: F.logo, fontWeight: 700, marginBottom: 8, fontStyle: "italic" }}>Yasak</div>
              <div style={{ fontSize: 12, lineHeight: 1.8, opacity: 0.95, fontFamily: F.body }}>
                Konfeti / patlama efekti{"\n"}Stok fotograf{"\n"}Neon / floresan{"\n"}3D render{"\n"}Maskot / karakter
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SES & TON ═══ */}
      {activeSection === 6 && (
        <div style={S.section}>
          <div style={{ background: "linear-gradient(135deg, #FFF5F0, #FFF)", borderRadius: 20, padding: "24px", borderLeft: "4px solid #FF3300" }}>
            <div style={{ fontSize: 18, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 10, fontStyle: "italic" }}>Normal Sesle, Gozune Bakarak</div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: F.body }}>
              IYI KI fısıldamıyor. Ama bagirmiyor da. Normal sesle, gozune bakarak,
              samimi bir gulumseemeyle konusuyor. Biraz cesur. Biraz sicak. Tamamen icten.
            </div>
          </div>

          {[
            { ctx: "Ilk acilis", good: "Bugun birini dusunecek misin?", bad: "Hosgeldiniz! Hemen baslayiin!" },
            { ctx: "Hediye gonderildi", good: "Gitti. Iyi ki dusundun.", bad: "Tebrikler! Basariyla gonderildi! \ud83c\udf89" },
            { ctx: "Hediye alindi", good: "Kahvesini aldi. Uzaktan ismarladiniz.", bad: "Hediyeniz teslim alindi!" },
            { ctx: "1 haftadir girilmemis", good: "Biz buradayiz. Sen bilirsin.", bad: "Seni ozledik!! Geri don \u2764\ufe0f" },
            { ctx: "Hediye geldi", good: "Biri seni dusundu.", bad: "Size 1 hediye var! Hemen acin!" },
            { ctx: "Bos gun", good: "Bugun sessiz. Ama yarin baska.", bad: "Bugun 0 hediye gonderdiniz!" },
          ].map((item, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ padding: "10px 16px", background: "#0D0D0F", fontSize: 10, color: "#FF3300", fontWeight: 700, letterSpacing: 2, fontFamily: F.body }}>{item.ctx.toUpperCase()}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "14px 16px", background: "#f5faf5", borderRight: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 9, color: "#00C853", fontWeight: 700, marginBottom: 6, letterSpacing: 1, fontFamily: F.body }}>{"\u2713"} BOYLE</div>
                  <div style={{ fontSize: 13, color: "#0D0D0F", fontFamily: F.logo, fontStyle: "italic" }}>"{item.good}"</div>
                </div>
                <div style={{ padding: "14px 16px", background: "#fef5f3" }}>
                  <div style={{ fontSize: 9, color: "#FF3300", fontWeight: 700, marginBottom: 6, letterSpacing: 1, fontFamily: F.body }}>{"\u2717"} DEGIL</div>
                  <div style={{ fontSize: 13, color: "#9CA3AF" }}>"{item.bad}"</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ BILDIRIMLER ═══ */}
      {activeSection === 7 && (
        <div style={S.section}>
          <div style={{ background: "linear-gradient(135deg, #FFF5F0, #FFF)", borderRadius: 20, padding: "24px", borderLeft: "4px solid #FF3300" }}>
            <div style={{ fontSize: 18, fontFamily: F.logo, fontWeight: 700, color: "#0D0D0F", marginBottom: 10, fontStyle: "italic" }}>Her Bildirim Bir Kalp Atisi</div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: F.body }}>
              Bildirim geldiginde kullanici gulummsemeli. "Aa" demeli.
              Asla "yine mi bu uygulama" dememeli.
            </div>
          </div>

          {[
            { type: "Hediye Geldi", body: "Biri seni dusundu.", note: "Kim? Yazmiyoruz. Merak uygulamayi actiriyor." },
            { type: "Gonderildi", body: "Gitti. Iyi ki dusundun.", note: "Kisa. Sicak. Gurur veriyor." },
            { type: "Alindi", body: "Kahvesini aldi. Uzaktan ismarladiniz.", note: "Dongu kapaniyor." },
            { type: "72 Saat", body: "Kahven seni bekliyor.", note: "Baski yok. Hatirlatma." },
            { type: "Sure Doldu", body: "Bu sefer kacti. Bir sonraki icin buradayiz.", note: "Suclama yok." },
            { type: "Yeni Marka", body: "Yeni bir jest imkani var.", note: "Davet var, CTA yok." },
          ].map((n, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ padding: "8px 16px", background: "#0D0D0F" }}>
                <span style={{ fontSize: 9, color: "#FF3300", fontWeight: 700, letterSpacing: 2, fontFamily: F.body }}>{n.type.toUpperCase()}</span>
              </div>
              <div style={{ padding: "14px 16px", background: "#fff", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: "linear-gradient(135deg, #FF3300, #E62E00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(255,51,0,0.3)" }}>
                  <span style={{ fontSize: 12, fontFamily: F.logo, color: "#fff", fontStyle: "italic" }}>ik</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 400, color: "#0D0D0F", fontFamily: F.logo, fontStyle: "italic" }}>iyi ki</div>
                  <div style={{ fontSize: 13, color: "#374151", marginTop: 2, fontFamily: F.body }}>{n.body}</div>
                </div>
              </div>
              <div style={{ padding: "8px 16px", background: "#FFF0E0", fontSize: 11, color: "#6B7280", fontStyle: "italic", fontFamily: F.body }}>{"\u2192"} {n.note}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0C; }
      `}</style>
    </div>
  );
}

const F = {
  logo: "'Libre Baskerville', Georgia, serif",
  body: "'DM Sans', -apple-system, sans-serif",
};

const S = {
  page: { maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px", fontFamily: "'DM Sans', sans-serif" },
  nav: { display: "flex", gap: 6, overflowX: "auto", padding: "8px 0 20px", position: "sticky", top: 0, background: "#0A0A0C", zIndex: 10 },
  navBtn: { padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", transition: "all 0.3s" },
  section: { display: "flex", flexDirection: "column", gap: 16 },
};
