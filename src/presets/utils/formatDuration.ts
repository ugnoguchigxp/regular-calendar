/**
 * Format duration in hours to human-readable string
 * @param hours - Duration in hours (e.g., 1.5 = 1h 30m)
 * @returns Formatted string (e.g., "1h 30m", "30m", "2h")
 */
export function formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

/**
 * Parse duration string back to hours
 * @param durationStr - Duration string (e.g., "1h 30m", "30m", "2h")
 * @returns Duration in hours
 */
export function parseDuration(durationStr: string): number {
    const hourMatch = durationStr.match(/(\d+)h/);
    const minMatch = durationStr.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;

    return hours + minutes / 60;
}
