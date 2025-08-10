// Timekeeper Dashboard Types

export type ClockStatus = 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';

// Shared header data interface for dashboard headers
export interface DashboardHeaderData {
  readonly userName: string;
  readonly clockInTime: string;
  readonly minutesAgo: number;
  readonly hoursAgo: number;
  readonly workedHours: string;
  readonly weeklyHours: string;
  readonly remainingHours: string;
}

export type ShiftStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ClockEntry {
  readonly id: string;
  readonly employeeId: string;
  readonly clockInTime: Date;
  readonly clockOutTime?: Date;
  readonly breakStartTime?: Date;
  readonly breakEndTime?: Date;
  readonly status: ClockStatus;
  readonly location?: {
    readonly latitude: number;
    readonly longitude: number;
    readonly address?: string;
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface DashboardData {
  readonly employee: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly fullName: string;
    readonly position?: string;
    readonly unit?: string;
  };
  readonly currentClock?: {
    readonly clockInTime: Date;
    readonly status: ClockStatus;
    readonly workedMinutes: number;
    readonly breakMinutes: number;
  };
  readonly todayStats: {
    readonly totalWorkedMinutes: number;
    readonly totalBreakMinutes: number;
    readonly overtimeMinutes: number;
  };
  readonly weekStats: {
    readonly totalWorkedMinutes: number;
    readonly remainingMinutes: number;
    readonly overtimeMinutes: number;
  };
  readonly monthStats: {
    readonly totalWorkedMinutes: number;
    readonly averageDailyMinutes: number;
    readonly totalDays: number;
  };
  readonly upcomingShifts: number;
  readonly pendingLeaveRequests: number;
}

export interface Shift {
  readonly id: string;
  readonly employeeId: string;
  readonly date: Date;
  readonly startTime: string; // HH:mm format
  readonly endTime: string; // HH:mm format
  readonly status: ShiftStatus;
  readonly unitId?: string;
  readonly unit?: string;
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface LeaveRequest {
  readonly id: string;
  readonly employeeId: string;
  readonly leaveType: 'ANNUAL' | 'SICK' | 'PERSONAL' | 'OTHER';
  readonly startDate: Date;
  readonly endDate: Date;
  readonly reason?: string;
  readonly status: LeaveRequestStatus;
  readonly approvedBy?: string;
  readonly approvedAt?: Date;
  readonly rejectionReason?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ClockResponse {
  readonly success: boolean;
  readonly clockEntry: ClockEntry;
  readonly message?: string;
}

export interface TimesheetEntry {
  readonly date: Date;
  readonly clockEntries: ClockEntry[];
  readonly totalWorkedMinutes: number;
  readonly totalBreakMinutes: number;
  readonly overtimeMinutes: number;
}
