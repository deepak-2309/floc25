
/**
 * Safely converts a Firestore Timestamp, date string, or Date object to a JavaScript Date object.
 * Returns null if the input is invalid or null/undefined.
 * 
 * @param value - The value to convert (Timestamp, string, Date, or null/undefined)
 * @returns Date object or null
 */
export const getSafeDate = (value: any): Date | null => {
    if (!value) return null;

    // If it's already a Date object
    if (value instanceof Date) {
        return value;
    }

    // If it's a Firestore Timestamp (has toDate method)
    if (value && typeof value.toDate === 'function') {
        return value.toDate();
    }

    // If it's a string or number, try to parse it
    const parsedDate = new Date(value);

    // Check if the date is valid
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
    }

    return null;
};

/**
 * Formats a date object for use in datetime-local input fields.
 * Format: YYYY-MM-DDThh:mm
 * 
 * @param date - The date to format
 * @returns Formatted string or empty string if date is invalid
 */
export const formatDateTimeForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    const safeDate = getSafeDate(date);
    if (!safeDate) return '';

    const year = safeDate.getFullYear();
    const month = String(safeDate.getMonth() + 1).padStart(2, '0');
    const day = String(safeDate.getDate()).padStart(2, '0');
    const hours = String(safeDate.getHours()).padStart(2, '0');
    const minutes = String(safeDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
