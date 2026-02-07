import { Timestamp } from 'firebase/firestore';

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
