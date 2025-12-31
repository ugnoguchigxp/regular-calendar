/**
 * Standard Calendar Helpers
 */

import type { ScheduleEvent } from '../RegularCalendar.schema';
import { TIME_SLOT_HEIGHT } from '../constants/calendarConstants';

/**
 * Get dates for the week containing the given date
 */
export const getWeekDates = (date: Date, weekStartsOn: 0 | 1): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...

    let diff: number;
    if (weekStartsOn === 1) {
        // Starts on Monday
        diff = currentDate.getDate() - ((day + 6) % 7);
    } else {
        // Starts on Sunday
        diff = currentDate.getDate() - day;
    }

    currentDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentDate);
        dayDate.setHours(0, 0, 0, 0);
        dates.push(dayDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};

/**
 * Generate time slots array
 */
export const generateTimeSlots = (
    interval: number, // minutes
    startHour = 8,
    endHour = 20
): string[] => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }
    }
    return slots;
};

/**
 * Get current time position in pixels
 */
export const getCurrentTimePosition = (interval = 30, startHour = 8): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = startHour * 60;
    const relativeMinutes = totalMinutes - startMinutes;

    const slotsPerHour = 60 / interval;
    const hourHeight = TIME_SLOT_HEIGHT * slotsPerHour;

    return (relativeMinutes / 60) * hourHeight;
};

export const isCurrentTimeInRange = (startHour = 8, endHour = 20): boolean => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= startHour && hours < endHour;
};

export const getEventsForDate = (
    events: ScheduleEvent[],
    date: Date
): ScheduleEvent[] => {
    return events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === date.toDateString();
    });
};

/**
 * Generate month grid
 */
export const getMonthCalendarGrid = (date: Date, weekStartsOn: 0 | 1): Date[][] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();

    const startOffset = weekStartsOn === 1
        ? (firstDayWeekday + 6) % 7
        : firstDayWeekday;

    const gridStartDate = new Date(firstDayOfMonth);
    gridStartDate.setDate(1 - startOffset);

    const weeks: Date[][] = [];
    const currentDate = new Date(gridStartDate);

    for (let week = 0; week < 6; week++) {
        const weekDays: Date[] = [];
        for (let day = 0; day < 7; day++) {
            weekDays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(weekDays);
    }

    return weeks;
};

/**
 * Calculate event position and height
 */
export const calculateEventPosition = (
    event: ScheduleEvent,
    timeInterval = 30,
    startHour = 8
): { top: number; height: number } => {
    const startTime = event.startDate;
    const endTime = event.endDate;

    const startHourVal = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();

    const startTotalMinutes = startHourVal * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    const slotsPerHour = 60 / timeInterval;
    const hourHeight = TIME_SLOT_HEIGHT * slotsPerHour;

    const baseMinutes = startHour * 60;
    const relativeStartMinutes = startTotalMinutes - baseMinutes;

    const top = (relativeStartMinutes / 60) * hourHeight;
    const height = (durationMinutes / 60) * hourHeight;

    return { top, height };
};

export const getDateClasses = (date: Date, isSelected: boolean): string => {
    const dayOfWeek = date.getDay();
    let classes = '';

    if (isSelected) {
        classes += 'font-bold';
    } else {
        classes += 'font-normal';
    }

    if (dayOfWeek === 0) {
        classes += ' text-red-600';
    } else if (dayOfWeek === 6) {
        classes += ' text-blue-600';
    } else {
        classes += ' text-foreground';
    }

    return classes;
};

export const getDayNameClasses = (dayOfWeek: number): string => {
    if (dayOfWeek === 0) return 'text-red-600';
    if (dayOfWeek === 6) return 'text-blue-600';
    return 'text-muted-foreground';
};

/**
 * Calculate overlap columns for events
 * Returns events with column position and total columns info
 */
export interface EventWithLayout {
    event: ScheduleEvent;
    position: { top: number; height: number };
    column: number;      // 0-indexed column this event is in
    totalColumns: number; // total columns in this overlap group
}

/**
 * Check if two events overlap in time
 */
const eventsOverlap = (a: ScheduleEvent, b: ScheduleEvent): boolean => {
    const aStart = a.startDate.getTime();
    const aEnd = a.endDate.getTime();
    const bStart = b.startDate.getTime();
    const bEnd = b.endDate.getTime();
    return aStart < bEnd && aEnd > bStart;
};

/**
 * Calculate event layout with overlap handling
 */
export const calculateEventsWithLayout = (
    events: ScheduleEvent[],
    timeInterval: number,
    startHour: number
): EventWithLayout[] => {
    if (events.length === 0) return [];

    // Sort events by start time, then by duration (longer first)
    const sorted = [...events].sort((a, b) => {
        const startDiff = a.startDate.getTime() - b.startDate.getTime();
        if (startDiff !== 0) return startDiff;
        // Longer events first
        const aDuration = a.endDate.getTime() - a.startDate.getTime();
        const bDuration = b.endDate.getTime() - b.startDate.getTime();
        return bDuration - aDuration;
    });

    // Build overlap groups using a greedy column assignment
    const result: EventWithLayout[] = [];
    const columns: ScheduleEvent[][] = []; // columns[i] = events in column i

    for (const event of sorted) {
        // Find the first column where this event doesn't overlap with ANY existing event in that column
        let assignedColumn = -1;

        for (let col = 0; col < columns.length; col++) {
            // Check against ALL events in this column, not just the last one
            const hasOverlap = columns[col].some(existingEvent => eventsOverlap(existingEvent, event));
            if (!hasOverlap) {
                assignedColumn = col;
                columns[col].push(event);
                break;
            }
        }

        // If no column found, create a new one
        if (assignedColumn === -1) {
            assignedColumn = columns.length;
            columns.push([event]);
        }

        result.push({
            event,
            position: calculateEventPosition(event, timeInterval, startHour),
            column: assignedColumn,
            totalColumns: 0, // Will be updated after all events are processed
        });
    }

    // Calculate totalColumns for each event based on overlapping events
    for (const item of result) {
        // Find all events that overlap with this one
        const overlappingEvents = result.filter(other =>
            eventsOverlap(item.event, other.event)
        );
        // The max column among overlapping events + 1 = total columns
        const maxColumn = Math.max(...overlappingEvents.map(e => e.column));
        item.totalColumns = maxColumn + 1;
    }

    return result;
};

