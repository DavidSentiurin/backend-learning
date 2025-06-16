// src/utils/logger/logger.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private prefix: string = '';

  createContext(context: string): LoggerService {
    const contextLogger = new LoggerService();
    contextLogger.prefix = context;
    return contextLogger;
  }

  private addPrefix(...args: unknown[]): unknown[] {
    if (!this.prefix) {
      return args;
    }

    // Add prefix as the first argument
    return [`[${this.prefix}]`, ...args];
  }

  log(...args: unknown[]): void {
    console.log(...this.addPrefix(...args));
  }

  error(...args: unknown[]): void {
    console.error(...this.addPrefix(...args));
  }

  warn(...args: unknown[]): void {
    console.warn(...this.addPrefix(...args));
  }

  debug(...args: unknown[]): void {
    console.debug(...this.addPrefix(...args));
  }

  info(...args: unknown[]): void {
    console.info(...this.addPrefix(...args));
  }
}
