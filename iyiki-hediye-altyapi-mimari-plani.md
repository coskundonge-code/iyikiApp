# iyiki — Uygulamasız Hediye Alma Altyapısı: Mimari Plan

## Vizyon

Hediye gönderen uygulamayı kullanır, alan kullanmak zorunda değildir. Alıcı sadece bir SMS/WhatsApp linki ile hediyesini partner lokasyonunda (ör. Starbucks Suadiye) QR kod göstererek alır. Uygulama indirmesi tamamen isteğe bağlıdır ve kullanım sonrası viral döngüyle teşvik edilir.

---

## 1. Uçtan Uca Akış

### Faz A — Gönderici (Uygulama İçi)

```
[Uygulamayı aç] → [Kategori seç: Kahve, Çikolata...] → [Hediye seç]
     → [Alıcı seç: Rehberden veya telefon numarası gir]
     → [Kişisel not yaz] → [Gönder ✓]
```

Gönder butonuna basıldığında:
1. `GiftAction` kaydı oluşturulur (status: `PENDING`)
2. Benzersiz 8 karakterlik `redeemCode` üretilir (ör: `AX7K-M2PQ`)
3. Kısa URL oluşturulur: `iyiki.app/r/AX7K-M2PQ`
4. SMS + WhatsApp mesajı alıcıya gönderilir

### Faz B — Alıcıya Bildirim (SMS + WhatsApp)

**SMS Mesajı:**
```
🎁 Bir arkadaşın sana bir hediye gönderdi!
Hediyeni görmek için: iyiki.app/r/AX7K-M2PQ
```

**WhatsApp Mesajı (Zengin İçerik):**
```
🎁 [Gönderen Adı] sana bir hediye gönderdi!

☕ Starbucks'tan bir kahve seni bekliyor.

📍 Suadiye, Bağdat Cad. şubesinde kullanabilirsin.

[Hediyeni Gör →] buton
```

### Faz C — Alıcı Web Sayfası (Uygulama Gerektirmez)

Alıcı linke tıkladığında mobil tarayıcıda açılan sayfa:

```
┌─────────────────────────────┐
│      🎁 iyi ki              │
│                             │
│  [Gönderen Adı] sana       │
│  bir hediye gönderdi!       │
│                             │
│  "Gel sana bir kahve        │
│   ısmarlayayım ☕"          │
│  — Gönderenin notu          │
│                             │
│  ┌─────────────────────┐    │
│  │   ☕ Starbucks       │    │
│  │   Filtre Kahve       │    │
│  └─────────────────────┘    │
│                             │
│  📍 Kullanabileceğin        │
│     lokasyonlar:            │
│  • Suadiye, Bağdat Cad.    │
│  • Kadıköy, Moda Cad.      │
│  • Beşiktaş, Çarşı          │
│                             │
│  [QR Kodunu Göster] buton   │
│                             │
│  ⏰ 71 saat 23 dk kaldı     │
│                             │
└─────────────────────────────┘
```

### Faz D — Lokasyon Doğrulama + QR Kod

"QR Kodunu Göster" butonuna basıldığında:

**Katman 1 — Tarayıcı GPS Kontrolü:**
- Browser Geolocation API ile konum alınır
- En yakın partner şubesi ile mesafe hesaplanır
- 200m yarıçap içindeyse → QR kod aktif
- Uzaktaysa → "Hediyeni kullanmak için şubeye git" + harita

**Katman 2 — POS Doğrulaması (Asıl Güvenlik):**
- QR kod her zaman bir `redeemCode` içerir
- Kasiyer QR'ı okuttuğunda → Partner POS sistemi API'ye istek atar
- API, kodun geçerli olduğunu VE o şubeye ait olduğunu doğrular
- Çift katmanlı güvenlik: GPS client-side kontrol + server-side POS doğrulama

