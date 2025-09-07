// Demo data for Timekeeper UI
import type {
  DashboardData,
  ClockEntry,
  Shift,
  LeaveRequest,
  TimesheetEntry,
  ClockStatus,
  ShiftStatus,
  LeaveRequestStatus,
} from '@/types/timekeeper';

// Helper to create dates relative to today
const getRelativeDate = (daysOffset: number, hours = 0, minutes = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 1);
  return date;
};

// Demo Clock Entries
export const demoClockEntries: ClockEntry[] = [
  {
    id: 'clock-1',
    employeeId: 'emp-001',
    clockInTime: getRelativeDate(0, 9, 0), // Today 9:00 AM
    status: 'CLOCKED_IN' as ClockStatus,
    location: {
      latitude: 10.8231,
      longitude: 106.6297,
      address: 'Credo HQ, District 1, Ho Chi Minh City',
    },
    createdAt: getRelativeDate(0, 9, 0),
    updatedAt: getRelativeDate(0, 9, 0),
  },
  {
    id: 'clock-2',
    employeeId: 'emp-001',
    clockInTime: getRelativeDate(-1, 8, 30), // Yesterday 8:30 AM
    clockOutTime: getRelativeDate(-1, 17, 45), // Yesterday 5:45 PM
    breakStartTime: getRelativeDate(-1, 12, 0), // Lunch break
    breakEndTime: getRelativeDate(-1, 13, 0),
    status: 'CLOCKED_OUT' as ClockStatus,
    location: {
      latitude: 10.8231,
      longitude: 106.6297,
      address: 'Credo HQ, District 1, Ho Chi Minh City',
    },
    createdAt: getRelativeDate(-1, 8, 30),
    updatedAt: getRelativeDate(-1, 17, 45),
  },
  {
    id: 'clock-3',
    employeeId: 'emp-001',
    clockInTime: getRelativeDate(-2, 9, 15), // 2 days ago
    clockOutTime: getRelativeDate(-2, 18, 30),
    breakStartTime: getRelativeDate(-2, 12, 30),
    breakEndTime: getRelativeDate(-2, 13, 30),
    status: 'CLOCKED_OUT' as ClockStatus,
    createdAt: getRelativeDate(-2, 9, 15),
    updatedAt: getRelativeDate(-2, 18, 30),
  },
];

// Demo Upcoming Shifts
export const demoShifts: Shift[] = [
  {
    id: 'shift-1',
    employeeId: 'emp-001',
    date: getRelativeDate(1), // Tomorrow
    startTime: '09:00',
    endTime: '18:00',
    status: 'SCHEDULED' as ShiftStatus,
    unitId: 'unit-001',
    unit: 'Customer Service',
    notes: 'Regular shift',
    createdAt: getRelativeDate(-7),
    updatedAt: getRelativeDate(-7),
  },
  {
    id: 'shift-2',
    employeeId: 'emp-001',
    date: getRelativeDate(2), // Day after tomorrow
    startTime: '09:00',
    endTime: '18:00',
    status: 'SCHEDULED' as ShiftStatus,
    unitId: 'unit-001',
    unit: 'Customer Service',
    createdAt: getRelativeDate(-7),
    updatedAt: getRelativeDate(-7),
  },
  {
    id: 'shift-3',
    employeeId: 'emp-001',
    date: getRelativeDate(3),
    startTime: '14:00',
    endTime: '22:00',
    status: 'SCHEDULED' as ShiftStatus,
    unitId: 'unit-001',
    unit: 'Customer Service',
    notes: 'Evening shift - covering for John',
    createdAt: getRelativeDate(-5),
    updatedAt: getRelativeDate(-5),
  },
  {
    id: 'shift-4',
    employeeId: 'emp-001',
    date: getRelativeDate(7), // Next week
    startTime: '08:00',
    endTime: '16:00',
    status: 'SCHEDULED' as ShiftStatus,
    unitId: 'unit-002',
    unit: 'Sales Department',
    notes: 'Training session with new team',
    createdAt: getRelativeDate(-3),
    updatedAt: getRelativeDate(-3),
  },
];

