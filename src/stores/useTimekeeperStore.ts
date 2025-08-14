import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { timekeeperService } from '@/services/timekeeper/timekeeper';
import type {
  DashboardData,
  ClockEntry,
  Shift,
  LeaveRequest,
  TimesheetEntry,
} from '@/types/timekeeper';
import { getErrorMessage } from '@/utils/errorUtils';
import { logError } from '@/utils/logger';

interface PhotoData {
  base64: string;
  timestamp: Date;
  metadata: {
    deviceId?: string;
    compression: number;
    originalSize: number;
  };
}

interface ClockActionPayload {
  location?: { latitude: number; longitude: number };
  photo?: PhotoData;
}

type TimekeeperState = {
  // Dashboard data
  dashboard: DashboardData | undefined;
  currentClock: ClockEntry | null;

  // Lists
  upcomingShifts: Shift[];
  leaveRequests: LeaveRequest[];
  timesheetEntries: TimesheetEntry[];
  todayClockEntries: ClockEntry[];
  clockPhotos: Record<string, string>; // clockId -> base64 image

  // UI state
  isLoading: boolean;
  isDashboardLoading: boolean;
  isClockActionLoading: boolean;
  isPhotoUploading: boolean;
  error: string | undefined;

  // Actions - Dashboard
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // Actions - Clock with photo support
  clockIn: (payload?: ClockActionPayload) => Promise<void>;
  clockOut: (payload?: ClockActionPayload) => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  getCurrentClockStatus: () => Promise<void>;
  fetchTodayClockEntries: () => Promise<void>;
  uploadClockPhoto: (clockId: string, photo: PhotoData) => Promise<string>;
  retryFailedPhotoUploads: () => Promise<void>;

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
  todayClockEntries: [],
  clockPhotos: {},
  isLoading: false,
  isDashboardLoading: false,
  isClockActionLoading: false,
  isPhotoUploading: false,
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

      // Actions - Clock with photo support
      async clockIn(payload) {
        set({ isClockActionLoading: true, error: undefined });
        try {
          // Store photo locally if provided (Phase 1: Mock implementation)
          if (payload?.photo) {
            // In real implementation, upload to S3 here
            const mockClockId = `clock_${Date.now()}`;
            localStorage.setItem(`clock_photo_${mockClockId}`, payload.photo.base64);
            set((state) => ({
              clockPhotos: {
                ...state.clockPhotos,
                [mockClockId]: payload.photo!.base64,
              },
            }));
          }

          const response = await timekeeperService.clockIn(payload?.location);
          set({
            isClockActionLoading: false,
            currentClock: response.clockEntry,
          });
          // Refresh dashboard to get updated stats
          await get().refreshDashboard();
          await get().fetchTodayClockEntries();
        } catch (error) {
          set({
            isClockActionLoading: false,
            error: getErrorMessage(error, 'Failed to clock in'),
          });
        }
      },

      async clockOut(payload) {
        set({ isClockActionLoading: true, error: undefined });
        try {
          // Store photo locally if provided (Phase 1: Mock implementation)
          if (payload?.photo) {
            // In real implementation, upload to S3 here
            const mockClockId = `clock_${Date.now()}`;
            localStorage.setItem(`clock_photo_${mockClockId}`, payload.photo.base64);
            set((state) => ({
              clockPhotos: {
                ...state.clockPhotos,
                [mockClockId]: payload.photo!.base64,
              },
            }));
          }

          await timekeeperService.clockOut(payload?.location);
          // TODO: Use response when API is available
          // const response = await timekeeperService.clockOut(payload?.location);
          set({
            isClockActionLoading: false,
            currentClock: null,
          });
          // Refresh dashboard to get updated stats
          await get().refreshDashboard();
          await get().fetchTodayClockEntries();
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

      // New clock photo actions
      async fetchTodayClockEntries() {
        try {
          // Mock implementation - in real app, fetch from API
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Generate mock entries for demo
          const mockEntries: ClockEntry[] = [
            {
              id: 'clock_1',
              employeeId: 'emp_1',
              clockInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
              clockOutTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
              status: 'CLOCKED_OUT',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'clock_2',
              employeeId: 'emp_1',
              clockInTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1 PM
              status: 'CLOCKED_IN',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          // Load photos from localStorage
          const photos: Record<string, string> = {};
          mockEntries.forEach((entry) => {
            const photoKey = `clock_photo_${entry.id}`;
            const photo = localStorage.getItem(photoKey);
            if (photo) {
              photos[entry.id] = photo;
            }
          });

          set({
            todayClockEntries: mockEntries,
            clockPhotos: photos,
          });
        } catch (error) {
          logError('Failed to fetch today clock entries:', error, {
            module: 'TimekeeperStore',
            action: 'photoKey',
          });
        }
      },

      async uploadClockPhoto(clockId, photo) {
        set({ isPhotoUploading: true });
        try {
          // Phase 1: Mock implementation - store in localStorage
          const photoKey = `clock_photo_${clockId}`;
          localStorage.setItem(photoKey, photo.base64);

          // Mock S3 URL
          const mockS3Url = `https://mock-s3.example.com/photos/${clockId}.jpg`;

          set((state) => ({
            isPhotoUploading: false,
            clockPhotos: {
              ...state.clockPhotos,
              [clockId]: photo.base64,
            },
          }));

          return mockS3Url;
        } catch (error) {
          set({
            isPhotoUploading: false,
            error: getErrorMessage(error, 'Failed to upload photo'),
          });
          throw error;
        }
      },

      async retryFailedPhotoUploads() {
        // Phase 1: Mock implementation
        // In real implementation, check for queued uploads and retry
        console.log('Retrying failed photo uploads...');
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
