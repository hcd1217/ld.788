# Permission Management Page Implementation Plan

## Overview
Create a comprehensive Permission Management Page following the existing patterns from RoleManagementPage.tsx and adhering to the PAGE-GUIDELINE.md standards.

## Implementation Steps

### 1. Create Permission Management Page Component
**File**: `src/pages/app/PermissionManagementPage.tsx`

**Key Features**:
- **Data Model**: Use the existing `Permission` type from `src/lib/api/client.ts`
  ```typescript
  type Permission = {
    id: string;
    resource: string;
    action: string;
    scope: string;
    description: string;
  };
  ```
- **API Integration**: Use `clientService.getAllPermissions()`, `clientService.addPermission()`, `clientService.updatePermission()`, `clientService.deletePermission()`
- **Access Control**: Root user only (`!user?.isRoot` check)
- **Responsive Design**: Desktop table view only (ignore mobile view as requested)
- **CRUD Operations**: Full Create, Read, Update, Delete functionality

**Form Structure**:
```typescript
type PermissionFormValues = {
  resource: string;
  action: string;
  scope: string;
  description: string;
};
```

**Form Field Types**:
- **Resource**: Select with enum values: `["*", "user", "report"]`
- **Action**: Select with enum values: `["read", "create", "*"]`
- **Scope**: Select with enum values: `["all", "own", "department", "*"]`
- **Description**: TextArea (free text)

**Validation Rules**:
- All fields required
- Resource: Must be one of the enum values
- Action: Must be one of the enum values
- Scope: Must be one of the enum values
- Description: minimum 10 characters

### 2. Add Router Configuration
**File**: `src/routers/index.tsx`

**Changes**:
- Add lazy import for PermissionManagementPage
- Add route under RootUserLayout: `/permission-management`
- Follow existing pattern like RoleManagementPage

### 3. Add Navigation Menu Item
**File**: `src/components/layouts/AuthLayout.tsx`

**Changes**:
- Add permission management menu item to `navigationItems` array
- Use `IconLock` or `IconKey` icon from @tabler/icons-react
- Position after Role Management
- Hide for non-root users

### 4. Add Translation Keys
**Files**: `src/locales/en.json` and `src/locales/vi.json`

**Required Keys**:
```json
{
  "permission": {
    "management": "Permission Management",
    "add": "Add Permission",
    "edit": "Edit Permission",
    "revoke": "Revoke Permission",
    "resource": "Resource",
    "action": "Action",
    "scope": "Scope",
    "description": "Description",
    "noPermissionsFound": "No permissions found",
    "addSuccess": "Permission added successfully",
    "updateSuccess": "Permission updated successfully",
    "revokeSuccess": "Permission revoked successfully",
    "addFailed": "Failed to add permission",
    "updateFailed": "Failed to update permission",
    "revokeFailed": "Failed to revoke permission"
  }
}
```

### 5. Component Structure & Design

**Layout Pattern** (following PAGE-GUIDELINE.md):
```typescript
<Container size="xl" mt="xl">
  <Stack gap="xl">
    {/* Header with back button and add permission button */}
    <Group justify="space-between">
      <Anchor component="button" onClick={() => navigate(-1)}>
        <IconArrowLeft /> Back to Previous Page
      </Anchor>
      <Button leftSection={<IconPlus />} onClick={handleAddPermission}>
        Add Permission
      </Button>
    </Group>

    {/* Page Title */}
    <Title order={1} ta="center">Permission Management</Title>

    {/* Main Content */}
    <Paper withBorder shadow="md" p="md" radius="md">
      {/* Table (Desktop only) */}
    </Paper>
  </Stack>
</Container>
```

**Table Columns**:
1. Resource
2. Action
3. Scope
4. Description
5. Actions (Edit/Revoke menu)

**Features**:
- Loading states with LoadingOverlay
- Error handling with notifications
- Confirmation modals for revoke operations
- Form validation with real-time feedback

### 6. State Management

**Local State**:
- `permissions: Permission[]` - All permissions
- `isLoading: boolean` - Loading state
- `selectedPermission: Permission | undefined` - Selected permission for edit
- `showAlert: boolean` - Form validation alert
- `isAddMode: boolean` - Add vs Edit mode
- `formOpened: boolean` - Modal state

