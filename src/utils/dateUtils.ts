import { format } from 'date-fns';

/**
 * Safely format a date, returning a fallback if the date is invalid
 */
export function safeFormatDate(date: string | Date | null | undefined, formatStr: string, fallback: string = 'N/A'): string {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return fallback;
        }
        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Error formatting date:', date, error);
        return fallback;
    }
}