// Demo Leave Requests
export const demoLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-001',
    leaveType: 'ANNUAL',
    startDate: getRelativeDate(14), // 2 weeks from now
    endDate: getRelativeDate(16),
    reason: 'Family vacation to Da Nang',
    status: 'PENDING' as LeaveRequestStatus,
    createdAt: getRelativeDate(-2),
    updatedAt: getRelativeDate(-2),
  },
  {
    id: 'leave-2',
    employeeId: 'emp-001',
    leaveType: 'SICK',
    startDate: getRelativeDate(-10),
    endDate: getRelativeDate(-9),
    reason: 'Flu symptoms',
    status: 'APPROVED' as LeaveRequestStatus,
    approvedBy: 'manager-001',
    approvedAt: getRelativeDate(-10),
    createdAt: getRelativeDate(-11),
    updatedAt: getRelativeDate(-10),
  },
  {
    id: 'leave-3',
    employeeId: 'emp-001',
    leaveType: 'PERSONAL',
    startDate: getRelativeDate(30),
    endDate: getRelativeDate(30),
    reason: 'Personal appointment',
    status: 'PENDING' as LeaveRequestStatus,
    createdAt: getRelativeDate(-1),
    updatedAt: getRelativeDate(-1),
  },
];

// Demo Dashboard Data
export const demoDashboardData: DashboardData = {
  employee: {
    id: 'emp-001',
    firstName: 'Huỳnh',
    lastName: 'Đặng',
    fullName: 'Đặng Huỳnh',
    position: 'Senior Customer Service Representative',
    unit: 'Customer Service',
  },
  currentClock: {
    clockInTime: getRelativeDate(0, 9, 0),
    status: 'CLOCKED_IN' as ClockStatus,
    workedMinutes: Math.floor((Date.now() - getRelativeDate(0, 9, 0).getTime()) / 60000),
    breakMinutes: 0,
  },
  todayStats: {
    totalWorkedMinutes: Math.floor((Date.now() - getRelativeDate(0, 9, 0).getTime()) / 60000),
    totalBreakMinutes: 0,
    overtimeMinutes: 0,
  },
  weekStats: {
    totalWorkedMinutes: 2145, // ~35.75 hours
    remainingMinutes: 255, // ~4.25 hours remaining for 40 hour week
    overtimeMinutes: 0,
  },
  monthStats: {
    totalWorkedMinutes: 9840, // ~164 hours
    averageDailyMinutes: 492, // ~8.2 hours per day
    totalDays: 20,
  },
  upcomingShifts: 4,
  pendingLeaveRequests: 2,
};

