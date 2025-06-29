# Error Handling Quick Reference

## 🚀 Quick Start

### Automatic Error Capture
```typescript
// These are automatically caught:
throw new Error('Runtime error');           // ✅ Logged
Promise.reject('Unhandled rejection');      // ✅ Logged
await api.get('/404');                      // ✅ Logged
<BrokenComponent />                         // ✅ Logged (with ErrorBoundary)
```

### Manual Error Logging
```typescript
import { useErrorStore, addApiError, addComponentError } from '@/stores/error';

// Generic error
useErrorStore.getState().addError({
  type: 'error',
  message: 'Something went wrong',
  severity: 'medium', // optional
});

// API error shorthand
addApiError('Failed to fetch', 500, '/api/data');

// Component error shorthand
addComponentError('Render failed', 'MyComponent', error);
```

## 📊 Error Types & Severities

| Type | Auto Severity | When to Use |
|------|--------------|-------------|
| `error` | low | JavaScript runtime errors |
| `unhandledRejection` | medium | Promise rejections |
| `apiError` | high/critical | API/Network failures |
| `componentError` | high | React component errors |

## 🎯 Integration Checklist

- [ ] API clients extend `BaseApiClient`
- [ ] Components wrapped with `ErrorBoundary`
- [ ] Async operations have error handling
- [ ] Sensitive data sanitized
- [ ] Error messages are user-friendly

## 🛠️ Development Tools

### Error Modal Shortcuts
- **Search**: Filter errors by message/source
- **Filter by Type**: Runtime, Promise, API, Component
- **Filter by Severity**: Critical, High, Medium, Low
- **Export** (Desktop): Download as JSON
- **Copy** (All devices): Copy to clipboard
- **Clear All**: Remove all errors

### Testing Errors
```typescript
// In development, trigger test errors:
window.dispatchEvent(new ErrorEvent('error', {
  message: 'Test error',
  filename: 'test.js',
  lineno: 1,
  colno: 1,
}));
```

## 📱 Mobile Considerations

| Feature | Desktop | Mobile |
|---------|---------|---------|
| Error Modal | ✅ | ✅ |
| Search/Filter | ✅ | ✅ |
| Export JSON | ✅ | ❌ |
| Copy to Clipboard | ✅ | ✅ |
| ScrollArea Width | 50vw | 80vw |

## ⚡ Performance Tips

1. **Deduplication**: Same errors increment count, not duplicated
2. **Limit**: Maximum 50 errors (oldest removed)
3. **Production**: Modal components not loaded
4. **Severity**: Auto-calculated, but can override

## 🔒 Security Reminders

```typescript
// ❌ Don't log sensitive data
context: { password, apiKey, ssn }

// ✅ Do log safe metadata
context: { userId, endpoint, timestamp }
```

## 🎭 Common Patterns

### Try-Catch with UI Feedback
```typescript
try {
  await riskyOperation();
} catch (error) {
  // Error auto-logged, handle UI
  showToast('Operation failed');
}
```

### ErrorBoundary with Fallback
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

### API Error Handling
```typescript
const { data, error } = await api
  .get('/endpoint')
  .then(data => ({ data }))
  .catch(error => ({ error }));

if (error) {
  // Already logged, handle UI
  return <ErrorState />;
}
```

## 📞 Need Help?

1. Check `/docs/guides/error-handling-integration.md`
2. Review `/implementation-plan/global-error-handling.md`
3. See ADR at `/docs/adr/001-global-error-handling.md`
4. Look at component examples in codebase