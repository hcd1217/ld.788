export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('vi-VN', {
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
  const endDateTime = new Date(endDate);

  // Reset time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  endDateTime.setHours(0, 0, 0, 0);

  const timeDiff = endDateTime.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Employee ended but still active
  if (daysDiff < 0 && isActive) {
    return 'ended_but_active';
  }

  // Employee ending soon
  if (daysDiff >= 0 && daysDiff <= daysThreshold) {
    return 'ending_soon';
  }

  return 'none';
}

/**
 * Get highlight styles for employee based on end date status
 * @param endDate - The employee's end date
 * @param isActive - Whether the employee is currently active
 * @returns Object with background and border color styles
 */
export function getEndDateHighlightStyles(endDate: Date | undefined, isActive: boolean) {
  const status = getEndDateStatus(endDate, isActive);

  switch (status) {
    case 'ending_soon':
      return {
        backgroundColor: 'var(--mantine-color-yellow-0)',
        borderColor: 'var(--mantine-color-yellow-4)',
      };
    case 'ended_but_active':
      return {
        backgroundColor: 'var(--mantine-color-red-0)',
        borderColor: 'var(--mantine-color-red-4)',
      };
    default:
      return {};
  }
}
