// TODO: Uncomment when API endpoints are available
// import { userApi } from '@/lib/api';
import { shouldUseDemoData } from '@/config/demo.config';
import type {
  ClockEntry,
  ClockResponse,
  DashboardData,
  LeaveRequest,
  Shift,
  TimesheetEntry,
} from '@/types/timekeeper';

import { timekeeperDemoService } from './timekeeperDemo.service';

class TimekeeperService {
  /**
   * Get dashboard data for the current user
   */
  async getDashboard(): Promise<DashboardData> {
    // Use demo data if configured
    if (shouldUseDemoData('dashboard')) {
      return timekeeperDemoService.getDashboard();
    }

    // TODO: Replace with actual API call when endpoint is available
    // const response = await userApi.timekeeper.getDashboard();
    // return this.transformDashboardData(response);

    // Temporary mock data for development
    return this.getMockDashboardData();
  }

  /**
   * Clock in
   */
  async clockIn(_location?: { latitude: number; longitude: number }): Promise<ClockResponse> {
    // Use demo data if configured
    if (shouldUseDemoData('timekeeper')) {
      return timekeeperDemoService.clockIn(_location);
    }

    // TODO: Implement when API endpoint is available
    // const response = await userApi.timekeeper.clockIn({ location: _location });
    // return this.transformClockResponse(response);

    throw new Error('Clock in functionality not yet implemented');
  }

  /**
   * Clock out
   */
  async clockOut(_location?: { latitude: number; longitude: number }): Promise<ClockResponse> {
    // Use demo data if configured
    if (shouldUseDemoData('timekeeper')) {
      return timekeeperDemoService.clockOut(_location);
    }

    // TODO: Implement when API endpoint is available
    // const response = await userApi.timekeeper.clockOut({ location: _location });
    // return this.transformClockResponse(response);

    throw new Error('Clock out functionality not yet implemented');
  }

  /**
   * Start break
   */
  async startBreak(): Promise<ClockResponse> {
    // Use demo data if configured
    if (shouldUseDemoData('timekeeper')) {
      return timekeeperDemoService.startBreak();
    }

    // TODO: Implement when API endpoint is available
    throw new Error('Start break functionality not yet implemented');
  }

  /**
   * End break
   */
  async endBreak(): Promise<ClockResponse> {
    // Use demo data if configured
    if (shouldUseDemoData('timekeeper')) {
      return timekeeperDemoService.endBreak();
    }

    // TODO: Implement when API endpoint is available
    throw new Error('End break functionality not yet implemented');
  }

  /**
   * Get timesheet entries for a date range
   */
  async getTimesheet(_startDate: Date, _endDate: Date): Promise<TimesheetEntry[]> {
    // Use demo data if configured
    if (shouldUseDemoData('timesheet')) {
      const result = await timekeeperDemoService.getTimesheet(_startDate, _endDate);
      return result;
    }

    // TODO: Implement when API endpoint is available
    // const response = await userApi.timekeeper.getTimesheet({ startDate: _startDate, endDate: _endDate });
    // return this.transformTimesheetData(response);

    return [];
  }

  /**
   * Get upcoming shifts
   */
  async getUpcomingShifts(): Promise<Shift[]> {
    // Use demo data if configured
    if (shouldUseDemoData('shifts')) {
      return timekeeperDemoService.getUpcomingShifts();
    }

    // TODO: Implement when API endpoint is available
    // const response = await userApi.timekeeper.getShifts({ status: 'SCHEDULED' });
    // return this.transformShifts(response);

    return [];
  }

  /**
   * Get leave requests
   */
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    // Use demo data if configured
    if (shouldUseDemoData('leaveRequests')) {
      return timekeeperDemoService.getLeaveRequests();
    }

    // TODO: Implement when API endpoint is available
    // const response = await userApi.timekeeper.getLeaveRequests();
    // return this.transformLeaveRequests(response);

    return [];
  }

  /**
   * Submit leave request
   */
  async submitLeaveRequest(_request: {
    leaveType: 'ANNUAL' | 'SICK' | 'PERSONAL' | 'OTHER';
    startDate: Date;
    endDate: Date;
    reason?: string;
  }): Promise<LeaveRequest> {
    // Use demo data if configured
    if (shouldUseDemoData('leaveRequests')) {
      return timekeeperDemoService.submitLeaveRequest(_request);
    }

    // TODO: Implement when API endpoint is available
    // const response = await userApi.timekeeper.submitLeaveRequest(_request);
    // return this.transformLeaveRequest(response);

    throw new Error('Submit leave request functionality not yet implemented');
  }

  /**
   * Get current clock status
   */
  async getCurrentClockStatus(): Promise<ClockEntry | null> {
    // Use demo data if configured
    if (shouldUseDemoData('timekeeper')) {
      return timekeeperDemoService.getCurrentClockStatus();
    }

    // TODO: Implement when API endpoint is available
    // const response = await userApi.timekeeper.getCurrentClock();
    // return response ? this.transformClockEntry(response) : null;

    return null;
  }

  // Private helper methods

  /**
   * Get mock dashboard data for development
   */
  private getMockDashboardData(): DashboardData {
    const now = new Date();
    let clockInTime = new Date();
    clockInTime.setHours(9, 0, 0, 0); // 9:00 AM
    const ONE_HOUR = 1000 * 60 * 60;
    while (clockInTime > now) {
      clockInTime = new Date(clockInTime.getTime() - ONE_HOUR);
    }

    const mark = now.getTime() - 7 * ONE_HOUR;
    while (clockInTime.getTime() < mark) {
      clockInTime = new Date(clockInTime.getTime() + ONE_HOUR);
    }

    const workedMinutes = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60));

    return {
      employee: {
        id: '1',
        firstName: 'Huỳnh',
        lastName: 'Đặng',
        fullName: 'Đặng Huỳnh',
        department: 'Product',
      },
      currentClock: {
        clockInTime,
        status: 'CLOCKED_IN',
        workedMinutes,
        breakMinutes: 0,
      },
      todayStats: {
        totalWorkedMinutes: workedMinutes,
        totalBreakMinutes: 0,
        overtimeMinutes: 0,
      },
      weekStats: {
        totalWorkedMinutes: 1950, // 32.5 hours
        remainingMinutes: 450, // 7.5 hours
        overtimeMinutes: 0,
      },
      monthStats: {
        totalWorkedMinutes: 9600, // 160 hours
        averageDailyMinutes: 480, // 8 hours
        totalDays: 20,
      },
      upcomingShifts: 3,
      pendingLeaveRequests: 1,
    };
  }

  // TODO: Add transformation methods when API responses are defined
  // private transformDashboardData(response: any): DashboardData { ... }
  // private transformClockResponse(response: any): ClockResponse { ... }
  // private transformClockEntry(response: any): ClockEntry { ... }
  // private transformTimesheetData(response: any): TimesheetEntry[] { ... }
  // private transformShifts(response: any): Shift[] { ... }
  // private transformLeaveRequests(response: any): LeaveRequest[] { ... }
  // private transformLeaveRequest(response: any): LeaveRequest { ... }
}

export const timekeeperService = new TimekeeperService();
