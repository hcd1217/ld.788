declare global {
  interface Console {
    ignore: (message?: any, ...optionalParams: any[]) => void;
  }
}

if (typeof console.ignore === 'undefined') {
  console.ignore = (_message?: any, ..._optionalParams: any[]) => {
    // do nothing
  };
}

export function registerLogger() {
  const originalConsoleLog = console.log;
  console.log = log.bind(null, 'info');
  console.warn = log.bind(null, 'warn');
  console.error = log.bind(null, 'error');
  console.info = log.bind(null, 'info');

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

  function log(
    level: 'info' | 'warn' | 'error',
    message: string,
    ...args: unknown[]
  ) {
    if (!import.meta.env.DEV) {
      return;
    }

    const message_: string = [message, ...args]
      .map((arg) => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const toString = String(arg);
        if (toString === '[object Object]') {
          return '';
        }

        return toString;
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
