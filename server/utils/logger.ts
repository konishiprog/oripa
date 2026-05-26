const logLevel = process.env.LOG_LEVEL || "info";

function isLogEnabled(level: string): boolean {
  const levels: { [key: string]: number } = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };
  return levels[level] <= levels[logLevel];
}

export const logger = {
  error: (prefix: string, message: string, ...args: any[]) => {
    if (isLogEnabled("error")) {
      console.error(`[${prefix}] ${message}`, ...args);
    }
  },
  warn: (prefix: string, message: string, ...args: any[]) => {
    if (isLogEnabled("warn")) {
      console.warn(`[${prefix}] ${message}`, ...args);
    }
  },
  info: (prefix: string, message: string, ...args: any[]) => {
    if (isLogEnabled("info")) {
      console.log(`[${prefix}] ${message}`, ...args);
    }
  },
  debug: (prefix: string, message: string, ...args: any[]) => {
    if (isLogEnabled("debug")) {
      console.log(`[${prefix}] ${message}`, ...args);
    }
  },
};
