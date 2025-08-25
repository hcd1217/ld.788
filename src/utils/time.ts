import type React from 'react';

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

/**
 * Get the proper locale format based on language code
 * @param language - Language code (e.g., 'vi', 'en')
 * @returns Proper locale format (e.g., 'vi-VN', 'en-US')
 */
export function getLocaleFormat(language: string): string {
  const localeMap: Record<string, string> = {
    vi: 'vi-VN',
    en: 'en-US',
  };
  return localeMap[language] || 'en-US';
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param locale - Optional locale string (defaults to 'vi-VN')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) {
    return '-';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale || 'vi-VN', {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

/**
 * Format a date with time to show hours and minutes
 * @param date - The date to format
 * @param locale - Optional locale string (defaults to 'vi-VN')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string with time
 */
export function formatDateTime(
  date: Date | string | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) {
    return '-';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(locale || 'vi-VN', {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

export type EndDateStatus = 'none' | 'ending_soon' | 'ended_but_active';

/**
 * Check the end date status of an employee
 * @param endDate - The employee's end date
 * @param isActive - Whether the employee is currently active
 * @param daysThreshold - Days ahead to consider "ending soon" (default: 30)
 * @returns The end date status
 */
export function getEndDateStatus(
  endDate: Date | undefined,
  isActive: boolean,
  daysThreshold = 30,
): EndDateStatus {
  if (!endDate) {
    return 'none';
  }

  const today = new Date();
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffTime = endDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // End date has passed but employee is still active
  if (diffDays < 0 && isActive) {
    return 'ended_but_active';
  }

  // End date is approaching
  if (diffDays >= 0 && diffDays <= daysThreshold) {
    return 'ending_soon';
  }

  return 'none';
}

/**
 * Get highlight styles for end date status
 * @param endDate - The employee's end date
 * @param isActive - Whether the employee is currently active
 * @returns CSS styles for highlighting based on end date status
 */
export function getEndDateHighlightStyles(
  endDate: Date | undefined,
  isActive: boolean,
): React.CSSProperties {
  const status = getEndDateStatus(endDate, isActive);

  switch (status) {
    case 'ended_but_active':
      return {
        backgroundColor: 'var(--mantine-color-red-0)',
        borderColor: 'var(--mantine-color-red-3)',
      };
    case 'ending_soon':
      return {
        backgroundColor: 'var(--mantine-color-yellow-0)',
        borderColor: 'var(--mantine-color-yellow-3)',
      };
    default:
      return {};
  }
}
