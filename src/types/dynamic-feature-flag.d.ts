export enum DynamicFeatureFlagKey {
  USER_MANAGEMENT = 'user-management',
  ROLE_MANAGEMENT = 'role-management',
  STORE_MANAGEMENT = 'store-management',
  STAFF_MANAGEMENT = 'staff-management',
  SHIFT_MANAGEMENT = 'shift-management',
}

// SubKey constants for type safety
export const USER_MANAGEMENT_SUBKEYS = {
  BULK_IMPORT: 'bulkImport',
  USER_INVITATIONS: 'userInvitations',
  CREATE_USER_WITH_DEPARTMENT: 'createUserWithDepartment',
} as const;

export const ROLE_MANAGEMENT_SUBKEYS = {
  CUSTOM_ROLES: 'customRoles',
  ROLE_HIERARCHY: 'roleHierarchy',
} as const;

export const STORE_MANAGEMENT_SUBKEYS = {
  GOOGLE_MAP_LOCATION: 'googleMapLocation',
} as const;

export const STAFF_MANAGEMENT_SUBKEYS = {
  CLOCK_IN_OUT: 'clockInOut',
} as const;

export const SHIFT_MANAGEMENT_SUBKEYS = {
  RE_SCHEDULE_SHIFT: 'reScheduleShift',
} as const;

// Type mapping for dynamic feature flag subKeys
export type DynamicFeatureFlagSubKeys = {
  [DynamicFeatureFlagKey.USER_MANAGEMENT]: (typeof USER_MANAGEMENT_SUBKEYS)[keyof typeof USER_MANAGEMENT_SUBKEYS];
  [DynamicFeatureFlagKey.ROLE_MANAGEMENT]: (typeof ROLE_MANAGEMENT_SUBKEYS)[keyof typeof ROLE_MANAGEMENT_SUBKEYS];
  [DynamicFeatureFlagKey.STORE_MANAGEMENT]: (typeof STORE_MANAGEMENT_SUBKEYS)[keyof typeof STORE_MANAGEMENT_SUBKEYS];
  [DynamicFeatureFlagKey.STAFF_MANAGEMENT]: (typeof STAFF_MANAGEMENT_SUBKEYS)[keyof typeof STAFF_MANAGEMENT_SUBKEYS];
  [DynamicFeatureFlagKey.SHIFT_MANAGEMENT]: (typeof SHIFT_MANAGEMENT_SUBKEYS)[keyof typeof SHIFT_MANAGEMENT_SUBKEYS];
};

export type DynamicFeatureFlagConfig = {
  enabled: boolean;
  rolloutPercentage?: number;
  description?: string;
  tags?: string[];
} & (
  | {
      key: DynamicFeatureFlagKey.USER_MANAGEMENT;
      // Description: 'Core user management features for business operations';
      value: {
        [USER_MANAGEMENT_SUBKEYS.BULK_IMPORT]: boolean;
        [USER_MANAGEMENT_SUBKEYS.USER_INVITATIONS]: boolean;
        [USER_MANAGEMENT_SUBKEYS.CREATE_USER_WITH_DEPARTMENT]: boolean;
      };
    }
  | {
      key: DynamicFeatureFlagKey.ROLE_MANAGEMENT;
      // Description: 'Core role management features for business operations';
      value: {
        [ROLE_MANAGEMENT_SUBKEYS.CUSTOM_ROLES]: boolean;
        [ROLE_MANAGEMENT_SUBKEYS.ROLE_HIERARCHY]: boolean;
      };
    }
  | {
      key: DynamicFeatureFlagKey.STORE_MANAGEMENT;
      // Description: 'Core store management features for business operations';
      value: {
        [STORE_MANAGEMENT_SUBKEYS.GOOGLE_MAP_LOCATION]: boolean;
      };
    }
  | {
      key: DynamicFeatureFlagKey.STAFF_MANAGEMENT;
      // Description: 'Core staff management features for business operations';
      value: {
        [STAFF_MANAGEMENT_SUBKEYS.CLOCK_IN_OUT]: boolean;
      };
    }
  | {
      key: DynamicFeatureFlagKey.SHIFT_MANAGEMENT;
      // Description: 'Core shift management features for business operations';
      value: {
        [SHIFT_MANAGEMENT_SUBKEYS.RE_SCHEDULE_SHIFT]: boolean;
      };
    }
);

export type DynamicFeatureFlagValue = DynamicFeatureFlagConfig['value'];

// Helper mapping for dynamic access to subkeys
export const FEATURE_FLAG_SUBKEYS_MAP = {
  [DynamicFeatureFlagKey.USER_MANAGEMENT]: USER_MANAGEMENT_SUBKEYS,
  [DynamicFeatureFlagKey.ROLE_MANAGEMENT]: ROLE_MANAGEMENT_SUBKEYS,
  [DynamicFeatureFlagKey.STORE_MANAGEMENT]: STORE_MANAGEMENT_SUBKEYS,
  [DynamicFeatureFlagKey.STAFF_MANAGEMENT]: STAFF_MANAGEMENT_SUBKEYS,
  [DynamicFeatureFlagKey.SHIFT_MANAGEMENT]: SHIFT_MANAGEMENT_SUBKEYS,
} as const;
