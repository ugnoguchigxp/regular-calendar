import type { ScheduleEvent } from '../../FacilitySchedule/FacilitySchedule.schema';

/**
 * Merge global events with additional colored events
 * Additional events take priority (override) for duplicate IDs
 * 
 * @param globalEvents - Base events from API
 * @param additionalEvents - Colored/styled events to overlay
 * @returns Merged event array
 */
export function mergeEvents(
    globalEvents: ScheduleEvent[],
    additionalEvents: ScheduleEvent[]
): ScheduleEvent[] {
    const eventMap = new Map<string, ScheduleEvent>();

    // 1. Add unassigned events (no attendee) from global list
    globalEvents.forEach(e => {
        // Only include if no specific attendee is assigned
        if (!e.attendee || e.attendee === '[]') {
            eventMap.set(e.id, {
                ...e,
                isAllDay: e.isAllDay ?? e.extendedProps?.isAllDay ?? false
            });
        }
    });

    // 2. Override with colored personnel events
    additionalEvents.forEach(e => {
        eventMap.set(e.id, {
            ...e,
            isAllDay: e.isAllDay ?? e.extendedProps?.isAllDay ?? false
        });
    });

    return Array.from(eventMap.values());
}

/**
 * Resolve the owner ID from event's extendedProps or attendee list
 * 
 * @param extendedProps - Event's extended properties
 * @param attendeeJson - JSON string of attendees
 * @returns Owner ID or undefined
 */
export function resolveEventOwnerId(
    extendedProps: Record<string, any> | undefined,
    attendeeJson: string | undefined
): string | undefined {
    // First check extendedProps
    let ownerId = extendedProps?.ownerId || extendedProps?.personnelId;

    // Fallback to first attendee's personnelId
    if (!ownerId && attendeeJson && attendeeJson !== '[]') {
        try {
            const attendees = JSON.parse(attendeeJson);
            if (Array.isArray(attendees) && attendees.length > 0) {
                ownerId = attendees[0].personnelId;
            }
        } catch {
            // Legacy string format or invalid JSON - ignore
        }
    }

    return ownerId;
}

/**
 * Clean event ID by extracting real ID from split display IDs
 * e.g., "event1_user2" -> "event1"
 * 
 * @param event - Event with potentially modified ID
 * @returns Event with original ID restored
 */
export function cleanEventId(event: ScheduleEvent): ScheduleEvent {
    const realId = (event.extendedProps as any)?.realId || event.id;
    return {
        ...event,
        id: realId
    };
}

/**
 * Parse attendee JSON string to array of names
 * 
 * @param attendeeJson - JSON string of attendees or legacy comma-separated string
 * @returns Array of attendee names
 */
export function parseAttendeeNames(attendeeJson: string | undefined): string[] {
    if (!attendeeJson || attendeeJson === '[]') return [];

    try {
        const parsed = JSON.parse(attendeeJson);
        if (Array.isArray(parsed)) {
            return parsed.map((a: any) => a.name).filter(Boolean);
        }
    } catch {
        // Legacy format - try comma separation
        return attendeeJson.split(/[,、]/).map(s => s.trim()).filter(Boolean);
    }

    return [];
}

/**
 * Format event title with attendee names
 * 
 * @param title - Original event title
 * @param attendeeJson - JSON string of attendees
 * @returns Formatted title with attendee names
 */
export function formatEventTitleWithAttendees(
    title: string,
    attendeeJson: string | undefined
): string {
    const names = parseAttendeeNames(attendeeJson);
    if (names.length > 0) {
        return `${title} (${names.join(', ')})`;
    }
    return title;
}
