import {type ComponentType, type ReactElement} from 'react';
import {ErrorBoundary} from './ErrorBoundary';

export function withErrorBoundary<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  fallback?: ReactElement,
): ComponentType<P> {
  function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name ?? 'Component'})`;

  return WrappedComponent;
}
