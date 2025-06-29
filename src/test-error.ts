// Test file to verify error handling is working
// This file will be removed after testing

export function throwTestError() {
  throw new Error(
    'Test error: This is a test error to verify error handling is working!',
  );
}

export function throwAsyncError() {
  setTimeout(() => {
    throw new Error('Test async error: This error happens after a delay');
  }, 1000);
}

export function throwUnhandledRejection() {
  Promise.reject(
    new Error('Test unhandled rejection: This promise was rejected'),
  );
}
