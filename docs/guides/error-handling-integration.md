# Error Handling Integration Guide

## Overview
This guide explains how to integrate with the global error handling system when adding new features.

## Integration Points

### 1. API Clients
All API clients extending `BaseApiClient` automatically log errors:
```typescript
// Errors are automatically captured
const api = new BaseApiClient({ baseURL: '/api' });
await api.get('/users'); // Errors logged to error store
```

### 2. Component Errors
Wrap components with ErrorBoundary for automatic error catching:
```typescript
// Option 1: Direct wrapping
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Option 2: HOC pattern
const SafeComponent = withErrorBoundary(YourComponent);
```

### 3. Custom Error Logging
Use helper functions for specific error types:
```typescript
import { addApiError, addComponentError } from '@/stores/error';

// API errors
addApiError('Failed to fetch user', 404, '/api/user/123', { userId: 123 });

// Component errors
addComponentError('Invalid props', 'UserProfile', new Error('Missing ID'));
```

### 4. Async Operations
Unhandled promise rejections are automatically caught, but prefer explicit handling:
```typescript
// Good: Explicit error handling
try {
  await riskyOperation();
} catch (error) {
  // Error automatically logged, but handle UI state
  setLoading(false);
  showUserMessage('Operation failed');
}

// Avoid: Unhandled promises
riskyOperation(); // Will be caught but provides poor UX
```

## Best Practices

### 1. Error Messages
- User-facing: Generic, helpful messages
- Developer-facing: Detailed technical information
```typescript
// Good
throw new Error('Failed to load user profile');

// Avoid
throw new Error('SELECT * FROM users WHERE id=123 failed');
```

### 2. Context Information
Always provide relevant context:
```typescript
useErrorStore.getState().addError({
  type: 'apiError',
  message: 'Failed to save settings',
  context: {
    endpoint: '/api/settings',
    userId: currentUser.id,
    settings: sanitizedSettings, // Remove sensitive data
  },
});
```

### 3. Severity Guidelines
- **Critical**: Data loss, security issues, app crashes
- **High**: Feature failures, API 5xx errors
- **Medium**: Validation errors, recoverable failures
- **Low**: Warnings, deprecations, minor issues

### 4. Performance Considerations
- Errors are deduplicated automatically
- Maximum 50 errors stored (FIFO)
- Development-only UI components

## Testing Error Scenarios

### Manual Testing
Use the test buttons in HomePage (development only):
```typescript
// Trigger different error types
<Button onClick={triggerRuntimeError}>Runtime Error</Button>
<Button onClick={triggerPromiseRejection}>Promise Rejection</Button>
<Button onClick={triggerApiError}>API Error</Button>
```

### Unit Testing
Mock the error store:
```typescript
import { useErrorStore } from '@/stores/error';

jest.mock('@/stores/error', () => ({
  useErrorStore: jest.fn(),
  addApiError: jest.fn(),
}));
```

### E2E Testing
Check for error modal presence:
```typescript
// Cypress example
cy.get('[data-testid="error-modal"]').should('not.exist');
cy.trigger('error');
cy.get('[data-testid="error-modal"]').should('be.visible');
```

## Common Patterns

### 1. Form Validation Errors
```typescript
const handleSubmit = async (values) => {
  try {
    await api.post('/submit', values);
  } catch (error) {
    if (error.status === 422) {
      // Show inline validation errors
      setFieldErrors(error.data.errors);
    }
    // API error already logged
  }
};
```

### 2. Loading State Errors
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await api.get('/data');
    setData(data);
  } catch (error) {
    setError('Failed to load data');
    // Error logged automatically
  } finally {
    setLoading(false);
  }
};
```

### 3. Retry Logic
```typescript
const retryableOperation = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await api.get('/flaky-endpoint');
    } catch (error) {
      if (i === retries - 1) throw error; // Log on final failure
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

## Production Considerations

### 1. Error Sanitization
Never log sensitive information:
```typescript
// Bad
context: { password: user.password, apiKey: secret }

// Good
context: { userId: user.id, operation: 'login' }
```

### 2. Future Integration
Prepare for external error tracking:
```typescript
// Ready for Sentry/LogRocket integration
if (import.meta.env.PROD) {
  // Future: Send to error tracking service
  // Sentry.captureException(error);
}
```

### 3. User Privacy
- No PII in error messages
- Sanitize URLs and parameters
- Clear error store on logout

## Troubleshooting

### Errors Not Appearing
1. Check environment (dev only)
2. Verify error catcher is registered
3. Check browser console for initialization errors

### Modal Not Opening
1. Check auto-open setting
2. Verify error count > 0
3. Check for CSS conflicts

### Performance Issues
1. Check error count (max 50)
2. Look for error loops
3. Verify deduplication is working