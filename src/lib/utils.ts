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

    if (typeof dateString === 'string') {
        // If it already has 'Z' or a +/- offset, parse it normally
        if (dateString.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(dateString)) {
            return new Date(dateString);
        }

        // If it looks like an ISO string but lacks timezone, assume UTC (standard for this API)
        // This regex checks for the presence of the time separator ':'
        if (dateString.includes(':')) {
            return new Date(dateString + 'Z');
        }
    }

    return new Date(dateString);
}
