import {ApiError} from '@/lib/api';

/**
 * Extracts a user-friendly error message from an unknown error
 * @param error - The error object
 * @param defaultMessage - The default message to use if error cannot be parsed
 * @returns A user-friendly error message
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