```
[Alıcı telefonu]          [Kasiyer POS]           [iyiki API]
      |                        |                       |
      |--- QR göster --------->|                       |
      |                        |--- POST /redeem ----->|
      |                        |                       |-- validate code
      |                        |                       |-- check branch
      |                        |                       |-- check expiry
      |                        |<-- 200 OK: Onaylandı--|
      |                        |                       |
      |<-- "Hediye verildi" ---|                       |
```

### Faz E — Kullanım Sonrası (Viral Döngü)

Hediye başarıyla kullanıldıktan 5 dakika sonra:

**SMS:**
```
☕ iyi ki! [Gönderen Adı] sana bir kahve ısmarladı.
Sen de sevdiklerini sevindirmek ister misin?
iyiki uygulamasını indir: [App Store / Play Store linki]
```

**WhatsApp:**
```
☕ Afiyet olsun!

[Gönderen Adı] iyi ki uygulamasıyla sana
bir kahve ısmarladı.

💛 Sen de sevdiklerini sevindirmek ister misin?
Söylemene gerek yok. Düşünmen yeter. İyi ki sen.

[Uygulamayı İndir →] buton
```

---

## 2. Veritabanı Değişiklikleri

### Mevcut (Değişiklik Gerekmez)

| Tablo/Alan | Durum |
|---|---|
| `GiftAction.redeemCode` | ✅ Mevcut |
| `GiftAction.receiverPhone` | ✅ Mevcut |
| `GiftAction.status` (PENDING/CLAIMED/EXPIRED) | ✅ Mevcut |
| `GiftAction.expiresAt` | ✅ Mevcut |
| `GiftAction.claimedAt` | ✅ Mevcut |
| `Partner` + `Branch` (lat/lng, address) | ✅ Mevcut |
| `Notification` sistemi | ✅ Mevcut |

### Yeni Eklenecekler

```prisma
// GiftAction'a eklenmesi gereken yeni alanlar
model GiftAction {
  // ... mevcut alanlar ...

  // Yeni: Kullanım detayları
  redemptionBranchId   String?
  redemptionBranch     Branch?    @relation(fields: [redemptionBranchId], references: [id])
  redemptionMethod     RedemptionMethod?  // QR_SCAN veya MANUAL_CODE

  // Yeni: Mesaj takibi
  smsDeliveryId        String?    // SMS provider'ın mesaj ID'si
  smsDeliveredAt       DateTime?
  whatsappDeliveryId   String?
  whatsappDeliveredAt  DateTime?

  // Yeni: Viral döngü takibi
  postRedemptionSmsSentAt  DateTime?  // Kullanım sonrası SMS gönderildi mi
  referralConverted        Boolean    @default(false) // Alıcı uygulamayı indirdi mi
}

enum RedemptionMethod {
  QR_SCAN
  MANUAL_CODE
}

// Yeni tablo: Kullanım denemeleri (audit & fraud prevention)
model RedemptionAttempt {
  id            String   @id @default(cuid())
  giftActionId  String
  giftAction    GiftAction @relation(fields: [giftActionId], references: [id])
  branchId      String?
  branch        Branch?  @relation(fields: [branchId], references: [id])

  method        RedemptionMethod
  status        RedemptionAttemptStatus  // SUCCESS, INVALID_CODE, EXPIRED, WRONG_BRANCH, ALREADY_CLAIMED

  // Konum bilgisi
  clientLat     Float?   // Alıcının GPS koordinatı
  clientLng     Float?
  distanceToShop Float?  // Metre cinsinden mesafe

  // Meta
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())
}

enum RedemptionAttemptStatus {
  SUCCESS
  INVALID_CODE
  EXPIRED
  WRONG_BRANCH
  ALREADY_CLAIMED
  FRAUD_DETECTED
}

// Yeni tablo: SMS/WhatsApp mesaj kuyruğu
model MessageQueue {
  id            String   @id @default(cuid())
  giftActionId  String
  giftAction    GiftAction @relation(fields: [giftActionId], references: [id])

  channel       MessageChannel   // SMS, WHATSAPP
  type          MessageType      // GIFT_NOTIFICATION, POST_REDEMPTION, REMINDER
  phone         String
  content       String

  status        MessageStatus    // QUEUED, SENT, DELIVERED, FAILED
  providerId    String?          // Provider'ın mesaj ID'si
  sentAt        DateTime?
  deliveredAt   DateTime?
  failReason    String?
  retryCount    Int       @default(0)

  scheduledFor  DateTime?        // Zamanlı mesajlar için (post-redemption delay)
  createdAt     DateTime  @default(now())
}

enum MessageChannel {
  SMS
  WHATSAPP
}

enum MessageType {
  GIFT_NOTIFICATION      // Hediye geldi bildirimi
  GIFT_REMINDER          // Süresi dolmadan hatırlatma
  POST_REDEMPTION        // Kullanım sonrası viral SMS
  WELCOME                // Uygulama indirildi karşılama
}

enum MessageStatus {
  QUEUED
  SENT
  DELIVERED
  FAILED
}
```

