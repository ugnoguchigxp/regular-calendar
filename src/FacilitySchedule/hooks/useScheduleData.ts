import { useMemo } from "react";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../FacilitySchedule.schema";

interface UseScheduleDataOptions {
	events: ScheduleEvent[];
	resources: Resource[];
	groups: ResourceGroup[];
	selectedGroupId: string | null;
}

export function useScheduleData({
	events,
	resources,
	groups,
	selectedGroupId,
}: UseScheduleDataOptions) {
	const effectiveGroupId = useMemo(
		() => selectedGroupId ?? groups[0]?.id ?? null,
		[selectedGroupId, groups],
	);

	const filteredResources = useMemo(() => {
		return effectiveGroupId
			? resources.filter((r) => r.groupId === effectiveGroupId)
			: resources;
	}, [resources, effectiveGroupId]);

	const filteredEvents = useMemo(() => {
		return effectiveGroupId
			? events.filter((e) => e.groupId === effectiveGroupId)
			: events;
	}, [events, effectiveGroupId]);

	return {
		effectiveGroupId,
		filteredResources,
		filteredEvents,
	};
}
