# Global Error Handling Implementation Plan

## Overview
Implement a centralized error handling system with global error catching and developer-friendly visualization during development.

## Architectural Design

### Core Principles
1. **Centralized State Management**: All errors flow through a single Zustand store for consistent handling
2. **Environment-Aware**: Different behaviors for development vs production
3. **Type Safety**: Full TypeScript support with proper error categorization
4. **Developer Experience**: Rich debugging tools without impacting production
5. **Performance**: Deduplication and limits to prevent memory issues

### System Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Global Handlers │────▶│   Error Store    │────▶│  Error Modal    │
│ - window.error  │     │ (Zustand)        │     │ (Dev Only)      │
│ - unhandled     │     │ - Deduplication  │     │ - Filtering     │
│   rejection     │     │ - Max 50 errors  │     │ - Search        │
└─────────────────┘     │ - Severity calc  │     │ - Statistics    │
                        └──────────────────┘     └─────────────────┘
                                 ▲
                    ┌────────────┴────────────┐
                    │                         │
           ┌────────────────┐       ┌─────────────────┐
           │ Error Boundary │       │  API Client     │
           │ - Component    │       │ - HTTP errors   │
           │   errors       │       │ - Network       │
           │ - React tree   │       │ - Timeouts      │
           └────────────────┘       └─────────────────┘
```

### Error Classification
- **Runtime Errors** (`error`): JavaScript exceptions, low severity
- **Promise Rejections** (`unhandledRejection`): Async failures, medium severity
- **API Errors** (`apiError`): HTTP/network failures, high/critical based on status
- **Component Errors** (`componentError`): React component failures, high severity

## Implementation Status
- ✅ Step 1: Error Store (Completed)
- ✅ Step 2: Global Error Catcher (Completed)
- ✅ Step 3: Error Modal Component (Completed)
- ✅ Step 4: Register in main.tsx (Completed)
- ✅ Step 5: React Error Boundary (Completed)
- ✅ Step 6: API Integration (Completed)
- ✅ Step 7: Development UI Controls (Completed)

## Core Components

### 1. Error Store (Zustand) ✅
**Status**: Implemented in `src/stores/error.ts`

**Final Implementation**:
```typescript
export type ErrorType = 'error' | 'unhandledRejection' | 'apiError' | 'componentError';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorRecord {
  id: string;
  timestamp: Date;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  source?: string;
  context?: Record<string, unknown>;
  count: number; // For deduplication
}

