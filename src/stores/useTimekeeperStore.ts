import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { timekeeperService } from '@/services/timekeeper';
import type {
  DashboardData,
  ClockEntry,
  Shift,
  LeaveRequest,
  TimesheetEntry,
} from '@/types/timekeeper';
import { getErrorMessage } from '@/utils/errorUtils';

type TimekeeperState = {
  // Dashboard data
  dashboard: DashboardData | undefined;
  currentClock: ClockEntry | null;

  // Lists
  upcomingShifts: Shift[];
  leaveRequests: LeaveRequest[];
  timesheetEntries: TimesheetEntry[];

  // UI state
  isLoading: boolean;
  isDashboardLoading: boolean;
  isClockActionLoading: boolean;
  error: string | undefined;

  // Actions - Dashboard
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // Actions - Clock
  clockIn: (location?: { latitude: number; longitude: number }) => Promise<void>;
  clockOut: (location?: { latitude: number; longitude: number }) => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  getCurrentClockStatus: () => Promise<void>;

  // Actions - Timesheet
  fetchTimesheet: (startDate: Date, endDate: Date) => Promise<void>;

  // Actions - Shifts
  fetchUpcomingShifts: () => Promise<void>;

  // Actions - Leave
  fetchLeaveRequests: () => Promise<void>;
  submitLeaveRequest: (request: {
    leaveType: 'ANNUAL' | 'SICK' | 'PERSONAL' | 'OTHER';
    startDate: Date;
    endDate: Date;
    reason?: string;
  }) => Promise<void>;

  // UI Actions
  clearError: () => void;
  reset: () => void;
};

const initialState = {
  dashboard: undefined,
  currentClock: null,
  upcomingShifts: [],
  leaveRequests: [],
  timesheetEntries: [],
  isLoading: false,
  isDashboardLoading: false,
  isClockActionLoading: false,
  error: undefined,
};

export const useTimekeeperStore = create<TimekeeperState>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions - Dashboard
      async fetchDashboard() {
        // Don't fetch if already loading
        if (get().isDashboardLoading) return;

        set({ isDashboardLoading: true, error: undefined });
        try {
          const dashboard = await timekeeperService.getDashboard();
          set({
            dashboard,
            isDashboardLoading: false,
            currentClock: dashboard.currentClock
              ? {
                  id: '1',
                  employeeId: dashboard.employee.id,
                  clockInTime: dashboard.currentClock.clockInTime,
                  status: dashboard.currentClock.status,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              : null,
          });
        } catch (error) {
          set({
            isDashboardLoading: false,
            error: getErrorMessage(error, 'Failed to load dashboard'),
          });
        }
      },

      async refreshDashboard() {
        // Force refresh regardless of current state
        set({ error: undefined });
        await get().fetchDashboard();
      },

      // Actions - Clock
      async clockIn(location) {
        set({ isClockActionLoading: true, error: undefined });
        try {
          const response = await timekeeperService.clockIn(location);
          set({
            isClockActionLoading: false,
            currentClock: response.clockEntry,
          });
          // Refresh dashboard to get updated stats
          await get().refreshDashboard();
        } catch (error) {
          set({
            isClockActionLoading: false,
            error: getErrorMessage(error, 'Failed to clock in'),
          });
        }
      },

      async clockOut(location) {
        set({ isClockActionLoading: true, error: undefined });
        try {
          await timekeeperService.clockOut(location);
          // TODO: Use response when API is available
          // const response = await timekeeperService.clockOut(location);
          set({
            isClockActionLoading: false,
            currentClock: null,
          });
          // Refresh dashboard to get updated stats
          await get().refreshDashboard();
        } catch (error) {
          set({
            isClockActionLoading: false,
            error: getErrorMessage(error, 'Failed to clock out'),
          });
        }
      },

      async startBreak() {
        set({ isClockActionLoading: true, error: undefined });
        try {
          await timekeeperService.startBreak();
          // TODO: Update currentClock when API response is available
          // const response = await timekeeperService.startBreak();
          // set({
          //   isClockActionLoading: false,
          //   currentClock: response.clockEntry,
          // });
          set({ isClockActionLoading: false });
        } catch (error) {
          set({
            isClockActionLoading: false,
            error: getErrorMessage(error, 'Failed to start break'),
          });
        }
      },

      async endBreak() {
        set({ isClockActionLoading: true, error: undefined });
        try {
          await timekeeperService.endBreak();
          // TODO: Update currentClock when API response is available
          // const response = await timekeeperService.endBreak();
          // set({
          //   isClockActionLoading: false,
          //   currentClock: response.clockEntry,
          // });
          set({ isClockActionLoading: false });
        } catch (error) {
          set({
            isClockActionLoading: false,
            error: getErrorMessage(error, 'Failed to end break'),
          });
        }
      },

      async getCurrentClockStatus() {
        set({ error: undefined });
        try {
          const currentClock = await timekeeperService.getCurrentClockStatus();
          set({ currentClock });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to get clock status'),
          });
        }
      },

      // Actions - Timesheet
      async fetchTimesheet(startDate, endDate) {
        set({ isLoading: true, error: undefined });
        try {
          const timesheetEntries = await timekeeperService.getTimesheet(startDate, endDate);
          console.log('timesheetEntries', timesheetEntries);
          set({ timesheetEntries });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load timesheet'),
          });
        } finally {
          setTimeout(() => {
            set({ isLoading: false });
          }, 200);
        }
      },

      // Actions - Shifts
      async fetchUpcomingShifts() {
        set({ isLoading: true, error: undefined });
        try {
          const upcomingShifts = await timekeeperService.getUpcomingShifts();
          set({ upcomingShifts, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to load shifts'),
          });
        }
      },

      // Actions - Leave
      async fetchLeaveRequests() {
        set({ isLoading: true, error: undefined });
        try {
          const leaveRequests = await timekeeperService.getLeaveRequests();
          set({ leaveRequests, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to load leave requests'),
          });
        }
      },

      async submitLeaveRequest(request) {
        set({ isLoading: true, error: undefined });
        try {
          const leaveRequest = await timekeeperService.submitLeaveRequest(request);
          set((state) => ({
            leaveRequests: [...state.leaveRequests, leaveRequest],
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to submit leave request'),
          });
        }
      },

      // UI Actions
      clearError() {
        set({ error: undefined });
      },

      reset() {
        set(initialState);
      },
    }),
    {
      name: 'timekeeper-store',
    },
  ),
);

// Selectors
export const useTimekeeperDashboard = () => useTimekeeperStore((state) => state.dashboard);
export const useTimekeeperError = () => useTimekeeperStore((state) => state.error);
export const useCurrentClock = () => useTimekeeperStore((state) => state.currentClock);
export const useClockActionLoading = () =>
  useTimekeeperStore((state) => state.isClockActionLoading);

// Helper hook for timekeeper actions - uses useMemo to prevent infinite loops
export const useTimekeeperActions = () => {
  const fetchDashboard = useTimekeeperStore((state) => state.fetchDashboard);
  const refreshDashboard = useTimekeeperStore((state) => state.refreshDashboard);
  const clockIn = useTimekeeperStore((state) => state.clockIn);
  const clockOut = useTimekeeperStore((state) => state.clockOut);
  const clearError = useTimekeeperStore((state) => state.clearError);

  return useMemo(
    () => ({
      fetchDashboard,
      refreshDashboard,
      clockIn,
      clockOut,
      clearError,
    }),
    [fetchDashboard, refreshDashboard, clockIn, clockOut, clearError],
  );
};
