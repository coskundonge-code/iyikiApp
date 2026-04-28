import { useState } from "react";

const scenes = [
  {
    id: 1,
    title: "Düşünce",
    time: "0:00 — 0:12",
    visual: "Sabah. Bir kadın metroda oturuyor. Telefonu elinde ama bakmıyor. Camdan dışarı bakıyor. Gözleri bir yere takılıyor — karşıda bir Starbucks. Yüzünde bir şey değişiyor. Birini hatırladı.",
    audio: "Sessizlik. Sadece metro sesi. Müzik yok.",
    voiceover: "",
    text: "",
    mood: "Sessiz, düşünceli. İzleyici ne olduğunu bilmiyor.",
    note: "Manifesto'dan: 'Bugün birini düşündün.' — Video tam buradan başlıyor. Düşünce anı.",
    color: "#6B7280",
  },
  {
    id: 2,
    title: "Vazgeçiş",
    time: "0:12 — 0:22",
    visual: "Kadın telefonunu açıyor. WhatsApp'ı açıyor. Bir kişinin sohbetine giriyor. Yazmaya başlıyor... siliyor. Tekrar yazıyor... tekrar siliyor. Telefonu indiriyor. Camdan dışarı bakmaya devam ediyor.",
    audio: "Klavye sesi (tık tık, silme sesi). Sonra sessizlik.",
    voiceover: "",
    text: "",
    mood: "Tanıdık bir hayal kırıklığı. Herkes bunu yaşamış.",
    note: "Manifesto'dan: 'Mesaj atmak yetmezdi. Aramak fazla olurdu. Para göndermek ayıp olurdu. Ve o an geçti.'",
    color: "#6B7280",
  },
  {
    id: 3,
    title: "Düşüncenin Ölümü",
    time: "0:22 — 0:28",
    visual: "Ekran kararıyor. Siyah zemin üzerinde tek cümle beliriyor, elle yazılmış gibi, yavaşça:",
    audio: "Tam sessizlik. 2 saniye.",
    voiceover: "",
    text: "O düşünce sessizce kayboldu.",
    mood: "Duygusal darbe. İzleyici kendi deneyimini hatırlıyor.",
    note: "Manifesto'dan birebir. Videonun duygusal dönüm noktası.",
    color: "#0D0D0F",
  },
  {
    id: 4,
    title: "Ama Ya Kaybolmasaydı?",
    time: "0:28 — 0:32",
    visual: "Siyah ekranda ikinci cümle beliriyor, bir öncekinin altında:",
    audio: "Hafif, sıcak bir piyano notası. Tek nota. Müzik burada başlıyor.",
    voiceover: "",
    text: "Ama ya kaybolmasaydı?",
    mood: "Umut kıvılcımı. Tonu değiştiren an.",
    note: "Manifesto ile pitch arası köprü. Çözümün ipucu.",
    color: "#FF3300",
  },
  {
    id: 5,
    title: "Yeniden Başlangıç",
    time: "0:32 — 0:42",
    visual: "Aynı kadın, aynı metro. Ama bu sefer farklı. Telefonunu açıyor. Ekranda sıcak krem renkli bir arayüz. Kartları yukarı aşağı kaydırıyor — markalar arasında geziyor. Starbucks kartı görünüyor. Duruyor. Parmağı bir ürünün üzerinde.",
    audio: "Yumuşak piyano melodisi devam ediyor. Sıcak, minimal.",
    voiceover: "",
    text: "",
    mood: "Keşif anı. Hızlı ama stresli değil. Doğal.",
    note: "UI prototipteki Stack & Swipe paterni görünüyor. Gerçek arayüz ekranda.",
    color: "#FF6D00",
  },
  {
    id: 6,
    title: "Jest",
    time: "0:42 — 0:48",
    visual: "Kadın bir Latte seçiyor. Sağa kaydırıyor — yeşil 'Hediye Et' göstergesi beliriyor. Kişi seçim ekranı. Bir isim seçiyor. Gönder. Ekranda: 'Gitti. İyi ki düşündün.' Kadın hafifçe gülümsüyor.",
    audio: "Piyano melodisi hafifçe yükseliyor. Gönderim anında küçük bir 'ding' sesi.",
    voiceover: "",
    text: "",
    mood: "Tatmin. Rahatlamış bir gülümseme. 15 saniye sürdü.",
    note: "Pitch'ten: 'Aç. Seç. Gönder. 15 saniye.' Ama zorlama hissi yok, doğal akıyor.",
    color: "#FF3300",
  },
  {
    id: 7,
    title: "Bildirim",
    time: "0:48 — 0:56",
    visual: "Kesme. Farklı bir şehir, farklı bir insan. Bir adam masasında çalışıyor. Telefonu titriyor. Ekranı görüyoruz — bildirim kartı kayıyor: iyi ki ikonu + 'Biri seni düşündü.' Adam duruyor. Ekrana bakıyor. Yüzünde şaşkınlık, sonra yumuşak bir gülümseme.",
    audio: "Telefon titreşim sesi. Piyano devam ediyor ama daha sıcak.",
    voiceover: "",
    text: "",
    mood: "Sürpriz ve sıcaklık. 'Biri beni düşünmüş' anı.",
    note: "Marka kimliğinden: Bildirim dili — 'Biri seni düşündü.' Kısa, sıcak, kibar.",
    color: "#FF3300",
  },
  {
    id: 8,
    title: "Gerçek",
    time: "0:56 — 1:04",
    visual: "Adam bir Starbucks'a giriyor. Telefonundaki ekranı gösteriyor (QR veya kod). Barista kahveyi hazırlıyor. Adam kahveyi alıyor. Bir yudum alıyor. Pencereden dışarı bakıyor — tıpkı kadının metroda baktığı gibi.",
    audio: "Espresso makinesi sesi. Kahve dökülme sesi. Piyano sıcak devam.",
    voiceover: "",
    text: "",
    mood: "Gerçeklik. Dijital sticker değil. Gerçek kahve, gerçek an.",
    note: "Memo'dan: 'Gerçek ürünler — dijital sticker değil.' Bu sahne bunu kanıtlıyor.",
    color: "#FFAB00",
  },
  {
    id: 9,
    title: "Çarpan",
    time: "1:04 — 1:12",
    visual: "Adam telefonuna bakıyor. İyi ki uygulamasında başka hediyeler görüyor. Bir çikolata, bir kitap, bir çikolata. Düşünüyor. Kendi de birine bir şey gönderiyor — bu sefer bir kitap. Kesme: başka bir yerde, başka birinin telefonu titriyor. 'Biri seni düşündü.'",
    audio: "Piyano melodisi dalga dalga büyüyor. Her yeni bildirimle küçük bir ding.",
    voiceover: "",
    text: "",
    mood: "Çarpan etkisi. Bir jest başka bir jest doğuruyor.",
    note: "Pitch'ten: 'Her hediye = 1 potansiyel yeni kullanıcı.' Kimse zorlamıyor. İnsan doğası.",
    color: "#FF5722",
  },
  {
    id: 10,
    title: "Montaj — Jestler Yayılıyor",
    time: "1:12 — 1:24",
    visual: "Hızlı kesme montajı. Farklı insanlar, farklı şehirler, farklı anlar: Bir genç kız annesine kahve gönderiyor. Bir baba kızına çikolata gönderiyor. Bir öğrenci arkadaşına kitap gönderiyor. Her birinde aynı bildirim: 'Biri seni düşündü.' Her birinde aynı gülümseme.",
    audio: "Piyano crescendo. Müzik en yüksek noktasına çıkıyor.",
    voiceover: "",
    text: "",
    mood: "Coşku değil, sıcaklık. Büyüyen ama bağırmayan bir dalga.",
    note: "Manifesto'dan: 'Her jest bir dalga. Her dalga yeni bir jest. Kimse zorlamıyor. Ama durmuyorlar.'",
    color: "#FF3300",
  },
  {
    id: 11,
    title: "Manifesto",
    time: "1:24 — 1:38",
    visual: "Ekran yavaşça sıcak krem rengine (#FFFAF5) dönüyor. Ortalanmış, elle yazılmış gibi, satır satır beliren metin:",
    audio: "Piyano yavaşlıyor, tek nota kalıyor.",
    voiceover: "",
    text: "Söylemene gerek yok.\nDüşünmen yeter.\n\nBir kahve kadar uzağındasın.\n\niyi ki",
    mood: "Durgunluk. Derinlik. Slogan ilk kez tam görünüyor.",
    note: "Logo ('iyi ki') son satırda, Libre Baskerville italic, #FF3300. Slogan marka kimliğinden.",
    color: "#FF3300",
  },
  {
    id: 12,
    title: "Kapanış",
    time: "1:38 — 1:45",
    visual: "Siyah zemin. Ortada sadece 'iyi ki' logosu (#FF3300, italic). Altında küçük: 'Yakında.' (lansman öncesi) veya App Store / Google Play ikonları (lansman sonrası).",
    audio: "Son piyano notası yavaşça sönüyor. 2 saniye sessizlik.",
    voiceover: "",
    text: "",
    mood: "Temiz kapanış. Merak bırakıyor.",
    note: "İki versiyon: lansman öncesi 'Yakında' ile merak, lansman sonrası indirme CTA'sı ile.",
    color: "#0D0D0F",
  },
];

