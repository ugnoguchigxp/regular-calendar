import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "regular-calendar";
import { checkScheduleConflict } from "regular-calendar";

/**
 * Zod schema for event form validation
 */
export const eventFormSchema = z.object({
	title: z.string().min(1, "required"),
	attendee: z.string().min(1, "required"),
	resourceId: z.string().min(1, "required"),
	startDate: z.string().min(1, "required"),
	durationHours: z.number().min(0.25).max(24),
	status: z.string().optional(),
	note: z.string().optional(),
	usage: z.string().optional(),
	isAllDay: z.boolean().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

/**
 * Event form data with parsed dates
 */
export interface EventFormData extends Omit<EventFormValues, "startDate"> {
	startDate: Date;
	endDate: Date;
	extendedProps?: Record<string, unknown>;
}

const getStringProp = (
	props: Record<string, unknown> | undefined,
	key: string,
) => {
	const value = props?.[key];
	return typeof value === "string" ? value : undefined;
};

export interface UseEventFormOptions {
	event?: ScheduleEvent;
	defaultResourceId?: string;
	defaultStartTime?: Date;
	resources: Resource[];
}

export interface UseEventFormReturn {
	form: ReturnType<typeof useForm<EventFormValues>>;
	isEditMode: boolean;
	startDateVal: string;
	durationVal: number;
	resourceIdVal: string;
	isAllDay: boolean;
	endDateDisplay: Date;
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
}: UseEventFormOptions): UseEventFormReturn {
	const isEditMode = !!event;

	const form = useForm<EventFormValues>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			title: event?.title || "",
			attendee: event?.attendee || "",
			resourceId:
				event?.resourceId || defaultResourceId || resources[0]?.id || "",
			startDate: format(
				event?.startDate || defaultStartTime || new Date(),
				"yyyy-MM-dd'T'HH:mm",
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
			usage: getStringProp(event?.extendedProps, "usage") ?? "Meeting",
			isAllDay: event?.isAllDay || false,
		},
	});

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
 */
export function useAvailableResources(
	resources: Resource[],
	resourceAvailability: { resourceId: string; isAvailable: boolean }[],
): Resource[] {
	return useMemo(() => {
		return resources.filter((r) => {
			const availability = resourceAvailability.find(
				(a) => a.resourceId === r.id,
			);
			return availability?.isAvailable ?? true;
		});
	}, [resources, resourceAvailability]);
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
): EventFormData {
	const start = new Date(data.startDate);
	if (data.isAllDay) {
		start.setHours(0, 0, 0, 0);
	}

	const minutes = (Number(data.durationHours) || 0) * 60;
	const end = new Date(start.getTime() + minutes * 60000);

	return {
		...data,
		startDate: start,
		endDate: end,
		extendedProps: {
			...(event?.extendedProps ?? {}),
			usage: data.usage,
			ownerId: event
				? getStringProp(event?.extendedProps, "ownerId")
				: currentUserId,
		},
	};
}
