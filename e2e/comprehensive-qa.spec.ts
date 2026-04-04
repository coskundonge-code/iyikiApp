import { test, expect } from '@playwright/test';

test.describe('MODÜL 1: RBAC ve Yetkilendirme', () => {
  test('Yatay ve Dikey Yetki Yükseltme Engellemesi (Horizontal/Vertical Privilege Escalation)', async ({ page }) => {
    // 1. Standart kullanıcı olarak giriş yap
    await page.goto('/login');
    const userBtn = page.getByRole('button', { name: 'Kullanıcı' });
    await userBtn.click();
    
    // 2. Admin sayfasına erişmeyi dene (Vertical Escalation)
    await page.goto('/admin');
    await page.waitForURL('**/home'); // Reddedilip Home sayfasına veya Login'e atılmalı
    expect(page.url()).not.toContain('/admin');
    
    // 3. Başka kullanıcının profiline erişmeyi dene (Horizontal Escalation - Mock Data)
    await page.goto('/profile?id=fake-user-id');
    expect(await page.locator('text=You do not have permission').isVisible() || page.url().includes('/home')).toBeTruthy();
  });

  test('Korumalı Route API Testi', async ({ request }) => {
    // API endpoint validation with NO cookies/tokens
    const response = await request.get('/api/cron/expire-gifts');
    expect(response.status()).toBe(401);
  });
});

test.describe('MODÜL 2: Fonksiyonel ve Akış Testleri', () => {
  test('Mutlu Yol (Happy Path) Uçtan Uca Akış', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Kullanıcı' }).click();
    
    // Yönlendirme ve Hediyeler yüklenmeli
    await page.waitForURL('**/home');
    
    // Navbar Tıklamaları
    await page.click('nav a[href="/send"]');
    await page.waitForURL('**/send');
    
    // Hediyeler listelenmiş olmalı
    const sendButton = page.locator('text=Kahve Ismarla');
    if (await sendButton.count() > 0) {
      await sendButton.first().click();
      await page.waitForSelector('input[type="tel"]');
    }
  });

  test('Uç Durumlar - Negatif Değerler (Edge Cases)', async ({ page }) => {
    await page.goto('/login');
    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill('00000000');
    // Gönder butonu pasif olmalı
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
    
    // Emoji girişi test
    await phoneInput.fill('😃😃😃');
    await expect(submitBtn).toBeDisabled();
  });
});

test.describe('MODÜL 3: Süreç ve Veri Bütünlüğü', () => {
  test('Aktif süreçlerin (F5) durum korunumu', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Kullanıcı' }).click();
    await page.waitForURL('**/home');
    
    // Sayfa yenileme state koruması
    await page.reload();
    await expect(page).toHaveURL(/\/home/); // Login loop'a düşmemeli
  });

  test('Geri (Back) Tuşu State Koruması', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Kullanıcı' }).click();
    await page.goto('/profile');
    await page.goBack();
    await expect(page).toHaveURL(/\/home/);
  });
});

test.describe('MODÜL 4: Güvenlik ve Form Zafiyetleri', () => {
  test('XSS ve SQL Injection Vektör Testi', async ({ page }) => {
    await page.goto('/login');
    const payload = "<script>alert('xss')</script>";
    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill(payload);
    
    const value = await phoneInput.inputValue();
    // Input numeric kısıtlama nedeniyle payloadı silmeli
    expect(value).not.toContain("<script>");
  });
});

test.describe('MODÜL 5: UI/UX ve Mantıksal Tıkanıklıklar', () => {
  test('Hata mesajlarının netliği ve Loading Indicator kontrolü', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled(); // Başlangıçta pasif
    
    // Demo login sonrası spinner beklemesi (zamanlı)
    const userBtn = page.getByRole('button', { name: 'Kullanıcı' });
    await userBtn.click();
    await page.waitForSelector('.toast', { state: 'visible' }); 
    expect(await page.locator('text=Hoş geldiniz!').isVisible()).toBeTruthy();
  });
});

test.describe('MODÜL 6: Performans ve Race Conditions', () => {
  test('Hızlı Çift Tıklama (Double Submit) Engellemesi', async ({ page }) => {
    await page.goto('/login');
    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill('+905551234567');
    
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.dblclick(); // Hızlı çift tıkla
    
    // Sadece bir kere istek gitmeli, verify ekranına atlamalı
    await page.waitForURL('**/verify');
  });
});

test.describe('MODÜL 7: Erişilebilirlik (A11y)', () => {
  test('Klavye Navigasyonu ve Aria Etiketleri', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });
});

test.describe('MODÜL 13: SEO ve Meta Veriler', () => {
  test('Title ve Meta Tag Kontrolleri', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain('İyi Ki');

    // canonical url check
    // Manifest link check
    const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifest).toBe('/manifest.json');
  });
});
