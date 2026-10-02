export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMetadata = {
  requestId?: string;
  provider?: string;
  videoId?: string;
  route?: string;
  method?: string;
  event?: string;
  durationMs?: number;
  errorCode?: string;
};

export type Logger = {
  debug(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  error(message: string, metadata?: LogMetadata): void;
};

function write(level: LogLevel, message: string, metadata: LogMetadata = {}) {
  const entry = JSON.stringify({
    level,
    message,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
  console[level === "debug" ? "log" : level](entry);
}

export const logger: Logger = {
  debug: (message, metadata) => write("debug", message, metadata),
  info: (message, metadata) => write("info", message, metadata),
  warn: (message, metadata) => write("warn", message, metadata),
  error: (message, metadata) => write("error", message, metadata),
};