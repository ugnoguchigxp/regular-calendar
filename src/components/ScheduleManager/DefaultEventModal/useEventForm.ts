import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
	AttendeeInfo,
	Personnel,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../../FacilitySchedule/FacilitySchedule.schema";
import { checkScheduleConflict } from "../../../FacilitySchedule/utils/scheduleHelpers";
import { formatIsoDateTime } from "../../../utils/dateUtils";
import type { CustomField } from "../types";

/**
 * Zod schema for event form validation
 */
const baseEventFormSchema = z.object({
	title: z.string().min(1, "Event name is required"),
	attendee: z.array(z.any()), // Array of AttendeeInfo
	resourceId: z.string().optional(),
	startDate: z.string().min(1, "Start date is required"),
	durationHours: z.number().min(0.25).max(24),
	status: z.string().optional(),
	note: z.string().optional(),
	isAllDay: z.boolean().optional(),
});

// We'll use a dynamic schema generator
const createEventFormSchema = (customFields: CustomField[] = []) => {
	const schema = baseEventFormSchema;

	// We can't easily add fields to the root object if we want them in extendedProps
	// But for the form, we flatten everything and then restructure on submit.
	// So yes, we add them to the root Zod schema.

	const customShape: Record<string, z.ZodTypeAny> = {};

	customFields.forEach((field) => {
		let fieldSchema: z.ZodTypeAny;

		if (field.type === "number") {
			fieldSchema = z.union([
				z.number(),
				z.string().transform((val) => Number(val)),
			]);
			// If required, we might check for NaN, but let's keep it simple for now or use z.coerce.number()
			if (field.required) {
				fieldSchema = z.coerce.number().min(1, `${field.label} is required`); // Assuming number fields > 0 if required? Or just exists.
			} else {
				fieldSchema = z.coerce.number().optional();
			}
		} else {
			// String based fields
			fieldSchema = z.string();
			if (field.required) {
				fieldSchema = (fieldSchema as z.ZodString).min(
					1,
					`${field.label} is required`,
				);
			} else {
				fieldSchema = (fieldSchema as z.ZodString).optional();
			}
		}

		customShape[field.name] = fieldSchema;
	});

	return schema.extend(customShape);
};

export type EventFormValues = z.infer<typeof baseEventFormSchema> &
	Record<string, unknown>;

/**
 * Event form data with parsed dates
 * Renamed to SMEventFormData (ScheduleManagerEventFormData) to avoid collision
 */
export interface SMEventFormData extends Omit<EventFormValues, "startDate"> {
	startDate: Date;
	endDate: Date;
	extendedProps?: Record<string, unknown>;
}

export interface UseEventFormOptions {
	event?: ScheduleEvent;
	defaultResourceId?: string;
	defaultStartTime?: Date;
	resources: Resource[];
	personnel?: Personnel[];
	customFields?: CustomField[];
	currentUserId?: string;
}

export interface UseEventFormReturn {
	form: ReturnType<typeof useForm<EventFormValues>>;
	isEditMode: boolean;
	startDateVal: string;
	durationVal: number;
	resourceIdVal?: string;
	isAllDay: boolean;
	endDateDisplay: Date;
	personnel: Personnel[];
}

/**
 * Custom hook for event form logic
 * Separates form state management from UI
 */
export function useEventForm({
	event,
	defaultResourceId,
	defaultStartTime,
	resources,
	personnel = [],
	customFields = [],
	currentUserId,
}: UseEventFormOptions): UseEventFormReturn {
	const isEditMode = !!event;

	const schema = useMemo(
		() => createEventFormSchema(customFields),
		[customFields],
	);

	const defaultValues = useMemo(() => {
		const getStringProp = (
			obj: Record<string, unknown> | undefined,
			key: string,
		): string | undefined => {
			const val = obj?.[key];
			return typeof val === "string" ? val : undefined;
		};

		// Helper to transform attendee JSON string to AttendeeInfo array (excluding self)
		const formatAttendeeForForm = (
			attendee: string | undefined,
			userId: string | undefined,
		): AttendeeInfo[] => {
			if (!attendee) return [];
			try {
				const parsed = JSON.parse(attendee);
				if (Array.isArray(parsed)) {
					return parsed.filter((p) => !userId || p.personnelId !== userId);
				}
			} catch {
				// Not JSON
			}
			return [];
		};

		const baseDefaults = {
			title:
				getStringProp(event?.extendedProps, "originalTitle") ||
				event?.title ||
				"",
			attendee: formatAttendeeForForm(event?.attendee, currentUserId),
			resourceId:
				event?.resourceId || defaultResourceId || resources[0]?.id || "",
			startDate: formatIsoDateTime(
				event?.startDate || defaultStartTime || new Date(),
			),
			durationHours: event
				? Math.round(
						((event.endDate.getTime() - event.startDate.getTime()) /
							(1000 * 60 * 60)) *
							100,
					) / 100
				: 1,
			status: event?.status || "booked",
			note: event?.note || "",
			isAllDay: event?.isAllDay || false,
		};

		// Add custom fields defaults
		const customDefaults: Record<string, unknown> = {};
		customFields.forEach((field) => {
			// Check extendedProps first, then field.defaultValue
			const val = event?.extendedProps?.[field.name];
			customDefaults[field.name] =
				val !== undefined ? val : (field.defaultValue ?? "");
		});

		return { ...baseDefaults, ...customDefaults };
	}, [
		event,
		defaultResourceId,
		defaultStartTime,
		resources,
		customFields,
		currentUserId,
	]);

	const form = useForm<EventFormValues>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	// Identity key for the current edit session
	const resetKey = useMemo(() => {
		if (event?.id) return `edit-${event.id}`;
		if (defaultStartTime) return `create-${defaultStartTime.getTime()}`;
		return "create-new";
	}, [event?.id, defaultStartTime]);

	// Reset form when the target event or selection changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: Only reset when identification changes
	useEffect(() => {
		form.reset(defaultValues);
	}, [resetKey]);

	const startDateVal = form.watch("startDate");
	const durationVal = form.watch("durationHours");
	const resourceIdVal = form.watch("resourceId");
	const isAllDay = form.watch("isAllDay") ?? false;

	const endDateDisplay = useMemo(() => {
		const end = new Date(startDateVal);
		if (!Number.isNaN(end.getTime())) {
			const minutes = (Number(durationVal) || 0) * 60;
			end.setTime(new Date(startDateVal).getTime() + minutes * 60000);
		}
		return end;
	}, [startDateVal, durationVal]);

	return {
		form,
		isEditMode,
		startDateVal,
		durationVal,
		resourceIdVal,
		isAllDay,
		endDateDisplay,
		personnel,
	};
}