---

## 3. API Tasarımı

### 3.1 Public API (Auth Gerektirmez)

#### `GET /r/[code]` — Hediye Sayfası (Web)
Next.js page, SSR ile render edilir. Auth gerektirmez.

```
Girdi: URL param → redeemCode
Çıktı: HTML sayfa (gift detayları, harita, QR butonu)

Kontroller:
- Kod geçerli mi?
- Süresi dolmuş mu?
- Zaten kullanılmış mı?
```

#### `GET /api/gift/[code]` — Hediye Bilgisi (JSON)
```json
// Response
{
  "gift": {
    "name": "Filtre Kahve",
    "partnerName": "Starbucks",
    "partnerLogo": "https://...",
    "senderName": "Ahmet",
    "note": "Gel sana bir kahve ısmarlayayım ☕",
    "expiresAt": "2026-04-08T12:00:00Z",
    "remainingHours": 71.4,
    "status": "PENDING"
  },
  "locations": [
    {
      "branchId": "...",
      "name": "Suadiye Şubesi",
      "address": "Bağdat Cad. No:123",
      "lat": 40.9632,
      "lng": 29.0699
    }
  ]
}
```

#### `POST /api/gift/[code]/verify-location` — GPS Doğrulama
```json
// Request
{ "lat": 40.9634, "lng": 29.0701 }

// Response
{
  "nearbyBranch": {
    "branchId": "...",
    "name": "Suadiye Şubesi",
    "distance": 45  // metre
  },
  "canRedeem": true,
  "qrPayload": "IYIKI:AX7K-M2PQ:branch_abc:1712345678"
}
```

### 3.2 Partner API (API Key Auth)

#### `POST /api/partner/redeem` — QR Kod Kullanımı
Partner POS sistemi tarafından çağrılır.

```json
// Request
{
  "redeemCode": "AX7K-M2PQ",
  "branchId": "branch_suadiye_001",
  "scannedAt": "2026-04-05T14:30:00Z"
}

// Headers
{
  "X-Partner-Key": "pk_live_abc123",
  "X-Signature": "hmac-sha256-signature"
}

// Response — Başarılı
{
  "success": true,
  "gift": {
    "name": "Filtre Kahve",
    "quantity": 1
  },
  "message": "Hediye onaylandı. Müşteriye teslim edebilirsiniz."
}

// Response — Hata
{
  "success": false,
  "error": "ALREADY_CLAIMED",
  "message": "Bu hediye daha önce kullanılmış."
}
```

#### Hata Kodları

| Kod | Açıklama |
|---|---|
| `INVALID_CODE` | Geçersiz kod |
| `EXPIRED` | Süresi dolmuş |
| `ALREADY_CLAIMED` | Zaten kullanılmış |
| `WRONG_BRANCH` | Bu şube için geçerli değil |
| `PARTNER_MISMATCH` | Farklı partnere ait hediye |
| `FRAUD_DETECTED` | Şüpheli aktivite |

### 3.3 Internal API

#### `POST /api/cron/send-reminders` — Hatırlatma Mesajları
24 saat ve 6 saat kala hatırlatma SMS gönderir.