**Form State** (using `@mantine/form`):
```typescript
const form = useForm<PermissionFormValues>({
  initialValues: {
    resource: '',
    action: '',
    scope: '',
    description: '',
  },
  validate: {
    resource: (value) => !value ? 'Resource is required' : null,
    action: (value) => !value ? 'Action is required' : null,
    scope: (value) => !value ? 'Scope is required' : null,
    description: (value) => !value || value.length < 10 ? 'Description must be at least 10 characters' : null,
  },
});
```

**Form Field Constants**:
```typescript
const RESOURCE_OPTIONS = [
  { value: '*', label: 'All Resources (*)' },
  { value: 'user', label: 'User' },
  { value: 'report', label: 'Report' },
];

const ACTION_OPTIONS = [
  { value: 'read', label: 'Read' },
  { value: 'create', label: 'Create' },
  { value: '*', label: 'All Actions (*)' },
];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'own', label: 'Own' },
  { value: 'department', label: 'Department' },
  { value: '*', label: 'All Scopes (*)' },
];
```

### 7. API Integration

**Service Methods** (already added to ClientApi):
- `clientService.getAllPermissions()` - Load all permissions
- `clientService.addPermission(data)` - Create new permission
- `clientService.updatePermission(id, data)` - Update existing permission
- `clientService.revokePermission(id)` - Revoke permission

**Error Handling**:
- Use try-catch blocks for all API calls
- Show error notifications on failure
- Maintain loading states during operations
- Reset form on success

### 8. UI/UX Considerations

**Icons** (from @tabler/icons-react):
- `IconLock` or `IconKey` - Menu navigation
- `IconPlus` - Add permission button
- `IconEdit` - Edit action
- `IconTrash` - Revoke action
- `IconDots` - Actions menu
- `IconRefresh` - Refresh button
- `IconArrowLeft` - Back button

**Colors & Styling**:
- Follow existing Mantine theme
- Use consistent Paper styling: `withBorder shadow="md" p="md" radius="md"`
- Loading overlays with blur: `overlayProps={{blur: 2}}`
- Error notifications in red
- Success notifications in green

### 9. Performance Considerations

**Optimization**:
- Use `useCallback` for expensive handlers
- Implement proper cleanup in `useEffect`
- Use specific icon imports
- Follow lazy loading patterns

**Memory Management**:
- Proper effect cleanup
- Avoid unnecessary re-renders

### 10. Testing & Validation

**Type Safety**:
- Run `yarn type-check` after implementation
- Use proper TypeScript types throughout
- Leverage Zod schema validation

**Functionality Testing**:
- Test all CRUD operations
- Validate form inputs
- Test error states

## File Structure Summary

```
src/
├── pages/app/
│   └── PermissionManagementPage.tsx    # Main page component
├── routers/
│   └── index.tsx                       # Router configuration
├── components/layouts/
│   └── AuthLayout.tsx                  # Navigation menu
├── locales/
│   ├── en.json                         # English translations
│   └── vi.json                         # Vietnamese translations
└── lib/api/
    └── client.ts                       # API methods (already added)
```

## Dependencies

**No new dependencies required** - all required packages are already in the project:
- @mantine/core - UI components
- @mantine/form - Form handling
- @mantine/hooks - React hooks
- @mantine/modals - Modal management
- @mantine/notifications - Notifications
- @tabler/icons-react - Icons
- react-router - Navigation
- zod - Schema validation

## Notes

1. **Desktop Only**: As requested, mobile view is ignored. Only desktop table layout implemented.
2. **Root User Only**: Access control implemented via `!user?.isRoot` check.
3. **API Ready**: Backend API endpoints are assumed to be implemented (placeholder methods added).
4. **Translation Ready**: All user-facing text uses i18n translation keys.
5. **Consistent Patterns**: Follows exact patterns from RoleManagementPage.tsx for consistency.
6. **Type Safety**: Full TypeScript coverage with proper types and validation.

## Post-Implementation Checklist

- [ ] Run `yarn type-check` to ensure no TypeScript errors
- [ ] Test all CRUD operations
- [ ] Test responsive behavior (desktop only)
- [ ] Validate form inputs and error handling
- [ ] Test navigation and menu integration
- [ ] Verify translations work correctly
- [ ] Check loading states and error scenarios
