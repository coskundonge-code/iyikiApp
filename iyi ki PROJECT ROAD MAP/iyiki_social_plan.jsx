import { useState } from "react";

const weeks = [
  {
    week: 1,
    phase: "Faz 0 — Gizem",
    theme: "Sadece Sorular",
    color: "#6B7280",
    strategy: "Hesap acilir ama bos. Profil resminde sadece '?' var. Bio'da tek cumle: 'Yakinda.' Her gun tek bir soru paylassilir. Yorum ve DM'lere cevap verilmez. Gizemli kalmalii.",
    posts: [
      { day: "Pzt", type: "Feed", platform: "IG + X", text: "En son kime kahve ismarladiniz?", note: "Sade tipografi, krem zemin. Sticker gorseliyle ayni dil." },
      { day: "Sal", type: "Story", platform: "IG", text: "Anket: Bugun birini dusundun mu? (Evet / Hayir)", note: "Interaktif anket. Sonuclari paylasma — gizem korunmali." },
      { day: "Car", type: "Feed", platform: "IG + X", text: "Aklina geldi ama yapmadin, degil mi?", note: "Ayni gorsel dil. Yorumlara cevap yok." },
      { day: "Per", type: "Story", platform: "IG", text: "Soru kutusu: Son jestiniz ne zamandi?", note: "Cevaplari biriktir, ileride kullanilacak." },
      { day: "Cum", type: "Feed", platform: "IG + X", text: "Bir kahve kadar uzagindasin.", note: "Hafta kapanisi. En duygusal metin." },
    ],
  },
  {
    week: 2,
    phase: "Faz 0 — Gizem",
    theme: "Sorular Derinlesiyor",
    color: "#6B7280",
    strategy: "Ayni gizem devam ediyor. Ama sorular daha kisisel, daha derin. Insanlar hesabi takip etmeye basliyor. 'Bu ne?' konusmasi baslamali.",
    posts: [
      { day: "Pzt", type: "Feed", platform: "IG + X", text: "Soylemedigin ama hissettigin ne var?", note: "Daha derin soru. Merak artiyor." },
      { day: "Sal", type: "Reel", platform: "IG + TikTok", text: "15 sn: Bir el kahve fincanini masaya koyuyor. Karsi taraf gorunmuyor. Metin: 'Bunu kimin icin aldin?'", note: "Ilk video icerik. Yuzsuz, sadece eller." },
      { day: "Car", type: "Feed", platform: "IG + X", text: "Birini dusunmek icin sebep mi lazim?", note: "Provokatif ama sicak." },
      { day: "Per", type: "Story", platform: "IG", text: "Geri sayim: '5 gun.' (baska hicbir sey yok)", note: "Ilk zaman ipucu. Geri sayim basliyor." },
      { day: "Cum", type: "Feed", platform: "IG + X", text: "Soylemedin. Ama dusundun. O da bir sey.", note: "Hafta kapanisi. Sticker'la ayni metin." },
    ],
  },
  {
    week: 3,
    phase: "Faz 1 — Ipucu",
    theme: "Renk Beliriyor",
    color: "#FF6D00",
    strategy: "Profil resmi '?' dan #FF3300 renkli daireye donuyor. Bio'ya 'iyi ki' ekleniyor ama aciklama yok. Postlarda #FF3300 accent beliriyor. Kucuk 'iyi ki' gorsellerin kossesinde.",
    posts: [
      { day: "Pzt", type: "Feed", platform: "IG + X", text: "Dusunmek de bir hediyedir.", note: "Ilk kez #FF3300 accent. Sag altta kucuk 'iyi ki'." },
      { day: "Sal", type: "Story", platform: "IG", text: "Anket: Hediye pahali mi olmali? (Pahali / Samimi)", note: "Kullanici etkilesimi. 'Samimi' cevabi one cikarilacak." },
      { day: "Car", type: "Feed", platform: "IG + X", text: "Seni dusundum demek zor. Gostermek kolay.", note: "Duygusal tırmanma. iyi ki artik gorunur." },
      { day: "Per", type: "Reel", platform: "IG + TikTok", text: "15 sn: Birinin telefonundan bir bildirim geliyor. Ekranda sadece 'Biri seni dusundu.' yazıyor. Yuz gulumsuyor.", note: "Urun ipucu ama uygulamaa gosterilmiyor." },
      { day: "Cum", type: "Feed", platform: "IG + X", text: "Belki bir cikolata. Belki bir kahve. Belki sadece 'aklima geldin'.", note: "Urun kategorileri ilk kez ima ediliyor." },
    ],
  },
  {
    week: 4,
    phase: "Faz 1 — Ipucu",
    theme: "Merak Dorukta",
    color: "#FF6D00",
    strategy: "Geri sayim yoğunlasiyor. Kullanici yorumlarina ilk kez kisa cevaplar veriliyor: sadece 'iyi ki' veya emoji yok, sadece nokta. Gerilim en ust noktada.",
    posts: [
      { day: "Pzt", type: "Feed", platform: "IG + X", text: "Jest yapmak icin sebep aramayi birak.", note: "Direkt, cesur. iyi ki buyuyor gorselde." },
      { day: "Sal", type: "Story", platform: "IG", text: "Geri sayim: '3 gun.' + iyi ki logosu ilk kez tam gorunur", note: "Logo reveal basliiyor." },
      { day: "Car", type: "Feed", platform: "IG + X", text: "Bazi seyler soylenmez. Gosterilir.", note: "Son gizem posti." },
      { day: "Per", type: "Story", platform: "IG", text: "Geri sayim: 'Yarin.' + iyi ki logosu + #FF3300 tam ekran", note: "Son geri sayim. Enerji dorukta." },
      { day: "Cum", type: "Carousel", platform: "IG", text: "5 slayt: 1) iyi ki 2) Soylemene gerek yok 3) Dusunmen yeter 4) Birini dusun 5) Gerisini biz hallederiz", note: "LANSMAN GUNU. Ilk carousel. Her sey aciklaniyor." },
    ],
  },
  {
    week: 5,
    phase: "Faz 2 — Acilis",
    theme: "iyi ki Burada",
    color: "#FF3300",
    strategy: "Uygulama yayinda. Bio guncelleniyor: 'Soylemene gerek yok. Dusunmen yeter.' + App Store linki. Icerikler artik marka tanıtımı + kullanici hikayeleri + urun gosterimleri.",
    posts: [
      { day: "Pzt", type: "Reel", platform: "IG + TikTok", text: "30 sn: Uygulama kullanim videosu. Bir kisi telefondan kahve seciyor, saga kaydiiryor, arkadassina gonderiyor. 'Gitti. Iyi ki dusundun.' yazisi.", note: "Ilk urun demosu ama reklam gibi degil, hayat gibi." },
      { day: "Sal", type: "Feed", platform: "IG + X", text: "iyi ki varsin. (gorsel: sticker tasarimi)", note: "Sticker gorsellerini dijitale tasima." },
      { day: "Car", type: "Story", platform: "IG", text: "Ilk 24 saatte kac kisi birini dusundu? Sayi paylasimi.", note: "Sosyal kanit. Gercek veri." },
      { day: "Per", type: "Feed", platform: "IG + X", text: "Bir kahve ismarlamak icin karsi karssiya olmak zorunda degilsin.", note: "Urunun temel vaadi acik acik soyleniyor." },
      { day: "Cum", type: "Reel", platform: "IG + TikTok", text: "15 sn: Farkli insanlar telefonlarindan bildirim aliyor: 'Biri seni dusundu.' Her birinin farkli tepkisi. Kimisi glumsüyor, kimisi sasiriyor.", note: "Duygusal patlama ani." },
    ],
  },
  {
    week: 6,
    phase: "Faz 2 — Acilis",
    theme: "Topluluk Basliiyor",
    color: "#FF3300",
    strategy: "Artik kullanici icerikleri (UGC) devreye giriyor. Gercek kullanicilardan gelen jest hikayeleri paylasiliyor. Marka sesi azaliyor, topluluk sesi yüksseliyor.",
    posts: [
      { day: "Pzt", type: "Feed", platform: "IG + X", text: "Bu hafta 3.247 kisi birini dusundu. Sen?", note: "Haftalik veri paylasimi basliyor. Sosyal kanit." },
      { day: "Sal", type: "Story", platform: "IG", text: "Kullanici hikayesi: 'Annem hastanedeydi. Bir sey gonderemedim ama iyi ki'den bir kahve yolladim. Mesaji okuyunca agladi.'", note: "Ilk UGC. Izinli, gercek, duygusal." },
      { day: "Car", type: "Reel", platform: "IG + TikTok", text: "30 sn: 'Bu hafta en cok gondeerilen hediye: Turk Kahvesi. En cok gonderilen saat: 08:14. En cok kullanilan cumle: Aklima geldin.'", note: "Veri hikayesi. Infografik reel." },
      { day: "Per", type: "Feed", platform: "IG + X", text: "Hediye almak icin ozel gun bekleme. Her gun birileri icin ozel.", note: "Marka felsefesi pekistirme." },
      { day: "Cum", type: "Carousel", platform: "IG", text: "5 slayt: Bu haftanin jest haritasi. Hangi sehirden kime, ne gonderildi. (Anonim, sadece sehir + urun)", note: "Haftalik rituel basliyor. Her cuma jest haritasi." },
    ],
  },
];

