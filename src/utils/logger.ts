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
  if (!debug && !isDevelopment) {
    return;
  }
  const colorMap = {
    info: 'blue',
    warn: '#f27a02',
    error: 'red',
  };
  const fontSizeMap = {
    info: '15px',
    warn: '20px',
    error: '36px',
  };

  const originalConsoleLog = console.log;
  console.log = isDevelopment ? log.bind(null, 'info') : productionLog;
  console.warn = isDevelopment ? log.bind(null, 'warn') : productionLog;
  console.error = isDevelopment ? log.bind(null, 'error') : productionLog;
  console.info = isDevelopment ? log.bind(null, 'info') : productionLog;

  function log(level: 'info' | 'warn' | 'error', message: unknown, ...args: unknown[]) {
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
