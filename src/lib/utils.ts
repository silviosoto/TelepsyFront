import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Parses a date string from the API. 
 * If the string doesn't have a timezone indicator (Z or +/-), 
 * it appends 'Z' to ensure it's treated as UTC.
 */
export function parseApiDate(dateString: string | Date): Date {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;

    // If it's a string and doesn't contain 'Z' or a timezone offset (+/-) after the time part
    if (typeof dateString === 'string' &&
        !dateString.includes('Z') &&
        !/\d{2}:\d{2}:\d{2}[+-]\d{2}:?\d{2}$/.test(dateString) &&
        !/\d{2}:\d{2}[+-]\d{2}:?\d{2}$/.test(dateString)) {
        return new Date(dateString + 'Z');
    }

    return new Date(dateString);
}
