/**
 * Error handling utilities for Floc
 */

/**
 * Extracts a user-friendly error message from an unknown error.
 * @param error - The caught error (can be Error, string, or unknown)
 * @returns A string message suitable for displaying to users
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Logs an error with context for debugging.
 * @param error - The error to log
 * @param context - A description of where the error occurred
 */
export function logError(error: unknown, context: string): void {
    console.error(`Error in ${context}:`, error);
}

/**
 * Combined error handler: logs and returns user-friendly message.
 * @param error - The caught error
 * @param context - Where the error occurred
 * @returns User-friendly error message
 */
export function handleError(error: unknown, context: string): string {
    logError(error, context);
    return getErrorMessage(error);
}
