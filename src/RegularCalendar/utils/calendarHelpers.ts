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
