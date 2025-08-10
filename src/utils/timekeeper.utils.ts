// Timekeeper utility functions

// Helper function to format time
export const formatTime = (date: Date | undefined, second = false): string => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: second ? '2-digit' : undefined,
    hour12: true,
  });
};

// Helper function to format duration
export const formatDuration = (minutes: number): string => {
  if (minutes === 0) {
    return '--';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 1) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

// Helper function to get week range
export const getWeekRange = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // End of week (Saturday)
  return { start, end };
};

// Helper function to get days of week
export const getDaysOfWeek = (weekStart: Date): Date[] => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

// Helper function to format date range
export const formatDateRange = (start: Date, end: Date): string => {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${startMonth}, ${year}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`;
};

// Helper function to format hours and minutes
export const formatHoursMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Helper function to format hours (HH:MM format)
export const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};
