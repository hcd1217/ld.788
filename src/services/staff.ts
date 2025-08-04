// Mock staff service with CRUD operations, pagination, and validation
import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';

export interface Staff {
  id: string;
  storeId: string; // Associated store

  // Basic Info
  fullName: string;
  email: string;
  phoneNumber: string;
  clockInUrl: string;
  clockInQrCode?: string; // Base64 QR code image

  // Working Pattern
  workingPattern: 'fulltime' | 'shift';
  weeklyContractedHours: number;
  defaultWeeklyHours?: number; // For fulltime staff
  hourlyRate: number;
  overtimeRate?: number; // Placeholder
  holidayRate?: number; // Placeholder

  // Leave Management
  bookableLeaveDays: number;
  leaveHoursEquivalent?: number; // Only for shift workers
  leaveBalance: {
    vacation: number;
    sick: number;
    other: number;
  };
  carryOverDays?: number;

  // Access & Permission
  role: 'admin' | 'manager' | 'member';
  accessPermissions: string[]; // List of permission keys

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'deleted';
}

export type CreateStaffRequest = {
  storeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  workingPattern: 'fulltime' | 'shift';
  weeklyContractedHours: number;
  defaultWeeklyHours?: number;
  hourlyRate: number;
  overtimeRate?: number;
  holidayRate?: number;
  bookableLeaveDays: number;
  leaveHoursEquivalent?: number;
  leaveBalance: {
    vacation: number;
    sick: number;
    other: number;
  };
  carryOverDays?: number;
  role: 'admin' | 'manager' | 'member';
};

export type UpdateStaffRequest = Partial<CreateStaffRequest> & {
  status?: 'active' | 'inactive';
};