// Generate timesheet entries for the past month
const generateTimesheetEntries = (): TimesheetEntry[] => {
  const entries: TimesheetEntry[] = [];
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 2);

  // Start from one month ago
  const currentDate = new Date(oneMonthAgo);
  currentDate.setHours(0, 0, 0, 0);

  // Generate entries for each day from one month ago until today
  while (currentDate <= today) {
    const date = new Date(currentDate);
    const dayOfWeek = date.getDay();

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend - no work
      entries.push({
        date: new Date(date),
        clockEntries: [],
        totalWorkedMinutes: 0,
        totalBreakMinutes: 0,
        overtimeMinutes: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Skip future dates
    if (date > today) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Generate clock entries for workdays
    const clockIn = new Date(date);
    // Vary clock-in times: 7:30 AM to 9:30 AM
    const clockInHour = 7 + Math.floor(Math.random() * 2);
    const clockInMinute = Math.floor(Math.random() * 60);
    clockIn.setHours(clockInHour, clockInMinute, 0, 0);

    let clockOut: Date | undefined;
    let breakStart: Date | undefined;
    let breakEnd: Date | undefined;
    let totalWorked = 0;
    let totalBreak = 0;

    // Check if this is today and still during work hours
    const isToday = date.toDateString() === today.toDateString();
    const currentHour = new Date().getHours();

    // For past days and today (if after work hours), add clock out
    if (!isToday || (isToday && currentHour >= 17)) {
      clockOut = new Date(date);
      // Vary clock-out times: 5:00 PM to 7:30 PM
      const clockOutHour = 17 + Math.floor(Math.random() * 2);
      const clockOutMinute = Math.floor(Math.random() * 60);
      clockOut.setHours(clockOutHour, clockOutMinute, 0, 0);

      // Add lunch break (30-60 minutes)
      breakStart = new Date(date);
      breakStart.setHours(12, Math.floor(Math.random() * 30), 0, 0);
      breakEnd = new Date(date);
      const breakDuration = 30 + Math.floor(Math.random() * 31); // 30-60 minutes
      breakEnd.setTime(breakStart.getTime() + breakDuration * 60000);

      totalBreak = Math.floor((breakEnd.getTime() - breakStart.getTime()) / 60000);
      totalWorked = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000) - totalBreak;
    } else if (isToday && currentHour >= 9) {
      // Today - still clocked in (only if current time is after clock in time)
      totalWorked = Math.floor((Date.now() - clockIn.getTime()) / 60000);
    }

    const clockEntry: ClockEntry = {
      id: `clock-${date.getTime()}`,
      employeeId: 'emp-001',
      clockInTime: clockIn,
      clockOutTime: clockOut,
      breakStartTime: breakStart,
      breakEndTime: breakEnd,
      status: clockOut ? ('CLOCKED_OUT' as ClockStatus) : ('CLOCKED_IN' as ClockStatus),
      location: {
        latitude: 10.8231 + (Math.random() * 0.01 - 0.005),
        longitude: 106.6297 + (Math.random() * 0.01 - 0.005),
        address: 'Credo HQ, District 1, Ho Chi Minh City',
      },
      createdAt: clockIn,
      updatedAt: clockOut || new Date(),
    };

    entries.push({
      date: new Date(date),
      clockEntries: totalWorked > 0 ? [clockEntry] : [],
      totalWorkedMinutes: totalWorked,
      totalBreakMinutes: totalBreak,
      overtimeMinutes: Math.max(0, totalWorked - 480), // Overtime after 8 hours
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return entries;
};

export const demoTimesheetEntries = generateTimesheetEntries();

// Log demo data initialization
const startDate = demoTimesheetEntries.length > 0 ? demoTimesheetEntries[0].date : new Date();
const endDate =
  demoTimesheetEntries.length > 0 ? (demoTimesheetEntries.at(-1)?.date ?? new Date()) : new Date();
console.log('Demo timesheet data initialized:', {
  entriesCount: demoTimesheetEntries.length,
  dateRange: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
  workDays: demoTimesheetEntries.filter((e) => e.totalWorkedMinutes > 0).length,
  firstFewDates: demoTimesheetEntries.slice(0, 5).map((e) => e.date.toLocaleDateString()),
});

// Additional helper data for quick testing
export const demoLocations = [
  {
    latitude: 10.8231,
    longitude: 106.6297,
    address: 'Credo HQ, District 1, Ho Chi Minh City',
  },
  {
    latitude: 10.7769,
    longitude: 106.7009,
    address: 'Credo Branch - District 2, Ho Chi Minh City',
  },
  {
    latitude: 10.8142,
    longitude: 106.6438,
    address: 'Credo Warehouse - Tan Binh, Ho Chi Minh City',
  },
];

// Function to get random demo data for testing
export const getRandomShift = (): Shift => {
  const daysOffset = Math.floor(Math.random() * 14) + 1;
  const startHour = Math.floor(Math.random() * 8) + 7; // 7 AM to 3 PM

  return {
    id: `shift-random-${Date.now()}`,
    employeeId: 'emp-001',
    date: getRelativeDate(daysOffset),
    startTime: `${startHour.toString().padStart(2, '0')}:00`,
    endTime: `${(startHour + 8).toString().padStart(2, '0')}:00`,
    status: 'SCHEDULED' as ShiftStatus,
    unitId: `unit-${Math.floor(Math.random() * 3) + 1}`,
    unit: ['Customer Service', 'Sales', 'Operations'][Math.floor(Math.random() * 3)],
    notes: Math.random() > 0.5 ? 'Regular shift' : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Function to simulate real-time clock updates
export const getCurrentClockStatus = (): DashboardData['currentClock'] | undefined => {
  const now = new Date();
  const hours = now.getHours();

  // Simulate different states based on current time
  if (hours >= 9 && hours < 17) {
    // During work hours - clocked in
    const clockInTime = new Date(now);
    clockInTime.setHours(9, 0, 0, 0);

    return {
      clockInTime,
      status:
        hours >= 12 && hours < 13 ? ('ON_BREAK' as ClockStatus) : ('CLOCKED_IN' as ClockStatus),
      workedMinutes: Math.floor((now.getTime() - clockInTime.getTime()) / 60000),
      breakMinutes: hours >= 13 ? 60 : 0,
    };
  }

  // Outside work hours - not clocked in
  return undefined;
};
