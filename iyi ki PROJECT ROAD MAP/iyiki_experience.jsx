import { useState } from "react";

const A = "#FF3300";
const tabs = ["Bildirimler", "Hediye Alma Anı", "Haftalık Veri"];

// ═══════════════════════════════════════════
// NOTIFICATION STRATEGY
// ═══════════════════════════════════════════

const notifications = [
  {
    category: "Jest Bildirimleri",
    desc: "Hediye gönderildiğinde veya alındığında. En kritik bildirimler — bunlar ürünün kalbi.",
    color: A,
    items: [
      { trigger: "Birine hediye gönderildi", title: "iyi ki", body: "Gitti. İyi ki düşündün.", timing: "Anında", priority: "Yüksek", note: "Gönderen kişiye. Onay + sıcak kapanış." },
      { trigger: "Birileri sana hediye gönderdi", title: "iyi ki", body: "Biri seni düşündü.", timing: "Anında", priority: "Yüksek", note: "Alan kişiye. Markanın imza bildirimi. Kısa, sıcak, merak uyandıran." },
      { trigger: "Hediye açıldı/görüntülendi", title: "iyi ki", body: "Hediyeni gördü. Gülümsedi mi acaba?", timing: "Anında", priority: "Orta", note: "Gönderene. İnsan merakını besleyen, sıcak bir dokunuş." },
      { trigger: "Hediye mağazadan alındı (redemption)", title: "iyi ki", body: "Kahvesini aldı. İyi ki sen.", timing: "Anında", priority: "Orta", note: "Gönderene. Döngü tamamlandı. Kapanış hissi." },
      { trigger: "Hediye 24 saat içinde sona erecek", title: "iyi ki", body: "Sana gönderilen kahve yarın sona eriyor.", timing: "Sona ermeden 24 saat önce", priority: "Orta", note: "Alan kişiye. Nazik hatırlatma, baskı değil." },
      { trigger: "Hediye süresi doldu (alınmadı)", title: "iyi ki", body: "Kahve havuza geri döndü. Başka birini mutlu edecek.", timing: "Süre dolduktan sonra", priority: "Düşük", note: "Alan kişiye. Suçluluk yok. 'Başka birini mutlu edecek' pozitif kapanış." },
    ]
  },
  {
    category: "Haftalık Ritüeller",
    desc: "Düzenli, beklenen, ritüel haline gelen bildirimler. Haftalık veri paylaşımı burada.",
    color: "#FFAB00",
    items: [
      { trigger: "Her cuma 18:00", title: "iyi ki", body: "Bu hafta 3.247 kişi birini düşündü.", timing: "Cuma 18:00", priority: "Orta", note: "Haftalık jest raporu. Sosyal kanıt. Topluluk hissi. Sayı her hafta değişiyor." },
      { trigger: "Her pazartesi 09:00", title: "iyi ki", body: "Yeni bir hafta. Kimi düşünüyorsun?", timing: "Pazartesi 09:00", priority: "Düşük", note: "Hafta başı nazik hatırlatma. Soru soruyor, emretmiyor." },
    ]
  },
  {
    category: "Özel Anlar",
    desc: "Kullanıcıya özel, kişiselleştirilmiş bildirimler. Seyrek ama etkili.",
    color: "#00BFA5",
    items: [
      { trigger: "İlk jestini yaptı", title: "iyi ki", body: "İlk jestini yaptın. İyi ki başladın.", timing: "İlk gönderimden sonra", priority: "Yüksek", note: "Milestone. Kutlama ama abartısız. 'İyi ki başladın' — marka ismine gönderme." },
      { trigger: "10. jestini yaptı", title: "iyi ki", body: "10 kişi senin sayende gülümsedi.", timing: "10. gönderimde", priority: "Orta", note: "Sessiz milestone. Rozet yok, skor yok — sadece sıcak bir cümle." },
      { trigger: "1 haftadır girmediyse", title: "iyi ki", body: "Aklına biri geldi mi bugün?", timing: "7 gün sonra", priority: "Düşük", note: "Re-engagement. Soru soruyor, 'geri dön' demiyor. Tek bildirim, spam yok." },
      { trigger: "Uygulamayı ilk kez açtığı günün yıldönümü", title: "iyi ki", body: "Bir yıl oldu. İyi ki buradasın.", timing: "Yılda bir", priority: "Düşük", note: "Yıldönümü. Minimal, sıcak. Marka ismine gönderme." },
    ]
  },
];

