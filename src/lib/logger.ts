type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
      const errorStr = entry.error ? ` Error: ${entry.error.message}` : ''
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${errorStr}`
    }
    return JSON.stringify(entry)
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      }
    }

    const formatted = this.formatLog(entry)

    switch (level) {
      case 'debug':
        if (this.isDevelopment) console.debug(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }

    return entry
  }

  debug(message: string, context?: Record<string, unknown>) {
    return this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    return this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    return this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const err = error instanceof Error ? error : undefined
    return this.log('error', message, context, err)
  }

  // API request logging
  apiRequest(method: string, path: string, userId?: string, context?: Record<string, unknown>) {
    return this.info(`API ${method} ${path}`, { userId, ...context })
  }

  // API response logging
  apiResponse(method: string, path: string, statusCode: number, duration: number, context?: Record<string, unknown>) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    return this.log(level, `API ${method} ${path} ${statusCode} ${duration}ms`, context)
  }

  // Database operation logging
  dbOperation(operation: string, table: string, duration?: number, context?: Record<string, unknown>) {
    return this.debug(`DB ${operation} ${table}${duration ? ` ${duration}ms` : ''}`, context)
  }

  // Auth logging
  authEvent(event: string, userId?: string, context?: Record<string, unknown>) {
    return this.info(`Auth: ${event}`, { userId, ...context })
  }

  // Security logging
  security(event: string, context?: Record<string, unknown>) {
    return this.warn(`Security: ${event}`, context)
  }
}

export const logger = new Logger()
export default logger