#### `POST /api/cron/post-redemption-sms` — Viral SMS Gönderimi
Kullanım sonrası 5 dk bekleyip viral SMS gönderir.

---

## 4. QR Kod Yapısı

### Payload Format
```
IYIKI:{redeemCode}:{branchId}:{timestamp}:{checksum}
```

Örnek:
```
IYIKI:AX7K-M2PQ:br_suadiye:1712345678:a3f2
```

### Güvenlik
- `checksum`: HMAC-SHA256(redeemCode + branchId + timestamp, SECRET_KEY) → ilk 4 hex
- `timestamp`: QR'ın üretildiği an, 5 dk geçerlilik (replay attack önlemi)
- QR her gösterimde yeniden üretilir (dinamik timestamp)

### QR Kod Akışı
```
[Alıcı web sayfası]
    |
    |-- GPS kontrolü geçti
    |-- POST /api/gift/{code}/verify-location
    |-- Server QR payload üretir (timestamp + checksum ile)
    |-- QR kod client'ta render edilir
    |
[Kasiyer POS]
    |
    |-- QR okutulur → payload parse edilir
    |-- POST /api/partner/redeem
    |-- Server checksum ve timestamp doğrular
    |-- Hediye onaylanır
```

---

## 5. Lokasyon Sistemi

### Client-Side (Tarayıcı GPS)

```javascript
// Basitleştirilmiş akış
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Server'a gönder, en yakın branch'i bul
    fetch(`/api/gift/${code}/verify-location`, {
      method: 'POST',
      body: JSON.stringify({ lat: latitude, lng: longitude })
    });
  },
  (error) => {
    // GPS reddedildi → QR kodu yine göster ama uyarı ver
    // "Konum paylaşırsanız size en yakın şubeyi gösterebiliriz"
    // QR kod yine çalışır çünkü asıl doğrulama POS tarafında
  }
);
```

### Server-Side (Mesafe Hesaplama)

```
Haversine formülü ile mesafe:
- < 200m: ✅ "Bu şubedesiniz" → QR aktif, yeşil
- 200m - 1km: ⚠️ "Yakınsınız" → QR aktif, sarı
- > 1km: 📍 "Şubeye gidin" → QR gösterilir ama gri, harita göster
```

**Önemli:** GPS reddi durumunda QR kod yine gösterilir. GPS sadece UX iyileştirmesi içindir. Asıl güvenlik POS doğrulamasındadır.

### POS-Side (Kesin Doğrulama)

```
Partner POS → /api/partner/redeem çağrısında:
- branchId otomatik olarak POS'tan gelir (kasiyer seçmez)
- Server, giftAction'ın bu branch'e ait partnere ait olduğunu doğrular
- Bu katman atlanamaz (server-side, API key + HMAC)
```

---

## 6. SMS & WhatsApp Entegrasyonu

### Mevcut Altyapı
- **Netgsm**: +90 Türk numaraları için (mevcut, çalışıyor)
- **Twilio**: Uluslararası numaralar için (mevcut, çalışıyor)

### Yeni: WhatsApp Business API

**Seçenek 1 — Twilio WhatsApp** (Önerilen başlangıç)
- Twilio zaten mevcut, WhatsApp eklentisi kolay
- Content Templates (Meta onaylı) gerekli
- Maliyet: ~0.05$/mesaj

**Seçenek 2 — Meta Cloud API (Direkt)**
- Daha ucuz yüksek hacimlerde
- Daha fazla özelleştirme
- Daha karmaşık entegrasyon

### Mesaj Akışı

```
[Gift Created]
    |
    ├── SMS (anında)
    │   └── Netgsm/Twilio → "Hediye geldi: {link}"
    │
    └── WhatsApp (anında, paralel)
        └── Twilio/Meta → Zengin mesaj + buton

[24 saat kala]
    └── SMS hatırlatma: "Hediyenin süresi yarın doluyor!"

[Gift Redeemed]
    |
    ├── [5 dk sonra] Viral SMS
    │   └── "İyi ki! Sen de sevdiklerini sevindir: {app link}"
    │
    └── [5 dk sonra] Viral WhatsApp
        └── Zengin mesaj + uygulama indirme butonu
```

