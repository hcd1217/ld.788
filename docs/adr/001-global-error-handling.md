# ADR-001: Global Error Handling Architecture

## Status
Accepted

## Context
The application needs a comprehensive error handling system that:
- Captures all types of errors (runtime, async, API, component)
- Provides excellent developer experience during development
- Has minimal impact on production performance
- Maintains type safety throughout

## Decision

### 1. Centralized State Management
We use Zustand for error state management because:
- Lightweight and performant
- Built-in DevTools support
- Simple API that doesn't require providers
- Type-safe with TypeScript

### 2. Error Categorization
Errors are categorized into four types:
- `error`: Runtime JavaScript errors
- `unhandledRejection`: Promise rejections
- `apiError`: API/Network failures
- `componentError`: React component errors

Each type has automatic severity assignment based on context.

### 3. Development-Only UI
The ErrorModal component is rendered only in development:
- Reduces production bundle size
- Prevents sensitive error information exposure
- Provides rich debugging tools where needed

### 4. Mobile-First Responsive Design
- Export functionality disabled on mobile (< 768px)
- Copy to clipboard available on all devices
- Responsive width adjustments for ScrollArea

### 5. Error Deduplication
Similar errors are grouped with a count to prevent spam:
- Matching based on type, message, and source
- Maintains last occurrence timestamp
- Reduces memory usage and improves readability

## Consequences

### Positive
- Single source of truth for all application errors
- Consistent error handling across the application
- Excellent developer experience with filtering, search, and export
- Type-safe error handling with TypeScript
- Performance optimized with deduplication and limits

### Negative
- Additional complexity in initial setup
- Requires discipline to maintain error categorization
- Manual integration needed for each error source

### Trade-offs
- Development features add ~50KB to dev bundle (removed in production)
- Window.innerWidth check instead of media queries (simpler but less reactive)
- 50 error limit may need adjustment based on usage patterns

## Implementation Notes
1. Error store must be initialized early in app lifecycle
2. Cleanup function must be called on app unmount
3. API clients need explicit integration
4. Component errors require ErrorBoundary wrapping