const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof COLORS) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function formatMeta(meta?: Record<string, unknown>) {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }

  const serialized = Object.entries(meta)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join(' ');

  return serialized ? ` ${colorize(serialized, 'dim')}` : '';
}

export const devLogger = {
  request(message: string, meta?: Record<string, unknown>) {
    console.log(`${colorize(timestamp(), 'dim')} ${colorize('REQ', 'cyan')} ${message}${formatMeta(meta)}`);
  },
  response(message: string, meta?: Record<string, unknown>) {
    console.log(`${colorize(timestamp(), 'dim')} ${colorize('RES', 'green')} ${message}${formatMeta(meta)}`);
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(`${colorize(timestamp(), 'dim')} ${colorize('WARN', 'yellow')} ${message}${formatMeta(meta)}`);
  },
  error(message: string, meta?: Record<string, unknown>, error?: unknown) {
    console.error(`${colorize(timestamp(), 'dim')} ${colorize('ERR', 'red')} ${message}${formatMeta(meta)}`);

    if (error instanceof Error) {
      console.error(colorize(error.stack ?? error.message, 'dim'));
    } else if (error) {
      console.error(colorize(String(error), 'dim'));
    }
  },
  bootstrap(message: string) {
    console.log(`${colorize(timestamp(), 'dim')} ${colorize('BOOT', 'blue')} ${message}`);
  },
};
