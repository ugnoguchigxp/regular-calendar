import {
	getPersonnelColor,
	type Personnel,
	type ScheduleEvent,
} from "regular-calendar";
import {
	formatEventTitleWithAttendees,
	resolveEventOwnerId,
} from "./eventHelpers";

/**
 * Booking data from resource availability API
 */
export interface BookingData {
	eventId: string;
	title: string;
	startDate: string;
	endDate: string;
	isAllDay: boolean;
	attendee: string;
	extendedProps?: string | Record<string, unknown>;
}

/**
 * Resource availability response from API
 */
export interface ResourceAvailabilityResponse {
	resourceId: string;
	resourceName: string;
	groupId: string;
	isAvailable: boolean;
	bookings: BookingData[];
}

/**
 * Parse extendedProps from string or object
 */
function parseExtendedProps(
	extendedProps: string | Record<string, unknown> | undefined,
): Record<string, unknown> {
	if (!extendedProps) return {};
	if (typeof extendedProps === "string") {
		try {
			return JSON.parse(extendedProps);
		} catch {
			console.warn(
				"[transformBookings] Failed to parse extendedProps",
				extendedProps,
			);
			return {};
		}
	}
	return extendedProps;
}

/**
 * Transform resource availability bookings to ScheduleEvent array
 *
 * @param availability - Resource availability data from API
 * @param personnel - Personnel list for color assignment
 * @returns Array of ScheduleEvent
 */
export function transformBookingsToEvents(
	availability: ResourceAvailabilityResponse[],
	personnel: Personnel[],
): ScheduleEvent[] {
	return availability.flatMap((res) =>
		res.bookings.map((book): ScheduleEvent => {
			const extendedProps = parseExtendedProps(book.extendedProps);

			// Format display title with attendees
			const displayTitle = formatEventTitleWithAttendees(
				book.title,
				book.attendee,
			);

			// Resolve owner ID
			const ownerId = resolveEventOwnerId(extendedProps, book.attendee);

			// Assign color based on owner
			let assignedColor: string | undefined;
			if (ownerId && personnel.length > 0) {
				const index = personnel.findIndex((p) => p.id === ownerId);
				if (index >= 0) {
					assignedColor = getPersonnelColor(index);
				}
			}

			return {
				id: book.eventId,
				groupId: res.groupId,
				resourceId: res.resourceId,
				title: displayTitle,
				startDate: new Date(book.startDate),
				endDate: new Date(book.endDate),
				isAllDay: book.isAllDay,
				attendee: book.attendee,
				color: assignedColor,
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
				extendedProps: {
					...extendedProps,
					originalTitle: book.title,
					ownerId,
				},
			} as ScheduleEvent;
		}),
	);
}
