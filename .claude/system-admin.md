# System Admin Reference

## Overview
System administrators manage the multi-tenant platform using access key authentication (no user accounts).

## Key Architecture
- **Auth**: Access key stored in sessionStorage (tab-specific)
- **State**: Separate `adminAuthenticated` state in `useAppStore`
- **Session**: `adminSessionManager` utility handles persistence
- **Routes**: Protected with `<AdminProtectedRoute>`

## Implementation Structure
```
src/
├── pages/admin/          # Admin pages (AdminLoginPage, etc.)
├── utils/adminSessionManager.ts  # Session management
├── lib/api/adminApi.ts  # Admin API client
└── stores/useAppStore.ts # Admin state (adminAuthenticated)
```

## Security Model
- Tab isolation: Each tab requires separate login
- Auto-logout on tab close (sessionStorage)
- 401 response triggers session cleanup
- No localStorage/cookies for security

## Admin Routes
```
/admin/login      # Access key authentication
/admin/dashboard  # Protected admin dashboard
/admin/*          # All admin routes require authentication
```

## Key Functions
- `adminLogin(accessKey)` - Authenticate admin
- `adminLogout()` - Clear session
- `isAdminAuthenticated()` - Check auth status
- `restoreAdminSession()` - Restore on app init
