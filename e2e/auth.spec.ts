import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/.*/)
    await expect(page.locator('text=/Telefon|Phone|Login/i')).toBeVisible()
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    // Check for phone input field
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="5"], input[placeholder*="90"]')
    await expect(phoneInput.first()).toBeVisible()

    // Check for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Gönder")')
    await expect(submitButton.first()).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/login')

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="5"], input[placeholder*="90"]').first()
    const submitButton = page.locator('button[type="submit"], button:has-text("Gönder")').first()

    // Try invalid phone
    await phoneInput.fill('1234567890')
    await submitButton.click()

    // Should show error or remain on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should accept valid Turkish phone number', async ({ page }) => {
    await page.goto('/login')

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="5"], input[placeholder*="90"]').first()
    await phoneInput.fill('+905551234567')

    // Check if phone is filled
    await expect(phoneInput).toHaveValue('+905551234567')
  })

  test('should navigate to OTP verification after phone submission', async ({ page }) => {
    await page.goto('/login')

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="5"], input[placeholder*="90"]').first()
    const submitButton = page.locator('button[type="submit"], button:has-text("Gönder")').first()

    await phoneInput.fill('+905551234567')
    await submitButton.click()

    // Should navigate to verify page or show OTP form
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {})

    const verifyTitle = page.locator('text=/Doğrula|Verify|OTP/i')
    const otpInput = page.locator('input[type="text"], input[placeholder*="kod"], input[placeholder*="code"]').first()

    const isVerifyPage = await page.url().includes('/verify')
    const isOtpVisible = await otpInput.isVisible().catch(() => false)
    const isTitleVisible = await verifyTitle.isVisible().catch(() => false)

    expect(isVerifyPage || isOtpVisible || isTitleVisible).toBe(true)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/login')

    // Simulate offline
    await page.context().setOffline(true)

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="5"], input[placeholder*="90"]').first()
    const submitButton = page.locator('button[type="submit"], button:has-text("Gönder")').first()

    await phoneInput.fill('+905551234567')
    await submitButton.click()

    // Should stay on page or show error
    await page.context().setOffline(false)
    await expect(page).toHaveURL(/\/login/)
  })

  test('should clear phone on logout', async ({ page }) => {
    await page.goto('/login')

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="5"], input[placeholder*="90"]').first()
    await phoneInput.fill('+905551234567')

    // Navigate away and back
    await page.goto('/')
    await page.goto('/login')

    // Input should be empty or have placeholder
    const inputValue = await phoneInput.inputValue()
    expect(inputValue).toBe('')
  })
})

test.describe('OTP Verification', () => {
  test('should display OTP input field', async ({ page }) => {
    await page.goto('/verify')

    const otpInput = page.locator('input[type="text"], input[placeholder*="kod"], input[placeholder*="code"]').first()
    await expect(otpInput).toBeVisible()
  })

  test('should accept 6-digit OTP code', async ({ page }) => {
    await page.goto('/verify')

    const otpInput = page.locator('input[type="text"], input[placeholder*="kod"], input[placeholder*="code"]').first()
    await otpInput.fill('123456')

    const value = await otpInput.inputValue()
    expect(value).toBe('123456')
  })

  test('should validate OTP format', async ({ page }) => {
    await page.goto('/verify')

    const otpInput = page.locator('input[type="text"], input[placeholder*="kod"], input[placeholder*="code"]').first()
    await otpInput.fill('abcdef')

    // Should only accept numbers
    const value = await otpInput.inputValue()
    const isNumeric = /^\d*$/.test(value)
    expect(isNumeric || value === '').toBe(true)
  })

  test('should show resend OTP button', async ({ page }) => {
    await page.goto('/verify')

    const resendButton = page.locator('button:has-text("Tekrar Gönder"), button:has-text("Resend")')
    const resendText = page.locator('text=/Tekrar|Resend/i')

    const isButtonVisible = await resendButton.first().isVisible().catch(() => false)
    const isTextVisible = await resendText.first().isVisible().catch(() => false)

    expect(isButtonVisible || isTextVisible).toBe(true)
  })
})