export type StaffListRequest = {
  storeId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  role?: 'admin' | 'manager' | 'member' | 'all';
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type StaffListResponse = {
  staff: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Permission matrix
export const permissionMatrix = {
  admin: [
    'manage_store',
    'manage_staff',
    'view_all_reports',
    'manage_permissions',
    'manage_schedule',
    'view_all_profiles',
    'clock_in',
  ],
  manager: ['manage_staff', 'view_reports', 'manage_schedule', 'view_all_profiles', 'clock_in'],
  member: ['view_own_profile', 'clock_in', 'view_schedule'],
};

// Validation constants
export const VALIDATION_RULES = {
  hourlyRate: {
    min: 15, // Minimum wage
    max: 200, // Maximum reasonable hourly rate
  },
  workingHours: {
    fulltime: {
      default: 40,
      min: 35,
      max: 48,
    },
    shift: {
      min: 0,
      max: 48,
    },
  },
  leave: {
    daysPerYear: {
      min: 0,
      max: 365,
    },
    hoursPerDay: {
      default: 8,
      min: 1,
      max: 24,
    },
  },
};

// Mock data storage
const mockStaff: Staff[] = [
  {
    id: 'staff-001',
    storeId: 'store-001',
    fullName: 'Nguyễn Văn Anh',
    email: 'nguyen.van.anh@example.com',
    phoneNumber: '+84901234567',
    clockInUrl:
      'https://app.credo.com/clock-in/5d41402abc4b2a76b9719d911017c592/e4da3b7fbbce2345d7772b0674a318d5',
    clockInQrCode: '',
    workingPattern: 'shift',
    weeklyContractedHours: 32,
    hourlyRate: 25.5,
    overtimeRate: 38.25,
    holidayRate: 51,
    bookableLeaveDays: 20,
    leaveHoursEquivalent: 8,
    leaveBalance: {
      vacation: 15,
      sick: 5,
      other: 0,
    },
    carryOverDays: 5,
    role: 'member',
    accessPermissions: permissionMatrix.member,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    status: 'active',
  },
  {
    id: 'staff-002',
    storeId: 'store-001',
    fullName: 'Trần Thị Mai',
    email: 'tran.thi.mai@example.com',
    phoneNumber: '+84909876543',
    clockInUrl:
      'https://app.credo.com/clock-in/5d41402abc4b2a76b9719d911017c592/f5ca38f748a1d6eaf726b8a42fb575c3',
    clockInQrCode: '',
    workingPattern: 'fulltime',
    weeklyContractedHours: 40,
    defaultWeeklyHours: 40,
    hourlyRate: 30,
    overtimeRate: 45,
    holidayRate: 60,
    bookableLeaveDays: 25,
    leaveBalance: {
      vacation: 20,
      sick: 5,
      other: 0,
    },
    carryOverDays: 3,
    role: 'manager',
    accessPermissions: permissionMatrix.manager,
    createdAt: new Date('2024-01-10T08:00:00Z'),
    updatedAt: new Date('2024-01-10T08:00:00Z'),
    status: 'active',
  },
  {
    id: 'staff-003',
    storeId: 'store-002',
    fullName: 'Lê Minh Khôi',
    email: 'le.minh.khoi@example.com',
    phoneNumber: '+84912345678',
    clockInUrl:
      'https://app.credo.com/clock-in/c1f4b5fb265066db8e9c028e7dc4e3a5/a8c5f1e8a1b1dc3d3e63a8b47fd2c872',
    clockInQrCode: '',
    workingPattern: 'shift',
    weeklyContractedHours: 24,
    hourlyRate: 22.5,
    overtimeRate: 33.75,
    holidayRate: 45,
    bookableLeaveDays: 15,
    leaveHoursEquivalent: 8,
    leaveBalance: {
      vacation: 10,
      sick: 5,
      other: 0,
    },
    carryOverDays: 3,
    role: 'member',
    accessPermissions: permissionMatrix.member,
    createdAt: new Date('2024-01-20T09:00:00Z'),
    updatedAt: new Date('2024-01-20T09:00:00Z'),
    status: 'active',
  },
  {
    id: 'staff-004',
    storeId: 'store-002',
    fullName: 'Phạm Thị Hương',
    email: 'pham.thi.huong@example.com',
    phoneNumber: '+84938765432',
    clockInUrl:
      'https://app.credo.com/clock-in/c1f4b5fb265066db8e9c028e7dc4e3a5/b6d767d2f8ed5d21a44b0e5886680cb9',
    clockInQrCode: '',
    workingPattern: 'fulltime',
    weeklyContractedHours: 40,
    defaultWeeklyHours: 40,
    hourlyRate: 28,
    overtimeRate: 42,
    holidayRate: 56,
    bookableLeaveDays: 20,
    leaveBalance: {
      vacation: 18,
      sick: 2,
      other: 0,
    },
    carryOverDays: 5,
    role: 'manager',
    accessPermissions: permissionMatrix.manager,
    createdAt: new Date('2024-01-12T11:00:00Z'),
    updatedAt: new Date('2024-01-12T11:00:00Z'),
    status: 'active',
  },
  {
    id: 'staff-005',
    storeId: 'store-003',
    fullName: 'Hoàng Đức Minh',
    email: 'hoang.duc.minh@example.com',
    phoneNumber: '+84978123456',
    clockInUrl:
      'https://app.credo.com/clock-in/d2a84f4b8b650937ec8f73cd8be2c4a4/c74d97b01eae257e44aa9d5bade97baf',
    clockInQrCode: '',
    workingPattern: 'shift',
    weeklyContractedHours: 36,
    hourlyRate: 26,
    overtimeRate: 39,
    holidayRate: 52,
    bookableLeaveDays: 18,
    leaveHoursEquivalent: 8,
    leaveBalance: {
      vacation: 12,
      sick: 6,
      other: 0,
    },
    carryOverDays: 4,
    role: 'member',
    accessPermissions: permissionMatrix.member,
    createdAt: new Date('2024-01-18T07:30:00Z'),
    updatedAt: new Date('2024-01-18T07:30:00Z'),
    status: 'active',
  },
  {
    id: 'staff-006',
    storeId: 'store-003',
    fullName: 'Vũ Thị Lan',
    email: 'vu.thi.lan@example.com',
    phoneNumber: '+84965432198',
    clockInUrl:
      'https://app.credo.com/clock-in/d2a84f4b8b650937ec8f73cd8be2c4a4/16790e0e170c3fcec02df1d6cb0bde6e',
    clockInQrCode: '',
    workingPattern: 'fulltime',
    weeklyContractedHours: 40,
    defaultWeeklyHours: 40,
    hourlyRate: 35,
    overtimeRate: 52.5,
    holidayRate: 70,
    bookableLeaveDays: 30,
    leaveBalance: {
      vacation: 25,
      sick: 5,
      other: 0,
    },
    carryOverDays: 5,
    role: 'admin',
    accessPermissions: permissionMatrix.admin,
    createdAt: new Date('2024-01-05T14:00:00Z'),
    updatedAt: new Date('2024-01-05T14:00:00Z'),
    status: 'active',
  },
  {
    id: 'staff-007',
    storeId: 'store-004',
    fullName: 'Đặng Văn Hải',
    email: 'dang.van.hai@example.com',
    phoneNumber: '+84919876543',
    clockInUrl:
      'https://app.credo.com/clock-in/e358efa489f58062f10dd7316b65649e/e96ed478dab8595a7dbda4cbcbfb82ed',
    clockInQrCode: '',
    workingPattern: 'shift',
    weeklyContractedHours: 28,
    hourlyRate: 24,
    overtimeRate: 36,
    holidayRate: 48,
    bookableLeaveDays: 17,
    leaveHoursEquivalent: 8,
    leaveBalance: {
      vacation: 14,
      sick: 3,
      other: 0,
    },
    carryOverDays: 3,
    role: 'member',
    accessPermissions: permissionMatrix.member,
    createdAt: new Date('2024-01-22T10:30:00Z'),
    updatedAt: new Date('2024-01-22T10:30:00Z'),
    status: 'active',
  },
  {
    id: 'staff-008',
    storeId: 'store-005',
    fullName: 'Bùi Thị Thanh',
    email: 'bui.thi.thanh@example.com',
    phoneNumber: '+84987654321',
    clockInUrl:
      'https://app.credo.com/clock-in/1385974ed5904a438616ff7bdb3f7439/f0b9ec9d9a84ea7cc6cac11c3ba39cea',
    clockInQrCode: '',
    workingPattern: 'fulltime',
    weeklyContractedHours: 40,
    defaultWeeklyHours: 40,
    hourlyRate: 32,
    overtimeRate: 48,
    holidayRate: 64,
    bookableLeaveDays: 22,
    leaveBalance: {
      vacation: 20,
      sick: 2,
      other: 0,
    },
    carryOverDays: 4,
    role: 'manager',
    accessPermissions: permissionMatrix.manager,
    createdAt: new Date('2024-01-08T08:00:00Z'),
    updatedAt: new Date('2024-01-08T08:00:00Z'),
    status: 'active',
  },
];

// Simulate API delay
const delay = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

// Generate unique ID
const generateId = () => `staff-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// Generate MD5 hash
const generateMD5 = (text: string): string => CryptoJS.MD5(text).toString();

// Generate clock-in URL
const generateClockInUrl = (storeId: string, staffId: string): string => {
  const storeHash = generateMD5(storeId);
  const staffHash = generateMD5(staffId);
  return `https://app.credo.com/clock-in/${storeHash}/${staffHash}`;
};

// Generate QR code
const generateQRCode = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

export const staffService = {
  async getAllStaff(params: StaffListRequest = {}): Promise<StaffListResponse> {
    await delay(300);

    const {
      storeId,
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      role = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    const filteredStaff = mockStaff.filter((staff) => {
      // Filter by store
      if (storeId && staff.storeId !== storeId) return false;

      // Filter by status
      if (status !== 'all' && staff.status !== status) return false;

      // Filter by role
      if (role !== 'all' && staff.role !== role) return false;

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          staff.fullName.toLowerCase().includes(searchLower) ||
          staff.email.toLowerCase().includes(searchLower) ||
          staff.phoneNumber.includes(search)
        );
      }

      return true;
    });

    // Sort
    filteredStaff.sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof Staff];
      let bValue: unknown = b[sortBy as keyof Staff];

      if (sortBy === 'name') {
        aValue = a.fullName;
        bValue = b.fullName;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return (aValue as any) > (bValue as any) ? 1 : -1;
      }

      return (aValue as any) < (bValue as any) ? 1 : -1;
    });

    // Paginate
    const total = filteredStaff.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const staff = filteredStaff.slice(startIndex, endIndex);

    return {
      staff,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getStaffById(id: string): Promise<Staff | undefined> {
    await delay(300);
    return mockStaff.find((staff) => staff.id === id && staff.status !== 'deleted');
  },

  async createStaff(data: CreateStaffRequest): Promise<Staff> {
    await delay(800);

    // Simulate validation error (optional)
    if (Math.random() < 0.05) {
      // 5% chance of error
      throw new Error('Failed to create staff member. Please try again.');
    }

    // Check for duplicate email/phone
    const existingStaff = mockStaff.find(
      (staff) =>
        staff.status !== 'deleted' &&
        (staff.email === data.email || staff.phoneNumber === data.phoneNumber),
    );

    if (existingStaff) {
      throw new Error('Staff member with this email or phone number already exists');
    }

    const staffId = generateId();
    const clockInUrl = generateClockInUrl(data.storeId, staffId);
    const clockInQrCode = await generateQRCode(clockInUrl);

    const newStaff: Staff = {
      id: staffId,
      ...data,
      clockInUrl,
      clockInQrCode,
      accessPermissions: permissionMatrix[data.role],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };

    mockStaff.push(newStaff);
    return newStaff;
  },

  async updateStaff(id: string, data: UpdateStaffRequest): Promise<Staff> {
    await delay(600);

    const staffIndex = mockStaff.findIndex(
      (staff) => staff.id === id && staff.status !== 'deleted',
    );
    if (staffIndex === -1) {
      throw new Error('Staff member not found');
    }

    // Check for duplicate email/phone if they're being updated
    if (data.email || data.phoneNumber) {
      const existingStaff = mockStaff.find(
        (staff) =>
          staff.id !== id &&
          staff.status !== 'deleted' &&
          (staff.email === data.email || staff.phoneNumber === data.phoneNumber),
      );

      if (existingStaff) {
        throw new Error('Staff member with this email or phone number already exists');
      }
    }

    const currentStaff = mockStaff[staffIndex];
    const updatedStaff: Staff = {
      ...currentStaff,
      ...data,
      updatedAt: new Date(),
      // Update permissions if role changed
      accessPermissions: data.role ? permissionMatrix[data.role] : currentStaff.accessPermissions,
    };

    mockStaff[staffIndex] = updatedStaff;
    return updatedStaff;
  },

  async deactivateStaff(id: string): Promise<Staff> {
    return this.updateStaff(id, { status: 'inactive' });
  },

  async activateStaff(id: string): Promise<Staff> {
    return this.updateStaff(id, { status: 'active' });
  },

  async deleteStaff(id: string): Promise<void> {
    await delay(400);

    const staffIndex = mockStaff.findIndex((staff) => staff.id === id);
    if (staffIndex === -1) {
      throw new Error('Staff member not found');
    }

    // Soft delete - mark as deleted
    mockStaff[staffIndex].status = 'deleted';
    mockStaff[staffIndex].updatedAt = new Date();
  },

  async hardDeleteStaff(id: string): Promise<void> {
    await delay(400);

    const staffIndex = mockStaff.findIndex((staff) => staff.id === id);
    if (staffIndex === -1) {
      throw new Error('Staff member not found');
    }

    // Hard delete - remove from array
    mockStaff.splice(staffIndex, 1);
  },

  // Validation methods
  validateStaffData(data: CreateStaffRequest | UpdateStaffRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('fullName' in data && (!data.fullName || data.fullName.trim().length < 2)) {
      errors.push('Full name must be at least 2 characters long');
    }

    if ('email' in data && (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
      errors.push('Valid email address is required');
    }

    if ('phoneNumber' in data && (!data.phoneNumber || data.phoneNumber.length < 10)) {
      errors.push('Valid phone number is required');
    }

    if (
      'hourlyRate' in data &&
      data.hourlyRate !== undefined &&
      (data.hourlyRate < VALIDATION_RULES.hourlyRate.min ||
        data.hourlyRate > VALIDATION_RULES.hourlyRate.max)
    ) {
      errors.push(
        `Hourly rate must be between $${VALIDATION_RULES.hourlyRate.min} and $${VALIDATION_RULES.hourlyRate.max}`,
      );
    }

    if ('weeklyContractedHours' in data && data.weeklyContractedHours !== undefined) {
      const maxHours =
        data.workingPattern === 'fulltime'
          ? VALIDATION_RULES.workingHours.fulltime.max
          : VALIDATION_RULES.workingHours.shift.max;

      if (data.weeklyContractedHours < 0 || data.weeklyContractedHours > maxHours) {
        errors.push(`Weekly hours must be between 0 and ${maxHours}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  async isEmailUnique(email: string, excludeId?: string): Promise<boolean> {
    await delay(200);
    return !mockStaff.some(
      (staff) =>
        staff.id !== excludeId &&
        staff.status !== 'deleted' &&
        staff.email.toLowerCase() === email.toLowerCase(),
    );
  },

  async isPhoneUnique(phone: string, excludeId?: string): Promise<boolean> {
    await delay(200);
    return !mockStaff.some(
      (staff) =>
        staff.id !== excludeId && staff.status !== 'deleted' && staff.phoneNumber === phone,
    );
  },

  // Utility methods
  calculateLeaveHours(leaveDays: number, hoursPerDay = 8): number {
    return leaveDays * hoursPerDay;
  },

  calculateOvertimeRate(baseRate: number, multiplier = 1.5): number {
    return baseRate * multiplier;
  },

  calculateHolidayRate(baseRate: number, multiplier = 2): number {
    return baseRate * multiplier;
  },

  async regenerateQRCode(staffId: string): Promise<string> {
    await delay(300);

    const staff = mockStaff.find((s) => s.id === staffId && s.status !== 'deleted');
    if (!staff) {
      throw new Error('Staff member not found');
    }

    const newQrCode = await generateQRCode(staff.clockInUrl);

    // Update in mock data
    const staffIndex = mockStaff.findIndex((s) => s.id === staffId);
    if (staffIndex !== -1) {
      mockStaff[staffIndex].clockInQrCode = newQrCode;
      mockStaff[staffIndex].updatedAt = new Date();
    }

    return newQrCode;
  },
};
