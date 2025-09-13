import { logDebug } from '@/utils/logger';

import { isDevelopment } from './env';

export interface RouteTransition {
  readonly from: string | null;
  readonly to: string;
  readonly timestamp: number;
  readonly duration?: number; // Time spent on previous page
}

export interface RouteTrackingOptions {
  readonly enableLogging?: boolean;
  readonly enableAnalytics?: boolean;
  readonly enablePerformanceTracking?: boolean;
  readonly customHandler?: (transition: RouteTransition) => void;
}

class RouteTracker {
  private lastTransition: RouteTransition | null = null;
  private options: RouteTrackingOptions;
  private routeHistory: RouteTransition[] = [];
  private readonly maxHistorySize = 50;

  constructor(options: RouteTrackingOptions = {}) {
    this.options = {
      enableLogging: true,
      enableAnalytics: false,
      enablePerformanceTracking: false,
      ...options,
    };
  }

  /**
   * Track a route change
   */
  track(from: string | null, to: string): void {
    const now = Date.now();
    const duration = this.lastTransition ? now - this.lastTransition.timestamp : undefined;

    const transition: RouteTransition = {
      from,
      to,
      timestamp: now,
      duration,
    };

    // Store in history
    this.addToHistory(transition);

    // Log if enabled
    if (this.options.enableLogging) {
      this.logTransition(transition);
    }

    // Track analytics if enabled
    if (this.options.enableAnalytics) {
      this.trackAnalytics(transition);
    }

    // Track performance if enabled
    if (this.options.enablePerformanceTracking) {
      this.trackPerformance(transition);
    }

    // Call custom handler if provided
    if (this.options.customHandler) {
      this.options.customHandler(transition);
    }

    this.lastTransition = transition;
  }

  /**
   * Get route history
   */
  getHistory(): readonly RouteTransition[] {
    return [...this.routeHistory];
  }

  /**
   * Clear route history
   */
  clearHistory(): void {
    this.routeHistory = [];
    this.lastTransition = null;
  }

  /**
   * Get the last route transition
   */
  getLastTransition(): RouteTransition | null {
    return this.lastTransition;
  }

  private addToHistory(transition: RouteTransition): void {
    this.routeHistory.push(transition);

    // Keep history size under control
    if (this.routeHistory.length > this.maxHistorySize) {
      this.routeHistory.shift();
    }
  }

  private logTransition(transition: RouteTransition): void {
    const message = transition.from
      ? `Route changed: ${transition.from} → ${transition.to}`
      : `Initial route: ${transition.to}`;

    const details = transition.duration
      ? ` (spent ${Math.round(transition.duration / 1000)}s on previous page)`
      : '';

    logDebug(`${message}${details}`, {
      module: 'routeTracking',
      action: 'message',
    });
  }

  private trackAnalytics(transition: RouteTransition): void {
    // Placeholder for analytics implementation
    // This could integrate with Google Analytics, Mixpanel, etc.

    // Example for Google Analytics (if window.gtag exists):
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-expect-error - gtag is added by Google Analytics script
      window.gtag('event', 'page_view', {
        page_path: transition.to,
        page_referrer: transition.from,
      });
    }
  }

  private trackPerformance(transition: RouteTransition): void {
    // Track performance metrics
    if (transition.duration && transition.from) {
      // Log if user spent too little time (bounce)
      if (transition.duration < 1000 && isDevelopment) {
        console.warn(`Quick bounce from ${transition.from} (${transition.duration}ms)`);
      }

      // Log slow page if user spent a lot of time
      if (transition.duration > 60000 && isDevelopment) {
        console.info(`User spent ${Math.round(transition.duration / 1000)}s on ${transition.from}`);
      }
    }

    // Track navigation timing if available
    if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

      if (pageLoadTime > 0 && isDevelopment) {
        console.log(`Page load time for ${transition.to}: ${pageLoadTime}ms`);
      }
    }
  }
}

// Create singleton instance
export const routeTracker = new RouteTracker();

// Export for custom instances if needed
export { RouteTracker };