const platformColors = { "IG + X": "#E1306C", "IG": "#C13584", "IG + TikTok": "#00f2ea", "X": "#1DA1F2" };
const typeIcons = { "Feed": "\ud83d\uddbc\ufe0f", "Story": "\u23fa", "Reel": "\ud83c\udfac", "Carousel": "\ud83d\udcc4" };

export default function SocialPlan() {
  const [activeWeek, setActiveWeek] = useState(0);
  const w = weeks[activeWeek];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0C; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: "#FF3300", marginBottom: 4 }}>iyi ki</div>
        <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: 3 }}>SOSYAL MEDYA \u2022 6 HAFTA \u2022 ICERIK PLANI</div>
      </div>

      {/* Week selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
        {weeks.map((wk, i) => (
          <button key={i} onClick={() => setActiveWeek(i)} style={{
            flex: 1, padding: "8px 4px", borderRadius: 12, border: "none", cursor: "pointer",
            fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            background: activeWeek === i ? `linear-gradient(135deg, ${wk.color}, ${wk.color}CC)` : "rgba(255,255,255,0.04)",
            color: activeWeek === i ? "#fff" : "#666",
            boxShadow: activeWeek === i ? `0 4px 12px ${wk.color}44` : "none",
            transition: "all 0.3s",
          }}>
            <div>H{wk.week}</div>
          </button>
        ))}
      </div>

      {/* Week header */}
      <div style={{
        background: `linear-gradient(135deg, ${w.color}18, ${w.color}08)`,
        borderRadius: 18, padding: "18px 20px", marginBottom: 16,
        borderLeft: `4px solid ${w.color}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontFamily: "'Libre Baskerville', serif", fontWeight: 700, color: "#fff", fontStyle: "italic" }}>Hafta {w.week}: {w.theme}</div>
          <div style={{ fontSize: 10, color: w.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: 1 }}>{w.phase.split("—")[1]?.trim().toUpperCase()}</div>
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{w.strategy}</div>
      </div>

      {/* Posts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {w.posts.map((p, i) => (
          <div key={i} style={{
            borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {/* Post header */}
            <div style={{
              padding: "10px 16px", background: "rgba(255,255,255,0.04)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: w.color, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>{p.day}</div>
                <span style={{ fontSize: 14 }}>{typeIcons[p.type] || "\ud83d\udccc"}</span>
                <span style={{ fontSize: 12, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{p.type}</span>
              </div>
              <div style={{
                padding: "3px 8px", borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                fontSize: 9, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}>{p.platform}</div>
            </div>

            {/* Post content */}
            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{
                fontSize: 15, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic",
                color: "#fff", lineHeight: 1.6, marginBottom: 8,
              }}>"{p.text}"</div>
              <div style={{
                fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.5, paddingTop: 8,
                borderTop: "1px solid rgba(255,255,255,0.04)",
              }}>{"\u2192"} {p.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Phase overview at bottom */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 20,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>FAZ OZETI</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "H1-2", title: "Gizem", desc: "Sadece soru\nYorum yok\nProfilde '?'", c: "#6B7280" },
            { label: "H3-4", title: "Ipucu", desc: "Renk beliriyor\n'iyi ki' gorunur\nGeri sayim", c: "#FF6D00" },
            { label: "H5-6", title: "Acilis", desc: "Uygulama yayinda\nUGC basliyor\nVeri paylasimi", c: "#FF3300" },
          ].map((f, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 2, background: f.c, marginBottom: 6 }} />
              <div style={{ fontSize: 10, color: f.c, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{f.label}</div>
              <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{f.title}</div>
              <div style={{ fontSize: 9, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, whiteSpace: "pre-line", marginTop: 4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform strategy */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 12,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>PLATFORM STRATEJISI</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { name: "Instagram", role: "Ana platform. Feed + Story + Reel + Carousel. Gorsel agirlikli. Sticker tasarimlariyla ayni dil.", icon: "\ud83d\udcf7" },
            { name: "X (Twitter)", role: "Kisa metin + link. Sorular buradan da paylassilir. Tartisma olusturma. Thread'ler.", icon: "\ud83d\udcac" },
            { name: "TikTok", role: "Sadece Reel icerikleri. Kisa, duygusal, yuzsuz videolar. Eller, objeler, bildirimler.", icon: "\ud83c\udfb5" },
          ].map((pl, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{pl.icon}</div>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{pl.name}</div>
                <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, marginTop: 2 }}>{pl.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtag strategy */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,255,255,0.06)", marginTop: 12,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>HASHTAG</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["#iyiki", "#iyikivarsin", "#iyikidusundun", "#iyikisen", "#birjestyap", "#kahveismarla", "#dusunmenyeter"].map((h, i) => (
            <div key={i} style={{
              padding: "5px 10px", borderRadius: 12,
              background: i < 4 ? "#FF330018" : "rgba(255,255,255,0.06)",
              color: i < 4 ? "#FF3300" : "#6B7280",
              fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}>{h}</div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Sans', sans-serif", marginTop: 8, lineHeight: 1.5 }}>
          Faz 0'da hashtag kullanilmaz. Faz 1'de sadece #iyiki. Faz 2'de tam set.
        </div>
      </div>

      {/* Rules */}
      <div style={{
        background: "rgba(255,51,0,0.06)", borderRadius: 16, padding: "18px",
        border: "1px solid rgba(255,51,0,0.1)", marginTop: 12,
      }}>
        <div style={{ fontSize: 10, color: "#FF3300", letterSpacing: 3, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>ALTIN KURALLAR</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>
          {"\u2022"} Asla emoji yogunlugu kullanma (maksimum 1 emoji per post){"\n"}
          {"\u2022"} Asla "Hemen indir!" "Kacirma!" gibi acil satis dili kullanma{"\n"}
          {"\u2022"} Fiyat, indirim, kampanya kelimelerinden uzak dur{"\n"}
          {"\u2022"} Her post tek bir duygu tasissin — birden fazla mesaj verme{"\n"}
          {"\u2022"} Gorsel dil: sticker tasarimlariyla tutarli, sicak, nazik{"\n"}
          {"\u2022"} Video iceriklerde yuz gosterme — eller, objeler, bildirim ekranlari{"\n"}
          {"\u2022"} UGC paylasimlarinda kullanici izni al, anonim birak (istemezlerse){"\n"}
          {"\u2022"} Her cuma veri paylasimi ritueli: "Bu hafta X kisi birini dusundu"
        </div>
      </div>
    </div>
  );
}
