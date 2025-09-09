import { isDevelopment } from './env';

declare global {
  interface Console {
    ignore: (message?: unknown, ...optionalParams: unknown[]) => void;
  }
}
console.ignore = () => {
  // Do nothing
};

export function registerLogger() {
  const debug = false;
  if (debug && isDevelopment) {
    return;
  }

  const originalConsoleLog = console.log;
  console.log = isDevelopment ? log.bind(null, 'info') : productionLog;
  console.warn = isDevelopment ? log.bind(null, 'warn') : productionLog;
  console.error = isDevelopment ? log.bind(null, 'error') : productionLog;
  console.info = isDevelopment ? log.bind(null, 'info') : productionLog;
  console.debug = isDevelopment ? log.bind(null, 'debug') : productionLog;

  const colorMap = {
    debug: 'green',
    info: 'blue',
    warn: '#f27a02',
    error: 'red',
  };
  const fontSizeMap = {
    debug: '15px',
    info: '15px',
    warn: '20px',
    error: '36px',
  };

  function log(level: 'info' | 'warn' | 'error' | 'debug', message: unknown, ...args: unknown[]) {
    if (level === 'debug') {
      return;
    }
    if (level === 'info') {
      // return;
    }
    const message_: string = [message, ...args]
      .map((arg) => {
        if (typeof arg == 'string') {
          return arg;
        }
        if (arg instanceof Error) {
          return [arg.message, arg.stack || 'No stack trace'].join('\n');
        }
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return '[Circular Object]';
          }
        }

        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'number') return arg.toString();
        if (typeof arg === 'boolean') return arg.toString();
        if (typeof arg === 'symbol') return arg.toString();
        if (typeof arg === 'bigint') return arg.toString();
        if (typeof arg === 'function') return arg.toString();

        // Fallback for any other type
        return Object.prototype.toString.call(arg);
      })
      .join(', ');

    originalConsoleLog(
      `%c[${new Date().toISOString()}] [${level}] ${message_}`,
      `font-style: italic; color: ${colorMap[level]}; font-size: ${fontSizeMap[level]};`,
    );

    switch (level) {
      case 'info': {
        break;
      }

      case 'warn': {
        break;
      }

      case 'error': {
        break;
      }
    }
  }
}

function productionLog() {
  // ignore all log
}

// ============================================================================
// Standardized Logging Functions
// ============================================================================

export type LogContext = {
  readonly module?: string; // Module or service name
  readonly action?: string; // Action being performed
  readonly userId?: string; // User context
  readonly clientCode?: string; // Client context
  readonly metadata?: Record<string, unknown>; // Additional data
};

/**
 * Log an error with context
 * Only logs in development mode unless forced
 */
export function logError(
  message: string,
  error?: unknown,
  context?: LogContext,
  forceLog: boolean = false,
): void {
  if (!isDevelopment && !forceLog) return;

  const errorDetails = error instanceof Error ? error : new Error(String(error));
  const logMessage = formatLogMessage('ERROR', message, context);

  if (isDevelopment) {
    console.error(logMessage, errorDetails, context?.metadata);
  } else if (forceLog) {
    // In production, use a more structured format
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message,
        error: errorDetails.message,
        stack: errorDetails.stack,
        context,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

/**
 * Log a warning with context
 * Only logs in development mode unless forced
 */
export function logWarn(message: string, context?: LogContext, forceLog: boolean = false): void {
  if (!isDevelopment && !forceLog) return;

  const logMessage = formatLogMessage('WARN', message, context);

  if (isDevelopment) {
    console.warn(logMessage, context?.metadata);
  } else if (forceLog) {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        message,
        context,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

/**
 * Log info with context
 * Only logs in development mode unless forced
 */
export function logInfo(message: string, context?: LogContext, forceLog: boolean = false): void {
  if (!isDevelopment && !forceLog) return;

  const logMessage = formatLogMessage('INFO', message, context);

  if (isDevelopment) {
    console.info(logMessage, context?.metadata);
  } else if (forceLog) {
    console.info(
      JSON.stringify({
        level: 'INFO',
        message,
        context,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

/**
 * Log debug information
 * Only logs in development mode
 */
export function logDebug(message: string, data?: unknown): void {
  if (!isDevelopment) return;

  console.debug(`[DEBUG] ${message}`, data);
}

/**
 * Format log message with context
 */
function formatLogMessage(level: string, message: string, context?: LogContext): string {
  const parts = [
    `[${level}]`,
    context?.module && `[${context.module}]`,
    context?.action && `[${context.action}]`,
    message,
  ].filter(Boolean);

  return parts.join(' ');
}
