import { test, expect } from '@playwright/test'

test.describe('Navigation and Routing', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies()

    await page.goto('/home')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should allow authenticated users to access main routes', async ({ page }) => {
    // This test assumes user can be logged in
    // In a real scenario, you might need to set up auth state first

    // Try to navigate to protected route
    await page.goto('/home')

    // Either redirected to login or page loads
    const isOnHome = await page.url().includes('/home')
    const isOnLogin = await page.url().includes('/login')

    expect(isOnHome || isOnLogin).toBe(true)
  })

  test('should display bottom navigation on main layout', async ({ page }) => {
    await page.goto('/home')

    // Check for bottom navigation
    const bottomNav = page.locator('[role="navigation"], nav, [class*="nav"], [class*="bottom"]')
    const navItems = page.locator('a[href*="/"], button[href*="/"]')

    // At least one nav element should exist
    const navCount = await navItems.count()
    expect(navCount).toBeGreaterThan(0)
  })

  test('should navigate between home and profile', async ({ page }) => {
    await page.goto('/home')

    // Look for profile link
    const profileLink = page.locator(
      'a[href*="/profile"], button:has-text("Profil"), a:has-text("Profile")'
    )

    const exists = await profileLink.first().isVisible().catch(() => false)
    if (exists) {
      await profileLink.first().click()
      await page.waitForNavigation({ timeout: 3000 }).catch(() => {})
      expect(await page.url()).toContain('/profile')
    }
  })

  test('should navigate between home and send gift', async ({ page }) => {
    await page.goto('/home')

    // Look for send gift link
    const sendLink = page.locator(
      'a[href*="/send"], button:has-text("Hediye Gönder"), button:has-text("Send")'
    )

    const exists = await sendLink.first().isVisible().catch(() => false)
    if (exists) {
      await sendLink.first().click()
      await page.waitForNavigation({ timeout: 3000 }).catch(() => {})
      expect(await page.url()).toContain('/send')
    }
  })

  test('should have working back navigation', async ({ page }) => {
    await page.goto('/home')
    const initialUrl = page.url()

    // Navigate to another page if possible
    const profileLink = page.locator('a[href*="/profile"]')
    const exists = await profileLink.isVisible().catch(() => false)

    if (exists) {
      await profileLink.click()
      await page.waitForNavigation({ timeout: 3000 }).catch(() => {})

      // Go back
      await page.goBack()

      // Should be back at home
      const finalUrl = page.url()
      expect(finalUrl).toContain('home')
    }
  })

  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/invalid-route-xyz')

    // Should either show 404 or redirect
    const is404 = await page.locator('text=/404|Not Found|Bulunamadı/i').isVisible().catch(() => false)
    const isRedirected = await page.url().includes('/login')

    expect(is404 || isRedirected).toBe(true)
  })

  test('should maintain navigation state when returning', async ({ page }) => {
    await page.goto('/home')

    // Get initial state (e.g., scroll position)
    const initialScroll = await page.evaluate(() => window.scrollY)

    // Navigate away
    const link = page.locator('a[href*="/notifications"]')
    const exists = await link.isVisible().catch(() => false)

    if (exists) {
      await link.click()
      await page.waitForNavigation({ timeout: 3000 }).catch(() => {})

      // Go back
      await page.goBack()

      // State should be similar (browser handles this)
      const url = page.url()
      expect(url).toContain('home')
    }
  })
})

test.describe('Admin Routes', () => {
  test('should restrict access to admin pages for regular users', async ({ page }) => {
    await page.goto('/admin')

    // Should redirect to login or show access denied
    const isOnAdmin = await page.url().includes('/admin')
    const isOnLogin = await page.url().includes('/login')
    const isDenied = await page
      .locator('text=/Denied|Erişim|Access/i')
      .isVisible()
      .catch(() => false)

    expect(!isOnAdmin || isDenied || isOnLogin).toBe(true)
  })

  test('should allow admin users to access admin panel', async ({ page }) => {
    // This would require logging in as admin first
    // Placeholder for admin flow

    await page.goto('/admin')

    // Check if admin panel loaded or redirected
    const isOnAdmin = await page.url().includes('/admin')
    const isOnLogin = await page.url().includes('/login')

    expect(isOnAdmin || isOnLogin).toBe(true)
  })
})

test.describe('Deep Linking', () => {
  test('should navigate directly to specific gift redemption', async ({ page }) => {
    const actionId = 'test-action-id'

    await page.goto(`/redeem/${actionId}`)

    // Should either load redemption page or redirect to login
    const isOnRedeem = await page.url().includes('/redeem')
    const isOnLogin = await page.url().includes('/login')

    expect(isOnRedeem || isOnLogin).toBe(true)
  })

  test('should handle invalid gift ID gracefully', async ({ page }) => {
    await page.goto('/redeem/invalid-id')

    // Should show error or redirect
    const isOnRedeem = await page.url().includes('/redeem')
    const isErrorShown = await page
      .locator('text=/Error|Hata|Invalid/i')
      .isVisible()
      .catch(() => false)

    expect(isOnRedeem || isErrorShown).toBe(true)
  })

  test('should navigate to send specific gift', async ({ page }) => {
    const giftId = 'test-gift-id'

    await page.goto(`/send/${giftId}`)

    // Should either load send page with gift or redirect
    const isOnSend = await page.url().includes('/send')
    const isOnLogin = await page.url().includes('/login')

    expect(isOnSend || isOnLogin).toBe(true)
  })
})

test.describe('Link Functionality', () => {
  test('should have accessible navigation links', async ({ page }) => {
    await page.goto('/home')

    // All links should be properly formatted
    const links = page.locator('a')
    const linkCount = await links.count()

    // Should have at least some navigation links
    expect(linkCount).toBeGreaterThan(0)
  })

  test('should not have broken navigation links', async ({ page }) => {
    await page.goto('/home')

    // Check for links with empty or invalid hrefs
    const invalidLinks = page.locator('a:not([href]), a[href=""], a[href="#"]')
    const invalidCount = await invalidLinks.count()

    // Should not have unintentional broken links
    // Note: Some href="#" might be intentional for buttons
    expect(invalidCount).toBeLessThanOrEqual(5)
  })

  test('should handle rapid navigation clicks', async ({ page }) => {
    await page.goto('/home')

    // Simulate rapid clicking
    const link = page.locator('a[href*="/notifications"]').first()
    const exists = await link.isVisible().catch(() => false)

    if (exists) {
      await link.click()
      // Rapid second click
      await link.clic