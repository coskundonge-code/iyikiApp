import { z } from 'zod';

// Turkish phone validation: +90XXXXXXXXXX format
const turkishPhoneRegex = /^\+90[0-9]{10}$/;

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Telefon numarası gereklidir')
    .regex(turkishPhoneRegex, 'Geçerli bir Türkçe telefon numarası girin (+90XXXXXXXXXX)'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Telefon numarası gereklidir')
    .regex(turkishPhoneRegex, 'Geçerli bir Türkçe telefon numarası girin (+90XXXXXXXXXX)'),
  code: z
    .string()
    .length(6, 'Doğrulama kodu 6 haneli olmalıdır')
    .regex(/^\d{6}$/, 'Doğrulama kodu yalnızca rakamlardan oluşmalıdır'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

// ============================================================================
// Gift Schemas
// ============================================================================

export const sendGiftSchema = z.object({
  giftId: z
    .string()
    .uuid('Geçerli bir hediye ID\'si gereklidir'),
  receiverPhone: z
    .string()
    .min(1, 'Alıcı telefon numarası gereklidir')
    .regex(turkishPhoneRegex, 'Geçerli bir Türkçe telefon numarası girin (+90XXXXXXXXXX)'),
  receiverName: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length > 0,
      'Ad boş olmamalıdır'
    ),
  note: z
    .string()
    .max(200, 'Not en fazla 200 karakter olabilir')
    .optional(),
});

export type SendGiftInput = z.infer<typeof sendGiftSchema>;

export const redeemGiftSchema = z.object({
  actionId: z
    .string()
    .uuid('Geçerli bir işlem ID\'si gereklidir'),
  branchId: z
    .string()
    .uuid('Geçerli bir şube ID\'si gereklidir'),
});

export type RedeemGiftInput = z.infer<typeof redeemGiftSchema>;

// ============================================================================
// User Profile Schemas
// ============================================================================

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir')
    .optional(),
  avatar: z
    .string()
    .url('Geçerli bir URL gereklidir')
    .optional(),
  birthday: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      'Geçerli bir tarih gereklidir'
    )
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================================================
// Notification Schemas
// ============================================================================

export const notificationTypeEnum = z.enum([
  'gift_received',
  'gift_redeemed',
  'gift_expiring',
  'gift_expired',
  'gift_to_pool',
  'gift_distributed',
  'premium',
  'system',
]);

export const createNotificationSchema = z.object({
  userId: z
    .string()
    .uuid('Geçerli bir kullanıcı ID\'si gereklidir'),
  type: notificationTypeEnum,
  title: z
    .string()
    .min(1, 'Başlık gereklidir'),
  message: z
    .string()
    .min(1, 'Mesaj gereklidir'),
  actionId: z
    .string()
    .uuid('Geçerli bir işlem ID\'si gereklidir')
    .optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// ============================================================================
// Pagination Schema
// ============================================================================

export const paginationSchema = z.object({
  page: z
    .number()
    .int('Sayfa pozitif bir tamsayı olmalıdır')
    .positive('Sayfa pozitif bir tamsayı olmalıdır'),
  limit: z
    .number()
    .int('Limit pozitif bir tamsayı olmalıdır')
    .min(1, 'Limit en az 1 olmalıdır')
    .max(100, 'Limit en fazla 100 olabilir'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================================
// Helper: Pagination with defaults
// ============================================================================

export const paginationSchemaWithDefaults = paginationSchema
  .partial()
  .refine(
    (data) => {
      const page = data.page ?? 1;
      const limit = data.limit ?? 10;
      return page > 0 && limit > 0 && limit <= 100;
    },
    'Geçerli sayfa ve limit olmalıdır'
  );

export type PaginationWithDefaults = z.infer<typeof paginationSchemaWithDefaults>; 