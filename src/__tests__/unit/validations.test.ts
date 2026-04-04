import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  verifyOtpSchema,
  sendGiftSchema,
  redeemGiftSchema,
  updateProfileSchema,
  paginationSchema,
  paginationSchemaWithDefaults,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct Turkish phone number', () => {
      const result = loginSchema.safeParse({ phone: '+905551234567' })
      expect(result.success).toBe(true)
    })

    it('should reject phone without +90 prefix', () => {
      const result = loginSchema.safeParse({ phone: '5551234567' })
      expect(result.success).toBe(false)
    })

    it('should reject phone with incorrect number of digits', () => {
      const result = loginSchema.safeParse({ phone: '+9055512345' })
      expect(result.success).toBe(false)
    })

    it('should reject empty phone', () => {
      const result = loginSchema.safeParse({ phone: '' })
      expect(result.success).toBe(false)
    })

    it('should reject phone with letters', () => {
      const result = loginSchema.safeParse({ phone: '+905551234abc' })
      expect(result.success).toBe(false)
    })
  })

  describe('verifyOtpSchema', () => {
    it('should validate correct OTP code', () => {
      const result = verifyOtpSchema.safeParse({
        phone: '+905551234567',
        code: '123456',
      })
      expect(result.success).toBe(true)
    })

    it('should reject OTP code with non-digits', () => {
      const result = verifyOtpSchema.safeParse({
        phone: '+905551234567',
        code: '12345a',
      })
      expect(result.success).toBe(false)
    })

    it('should reject OTP code with incorrect length', () => {
      const result = verifyOtpSchema.safeParse({
        phone: '+905551234567',
        code: '12345',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid phone in OTP schema', () => {
      const result = verifyOtpSchema.safeParse({
        phone: '5551234567',
        code: '123456',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('sendGiftSchema', () => {
    it('should validate complete gift send', () => {
      const result = sendGiftSchema.safeParse({
        giftId: '550e8400-e29b-41d4-a716-446655440000',
        receiverPhone: '+905551234567',
        receiverName: 'John Doe',
        note: 'Nice gift!',
      })
      expect(result.success).toBe(true)
    })

    it('should validate gift send without optional fields', () => {
      const result = sendGiftSchema.safeParse({
        giftId: '550e8400-e29b-41d4-a716-446655440000',
        receiverPhone: '+905551234567',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID for giftId', () => {
      const result = sendGiftSchema.safeParse({
        giftId: 'not-a-uuid',
        receiverPhone: '+905551234567',
      })
      expect(result.success).toBe(false)
    })

    it('should reject note exceeding max length', () => {
      const result = sendGiftSchema.safeParse({
        giftId: '550e8400-e29b-41d4-a716-446655440000',
        receiverPhone: '+905551234567',
        note: 'x'.repeat(201),
      })
      expect(result.success).toBe(false)
    })

    it('should accept note at max length', () => {
      const result = sendGiftSchema.safeParse({
        giftId: '550e8400-e29b-41d4-a716-446655440000',
        receiverPhone: '+905551234567',
        note: 'x'.repeat(200),
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid receiver phone', () => {
      const result = sendGiftSchema.safeParse({
        giftId: '550e8400-e29b-41d4-a716-446655440000',
        receiverPhone: '5551234567',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('redeemGiftSchema', () => {
    it('should validate correct redeem data', () => {
      const result = redeemGiftSchema.safeParse({
        actionId: '550e8400-e29b-41d4-a716-446655440000',
        branchId: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid actionId UUID', () => {
      const result = redeemGiftSchema.safeParse({
        actionId: 'invalid',
        branchId: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid branchId UUID', () => {
      const result = redeemGiftSchema.safeParse({
        actionId: '550e8400-e29b-41d4-a716-446655440000',
        branchId: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateProfileSchema', () => {
    it('should validate profile with all fields', () => {
      const result = updateProfileSchema.safeParse({
        name: 'John Doe',
        avatar: 'https://example.com/avatar.png',
        birthday: '1990-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('should reject name shorter than 2 characters', () => {
      const result = updateProfileSchema.safeParse({ name: 'A' })
      expect(result.success).toBe(false)
    })

    it('should reject name longer than 50 characters', () => {
      const result = updateProfileSchema.safeParse({
        name: 'A'.repeat(51),
      })
      expect(result.success).toBe(false)
    })

    it('should accept name at minimum length', () => {
      const result = updateProfileSchema.safeParse({ name: 'Ab' })
      expect(result.success).toBe(true)
    })

    it('should accept name at maximum length', () => {
      const result = updateProfileSchema.safeParse({ name: 'A'.repeat(50) })
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL for avatar', () => {
      const result = updateProfileSchema.safeParse({
        avatar: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid avatar URL', () => {
      const result = updateProfileSchema.safeParse({
        avatar: 'https://example.com/image.jpg',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid birthday date', () => {
      const result = updateProfileSchema.safeParse({
        birthday: 'invalid-date',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid birthday ISO date', () => {
      const result = updateProfileSchema.safeParse({
        birthday: '1990-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('should allow empty profile update', () => {
      const result = updateProfileSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('paginationSchema', () => {
    it('should validate correct pagination params', () => {
      const result = paginationSchema.safeParse({
        page: 1,
        limit: 10,
      })
      expect(result.success).toBe(true)
    })

    it('should reject zero page number', () => {
      const result = paginationSchema.safeParse({
        page: 0,
        limit: 10,
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative page number', () => {
      const result = paginationSchema.safeParse({
        page: -1,
        limit: 10,
      })
      expect(result.success).toBe(false)
    })

    it('should reject limit exceeding max 100', () => {
      const result = paginationSchema.safeParse({
        page: 1,
        limit: 101,
      })
      expect(result.success).toBe(false)
    })

    it('should reject limit of 0', () => {
      const result = paginationSchema.safeParse({
        page: 1,
        limit: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should accept limit of 100', () => {
      const result = paginationSchema.safeParse({
        page: 1,
        limit: 100,
      })
      expect(result.success).toBe(true)
    })

    it('should reject non-integer page', () => {
      const result = paginationSchema.safeParse({
        page: 1.5,
        limit: 10,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('paginationSchemaWithDefaults', () => {
    it('should apply defaults for missing values', () => {
      const result = paginationSchemaWithDefaults.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate with partial params', () => {
      const result = paginationSchemaWithDefaults.safeParse