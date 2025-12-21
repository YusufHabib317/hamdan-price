import { z } from 'zod';

/**
 * Validation schemas for the Device Pricing System
 * These schemas ensure data integrity for rate inputs
 * Requirements: 7.3
 */

// Common error messages
const ERRORS = {
  RATE_REQUIRED: 'Exchange rate is required',
  RATE_INVALID_TYPE: 'Exchange rate must be a number',
  RATE_POSITIVE: 'Exchange rate must be positive',
  RATE_MIN: 'Exchange rate must be at least 0.01',
};

// ============================================
// Exchange Rate Validation
// ============================================

export const exchangeRateSchema = z.object({
  rate: z
    .number({
      required_error: ERRORS.RATE_REQUIRED,
      invalid_type_error: ERRORS.RATE_INVALID_TYPE,
    })
    .positive(ERRORS.RATE_POSITIVE)
    .min(0.01, ERRORS.RATE_MIN),
});

export type ExchangeRateInput = z.infer<typeof exchangeRateSchema>;

// ============================================
// Validation Helper Functions
// ============================================

export function validateExchangeRate(data: unknown): ExchangeRateInput {
  return exchangeRateSchema.parse(data);
}

export function safeValidateExchangeRate(data: unknown) {
  return exchangeRateSchema.safeParse(data);
}