interface ErrorState {
  errors: ErrorRecord[];
  maxErrors: number;
  addError: (error: ErrorInput) => void;
  clearErrors: () => void;
  clearError: (id: string) => void;
  getRecentErrors: (count: number) => ErrorRecord[];
  getErrorsByType: (type: ErrorType) => ErrorRecord[];
  getErrorCount: () => number;
}
```

**Key Features Implemented**:
- Error deduplication with count tracking
- Severity levels based on error type
- Maximum error limit (50) to prevent memory issues
- Helper functions for API and component errors
- Type-safe implementation with proper TypeScript types

**Lessons Learned**:
- XO linter requires specific configuration for Zustand type inference
- Added `@typescript-eslint/no-unsafe-argument` and `@typescript-eslint/restrict-plus-operands` to xo.config.ts
- User improved type safety without disabling ESLint rules

### 2. Global Error Catcher ✅
**Status**: Implemented in `src/utils/errorCatcher.ts`

**Final Implementation**:
```typescript
export default function registerGlobalErrorCatcher(): () => void {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Global error handler
  const errorHandler = (event: ErrorEvent): void => {
    event.preventDefault();
    // Extract error details and add to store
  };

  // Unhandled promise rejection handler
  const unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
    event.preventDefault();
    // Extract rejection details and add to store
  };

  // Register listeners and return cleanup function
  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', unhandledRejectionHandler);
  
  return () => {
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
  };
}
```

**Key Features Implemented**:
- Environment-aware error handling (dev vs prod)
- Comprehensive error extraction with fallbacks
- Rich context collection (URL, user agent, timestamp)
- Source location tracking (filename:line:column)
- Cleanup function for proper teardown
- Optional rate limiting to prevent error spam
- Prepared for future error tracking service integration

### 3. Error Modal Component ✅
**Status**: Implemented in `src/components/ErrorModal.tsx`

**Final Implementation**:
- Mantine-based modal with rich error display
- Development-only rendering (hidden in production)
- Floating error indicator with count badge
- Auto-open on new errors with optional auto-close delay

**Key Features Implemented**:
- **Error Display**: Shows message, stack trace, source, and context
- **Severity Badges**: Color-coded based on error severity (critical/high/medium/low)
- **Deduplication Display**: Shows count badge for repeated errors
- **Copy Functionality**: One-click copy of error details as JSON
- **Bulk Operations**: Clear individual errors or all at once
- **Smart Auto-close**: Optional timer-based closure
- **Type Safety**: Fixed Mantine color types with proper type definitions

**UI Components**:
- Floating red action button with error count
- Modal with scrollable error list
- Individual error cards with all details
- Toast notifications for user feedback

## Additional Patterns to Implement

### 1. React Error Boundaries
- Catch component-level errors
- Integrate with error store
- Provide fallback UI

### 2. API Error Integration
- Hook into existing `ApiError` class from `BaseApiClient`
- Automatically capture failed API requests
- Include request details in error context

### 3. Error Categories
- **Recoverable**: User can retry the action
- **Non-recoverable**: Requires page reload or fix
- **Warning**: Non-critical issues for developer attention

### 4. Error Management Features
- **Rate Limiting**: Prevent error spam (e.g., max 10 errors per minute)
- **Deduplication**: Group similar errors together
- **Filtering**: Filter by error type, source, or time range
- **Export**: Export error logs for debugging

### 4. Global Registration ✅
**Status**: Implemented in `src/main.tsx`

**Final Implementation**:
- Error catcher registered at app initialization
- Cleanup function registered on window unload
- ErrorModal component added to the component tree
- Test buttons added to HomePage for verification (dev only)

**Key Features**:
- Early registration ensures all errors are caught
- Proper cleanup prevents memory leaks
- ErrorModal automatically shows when errors occur
- Test utilities verify all error types are captured

### 5. React Error Boundary ✅
**Status**: Implemented in `src/components/ErrorBoundary.tsx` and `src/components/withErrorBoundary.tsx`

**Final Implementation**:
- Class-based ErrorBoundary component that catches React component errors
- Integration with error store via `addComponentError()`
- Customizable fallback UI or default error display
- HOC `withErrorBoundary()` for easy component wrapping
- App wrapped with ErrorBoundary at root level

**Key Features**:
- **Error Recovery**: "Try Again" button to reset error state
- **Development Info**: Shows error message in dev mode
- **Automatic Logging**: All component errors sent to error store
- **Flexible Fallback**: Custom or default error UI
- **Type Safety**: Proper TypeScript types throughout

**Usage Examples**:
```typescript
// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <RiskyComponent />
</ErrorBoundary>