const notifRules = [
  "Günde maksimum 1 bildirim (jest bildirimleri hariç — onlar anında gider).",
  "Gece 22:00 - sabah 08:00 arası bildirim gönderilmez.",
  "'Hemen', 'kaçırma', 'son şans' gibi aciliyet dili asla kullanılmaz.",
  "Her bildirim bir soru sorar veya bir duygu taşır — hiçbiri emir vermez.",
  "Re-engagement bildirimi haftada en fazla 1 kez gönderilir.",
  "Kullanıcı bildirimleri kapatırsa asla zorlanmaz — uygulama içi deneyim yeterli olmalı.",
  "Bildirim başlığı her zaman 'iyi ki' — marka tutarlılığı.",
  "Bildirim gövdesi 40 karakteri geçmez.",
];

// ═══════════════════════════════════════════
// GIFT RECEIVING MOMENT
// ═══════════════════════════════════════════

const receivingSteps = [
  {
    step: 1,
    title: "Bildirim Geldi",
    screen: "Kilit ekranı",
    what: "Telefon titriyor. Bildirim kartı beliriyor: iyi ki ikonu + 'Biri seni düşündü.'",
    feel: "Merak. Kim? Ne? Neden?",
    design: "Bildirim kartı sıcak, iyi ki ikonu #FF3300 gradient. Kısa metin. Gönderen ismi burada görünmüyor — merak korunuyor.",
    duration: "2 saniye",
  },
  {
    step: 2,
    title: "Bildirimi Açtı",
    screen: "Uygulama — Hediye Ekranı",
    what: "Tam ekran hediye kartı beliriyor. Ortada ürün illüstrasyonu (kendi setimizden). Altında ürün adı ve marka. Gönderen ismi (veya 'Anonim bir dost'). Varsa kişisel not.",
    feel: "Sürpriz → Sıcaklık → Minnet.",
    design: "Krem zemin (#FFFAF5). Kart ortada, gölgeli, premium hissi. Ürün illüstrasyonu büyük. Fiyat hiçbir yerde yok. Not varsa Libre Baskerville italic ile.",
    duration: "5-10 saniye (okuma + hissetme)",
  },
  {
    step: 3,
    title: "Nasıl Alacağını Öğrendi",
    screen: "Uygulama — Alma Ekranı",
    what: "'Nasıl Alırım?' butonuna bastı. Ekranda: QR/barkod, en yakın mağaza haritası, 72 saat geri sayım. Net, basit, stressiz.",
    feel: "Netlik. 'Bunu yapabilirim' hissi.",
    design: "Beyaz zemin. QR büyük ve net. Harita butonu belirgin. Geri sayım yumuşak, baskıcı değil. 'En Yakın Mağaza' butonu #FF3300.",
    duration: "3 saniye",
  },
  {
    step: 4,
    title: "Mağazaya Gitti",
    screen: "Fiziksel mekan",
    what: "Mağazaya giriyor. Kasada telefonunu gösteriyor. Barista/kasiyer kodu tarıyor. Ürün hazırlanıyor/veriliyor.",
    feel: "Gerçeklik. 'Bu gerçekten oldu' anı. Dijitalden fiziksele geçiş.",
    design: "Kasada gösterilecek ekran: büyük QR + ürün adı + 'iyi ki' logosu. Barista için net, müşteri için gurur verici.",
    duration: "1-2 dakika",
  },
  {
    step: 5,
    title: "Aldıktan Sonra",
    screen: "Uygulama — Teşekkür Ekranı",
    what: "Redemption tamamlandı. Ekranda: 'Kahveni aldın. İyi ki sen.' Altında iki seçenek: 'Teşekkür Et' (gönderene mesaj) veya 'Ben de Birine Göndereyim'.",
    feel: "Tatmin + 'Ben de yapmalıyım' dürtüsü (doğal, zorlanmamış).",
    design: "Sıcak kapanış ekranı. Konfeti yok, kutlama patlaması yok — sadece sıcak bir cümle ve iki yumuşak buton.",
    duration: "5 saniye",
  },
];

const receivingRules = [
  "Hediye alma deneyimi asla 'kupon kullanma' gibi hissettirmemeli.",
  "Kasadaki işlem 'doğrulama' — 'ödeme' değil.",
  "Gönderen ismi varsayılan olarak görünür, anonim seçeneği gönderenin elinde.",
  "Fiyat hiçbir adımda görünmez — ne alana, ne gönderene, ne kasiyere.",
  "Teşekkür mesajı opsiyonel — zorlama yok.",
  "'Ben de göndereyim' seçeneği var ama asla 'baskı' hissi vermemeli.",
  "Süre dolmadan 24 saat önce nazik hatırlatma — baskıcı değil.",
  "Alınamazsa suçluluk hissi yaratmayacak dil: 'Başka birini mutlu edecek.'",
];

// ═══════════════════════════════════════════
// WEEKLY DATA SHARING
// ═══════════════════════════════════════════