const techSpecs = {
  sure: "1:45 (105 saniye)",
  format: "16:9 (yatay) + 9:16 (dikey/reels versiyon)",
  cozunurluk: "4K master, 1080p dağıtım",
  muzik: "Orijinal kompozisyon — solo piyano, minimal, sıcak",
  ses: "Voiceover yok. Diyalog yok. Sadece ortam sesi + müzik.",
  renk: "Sıcak tonlar. Fildişi (#FFFAF5) ve Alev (#FF3300) dominantı.",
  tipografi: "Libre Baskerville italic (ekran metinleri), elle yazılmış his.",
  oyuncular: "4-6 kişi, 25-45 yaş, kentli, doğal — oyuncu değil gerçek insan hissi.",
  mekan: "Gerçek mekanlar: metro, ofis, kafe, sokak. Stüdyo çekimi yok.",
  tempo: "Yavaş başlar, kademeli hızlanır, sonra yavaşlar. Nefes alan bir ritim.",
};

const principles = [
  { rule: "Yüz göster, ama 'bak bana' deme", desc: "İnsanlar doğal anlarında. Kameraya bakmazlar. Düşünürler, gülümserler, kararlar." },
  { rule: "Ürünü göster, ama reklam yapma", desc: "Uygulama ekranı görünür ama odak noktası değil. Odak insanın yüzündeki değişim." },
  { rule: "Müzik anlatsın, söz değil", desc: "Voiceover yok. Diyalog yok. Müzik ve yüz ifadeleri her şeyi söylüyor." },
  { rule: "Para kelimesi geçmesin", desc: "Hiçbir karede fiyat, TL, ödeme, kupon görünmez. Jest var, ticaret yok." },
  { rule: "Kültürel ipuçları bırakan, etiketlemeyen", desc: "Türk kahvesi, simit, kahve dukkanı — ama 'Türkiye reklamı' gibi durmasın." },
  { rule: "Hız değil, ritim", desc: "TikTok hızında değil. Ama sıkıcı da değil. Nefes alan, düşünme alanı bırakan bir tempo." },
];

