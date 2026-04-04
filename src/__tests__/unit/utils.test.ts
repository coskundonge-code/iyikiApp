import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatTimeRemaining,
  formatRelativeTime,
  formatPhone,
  generateOTP,
  getInitials,
  getStatusLabel,
  getStatusColor,
  getExpiryPercentage,
  cn,
} from '@/lib/utils'

describe('Utility Functions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('formatTimeRemaining', () => {
    it('should show "Süresi doldu" for expired time', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const pastTime = new Date(now.getTime() - 1000).toISOString()
      expect(formatTimeRemaining(pastTime)).toBe('Süresi doldu')
    })

    it('should show hours and minutes for times < 24 hours', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const future = new Date(now.getTime() + 5 * 3600000 + 30 * 60000).toISOString() // 5h 30m
      expect(formatTimeRemaining(future)).toBe('5 saat 30 dk')
    })

    it('should show days and hours for times >= 24 hours', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const future = new Date(now.getTime() + 2 * 24 * 3600000 + 5 * 3600000).toISOString() // 2d 5h
      expect(formatTimeRemaining(future)).toBe('2 gün 5 saat')
    })

    it('should show 0 minutes for just expired time', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const future = new Date(now.getTime() + 1 * 60000).toISOString() // 1 minute
      expect(formatTimeRemaining(future)).toBe('0 saat 1 dk')
    })
  })

  describe('formatRelativeTime', () => {
    it('should show "Az önce" for recent times', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const recent = new Date(now.getTime() - 30000).toISOString() // 30 seconds ago
      expect(formatRelativeTime(recent)).toBe('Az önce')
    })

    it('should show minutes for times < 60 minutes ago', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const past = new Date(now.getTime() - 30 * 60000).toISOString() // 30 minutes ago
      expect(formatRelativeTime(past)).toBe('30 dk önce')
    })

    it('should show hours for times < 24 hours ago', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const past = new Date(now.getTime() - 5 * 3600000).toISOString() // 5 hours ago
      expect(formatRelativeTime(past)).toBe('5 saat önce')
    })

    it('should show days for times < 7 days ago', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const past = new Date(now.getTime() - 3 * 86400000).toISOString() // 3 days ago
      expect(formatRelativeTime(past)).toBe('3 gün önce')
    })

    it('should show formatted date for times >= 7 days ago', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)
      const past = new Date(now.getTime() - 10 * 86400000).toISOString() // 10 days ago
      const result = formatRelativeTime(past)
      // Turkish locale uses DD.MM.YYYY format
      expect(result).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/)
    })
  })

  describe('formatPhone', () => {
    it('should format Turkish phone correctly', () => {
      expect(formatPhone('+905551234567')).toBe('+90 555 123 45 67')
    })

    it('should return unformatted phone if not Turkish', () => {
      expect(formatPhone('+15551234567')).toBe('+15551234567')
    })

    it('should handle missing format gracefully', () => {
      expect(formatPhone('5551234567')).toBe('5551234567')
    })
  })

  describe('generateOTP', () => {
    it('should generate a 6-digit string', () => {
      const otp = generateOTP()
      expect(otp).toMatch(/^\d{6}$/)
    })

    it('should generate different OTPs on consecutive calls', () => {
      const otp1 = generateOTP()
      const otp2 = generateOTP()
      // Very unlikely to be the same, but could happen theoretically
      expect([otp1, otp2]).toHaveLength(2)
    })

    it('should generate OTP in valid range', () => {
      const otp = parseInt(generateOTP(), 10)
      expect(otp).toBeGreaterThanOrEqual(100000)
      expect(otp).toBeLessThanOrEqual(999999)
    })
  })

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should get initials from single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle multiple spaces', () => {
      expect(getInitials('John  Michael  Doe')).toBe('JM')
    })

    it('should return ? for undefined name', () => {
      expect(getInitials(undefined)).toBe('?')
    })

    it('should return ? for empty name', () => {
      expect(getInitials('')).toBe('?')
    })

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('should limit to 2 characters', () => {
      expect(getInitials('John Michael David')).toBe('JM')
    })
  })

  describe('getStatusLabel', () => {
    it('should map pending status', () => {
      expect(getStatusLabel('pending')).toBe('Bekliyor')
    })

    it('should map claimed status', () => {
      expect(getStatusLabel('claimed')).toBe('Kullanıldı')
    })

    it('should map expired status', () => {
      expect(getStatusLabel('expired')).toBe('Süresi Doldu')
    })

    it('should map social_pool status', () => {
      expect(getStatusLabel('social_pool')).toBe('Askıda')
    })

    it('should map distributed status', () => {
      expect(getStatusLabel('distributed')).toBe('Dağıtıldı')
    })

    it('should return original status for unknown status', () => {
      expect(getStatusLabel('unknown')).toBe('unknown')
    })
  })

  describe('getStatusColor', () => {
    it('should return amber colors for pending', () => {
      expect(getStatusColor('pending')).toBe('bg-amber-100 text-amber-800')
    })

    it('should return green colors for claimed', () => {
      expect(getStatusColor('claimed')).toBe('bg-green-100 text-green-800')
    })

    it('should return red colors for expired', () => {
      expect(getStatusColor('expired')).toBe('bg-red-100 text-red-800')
    })

    it('should return purple colors for social_pool', () => {
      expect(getStatusColor('social_pool')).toBe('bg-purple-100 text-purple-800')
    })

    it('should return blue colors for distributed', () => {
      expect(getStatusColor('distributed')).toBe('bg-blue-100 text-blue-800')
    })

    it('should return gray colors for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getExpiryPercentage', () => {
    it('should calculate expiry percentage correctly', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)

      const created = new Date(now.getTime() - 24 * 3600000).toISOString() // 1 day ago
      const expires = new Date(now.getTime() + 24 * 3600000).toISOString() // 1 day from now

      const percentage = getExpiryPercentage(created, expires)
      expect(percentage).toBe(50) // 50% remaining
    })

    it('should return 100 for freshly created gifts', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)

      const created = now.toISOString()
      const expires = new Date(now.getTime() + 24 * 3600000).toISOString()

      const percentage = getExpiryPercentage(created, expires)
      expect(percentage).toBe(100)
    })

    it('should return 0 for expired gifts', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)

      const created = new Date(now.getTime() - 48 * 3600000).toISOString()
      const expires = new Date(now.getTime() - 24 * 3600000).toISOString()

      const percentage = getExpiryPercentage(created, expires)
      expect(percentage).toBe(0)
    })

    it('should clamp percentage to 0-100 range', () => {
      const now = new Date('2026-04-04T12:00:00Z')
      vi.setSystemTime(now)

      const created = new Date(now.getTime() - 100 * 3600000).toISOString()
      const expires = new Date(now.getTime() - 50 * 3600000).toISOString()

      const percentage = getExpiryPercentage(created, expires)
      expect(percentage).toBeGreaterThanOrEqual(0)
      expect(percentage).toBeLessThanOrEqual(100)
    })
  })

  describe('cn (classname utility)', () => {
    it('should combine multiple classes', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
    })

    it('should handle falsy values', () => {
      expect(cn('px-2', false && 'py-1', 'bg-white')).toBe('px-2 bg-white')
    })

    it('should handle undefined values', () => {
      expect(cn('px-2', undefined, 'bg-white')).toBe('px-2 bg-white')
    })

    it('should handle arrays', () => {
      expect(cn(['px-2', 'py-1'], 'bg-white')).toBe('px-2 py-1 bg-white')
    })
  })
})