/**
 * Check for schedule conflicts
 */
export function useConflictCheck(
	startDateVal: string,
	durationVal: number,
	resourceIdVal: string,
	events: ScheduleEvent[],
	currentEventId?: string,
) {
	return useMemo(() => {
		const start = new Date(startDateVal);
		if (Number.isNaN(start.getTime()) || !resourceIdVal) return null;

		const minutes = (Number(durationVal) || 0) * 60;
		const end = new Date(start.getTime() + minutes * 60000);

		const otherEvents = events.filter((e) => e.id !== currentEventId);
		return checkScheduleConflict(
			{ startDate: start, endDate: end, resourceId: resourceIdVal },
			otherEvents,
		);
	}, [startDateVal, durationVal, resourceIdVal, events, currentEventId]);
}

/**
 * Compute available resources based on resource availability
 * (Simplified for now, assuming all resources are available unless externally filtered)
 */
export function useAvailableResources(
	resources: Resource[],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_events: ScheduleEvent[],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_startDate: Date,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_endDate: Date,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_currentEventId?: string,
): Resource[] {
	// Placeholder for availability logic if needed.
	// For now just return all resources.
	return resources;
}

/**
 * Generate resource display names with group
 */
export function useResourceDisplayNames(
	resources: Resource[],
	groups: ResourceGroup[],
): Map<string, string> {
	return useMemo(() => {
		const map = new Map<string, string>();
		resources.forEach((r) => {
			const group = groups.find((g) => g.id === r.groupId);
			const displayName = group ? `${r.name} (${group.name})` : r.name;
			map.set(r.id, displayName);
		});
		return map;
	}, [resources, groups]);
}

/**
 * Prepare form data for submission
 */
export function prepareEventFormData(
	data: EventFormValues,
	event: ScheduleEvent | undefined,
	currentUserId?: string,
	customFields: CustomField[] = [],
): SMEventFormData {
	const start = new Date(data.startDate);
	if (data.isAllDay) {
		start.setHours(0, 0, 0, 0);
	}

	const minutes = (Number(data.durationHours) || 0) * 60;
	const end = new Date(start.getTime() + minutes * 60000);

	// Extract custom fields to extendedProps
	const extendedProps: Record<string, unknown> = {
		...(event?.extendedProps ?? {}),
	};

	if (currentUserId && !event) {
		extendedProps.ownerId = currentUserId;
	}

	customFields.forEach((field) => {
		if (data[field.name] !== undefined) {
			extendedProps[field.name] = data[field.name];
		}
	});

	// Transform form attendee array back to JSON string
	const parseAttendeeFromForm = (
		formAttendees: AttendeeInfo[],
		originalAttendee: string | undefined,
		userId: string | undefined,
	): string => {
		const newAttendees: Record<string, unknown>[] = [
			...(formAttendees as unknown as Record<string, unknown>[]),
		];

		// Try to restore original self object if it existed
		if (userId) {
			let selfObj = null;
			if (originalAttendee) {
				try {
					const parsed = JSON.parse(originalAttendee);
					if (Array.isArray(parsed)) {
						selfObj = parsed.find((p) => p.personnelId === userId);
					}
				} catch {}
			}

			// If not found in original, but we are the current user, add default self object
			if (!selfObj) {
				// For John Doe demo
				if (userId === "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d") {
					selfObj = {
						name: "John Doe",
						personnelId: userId,
						type: "personnel",
					};
				} else {
					selfObj = { name: "Self", personnelId: userId, type: "personnel" };
				}
			}

			if (selfObj) {
				newAttendees.unshift(selfObj as unknown as Record<string, unknown>);
			}
		}

		return JSON.stringify(newAttendees);
	};

	const attendee = parseAttendeeFromForm(
		data.attendee,
		event?.attendee,
		currentUserId,
	);

	return {
		...data,
		attendee,
		startDate: start,
		endDate: end,
		extendedProps,
	};
}