// Using HOC
const SafeComponent = withErrorBoundary(RiskyComponent);
```

### 6. API Error Integration ✅
**Status**: Implemented in `src/lib/api/base.ts`

**Final Implementation**:
- BaseApiClient updated to automatically log all API errors to error store
- Comprehensive error capture for different scenarios:
  - HTTP errors (4xx, 5xx)
  - Network errors
  - Timeout errors
  - Validation errors (Zod schema failures)
- Rich context provided for each error type
- Development-only logging to avoid performance impact in production

**Key Features**:
- **Automatic Capture**: All API errors logged without manual intervention
- **Error Context**: Includes method, URL, headers, request/response data
- **Validation Errors**: Special handling for Zod schema validation failures
- **Timeout Handling**: Captures timeout errors with configured timeout value
- **Network Errors**: Captures connection failures and other network issues

**Test Implementation**:
- Created `TestApiClient` in `src/lib/api/test.ts` for testing
- Added test buttons in HomePage for various error scenarios:
  - 404 errors
  - Validation errors
  - Timeout errors

**Usage**:
```typescript
// All errors are automatically logged in development
try {
  await apiClient.get('/users/123');
} catch (error) {
  // Error already logged to error store
  // Handle error for UI purposes
}
```

### 7. Development UI Controls ✅
**Status**: Implemented in enhanced `src/components/ErrorModal.tsx`

**Final Implementation**:
- Enhanced ErrorModal with advanced developer controls
- Three-tab interface: Errors, Statistics, Settings
- Rich filtering and search capabilities
- Export functionality for error logs
- Comprehensive error statistics visualization

**Key Features Implemented**:

**1. Error Filtering & Search**:
- Real-time search across error messages and sources
- Filter by error type (runtime, promise, API, component)
- Filter by severity (critical, high, medium, low)
- Combined filtering shows matching subset

**2. Export & Copy Functionality**:
- Export all errors as JSON file (desktop only)
- Copy to clipboard functionality (all devices)
- Includes timestamp, errors, and statistics
- Export disabled on mobile devices (< 768px width)
- Formatted JSON output with proper indentation

**3. Statistics View**:
- Errors grouped by type with counts
- Errors grouped by severity with counts
- Visual ring chart showing error distribution
- Real-time updates as errors occur

**4. Settings Panel**:
- Toggle auto-open behavior
- Persistent across session (in component state)

**5. Enhanced UI**:
- Tabbed interface for better organization
- Larger modal size (xl) for more content
- Clear indication of filtered vs total errors
- Improved visual hierarchy
- Responsive ScrollArea width (80vw on mobile, 50vw on desktop)
- Padding added to error list for better spacing

**Technical Implementation**:
- Used `useMemo` for efficient filtering and statistics
- Switch statements for type-safe counting
- Mantine components for consistent UI
- Proper TypeScript types throughout

## Implementation Steps

1. ✅ Create error store in `src/stores/error.ts` (Completed)
2. ✅ Implement global error catcher in `src/utils/errorCatcher.ts` (Completed)
3. ✅ Create ErrorModal component in `src/components/ErrorModal.tsx` (Completed)
4. ✅ Register error catcher in `src/main.tsx` (Completed)
5. ✅ Add React Error Boundary wrapper (Completed)
6. ✅ Integrate with BaseApiClient for API errors (Completed)
7. ✅ Add development-only UI controls (Completed)

## Environment Configuration

### Development
- Show error modal immediately
- Keep full error history
- Enable verbose logging
- Show stack traces

### Production
- Send errors to logging service (e.g., Sentry)
- No modal display to end users
- Sanitize sensitive information
- Rate limit error reporting

## Security Considerations
- Never expose sensitive data in error messages
- Sanitize user input in error contexts
- Avoid logging authentication tokens or passwords
- Clear error store on logout

## Testing Strategy
- Unit tests for error store
- Integration tests for global catchers
- E2E tests for error modal behavior
- Manual testing of various error scenarios

## Recent Updates (Mobile Responsiveness)

### Export/Copy Functionality Enhancement
- **Desktop Experience**: Both Export and Copy buttons available
- **Mobile Experience**: Export disabled, Copy button remains functional
- **Rationale**: File downloads on mobile can be problematic; clipboard access is universal

### Responsive Design Updates
- **ScrollArea Width**: Responsive breakpoints (80vw mobile, 50vw desktop)
- **Button State**: Export button disabled via `window.innerWidth < 768`
- **Padding**: Added consistent padding to error list container

### Technical Decisions
1. **Window.innerWidth vs Media Query**: Direct check for immediate feedback
2. **Separate Functions**: `handleExportErrors` and `handleCopyErrors` for clarity
3. **Consistent Data Format**: Both export and copy use identical JSON structure