### WhatsApp Template Mesajları (Meta Onay Gerekli)

```
Template 1: gift_notification
"🎁 {{1}} sana bir hediye gönderdi!
{{2}} — {{3}} seni bekliyor.
Hediyeni görmek için tıkla:"
[CTA: Hediyeni Gör → {{4}}]

Template 2: post_redemption
"☕ Afiyet olsun!
{{1}} iyi ki uygulamasıyla sana bir hediye verdi.
💛 Sen de sevdiklerini sevindirmek ister misin?"
[CTA: Uygulamayı İndir → {{2}}]

Template 3: gift_reminder
"⏰ Hediyenin süresi {{1}} içinde doluyor!
{{2}}'den {{3}} seni bekliyor."
[CTA: Hediyene Bak → {{4}}]
```

---

## 7. Partner POS Entegrasyonu

### Basit Entegrasyon (MVP)

Küçük partnerler için web tabanlı basit QR okuyucu:

```
[Partner Web Panel: partner.iyiki.app]
    |
    ├── Login (partner credentials)
    ├── QR Tarayıcı (kamera ile)
    │   └── Tarayınca → API call → Onay/Red göster
    └── Günlük rapor (kaç hediye kullanıldı)
```

### Gelişmiş Entegrasyon (Büyük Partnerler)

Starbucks, Gloria Jean's gibi büyükler için API entegrasyonu:

```
[Partner Mevcut POS] → [iyiki API] → [Doğrulama + Onay]
    - Webhook: /api/webhooks/partner (mevcut altyapı)
    - Events: gift_redeemed, stock_update
    - HMAC signature verification (mevcut)
```

### Partner Onboarding

1. Partner kaydı → API key + secret üretilir
2. Branch'ler eklenir (adres, koordinat)
3. Ürünler/hediyeler tanımlanır
4. POS entegrasyonu veya web panel erişimi
5. Test hediye ile doğrulama

---

## 8. MVP Yol Haritası

### MVP-1: Temel Akış (2-3 Hafta)

**Kapsam:**
- ✅ Gönderici: Hediye seçip telefon numarasıyla gönderir
- ✅ SMS gönderimi (mevcut Netgsm/Twilio)
- ✅ Alıcı web sayfası (`/r/[code]`) — basit, statik QR
- ✅ Partner web paneli (basit QR tarayıcı)
- ✅ Redemption API
- ❌ WhatsApp (sonraki faz)
- ❌ GPS geofence (sonraki faz)
- ❌ Viral post-redemption SMS (sonraki faz)

**Yeni dosyalar:**
```
src/app/r/[code]/page.tsx          — Public hediye sayfası (SSR)
src/app/api/gift/[code]/route.ts   — Gift bilgi API
src/app/api/partner/redeem/route.ts — POS redemption API
src/app/partner/scan/page.tsx      — Partner QR tarayıcı
src/lib/services/redemption.ts     — Redemption business logic
src/lib/services/qr-generator.ts   — QR kod üretimi
```

### MVP-2: Lokasyon + WhatsApp (2 Hafta)

**Kapsam:**
- GPS geofence (client-side)
- Dinamik QR kod (timestamp + checksum)
- WhatsApp Business API entegrasyonu
- Lokasyon bazlı QR aktivasyonu

### MVP-3: Viral Döngü + Analytics (1-2 Hafta)

**Kapsam:**
- Post-redemption SMS/WhatsApp (5 dk delay)
- Referral tracking (alıcı uygulamayı indirdi mi?)
- Hatırlatma mesajları (24 saat, 6 saat kala)
- Analytics dashboard (conversion funnel)

### MVP-4: Partner Genişletme (Ongoing)

**Kapsam:**
- Büyük partner POS API entegrasyonları
- Çoklu şube yönetimi
- Stok senkronizasyonu
- Partner self-service portal