export default function VideoKonsept() {
  const [activeScene, setActiveScene] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const s = scenes[activeScene];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 80px", background: "#0A0A0C", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0C; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 32, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 4 }}>iyi ki</div>
        <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: 4 }}>LANSMAN VİDEOSU KONSEPTİ</div>
        <div style={{ fontSize: 11, color: "#374151", fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>1:45 | Solo Piyano | Voiceover Yok | Gerçek İnsanlar</div>
      </div>

      {/* Video title */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,51,0,0.12), rgba(255,51,0,0.04))",
        borderRadius: 18, padding: "20px 22px", marginBottom: 20,
        borderLeft: "4px solid #FF3300",
      }}>
        <div style={{ fontSize: 20, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff", marginBottom: 6 }}>
          "O düşünce sessizce kayboldu."
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
          Bir düşüncenin ölümüyle başlayan, bir jestin doğumuyla biten 105 saniyelik sessiz hikaye. Kimse konuşmuyor. Müzik ve bakışlar her şeyi anlatıyor.
        </div>
      </div>

      {/* Scene selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {scenes.map((sc, i) => (
          <button key={i} onClick={() => { setActiveScene(i); setShowAll(false); }} style={{
            padding: "6px 10px", borderRadius: 10, border: "none", cursor: "pointer",
            fontSize: 9, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            background: activeScene === i ? `linear-gradient(135deg, ${sc.color}, ${sc.color}CC)` : "rgba(255,255,255,0.04)",
            color: activeScene === i ? "#fff" : "#555",
            transition: "all 0.3s",
          }}>{i + 1}</button>
        ))}
        <button onClick={() => setShowAll(!showAll)} style={{
          padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer",
          fontSize: 9, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          background: showAll ? "#FF3300" : "rgba(255,255,255,0.08)",
          color: showAll ? "#fff" : "#888",
        }}>{showAll ? "Tek" : "Tümü"}</button>
      </div>

      {/* Scene detail */}
      {(showAll ? scenes : [s]).map((scene, idx) => (
        <div key={scene.id} style={{
          borderRadius: 18, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
          marginBottom: showAll ? 16 : 0,
        }}>
          {/* Scene header */}
          <div style={{
            padding: "12px 18px", background: `linear-gradient(135deg, ${scene.color}25, ${scene.color}08)`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff" }}>
                {scene.id}. {scene.title}
              </div>
              <div style={{ fontSize: 10, color: scene.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginTop: 2 }}>{scene.time}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: scene.color }} />
          </div>

          {/* Visual */}
          <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize: 9, color: scene.color, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, marginBottom: 6 }}>GÖRSEL</div>
            <div style={{ fontSize: 13, color: "#E5E7EB", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>{scene.visual}</div>
          </div>

          {/* On-screen text */}
          {scene.text && (
            <div style={{ padding: "16px 18px", background: "rgba(255,51,0,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 9, color: "#FF3300", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, marginBottom: 6 }}>EKRAN METNİ</div>
              <div style={{ fontSize: 18, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#fff", lineHeight: 1.6, whiteSpace: "pre-line" }}>{scene.text}</div>
            </div>
          )}

          {/* Audio + Mood row */}
          <div style={{ padding: "14px 18px", display: "flex", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, marginBottom: 4 }}>SES</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{scene.audio}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, marginBottom: 4 }}>DUYGU</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{scene.mood}</div>
            </div>
          </div>

          {/* Director's note */}
          <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 9, color: "#FF3300", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, marginBottom: 4 }}>YÖNETMEN NOTU</div>
            <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, fontStyle: "italic" }}>{scene.note}</div>
          </div>
        </div>
      ))}

      {/* Emotion arc */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 20,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>DUYGU ARKI</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60 }}>
          {[15, 12, 8, 20, 30, 45, 55, 50, 60, 70, 55, 35].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`, borderRadius: "4px 4px 0 0",
              background: i < 3 ? "#6B7280" : i === 3 ? "#FF6D00" : `#FF3300`,
              opacity: i < 3 ? 0.5 : 0.3 + (h / 100),
              transition: "all 0.3s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 8, color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>Sessizlik</span>
          <span style={{ fontSize: 8, color: "#FF6D00", fontFamily: "'DM Sans', sans-serif" }}>Kıvılcım</span>
          <span style={{ fontSize: 8, color: "#FF3300", fontFamily: "'DM Sans', sans-serif" }}>Doruk</span>
          <span style={{ fontSize: 8, color: "#FF3300", fontFamily: "'DM Sans', sans-serif" }}>Dinginlik</span>
        </div>
      </div>

      {/* Principles */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 12,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>ÇEKİM İLKELERİ</div>
        {principles.map((p, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{p.rule}</div>
            <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Tech specs */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 12,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>TEKNİK ÖZELLİKLER</div>
        {Object.entries(techSpecs).map(([key, val], i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, width: 80, flexShrink: 0, textTransform: "uppercase" }}>{key}</div>
            <div style={{ fontSize: 12, color: "#E5E7EB", fontFamily: "'DM Sans', sans-serif" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Source docs */}
      <div style={{
        background: "rgba(255,51,0,0.06)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,51,0,0.1)", marginTop: 12,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>KAYNAK DOKÜMANLAR</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>
          Sahne 1-3: Manifesto'dan — "Bugün birini düşündün... O düşünce sessizce kayboldu."
          {"\n"}Sahne 4-6: Pitch Deck'ten — Problem → Çözüm → Ürün akışı
          {"\n"}Sahne 7-8: Marka Kimliğinden — Bildirim dili, UI tasarımı, ürün gerçekliği
          {"\n"}Sahne 9-10: Manifesto'dan — "Her jest bir dalga. Her dalga yeni bir jest."
          {"\n"}Sahne 11-12: Teşekkürler Memo + Slogan — "Söylemene gerek yok. Düşünmen yeter."
        </div>
      </div>
    </div>
  );
}
