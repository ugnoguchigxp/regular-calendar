/**
 * Native Date utilities to replace date-fns dependency.
 * 
 * NOTE: These implementations rely on the browser's local time handling.
 * Date objects in JS are inherently local unless UTC methods are used.
 * This matches the behavior needed for a UI calendar component running in the user's browser.
 */

// --- Arithmetic ---

export function addDays(date: Date, amount: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

export function subDays(date: Date, amount: number): Date {
    return addDays(date, -amount);
}

export function addWeeks(date: Date, amount: number): Date {
    return addDays(date, amount * 7);
}

export function addMonths(date: Date, amount: number): Date {
    const result = new Date(date);
    const expectedMonth = result.getMonth() + amount;
    result.setMonth(expectedMonth);
    // Handle month rollover (e.g. Jan 31 + 1 month -> Feb 28/29, not Mar 3)
    // If the day doesn't exist in the target month, JS moves to the next month.
    // We want to clamp to the last day of the target month.
    if (result.getMonth() !== (expectedMonth % 12 + 12) % 12) {
        result.setDate(0); // Set to last day of previous month (which is the target month)
    }
    return result;
}

export function subMonths(date: Date, amount: number): Date {
    return addMonths(date, -amount);
}

// --- Start/End of Period ---

export function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

export function endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

export function startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}

export function endOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0); // Last day of previous (target) month
    result.setHours(23, 59, 59, 999);
    return result;
}

export function startOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
    // Default weekStartsOn: 0 (Sunday) to match typical JS Date.getDay()
    // date-fns default is 0 (Sunday) as well usually, or locale dependent.
    // For this app we often use 1 (Monday). We'll fallback to 0 if not provided.
    const weekStartsOn = options?.weekStartsOn ?? 0;

    const result = new Date(date);
    const day = result.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
}

export function endOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
    const start = startOfWeek(date, options);
    const end = addDays(start, 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

// --- Comparison ---

export function isSameDay(dateLeft: Date, dateRight: Date): boolean {
    return (
        dateLeft.getFullYear() === dateRight.getFullYear() &&
        dateLeft.getMonth() === dateRight.getMonth() &&
        dateLeft.getDate() === dateRight.getDate()
    );
}

export function isSameMonth(dateLeft: Date, dateRight: Date): boolean {
    return (
        dateLeft.getFullYear() === dateRight.getFullYear() &&
        dateLeft.getMonth() === dateRight.getMonth()
    );
}

export function isBefore(date: Date, dateToCompare: Date): boolean {
    return date.getTime() < dateToCompare.getTime();
}

export function isAfter(date: Date, dateToCompare: Date): boolean {
    return date.getTime() > dateToCompare.getTime();
}

export function isWithinInterval(date: Date, interval: { start: Date; end: Date }): boolean {
    const time = date.getTime();
    return time >= interval.start.getTime() && time <= interval.end.getTime();
}

export function areIntervalsOverlapping(
    intervalLeft: { start: Date; end: Date },
    intervalRight: { start: Date; end: Date }
): boolean {
    return (
        intervalLeft.start.getTime() < intervalRight.end.getTime() &&
        intervalRight.start.getTime() < intervalLeft.end.getTime()
    );
}

// --- Iteration ---

export function eachDayOfInterval(interval: { start: Date; end: Date }): Date[] {
    const startDate = startOfDay(interval.start);
    const endDate = startOfDay(interval.end);

    const endTime = endDate.getTime();
    const dates = [];

    const current = new Date(startDate);
    while (current.getTime() <= endTime) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

// --- Formatting Helpers (Replacements for simple date-fns format) ---

/**
 * Format as ISO Date: YYYY-MM-DD
 * Used for <input type="date"> values
 */
export function formatIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Format as ISO Time: HH:mm
 * Used for <input type="time"> values or simple display
 */
export function formatIsoTime(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Format as ISO Date Time: YYYY-MM-DDTHH:mm
 * Used for datetime-local inputs or full timestamps
 */
export function formatIsoDateTime(date: Date): string {
    return `${formatIsoDate(date)}T${formatIsoTime(date)}`;
}
