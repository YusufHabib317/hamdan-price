import { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
} as const;

export function handleApiError(error: unknown, silent = false): ApiError {
  const axiosError = error as AxiosError<ApiError>;

  const apiError: ApiError = {
    code: axiosError.response?.data?.code || ErrorCodes.INTERNAL_ERROR,
    message: axiosError.response?.data?.message || 'An unexpected error occurred',
    details: axiosError.response?.data?.details,
  };

  if (!silent && typeof window !== 'undefined') {
    // Log error for debugging in development
  }

  return apiError;
}

export function createApiError(
  code: keyof typeof ErrorCodes,
  message: string,
  details?: Record<string, string[]>,
): ApiError {
  return { code, message, details };
}
