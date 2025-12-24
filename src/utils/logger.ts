/**
 * Centralized logging utility for the Kebo app.
 * 
 * - Debug and info logs are only shown in development mode
 * - Error logs are always shown (for crash reporting integration)
 * - All logs are prefixed with their level for easy filtering
 * 
 * SPDX-License-Identifier: Apache-2.0
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

const logger: Logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    // Errors are always logged for crash reporting purposes
    console.error(`[ERROR] ${message}`, ...args);
  },
};

export default logger;

