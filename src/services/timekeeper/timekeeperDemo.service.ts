// Demo Timekeeper Service for UI Testing
import {
  demoDashboardData,
  // demoClockEntries,
  demoLeaveRequests,
  demoShifts,
  demoTimesheetEntries,
  getCurrentClockStatus,
  getRandomShift,
} from '@/data/timekeeperDemoData';
import type {
  ClockEntry,
  ClockResponse,
  DashboardData,
  LeaveRequest,
  Shift,
  TimesheetEntry,
} from '@/types/timekeeper';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class TimekeeperDemoService {
  // State for demo
  private currentDashboard: DashboardData = { ...demoDashboardData };
  private shifts: Shift[] = [...demoShifts];
  private leaveRequests: LeaveRequest[] = [...demoLeaveRequests];
  private timesheetEntries: TimesheetEntry[] = [...demoTimesheetEntries];

  async getDashboard(): Promise<DashboardData> {
    await delay(500); // Simulate network delay

    // Update current clock status based on time of day
    this.currentDashboard = {
      ...this.currentDashboard,
      currentClock: getCurrentClockStatus(),
      upcomingShifts: this.shifts.filter((s) => s.status === 'SCHEDULED').length,
      pendingLeaveRequests: this.leaveRequests.filter((l) => l.status === 'PENDING').length,
    };

    return this.currentDashboard;
  }

  async clockIn(location?: { latitude: number; longitude: number }): Promise<ClockResponse> {
    await delay(800);

    const now = new Date();
    const newClockEntry: ClockEntry = {
      id: `clock-${Date.now()}`,
      employeeId: 'emp-001',
      clockInTime: now,
      status: 'CLOCKED_IN',
      location: location || {
        latitude: 10.8231,
        longitude: 106.6297,
        address: 'Credo HQ, District 1, Ho Chi Minh City',
      },
      createdAt: now,
      updatedAt: now,
    };

    // Update dashboard
    this.currentDashboard = {
      ...this.currentDashboard,
      currentClock: {
        clockInTime: now,
        status: 'CLOCKED_IN',
        workedMinutes: 0,
        breakMinutes: 0,
      },
    };

    return {
      success: true,
      clockEntry: newClockEntry,
      message: 'Successfully clocked in',
    };
  }

  async clockOut(location?: { latitude: number; longitude: number }): Promise<ClockResponse> {
    await delay(800);

    const now = new Date();
    const clockInTime = this.currentDashboard.currentClock?.clockInTime || new Date();

    const clockEntry: ClockEntry = {
      id: `clock-${Date.now()}`,
      employeeId: 'emp-001',
      clockInTime,
      clockOutTime: now,
      status: 'CLOCKED_OUT',
      location: location || {
        latitude: 10.8231,
        longitude: 106.6297,
        address: 'Credo HQ, District 1, Ho Chi Minh City',
      },
      createdAt: clockInTime,
      updatedAt: now,
    };

    // Clear current clock
    this.currentDashboard = {
      ...this.currentDashboard,
      currentClock: undefined,
    };

    return {
      success: true,
      clockEntry,
      message: 'Successfully clocked out',
    };
  }

  async startBreak(): Promise<ClockResponse> {
    await delay(500);

    const now = new Date();
    const currentClock = this.currentDashboard.currentClock;

    if (currentClock) {
      this.currentDashboard = {
        ...this.currentDashboard,
        currentClock: {
          ...currentClock,
          status: 'ON_BREAK',
        },
      };
    }

    const clockEntry: ClockEntry = {
      id: `clock-${Date.now()}`,
      employeeId: 'emp-001',
      clockInTime: currentClock?.clockInTime || now,
      breakStartTime: now,
      status: 'ON_BREAK',
      createdAt: currentClock?.clockInTime || now,
      updatedAt: now,
    };

    return {
      success: true,
      clockEntry,
      message: 'Break started',
    };
  }

  async endBreak(): Promise<ClockResponse> {
    await delay(500);

    const now = new Date();
    const currentClock = this.currentDashboard.currentClock;

    if (currentClock) {
      this.currentDashboard = {
        ...this.currentDashboard,
        currentClock: {
          ...currentClock,
          status: 'CLOCKED_IN',
          breakMinutes: (currentClock.breakMinutes || 0) + 30, // Add 30 min break
        },
      };
    }

    const clockEntry: ClockEntry = {
      id: `clock-${Date.now()}`,
      employeeId: 'emp-001',
      clockInTime: currentClock?.clockInTime || now,
      breakEndTime: now,
      status: 'CLOCKED_IN',
      createdAt: currentClock?.clockInTime || now,
      updatedAt: now,
    };

    return {
      success: true,
      clockEntry,
      message: 'Break ended',
    };
  }

  async getCurrentClockStatus(): Promise<ClockEntry | null> {
    await delay(300);

    const currentClock = this.currentDashboard.currentClock;
    if (!currentClock) return null;

    return {
      id: 'current-clock',
      employeeId: 'emp-001',
      clockInTime: currentClock.clockInTime,
      status: currentClock.status,
      createdAt: currentClock.clockInTime,
      updatedAt: new Date(),
    };
  }

  async getTimesheet(startDate: Date, endDate: Date): Promise<TimesheetEntry[]> {
    await delay(600);

    console.log('Demo getTimesheet called with:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalEntries: this.timesheetEntries.length,
    });

    // Filter timesheet entries based on date range
    const filtered = this.timesheetEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      // Reset time to start of day for proper comparison
      entryDate.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const isInRange = entryDate >= start && entryDate <= end;
      console.log('Entry date:', entryDate.toISOString(), 'In range:', isInRange);
      return isInRange;
    });

    console.log('Filtered entries:', filtered.length);
    return filtered;
  }

  async getUpcomingShifts(): Promise<Shift[]> {
    await delay(400);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Return shifts from today onwards
    return this.shifts
      .filter((shift) => new Date(shift.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    await delay(400);
    return [...this.leaveRequests];
  }

  async submitLeaveRequest(request: {
    leaveType: 'ANNUAL' | 'SICK' | 'PERSONAL' | 'OTHER';
    startDate: Date;
    endDate: Date;
    reason?: string;
  }): Promise<LeaveRequest> {
    await delay(1000);

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: 'emp-001',
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.leaveRequests.push(newRequest);

    // Update dashboard count
    this.currentDashboard = {
      ...this.currentDashboard,
      pendingLeaveRequests: this.leaveRequests.filter((l) => l.status === 'PENDING').length,
    };

    return newRequest;
  }

  // Additional demo methods for testing

  async addRandomShift(): Promise<Shift> {
    await delay(500);
    const newShift = getRandomShift();
    this.shifts.push(newShift);

    // Update dashboard count
    this.currentDashboard = {
      ...this.currentDashboard,
      upcomingShifts: this.shifts.filter((s) => s.status === 'SCHEDULED').length,
    };

    return newShift;
  }

  async approveLeaveRequest(requestId: string): Promise<LeaveRequest> {
    await delay(600);

    const requestIndex = this.leaveRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const updatedRequest: LeaveRequest = {
      ...this.leaveRequests[requestIndex],
      status: 'APPROVED',
      approvedBy: 'manager-001',
      approvedAt: new Date(),
      updatedAt: new Date(),
    };

    this.leaveRequests[requestIndex] = updatedRequest;

    // Update dashboard count
    this.currentDashboard = {
      ...this.currentDashboard,
      pendingLeaveRequests: this.leaveRequests.filter((l) => l.status === 'PENDING').length,
    };

    return updatedRequest;
  }

  async rejectLeaveRequest(requestId: string, reason: string): Promise<LeaveRequest> {
    await delay(600);

    const requestIndex = this.leaveRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const updatedRequest: LeaveRequest = {
      ...this.leaveRequests[requestIndex],
      status: 'REJECTED',
      rejectionReason: reason,
      updatedAt: new Date(),
    };

    this.leaveRequests[requestIndex] = updatedRequest;

    // Update dashboard count
    this.currentDashboard = {
      ...this.currentDashboard,
      pendingLeaveRequests: this.leaveRequests.filter((l) => l.status === 'PENDING').length,
    };

    return updatedRequest;
  }

  // Reset demo data
  resetDemoData(): void {
    this.currentDashboard = { ...demoDashboardData };
    this.shifts = [...demoShifts];
    this.leaveRequests = [...demoLeaveRequests];
    this.timesheetEntries = [...demoTimesheetEntries];
  }
}

export const timekeeperDemoService = new TimekeeperDemoService();
