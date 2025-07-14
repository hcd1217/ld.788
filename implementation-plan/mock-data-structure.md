# Mock Data Structure

## Store Configuration

```typescript
interface Store {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  operatingHours: {
    [day: string]: {
      open: string; // "09:00"
      close: string; // "17:00"
      closed?: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Example
{
  id: "store-001",
  name: "Downtown Coffee Shop",
  address: "123 Main St, San Francisco, CA 94105",
  location: {
    lat: 37.7749,
    lng: -122.4194
  },
  operatingHours: {
    monday: { open: "09:00", close: "17:00" },
    tuesday: { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday: { open: "09:00", close: "17:00" },
    friday: { open: "09:00", close: "17:00" },
    saturday: { open: "10:00", close: "16:00" },
    sunday: { closed: true }
  },
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}
```

## Staff Management

```typescript
interface Staff {
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
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'deleted';
}

// Example
{
  id: "staff-001",
  storeId: "store-001",
  fullName: "John Doe",
  email: "john.doe@example.com",
  phoneNumber: "+1234567890",
  clockInUrl: "https://app.example.com/clock-in/5d41402abc4b2a76b9719d911017c592/e4da3b7fbbce2345d7772b0674a318d5",
  clockInQrCode: "data:image/png;base64,iVBORw0KGgoAAAANS...",
  workingPattern: "shift",
  weeklyContractedHours: 32,
  hourlyRate: 25.50,
  overtimeRate: 38.25, // 1.5x placeholder
  holidayRate: 51.00, // 2x placeholder
  bookableLeaveDays: 20,
  leaveHoursEquivalent: 8,
  leaveBalance: {
    vacation: 15,
    sick: 5,
    other: 0
  },
  carryOverDays: 5,
  role: "member",
  accessPermissions: ["view_own_profile", "clock_in", "view_schedule"],
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  status: "active"
}
```

## Permission Matrix

```typescript
const permissionMatrix = {
  admin: [
    "manage_store",
    "manage_staff",
    "view_all_reports",
    "manage_permissions",
    "manage_schedule",
    "view_all_profiles",
    "clock_in"
  ],
  manager: [
    "manage_staff",
    "view_reports",
    "manage_schedule",
    "view_all_profiles",
    "clock_in"
  ],
  member: [
    "view_own_profile",
    "clock_in",
    "view_schedule"
  ]
};
```

## Validation Constants

```typescript
const VALIDATION_RULES = {
  hourlyRate: {
    min: 15.00, // Minimum wage
    max: 200.00 // Maximum reasonable hourly rate
  },
  workingHours: {
    fulltime: {
      default: 40,
      min: 35,
      max: 48
    },
    shift: {
      min: 0,
      max: 48
    }
  },
  leave: {
    daysPerYear: {
      min: 0,
      max: 365
    },
    hoursPerDay: {
      default: 8,
      min: 1,
      max: 24
    }
  }
};

// Leave Types
enum LeaveType {
  VACATION = 'vacation',
  SICK = 'sick',
  OTHER = 'other'
}
```