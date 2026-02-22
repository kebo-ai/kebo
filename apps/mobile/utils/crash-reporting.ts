import logger from "./logger";

export const initCrashReporting = () => {
  // Initialize crash reporting service here (Sentry, Bugsnag, Crashlytics)
};

export enum ErrorType {
  FATAL = "Fatal",
  HANDLED = "Handled",
}

export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  if (__DEV__) {
    const message = error.message || "Unknown";
    logger.error("Crash reported:", error);
    logger.debug("Error type:", type, "Message:", message);
  } else {
    // In production, utilize crash reporting service:
    // Sentry.captureException(error)
    // crashlytics().recordError(error)
    // Bugsnag.notify(error)
  }
};