---

## 9. Güvenlik Önlemleri

| Tehdit | Önlem |
|---|---|
| QR kod paylaşımı | Dinamik timestamp, 5 dk geçerlilik |
| Replay attack | checksum + timestamp doğrulama |
| Sahte GPS | GPS sadece UX; POS asıl doğrulama |
| Brute force redeem | Rate limiting + RedemptionAttempt log |
| Partner API abuse | HMAC signature + API key |
| SMS bombing | Aynı numaraya günde max 3 SMS |
| Kod tahmini | 8 karakter alphanumeric = 2.8 trilyon kombinasyon |

---

## 10. Maliyet Tahmini (Aylık, 1000 Hediye Bazında)

| Kalem | Birim Fiyat | Aylık Maliyet |
|---|---|---|
| SMS (Netgsm) | ~0.03 TL/SMS | ~90 TL (3 SMS/hediye) |
| WhatsApp (Twilio) | ~0.05$/mesaj | ~150$ (3 mesaj/hediye) |
| Supabase (mevcut) | Free tier | 0 TL |
| Vercel (mevcut) | Free tier | 0 TL |
| **Toplam** | | **~150$ + 90 TL** |

> Not: WhatsApp maliyet açısından baskın. Başlangıçta sadece SMS ile başlayıp, WhatsApp'ı büyüme aşamasında eklemek mantıklı.

---

## 11. Akış Diyagramı (Özet)

```
GÖNDEREN                     SİSTEM                      ALICI                    PARTNER
   |                           |                           |                        |
   |-- Hediye seç + gönder --->|                           |                        |
   |                           |-- GiftAction oluştur      |                        |
   |                           |-- redeemCode üret         |                        |
   |                           |-- SMS gönder ------------>|                        |
   |                           |-- WhatsApp gönder ------->|                        |
   |                           |                           |                        |
   |                           |                           |-- Link tıkla           |
   |                           |<-- GET /r/{code} ---------|                        |
   |                           |-- Hediye sayfası -------->|                        |
   |                           |                           |                        |
   |                           |                           |-- Şubeye git           |
   |                           |                           |-- GPS doğrula          |
   |                           |<-- verify-location -------|                        |
   |                           |-- QR payload gönder ----->|                        |
   |                           |                           |                        |
   |                           |                           |-- QR göster ---------->|
   |                           |                           |                        |-- QR oku
   |                           |<------------------------- POST /redeem ------------|
   |                           |-- Doğrula + onayla ------>|                        |
   |                           |                           |                        |-- Hediye ver
   |                           |                           |<-- Teslim edildi ------|
   |                           |                           |                        |
   |<-- Bildirim: kullanıldı --|                           |                        |
   |                           |                           |                        |
   |                           |-- [5dk] Viral SMS ------->|                        |
   |                           |                           |-- İsterse indir        |
   |                           |                           |-- Artık gönderici! 🔄  |
```

---

## 12. Tartışmaya Açık Konular

1. **QR kod her zaman gösterilsin mi?** GPS reddedilse bile QR göstermek UX açısından daha iyi, ama güvenlik riski? (POS zaten doğruluyor)

2. **Hediye birden fazla lokasyonda kullanılabilir mi?** Örneğin "herhangi bir Starbucks şubesi" mi yoksa "sadece Suadiye şubesi" mi?

3. **Manuel kod girişi desteklensin mi?** QR okuyucusu olmayan partner için kasiyer elle kod girebilir mi?

4. **Alıcı kayıtlıysa ne olsun?** Zaten uygulaması varsa push notification mı gönderelim, yoksa yine SMS?

5. **Süresi dolan hediyeler için farklı bir viral mesaj var mı?** "Hediyeni kullanamadın ama sen de birine hediye gönderebilirsin"

6. **WhatsApp'ı ne zaman ekleyelim?** MVP-1'de sadece SMS yeterli mi?

7. **Deep linking:** Alıcı uygulamayı indirdikten sonra hediye sayfasına otomatik yönlendirilsin mi?