const weeklyData = {
  title: "Bu hafta iyi ki'de",
  subtitle: "Her cuma 18:00'de paylaşılan haftalık jest raporu",
  metrics: [
    { label: "Toplam jest", value: "3.247", icon: "heart", note: "Bu hafta kaç kişi birini düşündü." },
    { label: "En çok gönderilen", value: "Türk Kahvesi", icon: "coffee", note: "Haftalık birinci ürün." },
    { label: "En çok gönderilen saat", value: "08:14", icon: "clock", note: "Sabah ilk iş — birini düşünmek." },
    { label: "En çok kullanılan not", value: "Aklıma geldin.", icon: "note", note: "İnsanlar ne yazıyor?" },
    { label: "Şehir sıralaması", value: "İstanbul, Ankara, İzmir", icon: "map", note: "Jestler nereden geliyor?" },
    { label: "En genç gönderici", value: "14 yaşında", icon: "star", note: "İnsan ilgisi hikayesi." },
  ],
  channels: [
    { name: "Push Bildirim", format: "Tek cümle: 'Bu hafta X kişi birini düşündü.'", freq: "Her cuma 18:00" },
    { name: "Uygulama İçi Kart", format: "Tam veri kartı — tüm metriklerle. Ana ekranda banner.", freq: "Cuma-Pazar görünür" },
    { name: "Instagram Story", format: "4-5 slayt: her metrik bir slayt. Paylaşılabilir.", freq: "Her cuma 19:00" },
    { name: "Instagram Feed", format: "Tek görsel: en çarpıcı metrik büyük, diğerleri küçük.", freq: "Her cuma 19:30" },
    { name: "E-posta", format: "Haftalık bülten: metrikler + 1 kullanıcı hikayesi.", freq: "Her cuma 20:00" },
  ],
  rules: [
    "Veriler her zaman anonim — isim, telefon, konum detayı paylaşılmaz.",
    "Şehir bazında paylaşım var ama mahalle/ilçe düzeyine inilmez.",
    "Kullanıcı hikayeleri sadece izinle paylaşılır.",
    "Sayılar yuvarlak değil, spesifik: '3.247' — '3.000+' değil. Gerçeklik hissi.",
    "Her hafta farklı bir 'insan hikayesi' metriki eklenir (en genç, en uzak mesafe, vs.).",
    "Veri paylaşımı ritüel — her cuma aynı saatte. Tutarlılık güven inşa eder.",
    "Negatif veri paylaşılmaz — düşüş varsa sessiz kalınır, yükseliş kutlanır.",
  ],
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export default function ExperienceDesign() {
  const [tab, setTab] = useState(0);
  const [expandedCat, setExpandedCat] = useState(0);

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
        <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: 3 }}>FAZ 3 — DENEYİM TASARIMI</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 12, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            background: tab === i ? `linear-gradient(135deg, ${A}, ${A}CC)` : "rgba(255,255,255,0.04)",
            color: tab === i ? "#fff" : "#666", transition: "all 0.3s",
          }}>{t}</button>
        ))}
      </div>

      {/* ═══ TAB 1: NOTIFICATIONS ═══ */}
      {tab === 0 && (
        <div>
          {notifications.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 16 }}>
              <button onClick={() => setExpandedCat(expandedCat === ci ? -1 : ci)} style={{
                width: "100%", padding: "14px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}08)`,
                borderLeft: `4px solid ${cat.color}`, textAlign: "left",
              }}>
                <div style={{ fontSize: 15, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff" }}>{cat.category}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{cat.desc}</div>
                <div style={{ fontSize: 10, color: cat.color, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{cat.items.length} bildirim tipi {expandedCat === ci ? "▲" : "▼"}</div>
              </button>

              {expandedCat === ci && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {cat.items.map((n, ni) => (
                    <div key={ni} style={{
                      borderRadius: 14, overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      {/* Notification preview */}
                      <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ fontSize: 9, color: cat.color, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, marginBottom: 6 }}>TETİKLEYİCİ: {n.trigger.toUpperCase()}</div>
                        <div style={{
                          background: "rgba(255,255,255,0.9)", borderRadius: 12, padding: "10px 14px",
                          display: "flex", gap: 10, alignItems: "center",
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: `linear-gradient(135deg, ${A}, #E62E00)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontSize: 9, fontFamily: "'Libre Baskerville', serif", color: "#fff", fontStyle: "italic" }}>ik</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0F", fontFamily: "'DM Sans', sans-serif" }}>{n.title}</div>
                            <div style={{ fontSize: 11, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>{n.body}</div>
                          </div>
                        </div>
                      </div>
                      {/* Meta */}
                      <div style={{ padding: "10px 16px", display: "flex", gap: 16, background: "rgba(255,255,255,0.015)" }}>
                        <div>
                          <div style={{ fontSize: 8, color: "#6B7280", fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>ZAMANLAMA</div>
                          <div style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{n.timing}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 8, color: "#6B7280", fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>ÖNCELİK</div>
                          <div style={{ fontSize: 10, color: n.priority === "Yüksek" ? A : n.priority === "Orta" ? "#FFAB00" : "#6B7280", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{n.priority}</div>
                        </div>
                      </div>
                      {/* Note */}
                      <div style={{ padding: "8px 16px 10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, fontStyle: "italic" }}>{n.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Notification rules */}
          <div style={{
            background: "rgba(255,51,0,0.06)", borderRadius: 16, padding: "18px",
            border: "1px solid rgba(255,51,0,0.1)", marginTop: 16,
          }}>
            <div style={{ fontSize: 10, color: A, letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>BİLDİRİM KURALLARI</div>
            {notifRules.map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 4 }}>{"→ "}{r}</div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TAB 2: GIFT RECEIVING ═══ */}
      {tab === 1 && (
        <div>
          <div style={{
            background: `linear-gradient(135deg, ${A}15, ${A}05)`, borderRadius: 16, padding: "16px 18px",
            borderLeft: `4px solid ${A}`, marginBottom: 20,
          }}>
            <div style={{ fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff" }}>Hediye alma anı, uygulamanın en kritik 60 saniyesi.</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", marginTop: 6, lineHeight: 1.6 }}>
              Bu an doğru tasarlanırsa kullanıcı gönderici oluyor. Yanlış tasarlanırsa bir daha açmıyor.
            </div>
          </div>

          {receivingSteps.map((s, i) => (
            <div key={i} style={{
              borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)", marginBottom: 12,
            }}>
              <div style={{
                padding: "12px 18px", background: `rgba(255,51,0,${0.04 + i * 0.02})`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14, background: A,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif",
                  }}>{s.step}</div>
                  <div style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff" }}>{s.title}</div>
                </div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }}>{s.duration}</div>
              </div>

              <div style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: A, fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", width: 60, flexShrink: 0 }}>EKRAN</div>
                  <div style={{ fontSize: 11, color: "#E5E7EB", fontFamily: "'DM Sans', sans-serif" }}>{s.screen}</div>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: A, fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", width: 60, flexShrink: 0 }}>NE OLUYOR</div>
                  <div style={{ fontSize: 11, color: "#E5E7EB", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{s.what}</div>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: "#FFAB00", fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", width: 60, flexShrink: 0 }}>DUYGU</div>
                  <div style={{ fontSize: 11, color: "#FFAB00", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>{s.feel}</div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", width: 60, flexShrink: 0 }}>TASARIM</div>
                  <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{s.design}</div>
                </div>
              </div>
            </div>
          ))}

          <div style={{
            background: "rgba(255,51,0,0.06)", borderRadius: 16, padding: "18px",
            border: "1px solid rgba(255,51,0,0.1)", marginTop: 8,
          }}>
            <div style={{ fontSize: 10, color: A, letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>HEDİYE ALMA KURALLARI</div>
            {receivingRules.map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 4 }}>{"→ "}{r}</div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TAB 3: WEEKLY DATA ═══ */}
      {tab === 2 && (
        <div>
          {/* Preview card */}
          <div style={{
            background: "linear-gradient(135deg, #1A1A2E, #0D0D0F)", borderRadius: 20,
            padding: "24px 20px", marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 10, color: A, letterSpacing: 3, marginBottom: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>HER CUMA 18:00</div>
            <div style={{ fontSize: 20, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff", marginBottom: 16 }}>{weeklyData.title}</div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {weeklyData.metrics.map((m, i) => (
                <div key={i} style={{
                  flex: "1 1 140px", background: "rgba(255,255,255,0.04)", borderRadius: 14,
                  padding: "14px 14px", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{m.label.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: i === 0 ? A : "#fff", fontWeight: 700 }}>{m.value}</div>
                  <div style={{ fontSize: 9, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{m.note}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <div style={{ fontSize: 12, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: A }}>iyi ki</div>
            </div>
          </div>

          {/* Channels */}
          <div style={{
            background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
            border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: A, letterSpacing: 3, marginBottom: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>DAĞITIM KANALLARI</div>
            {weeklyData.channels.map((ch, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", width: 100, flexShrink: 0 }}>{ch.name}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{ch.format}</div>
                  <div style={{ fontSize: 9, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{ch.freq}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div style={{
            background: "rgba(255,51,0,0.06)", borderRadius: 16, padding: "18px",
            border: "1px solid rgba(255,51,0,0.1)",
          }}>
            <div style={{ fontSize: 10, color: A, letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>VERİ PAYLAŞIM KURALLARI</div>
            {weeklyData.rules.map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 4 }}>{"→ "}{r}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
